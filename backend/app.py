"""EventHub's Flask application and JSON API."""

import os
import re
from datetime import date
from functools import wraps
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, session
from psycopg.rows import dict_row
from werkzeug.security import check_password_hash, generate_password_hash


ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "pages"
load_dotenv(ROOT / ".env")


def create_app():
    app = Flask(__name__)
    app.config.update(
        SECRET_KEY=os.getenv("FLASK_SECRET_KEY"),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.getenv("APP_ENV") == "production",
        PERMANENT_SESSION_LIFETIME=60 * 60 * 24 * 7,
        MAX_CONTENT_LENGTH=16 * 1024,
    )

    if not app.config["SECRET_KEY"]:
        raise RuntimeError("Set FLASK_SECRET_KEY in the environment or .env file.")

    def database_url():
        value = os.getenv("DATABASE_URL")
        if not value:
            raise RuntimeError("Set DATABASE_URL in the environment or .env file.")
        return value

    def current_user_id():
        return session.get("user_id")

    def database_error():
        app.logger.exception("Database request failed")
        return jsonify(error="The database is unavailable. Check the server configuration."), 503

    @app.get("/")
    def home():
        return send_from_directory(ROOT, "index.html")

    @app.get("/index.html")
    def home_file():
        return send_from_directory(ROOT, "index.html")

    @app.get("/pages/<path:filename>")
    def page_file(filename):
        return send_from_directory(PAGES, filename)

    @app.get("/css/<path:filename>")
    def css_file(filename):
        return send_from_directory(ROOT / "css", filename)

    @app.get("/js/<path:filename>")
    def js_file(filename):
        return send_from_directory(ROOT / "js", filename)

    @app.get("/api/auth/me")
    def auth_me():
        if not current_user_id():
            return jsonify(authenticated=False)
        return jsonify(
            authenticated=True,
            user={"id": session["user_id"], "name": session["name"], "role": session["role"]},
        )

    @app.post("/api/auth/register")
    def register_account():
        data = request.get_json(silent=True) or {}
        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip().lower()
        password = data.get("password", "")
        role = data.get("role")

        if not name or len(name) > 120:
            return jsonify(error="Enter a name up to 120 characters long."), 400
        if len(email) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
            return jsonify(error="Enter a valid email address."), 400
        if not isinstance(password, str) or len(password) < 8 or len(password) > 256:
            return jsonify(error="Password must be between 8 and 256 characters."), 400
        if role not in {"student", "organizer"}:
            return jsonify(error="Choose Student or Event organizer."), 400

        try:
            with psycopg.connect(database_url(), row_factory=dict_row) as conn:
                user = conn.execute(
                    """INSERT INTO users (name, email, password_hash, role)
                       VALUES (%s, %s, %s, %s)
                       ON CONFLICT (email) DO NOTHING
                       RETURNING id, name, role""",
                    (name, email, generate_password_hash(password), role),
                ).fetchone()
                if user is None:
                    return jsonify(error="An account with that email already exists."), 409
        except (psycopg.Error, RuntimeError):
            return database_error()

        session.clear()
        session.update(user_id=user["id"], name=user["name"], role=user["role"])
        session.permanent = True
        return jsonify(user={"id": user["id"], "name": user["name"], "role": user["role"]}), 201

    @app.post("/api/auth/login")
    def login():
        data = request.get_json(silent=True) or {}
        email = str(data.get("email", "")).strip().lower()
        password = data.get("password", "")
        if not email or not isinstance(password, str) or len(password) > 256:
            return jsonify(error="Enter your email and password."), 400

        try:
            with psycopg.connect(database_url(), row_factory=dict_row) as conn:
                user = conn.execute(
                    "SELECT id, name, role, password_hash FROM users WHERE email = %s",
                    (email,),
                ).fetchone()
        except (psycopg.Error, RuntimeError):
            return database_error()

        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify(error="Email or password is incorrect."), 401

        session.clear()
        session.update(user_id=user["id"], name=user["name"], role=user["role"])
        session.permanent = True
        return jsonify(user={"id": user["id"], "name": user["name"], "role": user["role"]})

    @app.post("/api/auth/logout")
    def logout():
        session.clear()
        return jsonify(message="Logged out.")

    @app.post("/api/events/<int:event_id>/registrations")
    def register_for_event(event_id):
        user_id = current_user_id()
        if not user_id:
            return jsonify(error="Log in to register for this event."), 401

        try:
            with psycopg.connect(database_url(), row_factory=dict_row) as conn:
                event = conn.execute(
                    "SELECT id, title, registration_deadline FROM events WHERE id = %s",
                    (event_id,),
                ).fetchone()
                if not event:
                    return jsonify(error="Event not found."), 404
                if event["registration_deadline"] < date.today():
                    return jsonify(error="Registration for this event has closed."), 410
                registration = conn.execute(
                    """INSERT INTO event_registrations (user_id, event_id)
                       VALUES (%s, %s)
                       ON CONFLICT (user_id, event_id) DO NOTHING
                       RETURNING id""",
                    (user_id, event_id),
                ).fetchone()
                if registration is None:
                    return jsonify(error="You are already registered for this event."), 409
        except (psycopg.Error, RuntimeError):
            return database_error()

        return jsonify(message=f"You are registered for {event['title']}.", registration_id=registration["id"]), 201

    @app.get("/api/events/mine")
    def my_events():
        user_id = current_user_id()
        if not user_id:
            return jsonify(error="Log in to see your events."), 401

        try:
            with psycopg.connect(database_url(), row_factory=dict_row) as conn:
                rows = conn.execute(
                    """SELECT e.id, e.title, e.event_date, e.location,
                              r.registered_at
                       FROM event_registrations AS r
                       JOIN events AS e ON e.id = r.event_id
                       WHERE r.user_id = %s
                       ORDER BY e.event_date, e.title""",
                    (user_id,),
                ).fetchall()
        except (psycopg.Error, RuntimeError):
            return database_error()

        return jsonify(events=[
            {
                **row,
                "event_date": row["event_date"].isoformat(),
                "registered_at": row["registered_at"].isoformat(),
            }
            for row in rows
        ])

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")), debug=os.getenv("APP_ENV") != "production")

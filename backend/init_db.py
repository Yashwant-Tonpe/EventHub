"""Create the initial schema and seed the six demonstration events."""

import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

EVENTS = [
    (1, "CodeSprint Hackathon", "2026-11-15", "Pune, Maharashtra", "2026-11-10"),
    (2, "Campus Cultural Fest", "2026-11-22", "Pune, Maharashtra", "2026-11-18"),
    (3, "Inter-College Sports Meet", "2026-12-05", "Pimpri, Maharashtra", "2026-11-28"),
    (4, "Web Development Workshop", "2026-11-28", "Online", "2026-11-26"),
    (5, "National Coding Challenge", "2026-12-12", "Online", "2026-12-08"),
    (6, "Creative Arts Showcase", "2026-12-18", "Pune, Maharashtra", "2026-12-14"),
]


def main():
    load_dotenv(ROOT / ".env")
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise SystemExit("Set DATABASE_URL in .env before initializing the database.")

    schema = (Path(__file__).parent / "schema.sql").read_text(encoding="utf-8")
    with psycopg.connect(database_url) as conn:
        for statement in schema.split(";"):
            if statement.strip():
                conn.execute(statement)
        with conn.cursor() as cursor:
            cursor.executemany(
                """INSERT INTO events (id, title, event_date, location, registration_deadline)
                   VALUES (%s, %s, %s, %s, %s)
                   ON CONFLICT (id) DO UPDATE SET
                       title = EXCLUDED.title,
                       event_date = EXCLUDED.event_date,
                       location = EXCLUDED.location,
                       registration_deadline = EXCLUDED.registration_deadline""",
                EVENTS,
            )
    print("Database schema is ready and demonstration events are seeded.")


if __name__ == "__main__":
    main()

# EventHub backend

This Flask API provides account creation, login sessions, and event registration. PostgreSQL stores users, event records, and registrations. The browser never receives password hashes, and passwords are stored as Werkzeug password hashes.

## Setup on Windows PowerShell

1. Install PostgreSQL and create an empty database named `eventhub` (for example, `psql -U postgres -c "CREATE DATABASE eventhub;"`).
2. Create a virtual environment and install the packages:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   ```

3. Copy `.env.example` to `.env`, set the PostgreSQL password, and replace `FLASK_SECRET_KEY` with a private random value (for example, generate one with `python -c "import secrets; print(secrets.token_hex(32))"`). Keep `.env` out of source control.
4. Create the tables and seed the sample event records:

   ```powershell
   python -m backend.init_db
   ```

5. Start the site through Flask (not Live Server):

   ```powershell
   python backend/app.py
   ```

6. Open `http://127.0.0.1:5000`.

The account forms create database-backed accounts and signed server sessions. Event registration requires a logged-in account and is stored once per account/event pair. The six event details remain demonstration content in the frontend; the database holds the event identifiers and registration deadlines needed for registration.

`APP_ENV=production` enables the session cookie's `Secure` attribute. Production deployment also requires HTTPS, a private secret key, and a managed PostgreSQL database.

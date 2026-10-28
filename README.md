# EventHub

EventHub is an inter-college event discovery and registration website built with HTML, CSS, vanilla JavaScript, Flask, and PostgreSQL.

## Features

- Search, filter, and sort sample college events.
- View event details and registration deadlines.
- Create student or organizer accounts and log in.
- Register for events and view registrations on the **My Events** page.
- Responsive layouts for desktop and mobile.

## Run locally

The backend setup requires Python and PostgreSQL. Follow [backend/README.md](backend/README.md) to create the database, configure `.env`, install dependencies, and start Flask. Open the site through Flask at `http://127.0.0.1:5000`; Live Server does not provide the API.

The sample event descriptions are demonstration content. Account and registration data is stored in the local PostgreSQL database.

## Keep credentials private

Do not commit `.env`. It contains the Flask signing key and database credentials. The repository `.gitignore` excludes `.env`, the Python virtual environment, and Python cache files.

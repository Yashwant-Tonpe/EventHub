const eventsGrid = document.getElementById("eventsGrid");
const eventsCount = document.getElementById("eventsCount");
const eventsEmpty = document.getElementById("eventsEmpty");
const loginRequired = document.getElementById("loginRequired");
const eventsError = document.getElementById("eventsError");

function formatDate(dateString) {
    return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
    });
}

function formatRegisteredAt(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

async function loadMyEvents() {
    eventsGrid.replaceChildren();
    eventsEmpty.hidden = true;
    loginRequired.hidden = true;
    eventsError.hidden = true;
    eventsCount.textContent = "Loading your registrations…";

    try {
        const response = await fetch("/api/events/mine");
        const result = await response.json();

        if (response.status === 401) {
            eventsCount.textContent = "";
            loginRequired.hidden = false;
            const next = `${window.location.pathname}${window.location.search}`;
            document.getElementById("loginLink").href = `login.html?next=${encodeURIComponent(next)}`;
            return;
        }
        if (!response.ok) throw new Error(result.error || "Unable to load registrations.");

        const registeredEvents = result.events || [];
        eventsCount.textContent = `${registeredEvents.length} registered event${registeredEvents.length === 1 ? "" : "s"}`;
        eventsEmpty.hidden = registeredEvents.length > 0;
        eventsGrid.innerHTML = registeredEvents.map(registeredEvent => {
            const event = window.EventHubEvents.find(item => item.id === registeredEvent.id);
            const category = event?.category || "Event";
            const cover = event?.cover || "cover-technical";
            const symbol = event?.symbol || "•";
            const fee = event?.fee || "See event details";
            return `
                <article class="event-card">
                    <a class="event-card-hit-area" href="event-details.html?id=${registeredEvent.id}" aria-label="Open ${escapeHtml(registeredEvent.title)}"></a>
                    <div class="event-cover ${cover}">
                        <span class="cover-symbol" aria-hidden="true">${symbol}</span>
                        <span class="event-badge">${category}</span>
                    </div>
                    <div class="event-body">
                        <p class="event-date">${formatDate(registeredEvent.event_date)}</p>
                        <h2>${escapeHtml(registeredEvent.title)}</h2>
                        <p class="event-organizer">${escapeHtml(registeredEvent.location)}</p>
                        <p class="registration-date">Registered ${formatRegisteredAt(registeredEvent.registered_at)}</p>
                        <div class="event-footer">
                            <span class="event-fee">${fee}</span>
                            <a class="event-link" href="event-details.html?id=${registeredEvent.id}">View Details &rarr;</a>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    } catch (error) {
        eventsCount.textContent = "";
        eventsError.hidden = false;
        document.getElementById("eventsErrorMessage").textContent =
            error instanceof TypeError
                ? "Could not reach EventHub. Start the Flask server and check the database connection."
                : error.message;
    }
}

document.getElementById("retryEvents").addEventListener("click", loadMyEvents);
document.getElementById("menuToggle").addEventListener("click", event => {
    const menu = document.getElementById("navLinks");
    const open = menu.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", String(open));
});
document.getElementById("navLinks").addEventListener("click", event => {
    if (!event.target.closest("a")) return;
    document.getElementById("navLinks").classList.remove("open");
    document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
});

loadMyEvents();

const params = new URLSearchParams(window.location.search);
const eventId = Number(params.get("id"));
const event = window.EventHubEvents.find(item => item.id === eventId);
const detailsSection = document.getElementById("eventDetails");
const notFoundSection = document.getElementById("eventNotFound");

function formatDate(dateString) {
    return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
}

if (!event) {
    notFoundSection.hidden = false;
} else {
    detailsSection.hidden = false;
    document.title = `${event.title} | EventHub`;
    document.getElementById("eventCover").classList.add(event.cover);
    document.getElementById("eventSymbol").textContent = event.symbol;
    document.getElementById("eventCategory").textContent = event.category;
    document.getElementById("eventDate").textContent = formatDate(event.date);
    document.getElementById("eventTitle").textContent = event.title;
    document.getElementById("eventOrganizer").textContent = `Organized by ${event.organizer}`;
    document.getElementById("eventDescription").textContent = event.description;
    document.getElementById("eventHighlights").innerHTML = event.highlights
        .map(highlight => `<li>${highlight}</li>`).join("");
    document.getElementById("factDate").textContent = formatDate(event.date);
    document.getElementById("factTime").textContent = event.time;
    document.getElementById("factVenue").textContent = event.venue;
    document.getElementById("factEligibility").textContent = event.eligibility;
    document.getElementById("factDeadline").textContent = formatDate(event.registrationDeadline);
    document.getElementById("factFee").textContent = event.fee;
    document.getElementById("registrationFee").textContent = event.fee;

    document.getElementById("registrationForm").addEventListener("submit", async submitEvent => {
        submitEvent.preventDefault();
        const status = document.getElementById("registrationStatus");
        status.textContent = "Submitting registration…";
        try {
            const response = await fetch(`/api/events/${event.id}/registrations`, { method: "POST" });
            const result = await response.json();
            if (response.status === 401) {
                const next = `${window.location.pathname}${window.location.search}`;
                window.location.href = `/pages/login.html?next=${encodeURIComponent(next)}`;
                return;
            }
            status.textContent = response.ok ? result.message : (result.error || "Could not register for this event.");
        } catch {
            status.textContent = "Could not reach EventHub. Start the Flask server and check the database connection.";
        }
    });
}

document.getElementById("menuToggle").addEventListener("click", clickEvent => {
    const menu = document.getElementById("navLinks");
    const open = menu.classList.toggle("open");
    clickEvent.currentTarget.setAttribute("aria-expanded", String(open));
});
document.getElementById("navLinks").addEventListener("click", clickEvent => {
    if (!clickEvent.target.closest("a")) return;
    document.getElementById("navLinks").classList.remove("open");
    document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
});

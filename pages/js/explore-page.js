const events = window.EventHubEvents;
const grid = document.getElementById("eventGrid");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
const locationFilter = document.getElementById("locationFilter");
const sortSelect = document.getElementById("sortSelect");

function selectedCategories() {
    return [...document.querySelectorAll('input[name="category"]:checked')]
        .map(input => input.value);
}

function formatDate(dateString) {
    return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
    });
}

function renderEvents() {
    const query = searchInput.value.trim().toLowerCase();
    const categories = selectedCategories();
    const location = locationFilter.value;
    const fee = document.querySelector('input[name="fee"]:checked').value;
    let filtered = events.filter(event => {
        const searchable = [event.title, event.category, event.organizer, event.location]
            .join(" ").toLowerCase();
        const feeMatches = fee === "All" || (fee === "Free" ? event.fee === "Free" : event.fee !== "Free");
        return searchable.includes(query) &&
            (!categories.length || categories.includes(event.category)) &&
            (location === "All" || event.location.startsWith(location)) && feeMatches;
    });

    switch (sortSelect.value) {
        case "date": filtered.sort((a, b) => a.date.localeCompare(b.date)); break;
        case "name": filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
        case "fee": filtered.sort((a, b) => (a.fee === "Free" ? 0 : 1) - (b.fee === "Free" ? 0 : 1) || a.date.localeCompare(b.date)); break;
        default: filtered.sort((a, b) => a.id - b.id);
    }

    grid.innerHTML = filtered.map(event => `
        <article class="event-card">
            <a class="event-card-hit-area" href="event-details.html?id=${event.id}" aria-label="Open ${event.title}"></a>
            <div class="event-cover ${event.cover}">
                <span class="cover-symbol" aria-hidden="true">${event.symbol}</span>
                <span class="event-badge">${event.category}</span>
            </div>
            <div class="event-body">
                <p class="event-date">${formatDate(event.date)}</p>
                <h3>${event.title}</h3>
                <p class="event-organizer">${event.organizer}</p>
                <p class="event-location">${event.location}</p>
                <div class="event-footer">
                    <span class="event-fee">${event.fee}</span>
                    <a class="event-link" href="event-details.html?id=${event.id}">View Details &rarr;</a>
                </div>
            </div>
        </article>
    `).join("");
    resultsCount.textContent = `${filtered.length} event${filtered.length === 1 ? "" : "s"} found`;
    emptyState.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;
}

function resetFilters() {
    searchInput.value = "";
    locationFilter.value = "All";
    sortSelect.value = "featured";
    document.querySelectorAll('input[name="category"]').forEach(input => { input.checked = false; });
    document.querySelector('input[name="fee"][value="All"]').checked = true;
    renderEvents();
}

searchInput.addEventListener("input", renderEvents);
locationFilter.addEventListener("change", renderEvents);
sortSelect.addEventListener("change", renderEvents);
document.querySelectorAll('input[name="category"], input[name="fee"]').forEach(input => input.addEventListener("change", renderEvents));
document.getElementById("searchForm").addEventListener("submit", event => { event.preventDefault(); renderEvents(); });
document.getElementById("resetFilters").addEventListener("click", resetFilters);
document.getElementById("emptyReset").addEventListener("click", resetFilters);
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

renderEvents();

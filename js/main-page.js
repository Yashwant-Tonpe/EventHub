const events = window.EventHubEvents;
const eventGrid = document.getElementById("eventGrid");
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const filterList = document.getElementById("filterList");
const sortSelect = document.getElementById("sortSelect");
const emptyState = document.getElementById("emptyState");
let activeCategory = "All";

function formatDate(dateString) {
    return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
    });
}

function renderEvents() {
    const query = searchInput.value.trim().toLowerCase();
    let filtered = events.filter(event => {
        const categoryMatches = activeCategory === "All" || event.category === activeCategory;
        const searchable = [event.title, event.category, event.organizer, event.location]
            .join(" ").toLowerCase();
        return categoryMatches && searchable.includes(query);
    });

    if (sortSelect.value === "name") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
        filtered.sort((a, b) => a.id - b.id);
    }

    eventGrid.innerHTML = filtered.map(event => `
        <article class="event-card">
            <a class="event-card-hit-area" href="pages/event-details.html?id=${event.id}" aria-label="Open ${event.title}"></a>
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
                    <a class="event-link" href="pages/event-details.html?id=${event.id}">View Details &rarr;</a>
                </div>
            </div>
        </article>
    `).join("");
    emptyState.hidden = filtered.length > 0;
}

function setCategory(category) {
    activeCategory = category;
    document.querySelectorAll(".filter-btn").forEach(button => {
        const selected = button.dataset.category === category;
        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(selected));
    });
    document.querySelectorAll(".category-card").forEach(button => {
        button.classList.toggle("chosen", button.dataset.category === category);
    });
    renderEvents();
}

searchForm.addEventListener("submit", event => {
    event.preventDefault();
    renderEvents();
    document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
});
searchInput.addEventListener("input", renderEvents);
filterList.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (button) setCategory(button.dataset.category);
});
document.querySelectorAll(".category-card").forEach(button => {
    button.addEventListener("click", () => {
        setCategory(button.dataset.category);
        document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
    });
});
sortSelect.addEventListener("change", renderEvents);
document.getElementById("clearFilters").addEventListener("click", () => {
    searchInput.value = "";
    sortSelect.value = "featured";
    setCategory("All");
});
document.getElementById("menuToggle").addEventListener("click", event => {
    const menu = document.getElementById("navLinks");
    const isOpen = menu.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});
document.getElementById("navLinks").addEventListener("click", event => {
    if (!event.target.closest("a")) return;
    document.getElementById("navLinks").classList.remove("open");
    document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
});

renderEvents();

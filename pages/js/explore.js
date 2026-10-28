
const events = [
    {
        id: 1,
        title: "CodeSprint Hackathon",
        category: "Technical",
        date: "2026-11-15",
        organizer: "Example Engineering College",
        location: "Pune",
        fee: "Free",
        symbol: "</>",
        cover: "cover-technical"
    },
    {
        id: 2,
        title: "Campus Cultural Fest",
        category: "Cultural",
        date: "2026-11-22",
        organizer: "Example Arts College",
        location: "Pune",
        fee: "Paid",
        symbol: "✦",
        cover: "cover-cultural"
    },
    {
        id: 3,
        title: "Inter-College Sports Meet",
        category: "Sports",
        date: "2026-12-05",
        organizer: "Example Sports Club",
        location: "Pimpri",
        fee: "Paid",
        symbol: "⚡",
        cover: "cover-sports"
    },
    {
        id: 4,
        title: "Web Development Workshop",
        category: "Workshop",
        date: "2026-11-28",
        organizer: "Example Tech Society",
        location: "Online",
        fee: "Free",
        symbol: "{ }",
        cover: "cover-workshop"
    },
    {
        id: 5,
        title: "National Coding Challenge",
        category: "Technical",
        date: "2026-12-12",
        organizer: "Example Computer Society",
        location: "Online",
        fee: "Free",
        symbol: "</>",
        cover: "cover-technical"
    },
    {
        id: 6,
        title: "Creative Arts Showcase",
        category: "Cultural",
        date: "2026-12-18",
        organizer: "Example Fine Arts Club",
        location: "Pune",
        fee: "Paid",
        symbol: "✦",
        cover: "cover-cultural"
    }
];

const grid = document.getElementById("eventGrid");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
const locationFilter = document.getElementById("locationFilter");
const sortSelect = document.getElementById("sortSelect");
const toast = document.getElementById("toast");

function getSelectedCategories() {
    return [...document.querySelectorAll(
        'input[name="category"]:checked'
    )].map(input => input.value);
}

function getSelectedFee() {
    return document.querySelector(
        'input[name="fee"]:checked'
    ).value;
}

function formatDate(date) {
    return new Date(date + "T12:00:00").toLocaleDateString(
        "en-IN",
        { day: "numeric", month: "short", year: "numeric" }
    );
}

function renderEvents() {
    const query = searchInput.value.trim().toLowerCase();
    const categories = getSelectedCategories();
    const location = locationFilter.value;
    const fee = getSelectedFee();

    let filtered = events.filter(event => {
        const searchable = [
            event.title,
            event.category,
            event.organizer,
            event.location
        ].join(" ").toLowerCase();

        return searchable.includes(query) &&
            (categories.length === 0 ||
                categories.includes(event.category)) &&
            (location === "All" || event.location.startsWith(location)) &&
            (fee === "All" || event.fee === fee);
    });

    switch (sortSelect.value) {
        case "date":
            filtered.sort((a, b) => a.date.localeCompare(b.date));
            break;
        case "name":
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "fee":
            filtered.sort((a, b) =>
                a.fee === b.fee ? a.date.localeCompare(b.date)
                    : a.fee === "Free" ? -1 : 1
            );
            break;
        default:
            filtered.sort((a, b) => a.id - b.id);
    }

    grid.innerHTML = filtered.map(event => `
        <article class="event-card">
            <div class="event-cover ${event.cover}">
                <span class="cover-symbol" aria-hidden="true">
                    ${event.symbol}
                </span>
                <span class="event-badge">${event.category}</span>
            </div>

            <div class="event-body">
                <p class="event-date">${formatDate(event.date)}</p>
                <h3>${event.title}</h3>
                <p class="event-organizer">${event.organizer}</p>
                <p class="event-location">⌖ ${event.location}</p>

                <div class="event-footer">
                    <span class="event-fee">${event.fee}</span>
                    <a href="#" class="event-link" data-event-id="${event.id}">
                        View Details →
                    </a>
                </div>
            </div>
        </article>
    `).join("");

    resultsCount.textContent =
        `${filtered.length} event${filtered.length === 1 ? "" : "s"} found`;

    emptyState.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;
}

function resetFilters() {
    searchInput.value = "";
    locationFilter.value = "All";
    sortSelect.value = "featured";

    document.querySelectorAll('input[name="category"]').forEach(input => {
        input.checked = false;
    });

    document.querySelector('input[name="fee"][value="All"]').checked = true;

    renderEvents();
}

searchInput.addEventListener("input", renderEvents);
locationFilter.addEventListener("change", renderEvents);
sortSelect.addEventListener("change", renderEvents);

document.querySelectorAll(
    'input[name="category"], input[name="fee"]'
).forEach(input => {
    input.addEventListener("change", renderEvents);
});

document.getElementById("searchForm").addEventListener("submit", event => {
    event.preventDefault();
    renderEvents();
});

document.getElementById("resetFilters").addEventListener("click", resetFilters);
document.getElementById("emptyReset").addEventListener("click", resetFilters);

grid.addEventListener("click", event => {
    const link = event.target.closest("[data-event-id]");
    if (!link) return;

    event.preventDefault();
    const selectedEvent = events.find(
        item => item.id === Number(link.dataset.eventId)
    );
    if (selectedEvent) {
        toast.textContent = `${selectedEvent.title}: event details page is coming next.`;
        toast.classList.add("show");
        window.clearTimeout(window.toastTimer);
        window.toastTimer = window.setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }
});

document.getElementById("menuToggle").addEventListener("click", event => {
    const menu = document.getElementById("navLinks");
    const open = menu.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", String(open));
});

document.getElementById("navLinks").addEventListener("click", event => {
    if (event.target.closest("a")) {
        document.getElementById("navLinks").classList.remove("open");
        document.getElementById("menuToggle")
            .setAttribute("aria-expanded", "false");
    }
});

renderEvents();

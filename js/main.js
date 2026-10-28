
const events = [
    {
        id: 1,
        title: "CodeSprint Hackathon",
        category: "Technical",
        date: "2026-11-15",
        organizer: "Example Engineering College",
        location: "Pune, Maharashtra",
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
        location: "Pune, Maharashtra",
        fee: "₹199",
        symbol: "✦",
        cover: "cover-cultural"
    },
    {
        id: 3,
        title: "Inter-College Sports Meet",
        category: "Sports",
        date: "2026-12-05",
        organizer: "Example Sports Club",
        location: "Pimpri, Maharashtra",
        fee: "₹100",
        symbol: "⚡",
        cover: "cover-sports"
    },
    {
        id: 4,
        title: "Web Development Workshop",
        category: "Workshop",
        date: "2026-11-28",
        organizer: "Example Tech Society",
        location: "Pune, Maharashtra",
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
        location: "Pune, Maharashtra",
        fee: "₹150",
        symbol: "✦",
        cover: "cover-cultural"
    }
];

const eventGrid = document.getElementById("eventGrid");
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const filterList = document.getElementById("filterList");
const sortSelect = document.getElementById("sortSelect");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");

let activeCategory = "All";

function formatDate(dateString) {
    return new Date(dateString + "T12:00:00").toLocaleDateString(
        "en-IN",
        { day: "numeric", month: "short", year: "numeric" }
    );
}

function renderEvents() {
    const query = searchInput.value.trim().toLowerCase();

    let filtered = events.filter(event => {
        const matchesCategory =
            activeCategory === "All" ||
            event.category === activeCategory;

        const searchableText = [
            event.title,
            event.category,
            event.organizer,
            event.location
        ].join(" ").toLowerCase();

        return matchesCategory && searchableText.includes(query);
    });

    if (sortSelect.value === "name") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
        filtered.sort((a, b) => a.id - b.id);
    }

    eventGrid.innerHTML = filtered.map(event => `
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
                    <a class="event-link"
                       href="#"
                       data-event-id="${event.id}">
                        View Details →
                    </a>
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
        button.classList.toggle(
            "chosen",
            button.dataset.category === category
        );
    });

    renderEvents();
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

searchForm.addEventListener("submit", event => {
    event.preventDefault();
    renderEvents();
    document.getElementById("explore").scrollIntoView({
        behavior: "smooth"
    });
});

searchInput.addEventListener("input", renderEvents);

filterList.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (button) setCategory(button.dataset.category);
});

document.querySelectorAll(".category-card").forEach(button => {
    button.addEventListener("click", () => {
        setCategory(button.dataset.category);
        document.getElementById("explore").scrollIntoView({
            behavior: "smooth"
        });
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
    if (event.target.closest("a")) {
        document.getElementById("navLinks").classList.remove("open");
        document.getElementById("menuToggle")
            .setAttribute("aria-expanded", "false");
    }
});

eventGrid.addEventListener("click", event => {
    const link = event.target.closest("[data-event-id]");
    if (!link) return;

    event.preventDefault();

    const selectedEvent = events.find(
        item => item.id === Number(link.dataset.eventId)
    );

    if (selectedEvent) {
        showToast(
            `${selectedEvent.title}: event details page is coming next.`
        );
    }
});

renderEvents();

async function updateAccountNavigation() {
    const actions = document.querySelector(".nav-actions");
    if (!actions) return;

    try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) return;
        const result = await response.json();
        if (!result.authenticated) return;

        const navLinks = document.querySelector(".nav-links");
        if (navLinks && !navLinks.querySelector('a[href="/pages/my-events.html"]')) {
            const myEvents = document.createElement("a");
            myEvents.href = "/pages/my-events.html";
            myEvents.textContent = "My Events";
            if (window.location.pathname === "/pages/my-events.html") {
                myEvents.classList.add("active");
            }
            navLinks.append(myEvents);
        }

        const greeting = document.createElement("span");
        greeting.className = "session-user";
        greeting.textContent = `Hi, ${result.user.name}`;

        const logout = document.createElement("button");
        logout.className = "btn btn-outline";
        logout.type = "button";
        logout.textContent = "Log Out";
        logout.addEventListener("click", async () => {
            logout.disabled = true;
            try {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.reload();
            } catch {
                logout.disabled = false;
            }
        });

        actions.replaceChildren(greeting, logout);
    } catch {
        // Keep the regular navigation when the API is unavailable.
    }
}

updateAccountNavigation();

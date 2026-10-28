const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const formStatus = document.getElementById("formStatus");

document.querySelectorAll("[data-password-toggle]").forEach(button => {
    button.addEventListener("click", () => {
        const input = button.parentElement.querySelector("input");
        const showPassword = input.type === "password";

        input.type = showPassword ? "text" : "password";
        button.textContent = showPassword ? "Hide" : "Show";
        button.setAttribute("aria-label", `${showPassword ? "Hide" : "Show"} password`);
        button.setAttribute("aria-pressed", String(showPassword));
    });
});

if (signupForm) {
    const password = signupForm.elements.password;
    const confirmPassword = signupForm.elements.confirmPassword;

    function validatePasswordMatch() {
        confirmPassword.setCustomValidity(
            confirmPassword.value && confirmPassword.value !== password.value
                ? "Passwords do not match."
                : ""
        );
    }

    password.addEventListener("input", validatePasswordMatch);
    confirmPassword.addEventListener("input", validatePasswordMatch);

    signupForm.addEventListener("submit", event => {
        event.preventDefault();
        validatePasswordMatch();
        if (!signupForm.reportValidity()) return;
        formStatus.textContent = "Creating your account…";
        fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: signupForm.elements.name.value.trim(),
                email: signupForm.elements.email.value.trim(),
                role: signupForm.elements.role.value,
                password: password.value
            })
        }).then(async response => {
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Could not create the account.");
            formStatus.textContent = "Account created. Opening EventHub…";
            window.setTimeout(() => { window.location.href = "/"; }, 500);
        }).catch(error => {
            formStatus.textContent = error instanceof TypeError
                ? "Could not reach EventHub. Start the Flask server and check the database connection."
                : error.message;
        });
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!loginForm.reportValidity()) return;
        formStatus.textContent = "Logging in…";
        fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: loginForm.elements.email.value.trim(),
                password: loginForm.elements.password.value
            })
        }).then(async response => {
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Could not log in.");
            formStatus.textContent = "Logged in. Opening EventHub…";
            const next = new URLSearchParams(window.location.search).get("next");
            const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
            window.setTimeout(() => { window.location.href = destination; }, 500);
        }).catch(error => {
            formStatus.textContent = error instanceof TypeError
                ? "Could not reach EventHub. Start the Flask server and check the database connection."
                : error.message;
        });
    });
}

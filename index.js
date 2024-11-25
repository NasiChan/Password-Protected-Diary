let authMode = "";

function showPasswordInput(mode) {
    authMode = mode;

    const passwordInputDiv = document.getElementById("password-input");
    const authMessage = document.getElementById("auth-message");

    // Set the message based on the mode
    authMessage.textContent =
        mode === "login"
            ? "Enter your password to log in:"
            : "Create a new password to sign up:";

    // Show the password input section
    passwordInputDiv.classList.remove("hidden");
}

async function authenticateUser() {
    const passwordBox = document.getElementById("password-box");
    const password = passwordBox.value.trim();

    if (!password) {
        showToast("Please enter a password.", "error");
        return;
    }

    if (authMode === "login") {
        const storedPassword = localStorage.getItem("userPassword");
        if (!storedPassword) {
            showToast("No account found. Please sign up first.", "error");
            return;
        }

        const hashedPassword = await hashPassword(password);
        if (hashedPassword === storedPassword) {
            showToast("Login successful!", "success");
            window.location.href = "diary.html";
        } else {
            showToast("Invalid password. Try again.", "error");
        }
    } else if (authMode === "signup") {
        if (password.length < 6) {
            showToast("Password must be at least 6 characters long.", "error");
            return;
        }

        const hashedPassword = await hashPassword(password);
        localStorage.setItem("userPassword", hashedPassword);
        showPopup("Sign up successful! You can now log in.");
        document.getElementById("password-box").value = "";
        authMode = ""; // Reset mode after successful signup
    }
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

function showPopup(message) {
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popup-message");

    popupMessage.textContent = message;
    popup.classList.remove("hidden");
}

function closePopup() {
    const popup = document.getElementById("popup");
    popup.classList.add("hidden");
}

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.padding = "10px";
    toast.style.backgroundColor = type === "success" ? "green" : "red";
    toast.style.color = "white";
    toast.style.borderRadius = "5px";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}


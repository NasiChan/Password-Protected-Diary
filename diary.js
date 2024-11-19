let authMode = "";
let failedAttempts = 0;

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

function showPasswordInput(mode) {
    authMode = mode;

    const passwordInputDiv = document.getElementById("password-input");
    passwordInputDiv.style.display = "block";

    const authMessage = document.getElementById("auth-message");
    authMessage.textContent =
        mode === "login"
            ? "Enter your password to log in:"
            : "Create a new password to sign up:";
}

async function authenticateUser() {
    toggleLoadingSpinner(true);

    const passwordBox = document.getElementById("password-box");
    const password = passwordBox.value;
    const hashedPassword = await hashPassword(password);

    if (authMode === "login") {
        const storedPassword = localStorage.getItem("userPassword");
        if (hashedPassword === storedPassword) {
            showToast("Login successful!", "success");
            window.location.href = "diary.html";
        } else {
            failedAttempts++;
            if (failedAttempts >= 3) {
                showToast("Too many failed attempts. Try again later.", "error");
                setTimeout(() => (failedAttempts = 0), 30000);
            } else {
                showToast("Invalid password. Try again.", "error");
            }
        }
    } else if (authMode === "signup") {
        if (password.length >= 6) {
            localStorage.setItem("userPassword", hashedPassword);
            showToast("Signup successful! You can now log in.", "success");
            window.location.href = "diary.html";
        } else {
            showToast("Password must be at least 6 characters long.", "error");
        }
    }

    toggleLoadingSpinner(false);
}

function evaluatePasswordStrength(password) {
    const strengthMessage = document.getElementById("password-strength");
    strengthMessage.classList.remove("hidden");

    if (password.length >= 12) {
        strengthMessage.textContent = "Password strength: Strong";
        strengthMessage.style.color = "green";
    } else if (password.length >= 8) {
        strengthMessage.textContent = "Password strength: Moderate";
        strengthMessage.style.color = "orange";
    } else {
        strengthMessage.textContent = "Password strength: Weak";
        strengthMessage.style.color = "red";
    }
}

function toggleLoadingSpinner(show) {
    const spinner = document.getElementById("loading-spinner");
    spinner.style.display = show ? "block" : "none";
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.backgroundColor = type === "success" ? "green" : "red";
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
}


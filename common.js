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

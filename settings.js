document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const currentPasswordInput = document.getElementById("current-password");
    const newPasswordInput = document.getElementById("new-password");
    const passwordMessage = document.getElementById("password-message");

    // Update Password Function
    async function updatePassword() {
        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();

        if (!currentPassword || !newPassword) {
            showToast("Both fields are required.", "error");
            return;
        }

        const storedPassword = localStorage.getItem("userPassword");
        const hashedCurrentPassword = await hashPassword(currentPassword);

        if (hashedCurrentPassword !== storedPassword) {
            showToast("Current password is incorrect.", "error");
            return;
        }

        if (newPassword.length < 6) {
            showToast("New password must be at least 6 characters long.", "error");
            return;
        }

        const hashedNewPassword = await hashPassword(newPassword);
        localStorage.setItem("userPassword", hashedNewPassword);

        showToast("Password updated successfully!", "success");
        currentPasswordInput.value = "";
        newPasswordInput.value = "";
    }

    // Change Theme Function
    function setTheme(theme) {
        const root = document.documentElement;
        switch (theme) {
            case "light":
                root.style.setProperty("--background-color", "#ffffff");
                root.style.setProperty("--text-color", "#000000");
                root.style.setProperty("--header-color", "#007bff");
                break;
            case "dark":
                root.style.setProperty("--background-color", "#121212");
                root.style.setProperty("--text-color", "#ffffff");
                root.style.setProperty("--header-color", "#1e1e1e");
                break;
            default:
                root.style.removeProperty("--background-color");
                root.style.removeProperty("--text-color");
                root.style.removeProperty("--header-color");
        }
        showToast(`Theme changed to ${theme}`, "success");
    }

    // Attach global functions to the window object
    window.updatePassword = updatePassword;
    window.setTheme = setTheme;
});

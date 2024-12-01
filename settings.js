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

        if (newPassword.length < 6) {
            showToast("New password must be at least 6 characters long.", "error");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    username: localStorage.getItem("username"), // assuming username is stored after login
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message, "success");
                currentPasswordInput.value = "";
                newPasswordInput.value = "";
            } else {
                showToast(data.message || "Failed to update password.", "error");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            showToast("An error occurred. Please try again later.", "error");
        }
    }
    window.updatePassword = updatePassword;
    window.setTheme = setTheme;
});

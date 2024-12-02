document.addEventListener("DOMContentLoaded", () => {
    const currentPasswordInput = document.getElementById("current-password");
    const newPasswordInput = document.getElementById("new-password");
    const confirmNewPasswordInput = document.getElementById("confirm-new-password");

    async function updatePassword() {
        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showToast("All fields are required.", "error");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showToast("New password and confirm password do not match.", "error");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: localStorage.getItem("username"),
                    currentPassword,
                    newPassword,
                    confirmNewPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message, "success");
                currentPasswordInput.value = "";
                newPasswordInput.value = "";
                confirmNewPasswordInput.value = "";
            } else {
                showToast(data.message || "Failed to update password.", "error");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            showToast("An error occurred. Please try again later.", "error");
        }
    }

    window.updatePassword = updatePassword;
});


document.addEventListener("DOMContentLoaded", () => {
    const archiveList = document.getElementById("archive-list");

    async function loadArchivedEntries() {
        try {
            // Replace 'username' with the currently logged-in user's username
            const username = localStorage.getItem('username'); // Example: store username in localStorage during login
            if (!username) {
                showToast('Error: Username not found.', 'error');
                return;
            }

            const response = await fetch(`http://localhost:3000/get-entries?username=${username}`);
            if (!response.ok) {
                throw new Error("Failed to fetch entries from the server.");
            }

            const entries = await response.json();
            if (entries.length === 0) {
                archiveList.innerHTML = "<li>No entries found.</li>";
                return;
            }

            // Populate the list with the fetched entries
            archiveList.innerHTML = entries
                .map(entry => `<li>${new Date(entry.date).toLocaleDateString()}: ${entry.entry_text}</li>`)
                .join("");
        } catch (error) {
            console.error("Error loading archived entries:", error);
            showToast("Error loading entries. Please try again.", "error");
        }
    }

    loadArchivedEntries();
});


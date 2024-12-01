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
                .map(entry => {
                    const date = new Date(entry.entry_date); // Parse the entry_date
                    const formattedDate = isNaN(date) ? "Invalid Date" : date.toLocaleString(); // Format the date
                    return `<li id="entry-${entry.id}">
                        <span id="entry-text-${entry.id}">${formattedDate}: ${entry.entry_text}</span>
                        <button class="delete-button" data-id="${entry.id}">Delete</button>
                        <button class="edit-button" data-id="${entry.id}">Edit</button>
                    </li>`;
                })
                .join("");

            // Attach event listeners to Delete and Edit buttons
            const deleteButtons = document.querySelectorAll(".delete-button");
            deleteButtons.forEach(button => {
                button.addEventListener("click", async (event) => {
                    const entryId = event.target.getAttribute("data-id");
                    await deleteEntry(entryId);
                    loadArchivedEntries(); // Reload the entries after deletion
                });
            });

            const editButtons = document.querySelectorAll(".edit-button");
            editButtons.forEach(button => {
                button.addEventListener("click", (event) => {
                    const entryId = event.target.getAttribute("data-id");
                    handleEditClick(entryId);
                });
            });
        } catch (error) {
            console.error("Error loading archived entries:", error);
            showToast("Error loading entries. Please try again.", "error");
        }
    }

    async function deleteEntry(entryId) {
        try {
            const response = await fetch(`http://localhost:3000/delete-entry`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: entryId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete entry.");
            }

            showToast("Entry deleted successfully!", "success");
        } catch (error) {
            console.error("Error deleting entry:", error);
            showToast("Failed to delete entry. Please try again.", "error");
        }
    }

    function handleEditClick(entryId) {
        const entryTextElement = document.getElementById(`entry-text-${entryId}`);
        const currentText = entryTextElement.textContent.split(": ")[1]; // Extract the existing text

        // Replace text with an input box and Save/Cancel buttons
        entryTextElement.innerHTML = `
            <input type="text" id="edit-input-${entryId}" value="${currentText}">
            <button class="save-edit-button" data-id="${entryId}">Save</button>
            <button class="cancel-edit-button" data-id="${entryId}">Cancel</button>
        `;

        // Attach event listeners to Save and Cancel buttons
        document.querySelector(`.save-edit-button[data-id="${entryId}"]`).addEventListener("click", async () => {
            const updatedText = document.getElementById(`edit-input-${entryId}`).value;
            await updateEntry(entryId, updatedText);
            loadArchivedEntries(); // Reload entries after editing
        });

        document.querySelector(`.cancel-edit-button[data-id="${entryId}"]`).addEventListener("click", () => {
            entryTextElement.innerHTML = `${currentText}`; // Restore the original text
        });
    }

    async function updateEntry(entryId, updatedText) {
        try {
            const response = await fetch(`http://localhost:3000/update-entry`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: entryId, entry_text: updatedText }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update entry.");
            }

            showToast("Entry updated successfully!", "success");
        } catch (error) {
            console.error("Error updating entry:", error);
            showToast("Failed to update entry. Please try again.", "error");
        }
    }

    loadArchivedEntries();
});

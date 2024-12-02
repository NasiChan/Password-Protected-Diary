document.addEventListener("DOMContentLoaded", () => {
    const archiveList = document.getElementById("archive-list");

    /**
     * Load Archived Entries: Fetches diary entries for the logged-in user and displays them in the archive list.
     * Preconditions: The user must be logged in, and the username must be stored in `localStorage`.
     * Postconditions: Populates the archive list with the fetched entries and attaches event listeners to the Edit and Delete buttons.
     */
    async function loadArchivedEntries() {
        try {
            const username = localStorage.getItem('username');
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

            // Populate the archive list with entries
            archiveList.innerHTML = entries
                .map(entry => {
                    const date = new Date(entry.entry_date);
                    const formattedDate = isNaN(date) ? "Invalid Date" : date.toLocaleString();
                    return `
                        <li id="entry-${entry.id}">
                            <span id="entry-text-${entry.id}">${formattedDate}: ${entry.entry_text}</span>
                            <button class="delete-button" data-id="${entry.id}">Delete</button>
                            <button class="edit-button" data-id="${entry.id}">Edit</button>
                        </li>`;
                })
                .join("");

            // Attach event listeners for editing and deleting
            attachEventListeners();
        } catch (error) {
            console.error("Error loading archived entries:", error);
            showToast("Error loading entries. Please try again.", "error");
        }
    }

    /**
     * Attach Event Listeners: Adds event listeners to the Delete and Edit buttons for each entry.
     * Preconditions: The archive list must contain entries with corresponding Edit and Delete buttons.
     * Postconditions: Listeners allow the user to delete or edit entries.
     */
    function attachEventListeners() {
        const deleteButtons = document.querySelectorAll(".delete-button");
        deleteButtons.forEach(button => {
            button.addEventListener("click", async (event) => {
                const entryId = event.target.getAttribute("data-id");
                await deleteEntry(entryId);
                loadArchivedEntries(); // Reload entries after deletion
            });
        });

        const editButtons = document.querySelectorAll(".edit-button");
        editButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                const entryId = event.target.getAttribute("data-id");
                handleEditClick(entryId); // Initiate editing for the selected entry
            });
        });
    }

    /**
     * Handle Edit Click: Initiates the editing process for a specific diary entry.
     * Preconditions: The entry with the given ID must exist in the DOM.
     * Postconditions: Replaces the entry text with an input box and Save/Cancel buttons, adjusts the input height dynamically.
     */
    function handleEditClick(entryId) {
        const entryTextElement = document.getElementById(`entry-text-${entryId}`);
        const editButton = document.querySelector(`.edit-button[data-id="${entryId}"]`);
        const deleteButton = document.querySelector(`.delete-button[data-id="${entryId}"]`);
        
        // Preserve the original text using a data attribute
        const currentText = entryTextElement.textContent.split(": ")[1];
        entryTextElement.setAttribute("data-original-text", currentText); // Store original text in a data attribute
    
        // Hide Edit and Delete buttons
        editButton.classList.add("hidden");
        deleteButton.classList.add("hidden");
    
        // Replace text with a textarea for editing
        entryTextElement.innerHTML = `
            <textarea id="edit-input-${entryId}">${currentText}</textarea>
            <button class="save-edit-button visible" data-id="${entryId}">Save</button>
            <button class="cancel-edit-button visible" data-id="${entryId}">Cancel</button>
        `;
    
        // Adjust textarea height to match content
        const editInput = document.getElementById(`edit-input-${entryId}`);
        editInput.style.height = "auto";
        editInput.style.height = `${editInput.scrollHeight}px`;
    
        // Dynamically resize the textarea as the user types
        editInput.addEventListener("input", () => {
            editInput.style.height = "auto";
            editInput.style.height = `${editInput.scrollHeight}px`;
        });
    
        // Save updated entry
        document.querySelector(`.save-edit-button[data-id="${entryId}"]`).addEventListener("click", async () => {
            const updatedText = editInput.value.trim();
            if (updatedText) {
                await updateEntry(entryId, updatedText);
                loadArchivedEntries();
            } else {
                showToast("Entry cannot be empty.", "error");
            }
        });
    
        // Cancel editing and revert to original content
        document.querySelector(`.cancel-edit-button[data-id="${entryId}"]`).addEventListener("click", () => {
            const originalText = entryTextElement.getAttribute("data-original-text"); // Retrieve original text
            entryTextElement.innerHTML = `${originalText}`; // Restore original text
            editButton.classList.remove("hidden");
            deleteButton.classList.remove("hidden");
        });
    }
    

    /**
     * Delete Diary Entry: Deletes a diary entry by its ID.
     * Preconditions: The entry with the given ID must exist in the database.
     * Postconditions: The entry is deleted from the database and the UI is updated to reflect the deletion.
     */
    async function deleteEntry(entryId) {
        try {
            const response = await fetch(`http://localhost:3000/delete-entry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

    /**
     * Update Diary Entry: Updates the text of an existing diary entry.
     * Preconditions: The entry with the given ID must exist in the database.
     * Postconditions: The diary entry is updated in the database and the UI is updated to reflect the changes.
     */
    async function updateEntry(entryId, updatedText) {
        try {
            const response = await fetch(`http://localhost:3000/update-entry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

    // Initial load of archived entries on page load
    loadArchivedEntries();
});

/**
 * Handle Diary Entry Save and Display: Saves a new diary entry and displays it.
 * Listens for the 'DOMContentLoaded' event to initialize and manage diary entries.
 * 
 * Preconditions:
 * - The `diary-entry` textarea and `save-entry` button must be present in the DOM.
 * - The `username` must be stored in `localStorage` for identifying the user.
 * - A valid backend service must be running at 'http://localhost:3000/save-entry' to handle saving the entry.
 * 
 * Postconditions:
 * - A new diary entry is saved to the backend and stored locally (if successful).
 * - The list of diary entries is updated and displayed in the `entries` section.
 * - A toast notification is shown indicating success or failure of the entry save.
 */
document.addEventListener("DOMContentLoaded", () => {
    const diaryEntry = document.getElementById("diary-entry");
    const saveButton = document.getElementById("save-entry");
    const entryList = document.getElementById("entries");

    // to make the textarea expandable
    document.addEventListener("input", function (e) {
        const textarea = e.target;
        if (textarea.tagName === "TEXTAREA") {
            textarea.style.height = "auto"; // Reset the height
            textarea.style.height = textarea.scrollHeight + "px"; // Set to scroll height
        }
    });

    /**
     * Load Saved Diary Entries: Retrieves diary entries from `localStorage` and displays them.
     * 
     * Preconditions:
     * - Entries must be stored in `localStorage` under the key 'diaryEntries' in JSON format.
     * 
     * Postconditions:
     * - The entries are displayed in the `entries` list in the HTML.
     */
    const loadEntries = () => {
        const diaryEntries = JSON.parse(localStorage.getItem("diaryEntries")) || [];
        entryList.innerHTML = '';  // Clear the list
        diaryEntries.forEach(entry => {
            const li = document.createElement("li");
            li.textContent = `${entry.date}: ${entry.text}`;
            entryList.appendChild(li);
        });
    };

    /**
     * Save Diary Entry: Saves the current diary entry and sends it to the server for persistence.
     * 
     * Preconditions:
     * - The `diary-entry` textarea must have content.
     * - The user must be logged in, and their username must be stored in `localStorage`.
     * 
     * Postconditions:
     * - The entry is sent to the backend server for saving.
     * - The local storage is updated with the new entry.
     * - A toast notification is displayed indicating success or failure.
     */
    saveButton.addEventListener("click", async () => {
        const entry = diaryEntry.value.trim();
        const username = localStorage.getItem("username"); // Retrieve username
    
        if (!username) {
            showToast("Error: User not logged in.", "error");
            return;
        }
    
        if (entry) {
            try {
                const response = await fetch('http://localhost:3000/save-entry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, entryText: entry }),
                });
    
                const result = await response.json();
                if (response.ok) {
                    showToast("Diary entry saved successfully!", "success");
                    diaryEntry.value = "";
                    // Resetting the textarea height 
                    diaryEntry.style.height = "auto";
                    diaryEntry.style.height = `${diaryEntry.scrollHeight}px`;
                } else {
                    showToast(result.message || "Error saving entry.", "error");
                }
            } catch (error) {
                console.error("Error:", error);
                showToast("Failed to save entry.", "error");
            }
        } else {
            showToast("Please write something before saving.", "error");
        }
    });

    // Initial load of entries when page loads
    loadEntries();
});

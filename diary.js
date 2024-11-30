document.addEventListener("DOMContentLoaded", () => {
    const diaryEntry = document.getElementById("diary-entry");
    const saveButton = document.getElementById("save-entry");
    const entryList = document.getElementById("entries");

    // Load saved entries from localStorage and display them
    const loadEntries = () => {
        const diaryEntries = JSON.parse(localStorage.getItem("diaryEntries")) || [];
        entryList.innerHTML = '';  // Clear the list
        diaryEntries.forEach(entry => {
            const li = document.createElement("li");
            li.textContent = `${entry.date}: ${entry.text}`;
            entryList.appendChild(li);
        });
    };

    // Save the entry and update the list
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
    

    loadEntries(); // Initial load of entries when page loads
});




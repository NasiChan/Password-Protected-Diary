
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
    saveButton.addEventListener("click", () => {
        const entry = diaryEntry.value.trim();
        if (entry) {
            const diaryEntries = JSON.parse(localStorage.getItem("diaryEntries")) || [];
            diaryEntries.push({ date: new Date().toLocaleString(), text: entry });
            localStorage.setItem("diaryEntries", JSON.stringify(diaryEntries));
            showToast("Diary entry saved successfully!", "success");
            diaryEntry.value = "";
            loadEntries(); // Reload the entries
        } else {
            showToast("Please write something before saving.", "error");
        }
    });

    loadEntries(); // Initial load of entries when page loads
});

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


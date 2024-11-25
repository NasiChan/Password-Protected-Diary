document.addEventListener("DOMContentLoaded", () => {
    const diaryEntry = document.getElementById("diary-entry");
    const saveButton = document.getElementById("save-entry");

    saveButton.addEventListener("click", () => {
        const entry = diaryEntry.value.trim();
        if (entry) {
            const diaryEntries = JSON.parse(localStorage.getItem("diaryEntries")) || [];
            diaryEntries.push({ date: new Date().toLocaleString(), text: entry });
            localStorage.setItem("diaryEntries", JSON.stringify(diaryEntries));
            showToast("Diary entry saved successfully!", "success");
            diaryEntry.value = "";
        } else {
            showToast("Please write something before saving.", "error");
        }
    });
});

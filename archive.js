document.addEventListener("DOMContentLoaded", () => {
    const archiveList = document.getElementById("archive-list");

    function loadArchivedEntries() {
        const archivedEntries = JSON.parse(localStorage.getItem("archivedEntries")) || [];
        archiveList.innerHTML = archivedEntries
            .map(entry => `<li>${entry.date}: ${entry.text}</li>`)
            .join("");
    }

    loadArchivedEntries();
});

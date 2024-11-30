// Common toast function
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}



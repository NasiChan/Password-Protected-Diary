/**
 * Show Toast Notification: Displays a toast notification with a message.
 * @param {string} message - The message to display in the toast.
 * @param {string} type - The type of the toast, determining its style (e.g., 'success', 'error').
 * 
 * Preconditions:
 * - The `message` and `type` parameters must be non-empty strings.
 * - The page must be able to append elements to the body.
 * 
 * Postconditions:
 * - A toast notification element is added to the body of the page with the specified message and type.
 * - The toast will automatically disappear after 3 seconds.
 */
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}




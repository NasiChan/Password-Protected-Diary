const apiUrl = 'http://localhost:3000';

async function signUp() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    // Show the loading spinner
    toggleLoadingSpinner(true);

    const response = await fetch(`${apiUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const result = await response.text();

    // Hide the loading spinner
    toggleLoadingSpinner(false);

    document.getElementById('signup-result').innerText = result;
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    toggleLoadingSpinner(true);

    try {
        const response = await fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json(); // Parse JSON response

        toggleLoadingSpinner(false);

        if (response.ok) {
            if (result.redirect) {
                // Redirect to the diary page
                window.location.href = result.redirect;
            } else {
                alert(result.message || "Login successful");
            }
        } else {
            alert(result.message || "Login failed");
        }
    } catch (error) {
        toggleLoadingSpinner(false);
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

function toggleLoadingSpinner(show) {
    const spinner = document.getElementById("loading-spinner");
    spinner.style.display = show ? "block" : "none";
}

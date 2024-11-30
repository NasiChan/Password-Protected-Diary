const apiUrl = 'http://localhost:3000';

// Sign-up function
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

// Login function
function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.redirect) {
            localStorage.setItem("username", username);
            // Redirect to the diary.html page after successful login
            window.location.href = 'http://localhost:3000/diary.html';  // Use relative URL to access diary.html
        } else {
            showToast(data.message, "error");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast("An error occurred. Please try again.", "error");
    });
}

// Function to toggle the loading spinner
function toggleLoadingSpinner(show) {
    const spinner = document.getElementById("loading-spinner");
    spinner.style.display = show ? "block" : "none";
}

// Handling form submission via button clicks or other actions on index.html
document.addEventListener('DOMContentLoaded', function () {
    // Sign-up form event listener
    const signUpButton = document.getElementById('signup-button');
    signUpButton.addEventListener('click', function (e) {
        e.preventDefault();
        signUp();  // Call the sign-up function on button click
    });

});
const apiUrl = 'http://localhost:3000';


function initializePage() {
    console.log("Page initialized!");
    const signupButton = document.getElementById('signup-button');
    const loginButton = document.getElementById('login-button');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    signupButton.addEventListener('click', () => {
        signupForm.classList.remove('hidden');
        signupForm.classList.add('visible');
        loginForm.classList.add('hidden');
    });

    loginButton.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        loginForm.classList.add('visible');
        signupForm.classList.add('hidden');
    });
}
/**
 * Sign-Up Function: Registers a new user by sending the provided username and password to the backend.
 * 
 * Preconditions:
 * - The username and password must be input by the user in the corresponding fields (`signup-username`, `signup-password`).
 * - The backend must be running at 'http://localhost:3000' with a `/signup` route to handle the POST request.
 * 
 * Postconditions:
 * - The new user's data is sent to the backend for registration.
 * - A response message from the server is displayed in the `signup-result` element.
 * - If an error occurs during the request, the error message is displayed.
 */
async function signUp() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    toggleLoadingSpinner(true);

    try {
        const response = await fetch(`${apiUrl}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

      
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.text();
        document.getElementById('signup-result').innerText = result;
    } catch (error) {
        handleClientError(error, 'signup-result');
    } finally {
        toggleLoadingSpinner(false);
    }
}

/**
 * Login Function: Authenticates a user and redirects to the diary page upon successful login.
 * 
 * Preconditions:
 * - The username and password must be input by the user in the corresponding fields (`login-username`, `login-password`).
 * - The backend must be running at 'http://localhost:3000' with a `/login` route to handle the POST request.
 * - The username must exist in the backend for a successful login.
 * 
 * Postconditions:
 * - The user is authenticated, and the username is stored in `localStorage`.
 * - The user is redirected to the `/diary.html` page if the login is successful.
 * - If login fails, a toast message is displayed with the error.
 */
async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.redirect) {
            localStorage.setItem("username", username);
            window.location.href = `${apiUrl}/diary.html`;
        } else {
            showToast(data.message, "error");
        }
    } catch (error) {
        handleClientError(error, 'login-result');
    }
}

/**
 * Handles client-side errors by displaying appropriate error messages.
 */
function handleClientError(error, resultElementId) {
    const errorMessage = error.message.includes('Failed to fetch')
        ? 'The server is currently unreachable. Please check your connection.'
        : error.message;

    document.getElementById(resultElementId).innerText = errorMessage;
    console.error('Client Error:', error.message);
}

/**
 * Toggles the visibility of the loading spinner.
 */
function toggleLoadingSpinner(show) {
    const spinner = document.getElementById("loading-spinner");
    spinner.style.display = show ? "block" : "none";
}

/**
 * Initializes event listeners for toggling between login and signup forms.
 * Called when the page is fully loaded.
 */



// Exporting for testing or external usage
// export { signUp, login };


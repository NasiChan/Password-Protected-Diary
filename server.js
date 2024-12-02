const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

//#region Middleware Setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
//#endregion Middleware Setup

//#region Database Connection
/**
 * Creates a connection to the MySQL database.
 * Uses the provided host, user, password, and database values to establish a connection.
 * Expects: MySQL credentials and database name.
 * Throws an error if the connection fails.
 */
const db = mysql.createConnection({
    host: 'localhost',
    user: 'NasiChan',  
    password: '@Salimeh_3', 
    database: 'diaryDB'  
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        process.exit(1); // Exit the process if database connection fails
    }
    console.log('Connected to the MySQL database');
});
//#endregion Database Connection

//#region Error Handling Utility
/**
 * Sends a consistent error response.
 * @param {Object} res - Express response object.
 * @param {number} status - HTTP status code.
 * @param {string} message - Error message to be sent in the response.
 */
function sendErrorResponse(res, status, message) {
    res.status(status).json({ error: message });
}
//#endregion Error Handling Utility

//#region Routes

// Health Check Route
/**
 * Health check route to verify server is running.
 * Expects no parameters.
 * Returns: "Server is up and running!" message on success.
 */
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// User Routes
/**
 * Sign-up Route: Adds a new user to the database.
 * Expects: { username, password } in the request body.
 * Preconditions: The request must contain a valid username and password.
 * Postcondition: User is added to the database if credentials are valid.
 */
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return sendErrorResponse(res, 400, 'Username and password are required.');
    }

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err, result) => {
        if (err) {
            console.error('Error saving user:', err.message);
            return sendErrorResponse(res, 500, 'Error saving user. Please try again later.');
        }
        res.status(200).json({ message: 'Sign-up successful.' });
    });
});

/**
 * Login Route: Authenticates a user.
 * Expects: { username, password } in the request body.
 * Preconditions: User must exist in the database with the correct credentials.
 * Postcondition: If credentials are correct, user is authenticated.
 */
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return sendErrorResponse(res, 400, 'Username and password are required.');
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            console.error('Error querying the database:', err.message);
            return sendErrorResponse(res, 500, 'Database query failed. Please try again later.');
        }

        if (result.length === 0) {
            return sendErrorResponse(res, 404, 'User not found.');
        }

        const storedPassword = result[0].password;

        if (password === storedPassword) {
            res.status(200).json({ message: 'Login successful', redirect: '/diary.html' });
        } else {
            return sendErrorResponse(res, 401, 'Invalid password.');
        }
    });
});

/**
 * Save Diary Entry Route: Saves an entry for the logged-in user.
 * Expects: { username, entryText } in the request body.
 * Preconditions: User must be logged in, and entry text must be provided.
 * Postcondition: The entry is saved to the database for the given user.
 */
app.post('/save-entry', (req, res) => {
    const { username, entryText } = req.body;

    if (!username || !entryText) {
        return sendErrorResponse(res, 400, 'Username and entry text are required.');
    }

    const query = 'INSERT INTO entries (username, entry_text, entry_date) VALUES (?, ?, ?)';
    const params = [username, entryText, new Date()];

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error saving entry:', err.message);
            return sendErrorResponse(res, 500, 'Error saving entry. Please try again later.');
        }
        res.status(200).json({ message: 'Entry saved successfully.' });
    });
});

/**
 * Get Diary Entries Route: Retrieves all entries for a specific user.
 * Expects: username as a query parameter.
 * Preconditions: User must exist in the database.
 * Postcondition: Returns all diary entries for the specified user.
 */
app.get('/get-entries', (req, res) => {
    const { username } = req.query;

    if (!username) {
        return sendErrorResponse(res, 400, 'Username is required.');
    }

    const query = 'SELECT * FROM entries WHERE username = ? ORDER BY entry_date DESC';

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error retrieving entries:', err.message);
            return sendErrorResponse(res, 500, 'Error retrieving entries. Please try again later.');
        }

        if (results.length === 0) {
            return sendErrorResponse(res, 404, 'No entries found for this user.');
        }

        res.status(200).json(results);
    });
});

/**
 * Delete Diary Entry Route: Deletes an entry by ID.
 * Expects: { id } in the request body.
 * Preconditions: The entry with the provided ID must exist in the database.
 * Postcondition: The entry is removed from the database.
 */
app.post('/delete-entry', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return sendErrorResponse(res, 400, 'Entry ID is required.');
    }

    const deleteQuery = 'DELETE FROM entries WHERE id = ?';

    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            console.error('Error deleting entry:', err.message);
            return sendErrorResponse(res, 500, 'Error deleting entry. Please try again later.');
        }

        if (result.affectedRows === 0) {
            return sendErrorResponse(res, 404, 'Entry not found.');
        }

        res.status(200).json({ message: 'Entry deleted successfully.' });
    });
});

/**
 * Update Diary Entry Route: Updates the text of an existing entry.
 * Expects: { id, entryText } in the request body.
 * Preconditions: The entry with the provided ID must exist.
 * Postcondition: The entry is updated with the new text.
 */
app.post('/update-entry', (req, res) => {
    const { id, entryText } = req.body;

    if (!id || !entryText) {
        return sendErrorResponse(res, 400, 'Entry ID and text are required.');
    }

    const updateQuery = 'UPDATE entries SET entry_text = ? WHERE id = ?';

    db.query(updateQuery, [entryText, id], (err, result) => {
        if (err) {
            console.error('Error updating entry:', err.message);
            return sendErrorResponse(res, 500, 'Error updating entry. Please try again later.');
        }

        if (result.affectedRows === 0) {
            return sendErrorResponse(res, 404, 'Entry not found.');
        }

        res.status(200).json({ message: 'Entry updated successfully.' });
    });
});
/**
 * Update Password Route: Allows the user to change their password.
 * Expects: { username, currentPassword, newPassword, currentPasswordConfirm } in the request body.
 * Preconditions: The user must exist, and the current password must be correct. The new password and confirm password must match.
 * Postcondition: If the passwords match and are valid, the user's password is updated.
 */

app.post('/update-password', (req, res) => {
    const { username, currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!username || !currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: "New password and confirm password do not match." });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            console.error('Error querying the database:', err.message);
            return sendErrorResponse(res, 500, 'Database query failed. Please try again later.');
        }

        if (result.length === 0) {
            return sendErrorResponse(res, 404, 'User not found.');
        }

        const storedPassword = result[0].password;

        if (currentPassword !== storedPassword) {
            return res.status(403).json({ message: "Current password is incorrect." });
        }

        const updateQuery = 'UPDATE users SET password = ? WHERE username = ?';
        db.query(updateQuery, [newPassword, username], (err) => {
            if (err) {
                console.error('Error updating password:', err.message);
                return sendErrorResponse(res, 500, 'Error updating password. Please try again later.');
            }

            res.status(200).json({ message: "Password updated successfully." });
        });
    });
});


///#endregion Routes

//#region Server Initialization
/**
 * Initializes the server to listen on the specified port.
 * Postcondition: The server starts and listens for incoming requests.
 */
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
//#endregion Server Initialization

//#endregion
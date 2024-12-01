
//#region index.html
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'NasiChan',  // Replace with your MySQL username
    password: '@Salimeh_3',  // Replace with your MySQL password
    database: 'diaryDB'  // Replace with your database name
});

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1); // Exit the process if database connection fails
    }
    console.log('Connected to the MySQL database');
});

//#region Helper Functions

// Function to get user by username
async function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM users WHERE username = ?";
        db.query(query, [username], (err, results) => {
            if (err) {
                console.error("Error fetching user:", err);
                return reject(err);
            }
            if (results.length === 0) {
                return resolve(null); // User not found
            }
            resolve(results[0]); // Return the first result
        });
    });
}

// Function to update user's password
async function updateUserPassword(username, newPassword) {
    return new Promise((resolve, reject) => {
        const query = "UPDATE users SET password = ? WHERE username = ?";
        db.query(query, [newPassword, username], (err, result) => {
            if (err) {
                console.error("Error updating password:", err);
                return reject(err);
            }
            resolve(result);
        });
    });
}

//#endregion Helper Functions

//#region Routes

// Basic health check route
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// Sign-up route
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err, result) => {
        if (err) {
            return res.status(500).send('Error saving user');
        }
        res.status(200).send('Sign-up successful');
    });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Error querying the database' });
        }

        if (result.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        const storedPassword = result[0].password;

        if (password === storedPassword) {
            res.status(200).json({ message: 'Login successful', redirect: '/diary.html' });
        } else {
            res.status(400).json({ message: 'Invalid password' });
        }
    });
});

// Update password route
app.post('/update-password', async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    try {
        // Get the user from the database
        const user = await getUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Verify the current password matches
        if (user.password !== currentPassword) {
            return res.status(403).json({ message: "Current password is incorrect." });
        }

        // Update the password
        await updateUserPassword(username, newPassword);

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

//#endregion Routes

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


//#endregion

//#region diary.html and archive.html
app.post('/save-entry', (req, res) => {
    const { username, entryText } = req.body;

    if (!username || !entryText) {
        return res.status(400).send({ message: 'Username and entry text are required' });
    }

    const query = 'INSERT INTO entries (username, entry_text, entry_date) VALUES (?, ?, ?)';
    const params = [username, entryText, new Date()];
    console.log('Executing query:', query, params);

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error saving entry:', err.sqlMessage || err);
            return res.status(500).send({ message: 'Error saving entry.' });
        }
        res.status(200).send({ message: 'Entry saved successfully!' });
    });
});

app.get('/get-entries', (req, res) => {
    const { username } = req.query;

    if (!username) {
        console.error("No username provided in request");
        return res.status(400).send({ message: 'Username is required.' });
    }

    const query = 'SELECT * FROM entries WHERE username = ? ORDER BY entry_date DESC';
    const params = [username];

    console.log('Executing query:', query, params); // Log the query and parameters

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.sqlMessage || err);
            return res.status(500).send({ message: 'Error retrieving entries.' });
        }

        console.log('Query executed successfully. Results:', results); // Log the raw results
        if (results.length === 0) {
            console.log('No entries found for username:', username);
            return res.status(404).send({ message: 'No entries found for this user.' });
        }

        res.status(200).json(results);
    });
});


app.post('/delete-entry', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).send({ message: "Entry ID is required." });
    }

    const deleteQuery = "DELETE FROM entries WHERE id = ?";
    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            console.error("Error deleting entry:", err.sqlMessage || err);
            return res.status(500).send({ message: "Error deleting entry." });
        }

        // Step 2: Reorder IDs
        const reorderQuery = `
            SET @row_number = 0;
            UPDATE entries SET id = (@row_number := @row_number + 1);
        `;
        db.query(reorderQuery, (err, result) => {
            if (err) {
                console.error("Error reordering IDs:", err.sqlMessage || err);
                return res.status(500).send({ message: "Error reordering IDs." });
            }

            res.status(200).send({ message: "Entry deleted successfully." });
        });
    });
});

app.post('/update-entry', (req, res) => {
    const { id, entry_text } = req.body;

    if (!id || !entry_text) {
        return res.status(400).send({ message: "Entry ID and text are required." });
    }

    const query = "UPDATE entries SET entry_text = ? WHERE id = ?";
    db.query(query, [entry_text, id], (err, result) => {
        if (err) {
            console.error("Error updating entry:", err.sqlMessage || err);
            return res.status(500).send({ message: "Error updating entry." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Entry not found." });
        }

        res.status(200).send({ message: "Entry updated successfully." });
    });
});
//#endregion

//#region settings.js
app.post('/update-password', async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    try {
        const user = await getUserByUsername(username); // Function to fetch user data

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(403).json({ message: "Current password is incorrect." });
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(username, newHashedPassword); // Function to update password

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

//#endregion
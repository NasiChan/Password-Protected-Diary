//#region index.html
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
// Create an Express application
const app = express();
const port = 3000; 

// Middleware setup
app.use(cors());
app.use(bodyParser.json()); // To parse JSON body in requests
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

// Basic Health Check Route (GET)
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// Sign-up route: POST /signup
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    // Save the user in the database (without hashing)
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err, result) => {
        if (err) {
            return res.status(500).send('Error saving user');
        }
        res.status(200).send('Sign-up successful');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required' });
    }

    // Retrieve user from the database by username
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Error querying the database' });
        }

        if (result.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        const storedPassword = result[0].password;

        // Compare the input password with the stored password (no hashing)
        if (password === storedPassword) {
            // Return a response with a redirect
            res.status(200).json({ message: 'Login successful', redirect: '/diary.html' });
        } else {
            res.status(400).json({ message: 'Invalid password' });
        }
    });
});


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
        return res.status(400).send({ message: 'Username is required.' });
    }

    const query = 'SELECT * FROM entries WHERE username = ? ORDER BY entry_date DESC';
    const params = [username];
    console.log('Executing query:', query, params);

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error retrieving entries:', err.sqlMessage || err);
            return res.status(500).send({ message: 'Error retrieving entries.' });
        }
        res.status(200).json(results);
    });
});
//#endregion
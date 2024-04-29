const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise'); // Database connection
const dotenv = require('dotenv'); // dotenc for database connection
const { checkDatabase, addUser, emailExists, logWorkout, workoutExists, pool, addReminder, getReminders } = require('./database.js');

dotenv.config(); 

const app = express();
const port = process.env.PORT || 3000; // Use port from environment variables or default to 3000

app.use(session({
    secret: 'key', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if your site is served over HTTPS
}));

// Middleware to parse JSON bodies
app.use(express.json());

app.use(express.static('views'));

// Route to handle sign-in request
app.post('/signin', async (req, res) => {
    const { email, password } = req.body; // Get email and password 
    try {
        const user = await checkDatabase(email, password); // Check if user exists
        if (user) {
            req.session.userId = user.id;
            res.status(200).send({ message: 'Success', user });
        } else {
            res.status(401).send({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (await emailExists(email)) {
            res.status(409).send({ message: 'Email already registered.'});
            // console.log("email already registered");
            return;
        }


        await addUser(email, password);
        res.status(201).send({ message: 'Account created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).send({ message: 'Failed to create account' });
    }
});

app.post('/submit-workouts', async (req, res) => {
    const { date, workouts } = req.body;
    const userId = req.session.userId; // Retrieved from session

    if (!userId) {
        return res.status(403).json({ message: 'User not authenticated' });
    }

    try {
        for (const workout of workouts) {
            const exists = await workoutExists(userId, date, workout.type);
            if (exists) {
                return res.status(409).json({ message: `Workout already logged for ${workout.type} on this date` });
            }

            // Insert workout if it does not exist
            await logWorkout(userId, date, workout.type, workout.weight, workout.sets, workout.reps);
        }
        res.status(201).json({ message: 'Workouts logged successfully' });
    } catch (error) {
        console.error('Failed to log workouts:', error);
        res.status(500).json({ message: 'Error logging workouts' });
    }
});


app.get('/workouts', async (req, res) => {
    const userId = req.session.userId; // Session management

    try {
        const [workouts] = await pool.query('SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC', [userId]);
        res.json(workouts);
    } catch (error) {
        console.error('Failed to fetch workouts:', error);
        res.status(500).json({ message: 'Error fetching workouts' });
    }
});

app.delete('/dismiss-reminder/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM reminders WHERE id = ?', [id]);
        res.send({ message: 'Reminder dismissed' });
    } catch (error) {
        console.error('Failed to dismiss reminder:', error);
        res.status(500).send({ message: 'Failed to dismiss reminder' });
    }
});

app.post('/add-reminder', async (req, res) => {
    const { date, time, message } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).json({ message: 'User not authenticated' });
    }

    try {
        const result = await addReminder(userId, date, time, message);
        if (result) {
            res.json({
                success: true,
                message: 'Reminder added successfully.',
                reminder: { date, time, message, id: result.insertId } // Send back the added reminder details
            });
        } else {
            res.status(400).json({ success: false, message: 'Reminder was not added.' });
        }
    } catch (error) {
        console.error('Error adding reminder:', error);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
});

app.get('/get-reminders', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(403).json({ message: 'User not authenticated' });
    }

    try {
        const reminders = await getReminders(userId);
        res.json(reminders);
    } catch (error) {
        console.error('Failed to fetch reminders:', error);
        res.status(500).json({ message: 'Error fetching reminders' });
    }
});

app.post('/signout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send({ message: 'Failed to sign out' });
        }
        res.send({ message: 'Sign out successful' });
    });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

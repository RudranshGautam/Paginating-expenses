const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Database setup
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'rudransh@1',
    database: 'ww'
});

const db = pool.promise();

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));

// Routes
app.get('/expenses/data', async (req, res) => {
    const userId = req.session.user.id; // Assume user ID is available in session
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const [expenses] = await db.execute(`
            SELECT id, amount, description, category
            FROM expenses
            WHERE user_id = ?
            LIMIT ? OFFSET ?
        `, [userId, limit, offset]);

        const [totalExpenses] = await db.execute(`
            SELECT COUNT(*) AS count
            FROM expenses
            WHERE user_id = ?
        `, [userId]);

        const totalPages = Math.ceil(totalExpenses[0].count / limit);

        res.json({
            expenses,
            totalPages
        });
    } catch (err) {
        console.error('Error fetching expenses data:', err);
        res.status(500).send('Error fetching expenses data. Please try again.');
    }
});

app.post('/expenses/add', (req, res) => {
    const { amount, description, category } = req.body;
    const userId = req.session.user.id;

    db.execute('INSERT INTO expenses (amount, description, category, user_id) VALUES (?, ?, ?, ?)', [amount, description, category, userId])
        .then(() => res.status(201).send('Expense added successfully'))
        .catch(err => {
            console.error('Error adding expense:', err);
            res.status(500).send('Error adding expense. Please try again.');
        });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

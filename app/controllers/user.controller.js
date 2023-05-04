const bcrypt = require('bcrypt');

const connection = require("../config/db.config");

exports.getUser = async (req, res) => {
    try {
        connection.query('SELECT * FROM users WHERE type != "admin"', (error, results) => {
            if (error) {
                // If an error occurred, send a server error response
                res.status(500).json({ error });
            } else {
                // Otherwise, send the results as a JSON array
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};

exports.getUserByEmail = async (req, res) => {
    try {
        const email = req.body.email;
        connection.query('SELECT * FROM users WHERE email = ? AND type != "admin"', [email], (error, results) => {
            if (error) {
                // If an error occurred, send a server error response
                res.status(500).json({ error });
            } else {
                // Otherwise, send the results as a JSON array
                res.json(results.length > 0 ? results[0] : { message: 'User not found' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};

exports.updateUser = async (req, res) => {
    try {
        const { email, name, address, phone } = req.body;
        connection.query('UPDATE users SET name = ?, address = ?, phone = ? WHERE email = ?', [name, address, phone, email], (error, results) => {
            if (error) {
                // If an error occurred, send a server error response
                res.status(500).json({ error });
            } else {
                // Otherwise, send the results as a JSON array
                res.send({ message: 'Update User Success.' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        const hashedPassword = bcrypt.hashSync(password, 8);
        connection.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], (error, results) => {
            if (error) {
                res.status(500).json({ error });
            } else {
                res.send({ message: 'Password Reset Success.' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};

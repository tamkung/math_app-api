var jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const connection = require("../config/db.config");
const config = require("../config/auth.config.js");

exports.signUp = async (req, res) => {
    try {
        const { fname, lname, year, phone, email, password } = req.body;
        const ts = Date.now();
        // sendVerificationEmail(email);
        // res.json({
        //     status: "OK",
        //     message: 'User registered successfully'
        // });
        // Check if the email already exists in the database
        const sql = 'SELECT * FROM users WHERE email = ?';
        const values = [email];
        connection.query(sql, values, (error, results) => {
            if (error) {
                res.status(500).json({ message: 'Error checking for duplicate email' });
            } else if (results.length > 0) {
                res.status(400).json({ message: 'Email already exists' });
            } else {
                // Hash the password
                const hashedPassword = bcrypt.hashSync(password, 8);
                // Insert the new user into the database
                const sql = 'INSERT INTO users (first_name, last_name, email, password, user_year, role_id, date_added) VALUES (?, ? ,?, ?, ?, 2, ?)';
                const values = [fname, lname, email, hashedPassword, year, ts];
                connection.query(sql, values, (error) => {
                    if (error) {
                        console.log(error);
                        res.status(500).json({ message: 'Error registering user' });

                    } else {
                        // Send email verification email
                        res.json({
                            status: "OK",
                            message: 'User registered successfully'
                        });
                    }
                });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Query the database for the user with the given email
        const sql = 'SELECT * FROM users WHERE email = ?';
        const values = [email];
        connection.query(sql, values, (error, results) => {
            if (error) {
                res.status(500).json({ message: 'Error logging in' });
            } else if (results.length === 0) {
                res.status(400).json({ message: 'Invalid email or password' });
            } else {
                // Check if the email has been verified

                // Compare the hashed password with the provided password
                const hashedPassword = results[0].password;
                if (bcrypt.compareSync(password, hashedPassword)) {
                    //res.json({ message: 'Logged in successfully' });
                    const token = jwt.sign({ email: results[0].email }, config.secret, {
                        expiresIn: 86400 // 24 hours
                    });
                    res.json({
                        status: "OK",
                        message: 'Logged in successfully',
                        token: token,
                        email: results[0].email,
                        type: results[0].type,
                    });
                    const sql = 'UPDATE users SET sessions = ? WHERE email = ?', values = [token, email];
                    connection.query(sql, values, (error) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("token updated");
                        }
                    });
                } else {
                    res.status(400).json({ message: 'Invalid email or password' });
                }

            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.verified = async (req, res) => {
    try {
        const { email } = req.query;
        // Update the "verified" field in the database
        const sql = 'UPDATE users SET verified = 1 WHERE email = ?';
        const values = [email];
        connection.query(sql, values, (error) => {
            if (error) {
                res.status(500).json({ message: 'Error verifying email' });
            } else {
                res.json({ message: 'Email verified successfully' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.forgotPass = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email);
        connection.query('SELECT * FROM users WHERE email = ? AND type != "admin"', [email], (error, results) => {
            if (error) {
                res.status(500).json({ error });
            } else {
                res.json(results.length > 0 ? results[0] : { message: 'User not found' });
                if (results.length > 0) {
                    nodemailer.sendForgotPassEmail(email);
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};

module.exports.signOut = async (req, res) => {
    try {
        // Clear the JWT from the request header
        req.headers['x-access-token'] = null;
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
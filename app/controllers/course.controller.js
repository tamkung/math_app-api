const connection = require("../config/db.config");

exports.getCourse = async (req, res) => {
    try {
        connection.query('SELECT * FROM course WHERE category_id = 1', (error, results) => {
            if (error) {
                res.status(500).json({ error });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};

exports.getSection = async (req, res) => {
    try {
        connection.query('SELECT * FROM section WHERE course_id = 1', (error, results) => {
            if (error) {
                res.status(500).json({ error });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};

exports.getLesson = async (req, res) => {
    try {
        const { course_id, section_id } = req.body;
        connection.query('SELECT * FROM lesson WHERE course_id = ? AND section_id = ?', [course_id, section_id], (error, results) => {
            if (error) {
                res.status(500).json({ error });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    }
}

exports.getQuestion = async (req, res) => {
    try {
        const quiz_id = req.body.quiz_id;
        connection.query('SELECT * FROM question WHERE quiz_id = ?', [quiz_id], (error, results) => {
            if (error) {
                res.status(500).json({ error });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    }
}
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

exports.addQuizResult = async (req, res) => {
    try {
        const { quiz_id, user_id, user_answers, correct_answers, score, total_score } = req.body;
        const timestamp = Date.now();
        console.log(correct_answers);
        const sql = 'INSERT INTO quiz_results (quiz_id, user_id, user_answers, correct_answers, score, total_score, date_added) VALUES (?, ? ,?, ?, ?, ?, ?)';
        const values = [quiz_id, user_id, user_answers, correct_answers, score, total_score, timestamp];
        connection.query(sql, values, (error) => {
            if (error) {
                res.status(500).json({ error });
            } else {
                res.json({ message: 'Quiz result added successfully' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    }
}

exports.getScore = async (req, res) => {
    try {
        const { user_id, quiz_id } = req.body;
        connection.query('SELECT score, total_score FROM quiz_results WHERE user_id = ? AND quiz_id = ? ORDER BY quiz_result_id DESC', [user_id, quiz_id], (error, results) => {
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

exports.getPercentLesson = async (req, res) => {
    try {
        const { user_id } = req.body;
        connection.query(`
        SELECT 
	        qr.quiz_result_id,
            qr.quiz_id,
            qr.user_id,
            qr.user_answers,
            qr.correct_answers,
            qr.score,
            qr.total_score,
            ROUND((qr.score / qr.total_score) * 100, 0) AS percent_score
        FROM quiz_results qr
        WHERE qr.user_id = ?`, [user_id], (error, results) => {
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

exports.getAVGPercentSection = async (req, res) => {
    try {
        const { user_id, course_id } = req.body;
        connection.query(`
            SELECT  
                s.id,
                s.title,
                ROUND(SUM(qr.score / qr.total_score * 100), 0) AS sum_percent,
                ROUND(SUM(qr.score / qr.total_score * 100), 0) / cls.sec_length AS avg_percent,
                cls.sec_length
            FROM section s
            LEFT JOIN lesson l ON l.section_id = s.id 
            LEFT JOIN quiz_results qr ON qr.quiz_id = l.id AND qr.user_id = ?
            LEFT JOIN (
                SELECT 
                    COUNT(l.section_id) AS sec_length,
                    l.section_id 
                FROM lesson l 
                GROUP BY l.section_id 
            ) AS cls ON cls.section_id = s.id
            WHERE s.course_id = ?
            GROUP BY s.id, s.title, cls.sec_length
        `, [user_id, course_id], (error, results) => {
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
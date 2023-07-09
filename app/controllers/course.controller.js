const { json } = require("body-parser");
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
        connection.query(`
        SELECT l.*, l3.id AS quiz_id
        FROM lesson l
        LEFT JOIN (
            SELECT l2.*
            FROM lesson l2 
            WHERE l2.course_id = ?
            AND l2.section_id = ?
            AND l2.lesson_type = "quiz"
        ) AS l3 ON l3.title LIKE CONCAT('%', l.title, '%')
        WHERE l.course_id = ?
        AND l.section_id = ?
        AND l.lesson_type = "video"
        `, [course_id, section_id, course_id, section_id], (error, results) => {
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

exports.getLessonQuestion = async (req, res) => {
    try {
        const { course_id, section_id, title } = req.body;
        const searchTerm = `%${title}%`;
        connection.query('SELECT * FROM lesson WHERE course_id = ? AND section_id = ? AND lesson_type = "quiz" AND title LIKE ? LIMIT 1', [course_id, section_id, searchTerm], (error, results) => {
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
                let data;
                if (results.length > 0) {
                    data = results.map((item) => {
                        let op = JSON.parse(item.options);
                        let answer = JSON.parse(item.correct_answers);
                        let options = [];
                        for (let i = 0; i < op.length; i++) {
                            options.push({
                                option_index: i + 1,
                                option: op[i]
                            });
                        }
                        let options_shuffle = options.sort(() => Math.random() - 0.5);
                        let answer_question = [];
                        for (let i = 0; i < answer.length; i++) {
                            answer_question.push(op[answer[i] - 1]);
                        }
                        return {
                            id: item.id,
                            quiz_id: item.quiz_id,
                            title: item.title,
                            type: item.type,
                            number_of_options: item.number_of_options,
                            options: options_shuffle,
                            answer: parseInt(answer[0]),
                            answer_question: answer_question[0]
                        }
                    });
                } else {
                    res.json({ message: 'No questions found' });
                }
                res.json(data);

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
        connection.query('SELECT score, total_score FROM quiz_results WHERE user_id = ? AND quiz_id = ? ORDER BY quiz_result_id DESC LIMIT 1', [user_id, quiz_id], (error, results) => {
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
        const { user_id, quiz_id } = req.body;
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
        WHERE qr.user_id = ? AND qr.quiz_id IN (`+ quiz_id + `)`, [user_id], (error, results) => {
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
                ROUND(SUM(qr.score / qr.total_score * 100) / cls.sec_length, 0) AS avg_percent,
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
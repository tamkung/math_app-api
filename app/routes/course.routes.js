const express = require('express');
const router = express.Router();

const {
    getCourse,
    getSection,
    getLesson,
    getQuestion,
    addQuizResult,
    getPercentLesson,
    getAVGPercentSection,
} = require('../controllers/course.controller');

router.get("/course", getCourse);

router.get("/section", getSection)

router.post("/lesson", getLesson);

router.post("/question", getQuestion);

router.post("/add-quiz-result", addQuizResult);

router.post("/percent-lesson", getPercentLesson);

router.post("/percent-section", getAVGPercentSection);

module.exports = router;
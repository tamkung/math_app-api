const express = require('express');
const router = express.Router();

const { getCourse, getSection, getLesson, getQuestion } = require('../controllers/course.controller');

router.get("/course", getCourse);

router.get("/section", getSection)

router.post("/lesson", getLesson);

router.post("/question", getQuestion);

module.exports = router;
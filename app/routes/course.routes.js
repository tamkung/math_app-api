const express = require('express');
const router = express.Router();

const { getCourse } = require('../controllers/course.controller');

router.get("/course", getCourse);

module.exports = router;
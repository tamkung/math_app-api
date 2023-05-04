const express = require('express');
const router = express.Router();

const {
    getUser,
    getUserByEmail,
    resetPassword
} = require('../controllers/user.controller');

router.get("/getuser", getUser);

router.get("/getuserbyemail", getUserByEmail);

router.post("/reset-password", resetPassword)

module.exports = router;
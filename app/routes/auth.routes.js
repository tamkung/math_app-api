const express = require('express');
const router = express.Router();

const {
  signUp,
  signIn,
  signOut,
  forgotPass,
  changePass,
} = require('../controllers/auth.controller');

router.post("/auth/signup", signUp);

router.post("/auth/signin", signIn);

router.post("/auth/signout", signOut);

router.post("/auth/forgotpass", forgotPass);

router.post("/auth/changepass", changePass);

module.exports = router;

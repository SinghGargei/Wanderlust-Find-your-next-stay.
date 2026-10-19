const express = require('express');
const router = express.Router();
const passport = require('passport');
const { savedRedirectUrl } = require('../middleware.js');
const userController = require('../controllers/user.js');

// Signup Routes
// router.get("/signup", userController.renderSignupForm);
// router.post("/signup", userController.signup);

router.route("/signup")
.get( userController.renderSignupForm)
.post( userController.signup);

// Login Routes
// router.get("/login", userController.renderLoginForm);
// router.post(
//     "/login",
//     savedRedirectUrl,
//     passport.authenticate("local", {
//         failureRedirect: "/login",
//         failureFlash: { type: 'failure', message: 'Invalid username or password' },
//     }),
//     userController.login
// );
router.route("/login")
.get(userController.renderLoginForm)
.post(
    savedRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: { type: 'failure', message: 'Invalid username or password' },
    }),
    userController.login
);

// Logout Route
router.get("/logout", userController.logout);

module.exports = router;
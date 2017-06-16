const express = require("express");
const session = require("express-session");
const router = new express.Router();
const db = require("./db.js");
const hash = require('sha256');
require('dotenv').config();

// cookie settings
router.use(session({
    secret: process.env.COOKIE_SECRET,
    cookieName: 'session',
    cookie: {
        maxAge: 10000000
    },
    resave: true,
    saveUninitialized: true
}));

// Check if the user is logged in
router.use("/auth/login", (req, res) => {
    // Only login if the user is not authenticated
    if (!req.session.authenticated) {

        // Defaults to false
        req.session.authenticated = false;

        // Check if a password and username was given
        if (req.body.password && req.body.username) {
            const username = req.body.username;
            const password = hash.x2(req.body.password);
            const queryString = "SELECT * FROM users WHERE user_name = " + db.escape(username);

            db.query(queryString, (error, results) => {
                if (error) {
                    throw error;
                }

                if (results.length === 0) {
                    res.json({authenticated: false});
                } else {
                    if (results[0].password === password) {
                        req.session.authenticated = true;
                        req.session.username = username;
                        req.session.userId = results[0].id;
                        res.redirect("/chat_page");
                    } else {
                        res.json({authenticated: false});
                    }
                }
            });
        }
    } else {
        res.redirect("http://localhost:8080/chat_page")
    }
});

router.use('/auth/logout', (req, res) => {
    req.session.destroy();
    req.session.authenticated = false;
    res.redirect('/');
});

router.use('/auth/status', (req, res) => {
    res.json({
        authenticated: req.session.authenticated
    });
});

module.exports.requiresAuthentication = (req, res, next) => {
    // Send the error
    function err(res) {
        res.status(401).json({
            error: 'This route requires you to be authenticated.'
        });
    }

    // If there is no session or not authenticated
    if (!req.session) return err(res, 'No session found');
    if (!req.session.authenticated) return err(res);

    // If properly authenticated, call the next route
    next();
};
module.exports.router = router;
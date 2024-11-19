const router = require('express').Router();
const passport = require('passport');

// auth login 
router.get('/login', (req, res) => {
    const message = req.session && req.session.messages && req.session.messages[0];
    req.session = null; // Fully reset the session state
    res.render('login', { warning: message || null, user: null });
});

//log out
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.redirect('/auth/login');
        }
        req.session.destroy((err) => {
            if (err) console.error('Error destroying session:', err);
            res.clearCookie('connect.sid'); // Clear session cookie
            console.log('Session destroyed and cookie cleared');
            res.redirect('/auth/login');
        });
    });
});

// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

//callback route for google to redirect to

router.get('/google/redirect', 
    passport.authenticate('google', { failureRedirect: '/auth/login', failureMessage: true }),
    (req, res) => {
        if (!req.user) {
            req.logout(() => {
                res.redirect('/auth/login');
            });
        } else {
            // Successful login
            res.redirect('/sportsschedule/');
        }
    }
);

module.exports = router;
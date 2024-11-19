const router = require('express').Router();

const authCheck = (req,res,next) => {
    if(!req.user) {
        // not logged in
        res.redirect('/auth/login');
    } else {
        // logged in
        next();
    }
};

router.get('/', authCheck, (req,res) => {
    res.render('sportsschedule', {user: req.user});
});

module.exports = router;
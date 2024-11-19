const express = require('express');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const passportSetup = require('./config/passport-setup');

const db = require('./models/database');

const keys = require('./config/keys');
const session = require('express-session')
const passport = require('passport');

const app = express();

// setup view enginer
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(session({
    secret: [keys.session.cookieKey],
    resave: false,
    saveUninitialized: false, // Prevent creating sessions for unauthenticated users
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day expiry
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// set up routes
app.use('/auth', authRoutes);
app.use('/sportsschedule', profileRoutes);

app.use((req, res, next) => {
    console.log('Session Middleware:', req.session);
    console.log('User Middleware:', req.user);
    next();
});

app.use('/auth', (req, res, next) => {
    if (!req.session || !req.session.passport) {
        console.log('Unauthorized access to auth routes');
    }
    next();
});

app.use('/auth/login', (req, res, next) => {
    console.log('Session at /auth/login:', req.session);
    next();
});

// create home route
app.get('/', (req, res) => {
    res.render('home', { user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
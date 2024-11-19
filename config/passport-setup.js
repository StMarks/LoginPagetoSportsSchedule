const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('../models/user-model');

const pool = require('../models/database');

passport.serializeUser((user, done) => {
    console.log('Serializing user with ID:', user.id);
    done(null, user.id); // Store only the user's ID in the session
});

passport.deserializeUser((id, done) => {
    console.log('Deserializing user with ID:', id);
    const query = "SELECT * FROM users WHERE id = ?";
    pool.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error during deserialization:', err);
            return done(err);
        }
        if (!results.length) {
            console.log('No user found for ID:', id);
            return done(null, false); // No user found
        }
        console.log('Deserialized user:', results[0]);
        done(null, results[0]);
    });
});

passport.use(
    new GoogleStrategy({
        callbackURL: '/auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
    }, (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;

        if (!email.endsWith('@stmarksschool.org')) {
            console.log('Non-SM email detected:', email);
            return done(null, false, { message: 'Only SM emails can log in.' });
        }

        const googleId = profile.id;
        const username = profile.displayName;
        const thumbnail = profile._json.picture;

        const findUserQuery = "SELECT * FROM users WHERE googleId = ?";
        pool.query(findUserQuery, [googleId], (err, result) => {
            if (err) return done(err);
            if (result.length > 0) {
                return done(null, result[0]); // User exists
            } else {
                const createUserQuery = "INSERT INTO users (googleId, username, thumbnail) VALUES (?, ?, ?)";
                pool.query(createUserQuery, [googleId, username, thumbnail], (err, result) => {
                    if (err) return done(err);

                    const newUserQuery = "SELECT * FROM users WHERE id = ?";
                    pool.query(newUserQuery, [result.insertId], (err, newResult) => {
                        if (err) return done(err);
                        done(null, newResult[0]); // Newly created user
                    });
                });
            }
        });
    })
);
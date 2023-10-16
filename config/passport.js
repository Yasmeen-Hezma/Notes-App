const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../server/models/User');

module.exports = function (passport) {
    // Local authentication
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
            },
            async (email, password, done) => {
                try {
                    const user = await User.findOne({ email });
                    if (!user) {
                        return done(null, false, { message: 'Incorrect username.' });
                    }
                    const passwordMatch = await bcrypt.compare(password, user.password);
                    if (passwordMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
    // Google authentication
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.NODE_ENV === 'production'
                    ? 'https://notes-app-fazg.onrender.com/google/callback'
                    : 'http://localhost:3000/google/callback',
            },
            async function (accessToken, refreshToken, profile, done) {
                const newUser = {
                    googleId: profile.id,
                    username: profile.name.givenName + ' ' + profile.name.familyName,
                    email: profile.emails[0].value,
                };

                try {
                    let user = await User.findOne({ email: newUser.email });
                    if (user) {
                        done(null, user);
                    } else {
                        user = await User.create(newUser);
                        done(null, user);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        )
    );

    // Passport serialization and deserialization
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            console.error(error);
            return done(error, false);
        }
    });
};

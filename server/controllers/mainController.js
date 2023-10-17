const User = require('../models/User');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const Token = require('../models/Token');
const sendEmail = require('../../config/sendEmail');
const crypto = require('crypto');

exports.homePage = (req, res) => {
    res.render('index', { title: 'Home Page' });
}
exports.aboutPage = (req, res) => {
    res.render('about', { title: 'About Page' });
}

// Login (GET)
exports.login = (req, res) => {
    res.render('login', { title: 'Login', messages: req.flash() });
};
// Login (POST)
exports.loginPost = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error', 'Login failed. Please double-check your email and password.');
            return res.redirect('/login');
        }
        if (!user.isverified) {
            return res.redirect('/resend-email');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/dashboard');
        });
    })(req, res, next);
};
// Google OAuth authentication
exports.getGoogleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// Google OAuth callback
exports.getGoogleAuthCallback = passport.authenticate('google', {
    failureRedirect: '/',
    successRedirect: '/dashboard',
});

// Logout the user
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/');
    });
};
// sign up (GET)
exports.signUp = (req, res) => {
    res.render('sign-up', { title: 'sign up', messages: req.flash() });
};
// sign up (POST)
exports.signUpPost = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'This email already exists');
            return res.redirect('/sign-up');
        }
        if (password.length < 7) {
            req.flash('error', 'Password must be more than 6 characters');
            return res.redirect('/sign-up');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        const token = await new Token({
            userId: newUser.id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();
        const url = `${process.env.BASE_URL}${newUser._id}/verify/${token.token}`;
        await sendEmail(newUser.email, "Verify Email", url);
        res.redirect('/verify-email');
    } catch (error) {
        res.redirect('/sign-up');
    }
};
// verify email (page)
exports.verifyEmailPage = async (req, res) => {
    res.render('verify-email', { title: 'Verify Email' })
}
// verify email
exports.verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(400).send({ message: "Invalid link" });
        }
        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) {
            return res.status(400).send({ message: "Invalid link" });
        }
        await User.findByIdAndUpdate(user._id, { isverified: true });
        await Token.findByIdAndDelete(token._id);
        res.render('login', { title: 'Verify Email', messages: req.flash() });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
}
// resend email (GET)
exports.resendEmail = async (req, res) => {
    res.render('resend-email', { title: 'Resend Email', messages: req.flash() });
};
// resend email (POST)
exports.resendEmailPost = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Email not found');
            return res.redirect('/resend-email');
        }
        // Delete any existing verification tokens for the user
        await Token.findOneAndDelete({ userId: user._id });
        // Generate a new verification token and save it
        const token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex")
        }).save();
        // Construct the verification URL
        const url = `${process.env.BASE_URL}${user._id}/verify/${token.token}`;
        // Send the verification email
        await sendEmail(user.email, "Verify Email", url, 'Verify your email');
        res.redirect('/verify-email');
    } catch (e) {
        res.redirect('/login');
    }
};
// reset password (GET)
exports.resetPassword = async (req, res) => {
    res.render('reset-password', { title: 'Reset Password', messages: req.flash() });
}
// reset password (POST)
exports.resetPasswordPost = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Email not found');
            return res.redirect('/reset-password');
        }
        if (password.length < 7) {
            req.flash('error', 'Password must be more than 6 characters');
            return res.redirect('/reset-password');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        return res.redirect('/login');
    }
    catch (e) {
        return res.redirect('/login');
    }
}
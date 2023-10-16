const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const dashboardController = require('../controllers/dashboardController');

const { ensureAuthenticated } = require('../../config/auth');

router.get('/', mainController.homePage);
router.get('/about', ensureAuthenticated, (req, res) => { res.render('about', { title: 'About' }) });
router.get('/features', ensureAuthenticated, (req, res) => { res.render('features', { title: 'Features' }) });
router.get('/FAQs', ensureAuthenticated, (req, res) => { res.render('FAQs', { title: 'FQAs' }) });
router.get('/sign-up', mainController.signUp);
router.post('/sign-up', mainController.signUpPost);
router.get('/login', mainController.login);
router.post('/login', mainController.loginPost);
router.get('/auth/google', mainController.getGoogleAuth);
router.get('/google/callback', mainController.getGoogleAuthCallback);
router.get('/logout', ensureAuthenticated, mainController.logout);
router.get('/add-note', ensureAuthenticated, dashboardController.addNote);
router.post('/add-note', ensureAuthenticated, dashboardController.addNotePost);
router.get('/dashboard', ensureAuthenticated, dashboardController.dashboard);
router.get('/note/:id', ensureAuthenticated, dashboardController.viewNote);
router.put('/note/:id', ensureAuthenticated, dashboardController.updateNote);
router.delete('/note/:id', ensureAuthenticated, dashboardController.deleteNote);
router.get('/search', ensureAuthenticated, dashboardController.searchNote);
router.post('/search', ensureAuthenticated, dashboardController.searchNotePost);
router.get("/:id/verify/:token/", mainController.verifyEmail);
router.post("/resend-email", mainController.resendEmailPost)
router.get("/resend-email", mainController.resendEmail)
router.get('/verify-email', mainController.verifyEmailPage);
router.get('/reset-password', mainController.resetPassword);
router.post('/reset-password', mainController.resetPasswordPost);




module.exports = router;
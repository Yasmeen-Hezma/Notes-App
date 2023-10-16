require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require("method-override");
const db = require('./config/db');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const passportConfig = require('./config/passport');
const app = express();


const port = process.env.PORT || 3000;

// Configure session middleware
app.use(session({
    secret: 'NoteSectretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MongoUrl
    })
}));
app.use(flash());
// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static('public'));

// Templating Engine
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Connect to the database
db();
passportConfig(passport);
/*To make isauthenticate() local that I can use in main.js*/
const isAuthenticatedMiddleware = (req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
};
app.use(isAuthenticatedMiddleware);
// Routes
app.use('/', require('./server/routes/mainRoutes'));

// Handle 404 
app.get('*', (req, res) => {
    res.status(404).render('404', { title: '404 page' });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

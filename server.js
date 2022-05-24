//server.js

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

/**
 * Required External Modules
 */
const express = require('express')
const path = require("path")
const expressSession = require("express-session")
const passport = require("passport")
const Auth0Strategy = require("passport-auth0")
const userInViews = require('./lib/middleware/userInViews')
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

/**
 * App Variables
 */
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const app = express()

require("dotenv").config()

/**
 * Session Configuration
 */

const session = {
    secret: process.env.SESSION_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false
};

if (app.get("env") === "production") {
    // Serve secure cookies, requires HTTPS
    session.cookie.secure = true;
}

/**
 * Passport Configuration
 */

const strategy = new Auth0Strategy(
    {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL: process.env.AUTH0_CALLBACK_URL
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
        /**
         * Access tokens are used to authorize users to an API
         * (resource server)
         * accessToken is the token to call the Auth0 API
         * or a secured third-party API
         * extraParams.id_token has the JSON Web Token
         * profile has all the information from the user
         */
        return done(null, profile);
    }
);

/**
 *  App Configuration
 */

app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.set('layout', 'layouts/layout')
app.use(express.static('public'))
app.use(expressSession(session));
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());



passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Creating custom middleware with Express
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

app.use(userInViews);

// Router mounting
app.use('/', indexRouter)
app.use('/auth', authRouter)



/**
 *  DB Configuration
 */
// Setup Mongo database connection and check to see if we're connected or not.
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

/**
 * Server Activation
 */

app.listen(process.env.PORT || 3000)
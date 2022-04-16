// Only use environment vaiables if we're in development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

// Import our index router into our server.js file
const indexRouter = require('./routes/index')

// Set view engine
app.set('view engine', 'ejs')

// Set where our views are coming from
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')

// Tell express to use express layouts
app.use(expressLayouts)

// Tell express where our public files will be
app.use(express.static('public'))

// Setup Mongo database connection and check to see if we're connected or not.
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

//Tell our app to use our index router
app.use('/', indexRouter)

app.listen(process.env.PORT || 3000)
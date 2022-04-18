// Only use our environment variables if we're in development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')

// Import routers into our server.js file
const indexRouter = require('./routes/index')
//const bugRouter = require('./routes/bugReport')

// Set view engine
app.set('view engine', 'ejs')

// Set where our views are coming from
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')

// Tell express to use express layouts
app.use(expressLayouts)

// Tell express where our public files will be
app.use(express.static('public'))

// Tell express to use body-parser
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

// Setup Mongo database connection and check to see if we're connected or not.
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

//Tell our app to use our index router
app.use('/', indexRouter)
//app.use('/bugs', bugRouter)

app.listen(process.env.PORT || 3000)
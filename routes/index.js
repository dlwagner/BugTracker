const express = require('express')
const router = express.Router()

// Route: This is the very root of our application
// Here we are passing to the route a function consisting of the request and response objects.
router.get('/', (req, res) => {
    //Render our index view
    res.render('index')
})

module.exports = router
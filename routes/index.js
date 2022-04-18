const express = require('express')
const router = express.Router()
const Bug = require('../models/bug')

// Index Route: This is the root of the application
router.get('/', (req, res) => {
    res.render('index')
})

// New Bug Route
router.get('/new', (req, res) => {
    res.render('index/new', { bug: new Bug() })
})

// Create Bug Route
router.post('/', (req, res) => {
    //res.send('Create New Bug Report')
    //res.render('index')
    res.send(req.body.name)
})

module.exports = router
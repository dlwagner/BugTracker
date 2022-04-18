const express = require('express')
const router = express.Router()
const Bug = require('../models/bug')


// All Bugs Route
router.get('/', (req, res) => {
    res.render('bugs/index')
})

// New Bug Route
router.get('/new', (req, res) => {
    res.render('bugs/new', { bug: new Bug() })
})

// Create Bug Route
router.post('/', (req, res) => {
    //res.send('Create Bug Report')
    res.render('index')
})

/*
// Edit Bug Route
router.get('/:id', (req, res) => {
    res.send('Edit Bug Report')
})

// Update Bug Route
router.put('/:id', (req, res) => {
    res.send('Update Bug Report')
})
*/
module.exports = router
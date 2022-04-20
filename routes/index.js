const express = require('express')
const router = express.Router()
const Bug = require('../models/bug')

//all bugs route
router.get('/', async (req, res) => {
    try {
        const bugs = await Bug.find({})
        res.render('index/bugTable', { bugs: bugs })
    } catch {
        res.redirect('/')
    }
    //res.render('index/bugTable')
})

//new bug route
router.get('/new', (req, res) => {
    //res.send('new bug page')
    res.render('index/new', { bug: new Bug() })
})

//create new bug route
router.post('/', async (req, res) => {
    const bug = new Bug({
        name: req.body.name
    })
    try {
        const newBug = await bug.save()
        res.redirect('/')
    } catch {
        res.render('index/new', {
            bug: bug,
            errorMessage: 'Error creating bug report'
        })
    }
})

module.exports = router
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
})

//new bug route
router.get('/new', (req, res) => {
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

// Show bug route
router.get('/:id', async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id)
        res.render('index/details', { bug: bug })
    } catch {
        res.redirect('/')
    }
})

//Edit Bug Route
router.get('/:id/edit', async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id)
        res.render('index/edit', { bug: bug })
    } catch {
        res.redirect('/')
    }
})

//Update Bug Route
router.put('/:id', async (req, res) => {
    let bug
    try {
        bug = await Bug.findById(req.params.id)
        bug.name = req.body.name
        await bug.save()
        res.redirect(`/${bug.id}`)
    } catch {
        if (bug == null) {
            res.redirect('/')
        } else {
            res.render('index/edit', {
                bug: bug,
                errorMessage: 'Error updating bug'
            })
        }
    }
})

//Delete bug route
router.delete('/:id', async (req, res) => {
    let bug
    try {
        bug = await Bug.findById(req.params.id)
        await bug.remove()
        res.redirect('/')
    } catch {
        if (bug == null) {
            res.redirect('/')
        } else {
            res.redirect(`/${bug.id}`)
        }
    }
})


module.exports = router
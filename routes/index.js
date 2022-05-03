const express = require('express')
const router = express.Router()
const Bug = require('../models/bug')
const fs = require('fs');
const fileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/doc']

//All bugs route
router.get('/', async (req, res) => {
    try {
        const bugs = await Bug.find({})
        res.render('index/bugTable', { bugs: bugs })
    } catch {
        res.redirect('/')
    }
})

//New bug route
router.get('/new', (req, res) => {
    res.render('index/new', { bug: new Bug() })
})

//Create bug route
router.post('/', async (req, res) => {
    const bug = new Bug({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        status: req.body.status,
        priority: req.body.priority,
    })

    saveBugReport(bug, req.body.files)

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

// Download route
router.get('/:id/download', async (req, res) => {

    try {
        const bug = await Bug.findById(req.params.id)
        downloadFile(bug)
        res.redirect(`/${bug.id}`)
    } catch {
        console.log("error downloading file")
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
        bug.title = req.body.title
        bug.description = req.body.description
        bug.category = req.body.category
        bug.status = req.body.status
        bug.priority = req.body.priority
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

function saveBugReport(bug, fileEncoded) {
    if (fileEncoded == null) return
    const myFile = JSON.parse(fileEncoded)
    if (myFile != null && fileTypes.includes(myFile.type)) {
        bug.files = new Buffer.from(myFile.data, 'base64')
        bug.fileName = myFile.name
        bug.fileType = myFile.type
    }
}

function downloadFile(bug) {

    try {
        let buf = Buffer.from(bug.files)
        fs.writeFileSync(bug.fileName, buf)
    } catch {
        console.log('error writing file')
    }

}

module.exports = router
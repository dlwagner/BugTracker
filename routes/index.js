const express = require('express')
const router = express.Router()
const Bug = require('../models/bug')
const BugFile = require('../models/bugFile')
const fs = require('fs').promises;
const fileTypes = ['image/jpeg', 'image/png', 'image/gif',
    'application/pdf', 'text/plain', 'text/html', 'application/doc',
    'application/docx']

let myArray = []

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
    let newBug
    const bug = new Bug({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        status: req.body.status,
        priority: req.body.priority,
    })
    try {
        newBug = await bug.save()
        res.redirect('/')
    } catch {
        res.render('index/new', {
            bug: bug,
            errorMessage: 'Error creating bug report'
        })
    }
    //console.log("msdoc: ", req.body.files)
    if (req.body.files.length > 0)
        saveFiles(newBug, req.body.files)
})

// Show bug route
router.get('/:id', async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id).populate("bugFiles")
        res.render('index/details', { bug: bug })
    } catch (err) {
        console.log(err)
        res.redirect('/')
    }
})

//Edit bug route
router.get('/:id/edit', async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id).populate("bugFiles")
        res.render('index/edit', { bug: bug })
    } catch {
        res.redirect('/')
    }
})

// Download file route
router.get('/:id/download', async (req, res) => {
    try {
        const bFile = await BugFile.findById(req.params.id);
        let buf = Buffer.from(bFile.fileData);
        await fs.writeFile(bFile.fileName, buf);

        res.download(bFile.fileName, err => {
            if (err) {
                throw err;
            } else {
                // If download is complete
                if (res.headersSent) {
                    // Delete the file which was created locally after download is complete
                    fs.rm(bFile.fileName);
                }
            }
        });
    } catch (err) {
        console.log("error downloading file", err);
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
    if (req.body.files.length > 0)
        saveFiles(bug, req.body.files)
})

//Delete bug route
router.delete('/:id', async (req, res) => {
    let bug
    try {
        bug = await Bug.findById(req.params.id)
        //First, delete associated files
        await BugFile.deleteMany({ bugId: bug._id })
        //Then delete the bug report
        await bug.deleteOne({ _id: bug._id })
        res.redirect('/')
    } catch {
        if (bug == null) {
            res.redirect('/')
        } else {
            console.log("err")
            res.redirect(`/${bug.id}`)
        }
    }
})

//Delete File Route
//TODO: finish this.
router.delete('/:id/deletefile', async (req, res) => {
    console.log('delete files')
})

async function saveFiles(newBug, files) {
    let fileData
    if (Array.isArray(files)) {
        //More than one file is being uploaded.
        //The filepond objects are in an array.
        for (let i = 0; i < files.length; i++) {
            fileData = JSON.parse(files[i])
            console.log("ms: ", fileData.type)
            const bugFile = new BugFile({
                bugId: newBug._id,
                fileData: new Buffer.from(fileData.data, 'base64'),
                fileName: fileData.name,
                fileType: fileData.type,
                fileSize: fileData.size
            })
            try {
                // First, Save the files
                await bugFile.save()
                // Then, Update bug report with file IDs
                await Bug.findOneAndUpdate({ _id: newBug._id }, { $push: { bugFiles: bugFile._id } })
            } catch (err) {
                console.log("err: ", err)
            }
        }
    } else {
        //Only one file is being uploaded.
        //The filepond object is not in an array.
        fileData = JSON.parse(files)
        const bugFile = new BugFile({
            bugId: newBug._id,
            fileData: new Buffer.from(fileData.data, 'base64'),
            fileName: fileData.name,
            fileType: fileData.type,
            fileSize: fileData.size
        })
        try {
            // First, Save the file
            await bugFile.save()
            // Then, Update bug report with file ID
            await Bug.findOneAndUpdate({ _id: newBug._id }, { $push: { bugFiles: bugFile._id } })
        } catch (err) {
            console.log("err: ", err)
        }
    }
}

module.exports = router
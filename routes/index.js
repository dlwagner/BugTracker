// index.js

/**
 * Required External Modules
 */
const express = require('express')
const router = express.Router()
const passport = require("passport")
const secured = require('../lib/middleware/secured')
require("dotenv").config()
const Bug = require('../models/bug')
const BugFile = require('../models/bugFile')
const fs = require('fs').promises;
const fileTypes = ['image/jpeg', 'image/png', 'image/gif',
    'application/pdf', 'text/plain', 'text/html', 'application/doc',
    'application/docx']

/**
 * Routes Definitions
 */

//Landing Page Route
router.get('/', async (req, res) => {
    console.log("in landingpage route")
    console.log('req.isAuthenticated(): ', req.isAuthenticated())
    try {
        //const bugs = await Bug.find({})
        //res.render('index/bugTable', { bugs: bugs })
        res.render('index/landingPage')
    } catch {
        console.log("catch->all bugs route")
        res.redirect('/')
    }
})

router.get("/login", passport.authenticate("auth0", { scope: "openid email profile" }), (req, res) => {
    console.log("in /login")
    res.redirect("/");
});

router.get("/callback", (req, res, next) => {
    passport.authenticate("auth0", (err, user, info) => {
        console.log("in /callback")
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            const returnTo = req.session.returnTo;
            delete req.session.returnTo;
            res.redirect(returnTo || "/");
        });
    })(req, res, next);
});

router.get("/logout", (req, res) => {
    req.logOut();
    console.log("in /logout")
    let returnTo = req.protocol + "://" + req.hostname;
    const port = req.socket.localPort;

    if (port !== undefined && port !== 80 && port !== 443) {
        returnTo =
            process.env.NODE_ENV === "production"
                ? `${returnTo}/`
                : `${returnTo}:${port}/`;
    }

    const logoutURL = new URL(
        `https://${process.env.AUTH0_DOMAIN}/v2/logout`
    );

    const searchString = new URLSearchParams({
        client_id: process.env.AUTH0_CLIENT_ID,
        returnTo: returnTo
    });

    logoutURL.search = searchString;

    res.redirect(logoutURL);
});

// All Bugs Route
router.get('/allbugs', secured, async (req, res) => {
    try {
        const bugs = await Bug.find({})
        res.render('index/bugTable', { bugs: bugs })
        //res.render('index/landingPage')
    } catch {
        console.log("catch->all bugs route")
        res.redirect('/')
    }
})

//New bug route
router.get('/new', secured, (req, res) => {
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
        res.redirect('/allbugs')
    } catch {
        res.render('index/new', {
            bug: bug,
            errorMessage: 'Error creating bug report'
        })
    }
    if (req.body.files.length > 0)
        saveFiles(newBug, req.body.files)
})

// Show bug route
router.get('/:id', secured, async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id).populate("bugFiles")
        res.render('index/details', { bug: bug })
    } catch {
        res.redirect('/')
    }
})

//Edit bug route
router.get('/:id/edit', secured, async (req, res) => {
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
    } catch {
        //do error handling here
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

    try {
        if (req.body.checkDelete != null)
            await deleteFiles(req.params.id, req.body.checkDelete)
    } catch {
        //do error handling here
    }

    try {
        if (req.body.files.length > 0)
            await saveFiles(req.params.id, req.body.files)

    } catch {
        //do error handling here
    }
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
        res.redirect('/allbugs')
    } catch {
        if (bug == null) {
            res.redirect('/')
        } else {
            res.redirect(`/${bug.id}`)
        }
    }
})

async function deleteFiles(updateBug, files) {
    if (Array.isArray(files)) {
        //More than one file is being deleted.
        //The filepond objects are in an array.
        for (let i = 0; i < files.length; i++) {
            try {
                // First, update the Bug.bugFiles array
                await Bug.findOneAndUpdate({ _id: updateBug }, { $pull: { bugFiles: files[i] } })
                // Then, delete the bug file
                await BugFile.findOneAndDelete({ _id: files[i] })
            } catch {
                //do error handlilng here
            }
        }
    } else {
        //Only one file is being deleted.
        //The filepond object is not in an array.
        try {
            // First, update the Bug.bugFiles array
            await Bug.findOneAndUpdate({ _id: updateBug }, { $pull: { bugFiles: files } })
            // Then, delete the bug file
            await BugFile.findOneAndDelete({ _id: files })
        } catch {
            //do error handling here
        }
    }
}

async function saveFiles(newBug, files) {
    let fileData
    if (Array.isArray(files)) {
        //More than one file is being uploaded.
        //The filepond objects are in an array.
        for (let i = 0; i < files.length; i++) {
            fileData = JSON.parse(files[i])
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
                await Bug.findOneAndUpdate({ _id: newBug }, { $push: { bugFiles: bugFile._id } })
            } catch {
                //do error handling here
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
            await Bug.findOneAndUpdate({ _id: newBug }, { $push: { bugFiles: bugFile._id } })
        } catch (err) {
            //do error handling here
        }
    }
}

module.exports = router
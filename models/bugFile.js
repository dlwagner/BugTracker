const mongoose = require('mongoose')

const bugFileSchema = new mongoose.Schema({

    bugId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bug'
    },

    fileData: {
        type: Buffer,
        required: false
    },

    fileName: {
        type: String,
        required: false
    },

    fileType: {
        type: String,
        required: false
    },

    fileSize: {
        type: Number,
        required: false
    }
})
module.exports = mongoose.model('bugFile', bugFileSchema)
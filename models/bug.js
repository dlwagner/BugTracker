const mongoose = require('mongoose')

const bugSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: false
    },

    status: {
        type: String,
        required: false
    },

    priority: {
        type: String,
        required: false
    },

    createdBy: {
        type: String,
        required: false
    },

    assignedTo: {
        type: String,
        required: false
    },

    project: {
        type: String,
        required: false
    },

    milestone: {
        type: String,
        required: false
    },

    files: {
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

module.exports = mongoose.model('Bug', bugSchema)
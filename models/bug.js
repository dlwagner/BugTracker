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

    bugFiles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bugFile'
    }]

})

module.exports = mongoose.model('Bug', bugSchema)
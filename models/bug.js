const mongoose = require('mongoose')

const bugSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model('Bug', bugSchema)
const mongoose = require('mongoose')

const bugSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Bug', bugSchema)
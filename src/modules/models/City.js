const mongoose = require('mongoose')
const CitySchema = mongoose.Schema({
    name: {
        type: String,
        unique: true
    }

    
}, {
    timestamps: true
})



const City = mongoose.model('City', CitySchema)

module.exports = City
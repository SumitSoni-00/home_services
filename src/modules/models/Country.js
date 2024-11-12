const mongoose = require('mongoose')
const CountrySchema = mongoose.Schema({
    name: {
        type: String,
        unique: true
    },

    states: [{ type: Schema.Types.ObjectId, ref: 'State' }]
}, {
    timestamps: true
})



const Country = mongoose.model('Country', CountrySchema)

module.exports = Country
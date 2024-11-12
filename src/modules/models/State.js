const mongoose = require('mongoose')
const Schema=mongoose.Schema

const stateSchema = new Schema({
    id: {
        type: Number
    },
    name: {
        type: String
    },
    cities: [
        {
            type: Schema.Types.ObjectId,
            ref: 'City'
        },

    ],
    country: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        default: null
    }
});



const State = mongoose.model('State', stateSchema)

module.exports = State


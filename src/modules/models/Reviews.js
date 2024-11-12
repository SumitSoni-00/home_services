const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewsSchema = new Schema({
    id: {
        type: Number
    },
    comment: {
        type: String
    },
    star: {
        type: Number
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        default: null
    },


    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    }
},{
    timestamps:true
});



const Reviews = mongoose.model('Reviews', reviewsSchema)



module.exports = Reviews


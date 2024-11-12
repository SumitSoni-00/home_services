const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bookingSchema = new Schema({
    id: {
        type: Number,
        default: 1
    },
    service: {
        type: String,
        default: null
    },
    city: {
        type: Schema.Types.ObjectId,
        ref: 'City'
        , default: null
    },
    state: {
        type: Schema.Types.ObjectId,
        ref: 'State',
        default: null

    },
    pinCode: {
        type: String,
        default: null
    },
    address:{
        type:String,
        default:null
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    allotedEmployee: {
        type: Schema.Types.ObjectId,
        ref: "Employee",
        default: null
    },
    status: {
        type: String,
        enum: {
            values: ["NEW", "ALLOTED", "COMPLETED", "CANCELLED"],
            message: "bad status"
        },
        default: "NEW",
        required: true
    },
    


    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        default: null
    }
}, {
    timestamps: true
});

bookingSchema.pre('save', async function (next) {

   


    if (this.isNew) {
        const maxId = await Booking.findOne().select({ "id": 1 }).sort({ "id": -1 }).limit(1)
        console.log(maxId);
        if (maxId) {
            this.id = maxId.id + 1
        }
    }

    next()
})


// bookingSchema.post('save', function () {
//     return () => async function (doc, next) {
//         if (this.$locals.wasNew) {
//             cust.bookings.push(booking)

//             await cust.save()
//         }
//         next()
//     }
// })

const Booking = mongoose.model('Booking', bookingSchema)

module.exports = Booking


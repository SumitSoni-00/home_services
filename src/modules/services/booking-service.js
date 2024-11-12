
class BookingService {

    async aggregateBookings(filterItems, matchItems) {

        const bookings = await Booking.aggregate([
            {
                $match: filterItems
            },
            {
                $lookup: {
                    "from": "cities",
                    "localField": "city",
                    "foreignField": "_id",
                    "as": "city"

                }
            }
            ,
            {
                $lookup: {
                    "from": "states",
                    "localField": "state",
                    "foreignField": "_id",
                    "as": "state"

                }
            },
            {
                $lookup: {
                    "from": "customers",
                    "localField": "customer",
                    "foreignField": "_id",
                    "as": "customer"

                }
            },
            {
                $match: matchItems
            },
            {
                $project: {
                    id: 1,
                    service: 1,
                    customerFirstName: "$customer.firstName",
                    customerLastName: "$customer.lastName",
                    customerEmail: "$customer.email",
                    customerPhone: "$customer.phone",
                    orderDate: 1,
                    pinCode: 1,
                    city: "$city.name",

                    state: "$state.name",

                }
            },
            
        ])

        return bookings

    }


    async updateAlot(filter, employeeObjectId, update) {
        
        update.allotedEmployee = employeeObjectId._id
       

        const result = await Booking.findOneAndUpdate(filter, update,{new:true})
        //console.log(result);
       

        return result ? {_id:result._id} : null
    }


    async get_idById(id) {
        return await Booking.findOne({ id: id }, { _id: 1 })
    }

}

module.exports = new BookingService()


const Booking = require("../models/Booking")
const employeeService = require("./employee-service")
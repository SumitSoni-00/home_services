
class EmployeeService {
    async getUsersFilteredProfile(filter) {


        const employees = await Employee.find({ isActive: true, isBlocked: false, basicProfileCompleted: true });
        //console.log(employees);
        let arrEmployees = []
        employees.forEach((employee) => {

            if (employee.profileDetails.state === filter.state && employee.profileDetails.city === filter.city && employee.profileDetails.pinCode === filter.pinCode && employee.profileDetails.serviceCategory === filter.category) {
                arrEmployees.push({
                    name: employee.profileDetails.name,
                    email: employee.email,
                    rating: employee.rating,
                    address: employee.profileDetails.address,
                    city: employee.profileDetails.city,
                    state: employee.profileDetails.state,
                    pinCode: employee.profileDetails.pinCode,
                    picPath: employee.profileDetails.profilePhoto
                })
            }
        })

        return arrEmployees


    }

    async getValidEmployees(matchFilter) {
        const employees = await Employee.aggregate([
            { $match: { isActive: true, basicProfileCompleted: true, isBlocked: false } },

            { $unwind: '$profileDetails' },
            {
                $match: matchFilter
            },
            {
                $project: {
                    name: "$profileDetails.name",
                    email: 1,
                    rating: 1,
                    address: "$profileDetails.address",
                    city: "$profileDetails.city",
                    state: "$profileDetails.state",
                    pinCode: "$profileDetails.pincode",
                    picPath: "$profileDetails.profilePhoto"
                }
            }


            //{ $project: { _id: '$_id', Brand: {$push : '$Brand' }}}
        ])

        return employees
    }

    async getValidEmployeesLimit(matchFilter) {
        const employees = await Employee.aggregate([
            { $match: { isActive: true, basicProfileCompleted: true, isBlocked: false } },

            { $unwind: '$profileDetails' },

            {
                $lookup: {
                    "from": "reviews",
                    "localField": "reviews",
                    "foreignField": "_id",
                    "as": "reviews"

                }
            },
            //{ $unwind: '$reviews' },
            /* {
                 $match: matchFilter
             },*/
            {
                $project: {
                    firstName: "$profileDetails.firstName",
                    lastName: "$profileDetails.name",
                    email: 1,
                    rating: 1,
                    address: "$profileDetails.address",
                    city: "$profileDetails.city",
                    state: "$profileDetails.state",
                    pinCode: "$profileDetails.pincode",
                    picPath: "$profileDetails.profilePhoto",
                    reviews: "$reviews"
                }
            },
            { $limit: 2 }


            //{ $project: { _id: '$_id', Brand: {$push : '$Brand' }}}
        ])

        return employees
    }

    async get_IdByEmail(employeeEmail) {

        //console.log(employeeEmail);
        const objectId = await Employee.findOne({
            email: employeeEmail
        }, {
            _id: 1
        })
        //console.log(objectId);



        return objectId
    }


    async alotMeOrder(employee_id, order_id) {
        //console.log(employee_id,order_id);

        const result = await Employee.findOneAndUpdate({ _id: employee_id }, { allotedOrder: order_id },{new:true})
        return result

    }



}

module.exports = new EmployeeService();


const Employee = require("../models/Employee")

const bookingService = require("../services/booking-service")
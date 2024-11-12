const employeeService = require("../modules/services/employee-service")
const Booking = require("../modules/models/Booking")
const Employee = require("../modules/models/Employee")
const bookingService = require("../modules/services/booking-service")
class AdminController {


    async newOrdersInit(req, res, next) {
        try {
            const allNewOrders = await bookingService.aggregateBookings({
                status: "NEW"
            }, {})
            console.log(allNewOrders);
            return res.render("new_orders_admin_dash", { allNewOrders: allNewOrders })
        } catch (error) {

        }
        next()
    }

    async alotNextInit(req, res, next) {

        // console.log(req.body);
        const orderId = req.body.orderId
        const allotmentDate = req.body.allotment_date
        const { state, city, pinCode, category } = req.body

        //fetch all employees
        const filterItems = {
            "profileDetails.serviceCategory": category,
            "profileDetails.city": city,
            "profileDetails.state": state,
            "profileDetails.pincode": pinCode
        }
        const empls = await employeeService.getValidEmployees({ filterItems })
        //console.log(empls);
        req.employees = empls
        next()

        // try {
        //     const filter = {
        //         state: state,
        //         city: city,
        //         pinCode: pinCode,
        //         category: category
        //     }
        //     const employees = await employeeService.getUsersFilteredProfile(filter)
        //     req.employees = employees
        //     req.filter = filter
        //     //console.log(employees);
        //     next()
        // } catch (err) {
        //     console.log(err);
        // }
    }

    // async alotOrder(req, res, next) {
    //     const { orderId, allotmentDate, employeeEmail } = req.body
    //     //check orderId and employeeEmail
    //     try {
    //         const order = await Booking.findOne({ id: orderId, orderStatus: "new" })
    //         const employee = await Employee.findOne({ email: employeeEmail, isActive: true, basicProfileCompleted: true })
    //         if (!order || !employee) {
    //             //return res.send("not exist any")
    //         }

    //         //order.allotedEmployee=employee
    //         //employee.allotedOrder=order

    //         //order.save()
    //         //employee.save()
    //         return res.render("final_booking_preview")


    //     } catch (error) {
    //         console.log(error);
    //     }
    //     console.log(req.body);
    // }

    async filterNewOrders(req, res, next) {
        //console.log(req.body);

        //console.log(req.body);
        //delete req.body.customerName
        //console.log(req.body);
        const filterItems = req.body
        //console.log(filterItems);

        console.time("label1")

        let matchItems = {};
        console.log(matchItems);
        if (filterItems.customer) {
            matchItems["customer.firstName"] = filterItems.customer.trim().toLowerCase().split(" ")[0]

            if (filterItems.customer.trim().toLowerCase().split(" ")[1]) {
                matchItems["customer.lastName"] = filterItems.customer.trim().toLowerCase().split(" ")[1]
            }



        } else if (filterItems.city) {
            matchItems["city.name"] = filterItems.city

        } else if (filterItems.state) {
            matchItems["state.name"] = filterItems.state

        }



        delete filterItems.customer
        delete filterItems.city
        delete filterItems.state

        //filterItems.status = "NEW"
        console.log(matchItems);







        try {

            const bookings = await bookingService.aggregateBookings(filterItems, matchItems)


            //console.log(bookings);
            console.log(bookings);

            console.timeEnd("label1")

        } catch (error) {
            console.log(error);

        }


        next()























        //console.log(filterItems);
        //#############################################################################
        // try {
        //     const cursor =  Booking.find(filterItems)
        //         .populate([
        //             {
        //                 path: "customer",
        //                 model: "Customer",
        //                 match: customerMatch,
        //                 select: { firstName: 1 }
        //             },
        //             {
        //                 path: "city",
        //                 model: "City",
        //                 match: cityMatch,
        //                 select: { name: 1 }
        //             },
        //             {
        //                 path: "state",
        //                 model: "State",
        //                 match: stateMatch,
        //                 select: { name: 1 }
        //             }])

        //             // cursor.forEach((doc)=>{
        //             //     if(doc.state!=null && doc.city!=null && doc.customer!=null){
        //             //         filteredNewOrders.push(doc)
        //             //     }
        //             // })

        //             //console.log(cursor);

        //             .cursor()

        //     //console.log(cursor);
        //     for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        //         if (doc.state != null && doc.customer!=null && doc.city!=null) {
        //             filteredNewOrders.push(doc)
        //         }
        //     }
        //     /*
        //     .stream()
        // .on ("data", function (doc){
        //     test.push (convert (doc));
        // }).on ("error", function (error){
        //     cb (error, 500);
        // }).on ("close", function (){
        //     cb (null, bookings)
        // });*/
        //     /*.
        //     cursor()
        //     .
        //     on('data', function (doc) { 
        //         if(doc.state!=null){
        //             test.push ( doc);
        //         }
        //     }).
        //     on('end', function () { console.log(test); });*/
        //     console.log(filteredNewOrders);
        //     console.timeEnd("label1")
        //      return res.json({ "size": filteredNewOrders.length })

        // } catch (error) {
        //     console.log(error);

        // }
        //################################################################################


        // else {


        //     delete filterItems.customer
        //     delete filterItems.city
        //     delete filterItems.state

        //     //filterItems.status = "NEW"


        //     //console.log(filterItems);
        //     try {
        //         const bookings = await Booking.find(filterItems).populate([
        //             {
        //                 path: "customer",
        //                 model: "Customer",

        //                 select: { firstName: 1 }
        //             },
        //             {
        //                 path: "city",
        //                 model: "City",
        //                 select: { name: 1 }
        //             },
        //             {
        //                 path: "state",
        //                 model: "State",

        //                 select: { name: 1 }
        //             }])
        //         //console.log(bookings);
        //         return res.json({ "size": bookings.length })
        //     } catch (error) {
        //         console.log(error);

        //     }
        // }

    }

    async alotOrder(req, res, next) {
        try {

            // console.log(req.query);
            if(!req.query.orderId || !req.query.employeeEmail){
                return res.json("fields required")
            }
            const filter = {
                id: req.query.orderId
            }


            const employeeEmail = req.query.employeeEmail
            

            const employeeObjectId = await employeeService.get_IdByEmail(employeeEmail);
            //console.log(employeeObjectId);
            if(!employeeObjectId){
                return res.json("employee not found")
            }
            const update = {
                status: "ALLOTED"
            }
            const alotBookingRes = await bookingService.updateAlot(filter, employeeObjectId, update);
            //console.log(alotBookingRes);
            if (alotBookingRes) {
                //console.log(alotBookingRes);
                const employeeBookResult = await employeeService.alotMeOrder(employeeObjectId._id, alotBookingRes._id)
                console.log(employeeBookResult);
            }else{
                return res.json("booking not found")
            }
            res.render("order_booking_status", {
                status: true
            })
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new AdminController()
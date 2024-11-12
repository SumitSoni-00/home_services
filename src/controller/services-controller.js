const joi = require('joi');
const Customer = require("../modules/models/Customer")
const RefreshToken = require("../modules/models/RefreshToken")
const bcrypt = require('bcrypt');
const crypto = require("crypto")
const { CLIENT_URL } = process.env
const CustomerDto = require("../dtos/customer-dto")
const tokenService = require('../modules/services/token-service');
//import CustomErrorHandler from '../../services/CustomErrorHandler';
const emailService = require("../utils/email-service")
const express = require("express")
const app = express()
const Employee = require("../modules/models/Employee")
const jwt = require("jsonwebtoken")
const fs = require("fs");
const { log } = require('console');
const Booking = require('../modules/models/Booking');
const employeeService = require("../modules/services/employee-service")
class ServicesController {


    async hello() {
        console.log("hello");
    }

    async bookMyService(req, res, next) {
        console.log(req.body);

        const cust = req.cust
        const category = req.body.category
        const existingSelected = req.body.existing_selected
        const bookingData = {}
        const body = req.body
        if (existingSelected === "true") {

            bookingData.address = body.select_address
            // bookingData.city=body.select_city
            // bookingData.state=body.select_state
            bookingData.pinCode = body.select_pinCode

        } else if (existingSelected === "") {

            bookingData.address = body.address
            // bookingData.city=body.city
            // bookingData.state=body.state
            bookingData.pinCode = body.pinCode
        }
        const customerSetData = {}
        if (body.first_name && body.last_name) {
            console.log("names");
            customerSetData.firstName = body.first_name
            customerSetData.lastName = body.last_name

        }
        if (body.contact_phone) {
           
            customerSetData.contactPhone = body.contact_phone
            customerSetData.alternatePhone = body.alternate_phone.length ? body.alternate_phone : null
        }

        if (body.alternate_phone) {
            console.log("hello hi");
            
            customerSetData.alternatePhone = body.alternate_phone
        }
        //console.log(bookingData);
        bookingData.service = category
        bookingData.customer = cust
        //console.log(bookingData);
       


        try {
            const booking = new Booking(bookingData)

            const newBook = await booking.save()

            //cust.bookings.push(booking)
            //console.log(newBook._id);
            let pushData={
                bookings: booking

            }

            if(body.save_address==="true"){
                pushData.addresses={
                    address:body.address,
                    city:body.city,
                    state:body.state,
                    pinCode:body.pinCode
                }
            }
           // console.log(pushData);

            //await cust.save()
            const newRes = await Customer.findOneAndUpdate({
                _id: cust._id
            }, {
                $push: pushData,
                $set: customerSetData
            }, {
                new: true
            })




            //console.log("booking");
            //console.log(newRes);
            const details = {
                name: `${cust.firstName} ${cust.lastName}`,
                address: `${cust.address} ,${cust.city}, ${cust.state}`,
                pinCode: cust.pincode
            }


            return res.render("services/booking_service_status", { booking: true, details: details })

        } catch (error) {
            console.log(error);

        }


        //console.log(req.body);

    }
    async initPage(req, res, next) {
        const servicesMap = {
            "gardening": "gardening_works",
            "electricity": "electricity_works",
            "cleaning": "cleaning_works",
            "plumbering": "plumbering_works",
            "pest_control": "pest_control_works",
            "furniture": "furniture_works",
            "painters": "painters_works"
        }
        var { city, state } = req.cookies
        if (city === "" || state === "") {
            city = "Jabalpur"
            state = "Madhya Pradesh"
        }
        //console.log(city.length ,state.length)
        const category = req.params.category
        const services = servicesMap[category]
        //console.log(services);
        if (!servicesMap[category]) {
            return res.json("not")
        }
        try {
            const filterItems = {
                "profileDetails.city": city,
                "profileDetails.state": state,
                "profileDetails.serviceCategory": services

            }
            const employees = await employeeService.getValidEmployeesLimit(filterItems)


            //const splitEmpl=newEmpls[0].profileDetails.profilePhoto.split("\\")
            //console.log(employees)
            req.employees = employees

            next()
        } catch (error) {
            console.log(error)
        }
    }


    async initFinalBooking(req, res, next) {

        const cust = req.cust
        //console.log(cust);

        const customerDetails = {
            firstName: cust.firstName,
            lastName: cust.lastName,
            contactPhone: cust.contactPhone,
            alternatePhone: cust.alternatePhone,
            city: cust.city,
            state: cust.state,
            address: cust.address,
            pinCode: cust.pincode,
            authenticationMethod: cust.authenticationMethod,
            primaryEmail: cust.primaryEmail,
            primaryPhone: cust.primaryPhone,
            addresses: cust.addresses

        }
        req.customerDetails = customerDetails
        next()


    }
}





module.exports = new ServicesController();







































/*



 const empls = await Employee.find({ isActive: true, isBlocked: false, basicProfileCompleted: true }).populate("reviews")
            var arr = [];
            const newEmpls = empls.filter((empl) => {
                if (empl.profileDetails.serviceCategory === services && empl.profileDetails.city === city) {
                    var splitEmpl = empl.profileDetails.profilePhoto.split("\\")
                    var picPath = splitEmpl[splitEmpl.length - 2] + "/" + splitEmpl[splitEmpl.length - 1]
                    var newEmpl = {
                        name: empl.profileDetails.name,
                        city: empl.profileDetails.city,
                        rating: empl.rating,
                        subWorks: empl.profileDetails.serviceSubCategory,
                        reviews: empl.reviews,
                        pic: picPath

                    }

                    arr.push(newEmpl)
                }


            })

            */
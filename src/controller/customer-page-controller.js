
class CustomerPageController {


    async initbookingsPage(req, res, next) {
        //const bookings=req.cust.populate("bookings")
        //console.log(req.cust.bookings[0].service);
        //console.log(req.cust);
        const bookedOrders = []
        const completedOrders = []
        const ongoingOrders = []
        const cancelledOrders = []
        const allOrders = req.cust.bookings

        try {
            allOrders.forEach((order) => {
                let status = order.status
                if (status === "NEW") {
                    bookedOrders.push(order)
                } else if (status === "ALLOTED") {
                    ongoingOrders.push(order)
                } else if (status === "COMPLETED") {
                    completedOrders.push(order)
                } else if (status === "CANCELLED") {
                    cancelledOrders.push(order)
                } else {
                    throw new Error("bad status")
                }


            })

            //console.log( bookedOrders, completedOrders ,ongoingOrders,cancelledOrders);


            res.render("customer/my_orders", {
                allOrders: allOrders,
                cust: req.cust,
                bookedOrders: bookedOrders,
                ongoingOrders: ongoingOrders,
                completedOrders: completedOrders,
                cancelledOrders: cancelledOrders
            })
        } catch (error) {
            console.log(error);
        }




    }

    async updateProfile(req, res, next) {
        const firstName = req.body.first_name
        const lastName = req.body.last_name
        const phone = req.body.phone
        const email = req.body.email


        const cust = req.cust
        if (cust.loginMethod === "EMAIL" && !email && phone) {
            cust.contactPhone = phone
        } else if (cust.loginMethod === "PHONE" && !phone && email) {
            cust.contactEmail = email
        }

        cust.firstName = firstName
        cust.lastName = lastName
        



        try {
            await cust.save()
            console.log(cust);


            next()
        } catch (error) {
            console.log(error);

        }
    }

    async initProfilePage(req, res, next) {
        const cust = req.cust;
        var basicDetailsCompleted = true
        if (!cust.firstName || !cust.lastName || !cust.city || !cust.state || !cust.pincode || !cust.address) {
            basicDetailsCompleted = false;
        }
        req.basicDetailsCompleted = basicDetailsCompleted
        if (cust.loginMethod === "EMAIL") {
            req.emailAuth = true
            req.phoneAuth = false;
        } else if (cust.loginMethod === "PHONE") {
            req.phoneAuth = true;
            req.emailAuth = false
        }
        next()
    }

    async saveAddress(req, res, next) {
        try {
            console.log(req.body);
            const cust = req.cust
            cust.addresses.push(req.body)
            const saveResult = await cust.save();
            if (saveResult) {
                console.log(saveResult);
                return res.json("success")
            }
        } catch (error) {
            console.log(error);
        }
    }

    async initManageAddresses(req, res, next) {



        try {
            //console.log(req.cust);
            const addresses = req.cust.addresses
            req.addresses = addresses
            next()
        } catch (error) {

        }
    }


    async addNewAddress(req, res, next) {
        //console.log(req.cust);
        const body = req.body
        const newAddress = {
            fullName: body.full_name,
            pinCode: body.pinCode,
            address: body.address,
            contactPhone: body.contact_phone,
            city: body.city,
            state: body.state,
            alternatePhone: body.alternate_phone,
            locality: body.locality
        }

        console.log(newAddress);


        try {

            const cust = req.cust
            cust.addresses.push(newAddress)
            const saveResult = await cust.save();
            if (saveResult) {
                //console.log(saveResult);
                return res.redirect("addresses")
            }
        } catch (error) {

            res.cookie('saveAddressFailed', true, {
                maxAge: 1000 * 60 * 5,
                httpOnly: true,
            });
            return res.redirect("addresses")


            //return res.json("error")
        }


    }
}

module.exports = new CustomerPageController()


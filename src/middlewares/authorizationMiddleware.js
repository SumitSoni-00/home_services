const jwt = require("jsonwebtoken");
const { connect } = require("mongoose");
const Employee = require("../modules/models/Employee");
const Customer = require("../modules/models/Customer")
class AuthorizationMiddleware {
    async ifAlreadySignin(req, res, next) {
        req.first = "first"
        //console.log("middleware for guest")
        const accessToken = req.cookies.accessToken;
        const role = req.cookies.role

        if (accessToken) {


            jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) {
                    console.log(err)
                    //return res.status(400).json({ msg: "Invalid Authentication." })
                    next();
                }

                else if (user) {
                    //console.log(user);
                    if (role === "employee") {
                        res.redirect("/employee/home_dash")
                    } else if (role === "customer") {
                        res.redirect("/customer/home")
                    }
                    //return res.status(400).json({ msg: "already login.", role: role })
                }

            })
        } else {
            next();
        }
    }




    async userBasicAuthorization(req, res, next) {
        //console.log("cookies" + req.cookies.accessToken)
        const accessToken = req.cookies.accessToken;
        const role = req.cookies.role
        //console.log("###############################" + req.body.myImage2 + "##################################################")
        //console.log("inside employee "+  req.first)
        // const empl = await Employee.findOne({ _id: user._id }) //Line 1
        if (accessToken) {
           
            try {
                const user = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET)
               

                if (user) {
                    //console.log(role);
                    if (role === "employee" && user.role==="employee") {
                        
                        try {
                            const empl = await Employee.findOne({ _id: user._id }).populate([
                                {
                                    path:"allotedOrder"
                                },
                                {
                                    path:"completedOrders"

                                }
                            ]
                                
                                ) //Line 2
                            if (empl) {
                                req.empl = empl
                                next();
                            } else {
                                return res.statu(400).json("error")
                            }
                        } catch (err) {
                            console.log(err)
                            return res.statu(400).json("error")
                        }
                    } else if (role === "customer") {
                        try {
                            const cust = await Customer.findOne({ _id: user._id }).populate("bookings") //Line 2
                            req.cust=cust
                            if (cust) {
                                next()
                            } else {
                                return res.statu(400).json("error")
                            }
                        } catch (err) {
                            console.log(err)
                            return res.statu(400).json("error")
                        }
                    }

                }
            } catch (err) {

                console.log(err)
                return res.status(400).json({ msg: "access token err." })
                //next();



            }
        } else {
            //console.log("############## get OUT #############")
            return res.redirect("/")
        }
    }



    async customerBasicAuthorization(req, res, next) {
        //console.log("cookies" + req.cookies.accessToken)
        const accessToken = req.cookies.accessToken;
        const role = req.cookies.role
        //console.log("###############################" + req.body.myImage2 + "##################################################")
        //console.log("inside employee "+  req.first)
        // const empl = await Employee.findOne({ _id: user._id }) //Line 1
        if (accessToken) {
           
            try {
                const user = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET)
               

                if (user) {
                    //console.log(role);
                    if (role === "employee" && user.role==="employee") {
                       
                       return res.redirect("/")
                    } else if (role === "customer" && user.role==="customer") {
                        try {
                            const cust = await Customer.findOne({ _id: user._id }) //Line 2
                            req.cust=cust
                            if (cust) {
                                next()
                            } else {
                                return res.statu(400).json("error")
                            }
                        } catch (err) {
                            console.log(err)
                            return res.status(400).json("error")
                        }
                    }

                }
            } catch (err) {

                console.log(err)
                return res.status(400).json({ msg: "access token err." })
                //next();



            }
        } else {
            //console.log("############## get OUT #############")
            return res.redirect("/")
        }
    }


    async employeeBasicAuthorization(req, res, next) {
        //console.log("cookies" + req.cookies.accessToken)
        const accessToken = req.cookies.accessToken;
        const role = req.cookies.role
        //console.log("###############################" + req.body.myImage2 + "##################################################")
        //console.log("inside employee "+  req.first)
        // const empl = await Employee.findOne({ _id: user._id }) //Line 1
        if (accessToken) {
           
            try {
                const user = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET)
               

                if (user) {
                    //console.log(role);
                    if (role === "customer" && user.role==="customer") {
                       
                       return res.redirect("/")
                    } else if (role === "employee" && user.role==="employee") {
                        try {
                            const employee = await Employee.findOne({ _id: user._id }) //Line 2
                            req.employee=employee
                            if (employee) {
                                next()
                            } else {
                                return res.statu(400).json("error")
                            }
                        } catch (err) {
                            console.log(err)
                            return res.status(400).json("error")
                        }
                    }

                }
            } catch (err) {

                console.log(err)
                return res.status(400).json({ msg: "access token err." })
                //next();



            }
        } else {
            //console.log("############## get OUT #############")
            return res.redirect("/")
        }
    }

    unauthorisedUserRedirectLogin(app) {
        return async (req, res, next) => {
            //console.log("cookies" + req.cookies.accessToken)
            const accessToken = req.cookies.accessToken;
            const role = req.cookies.role
            //console.log("###############################"+  req.body.myImage2 +"##################################################")
            //console.log("inside employee "+  req.first)
            // const empl = await Employee.findOne({ _id: user._id }) //Line 1
            if (accessToken) {
                try {
                    const user = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET)


                    if (user) {
                        if (role === "employee") {
                            try {
                                const empl = await Employee.findOne({ _id: user._id }) //Line 2
                                if (empl) {
                                    req.empl = empl
                                    next();
                                } else {
                                    return res.statu(400).json("error")
                                }
                            } catch (err) {
                                console.log(err)
                                return res.statu(400).json("error")
                            }
                        } else if (role === "customer") {
                            try {
                                const cust = await Customer.findOne({ _id: user._id }) //Line 2
                                if (cust) {
                                    req.cust = cust
                                    next()
                                } else {
                                    return res.statu(400).json("error")
                                }
                            } catch (err) {
                                console.log(err)
                                return res.statu(400).json("error")
                            }
                        }

                    }
                } catch (err) {

                    console.log(err)
                    return res.status(400).json({ msg: "access token err." })
                    //next();



                }
            } else {
                // console.log("############## get OUT #############")
                //app.test="new_test"
                
                
               


                const url = req.originalUrl
                res.cookie('guestToUserRedirect', url, {
                  maxAge: 1000 * 60 * 60,
                  httpOnly: true,
                });
                //console.log(fullUrl);
                return res.redirect("/view_login")
            }
        }

    }




    // async unauthorisedUserRedirectLogin(req, res, next) {
    //     //console.log("cookies" + req.cookies.accessToken)
    //     const accessToken = req.cookies.accessToken;
    //     const role = req.cookies.role
    //     //console.log("###############################"+  req.body.myImage2 +"##################################################")
    //     //console.log("inside employee "+  req.first)
    //     // const empl = await Employee.findOne({ _id: user._id }) //Line 1
    //     if (accessToken) {
    //         try {
    //             const user = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET)


    //             if (user) {
    //                 if (role === "employee") {
    //                     try {
    //                         const empl = await Employee.findOne({ _id: user._id }) //Line 2
    //                         if (empl) {
    //                             req.empl = empl
    //                             next();
    //                         } else {
    //                             return res.statu(400).json("error")
    //                         }
    //                     } catch (err) {
    //                         console.log(err)
    //                         return res.statu(400).json("error")
    //                     }
    //                 } else if (role === "customer") {
    //                     try {
    //                         const cust = await Customer.findOne({ _id: user._id }) //Line 2
    //                         if (cust) {
    //                             req.cust = cust
    //                             next()
    //                         } else {
    //                             return res.statu(400).json("error")
    //                         }
    //                     } catch (err) {
    //                         console.log(err)
    //                         return res.statu(400).json("error")
    //                     }
    //                 }

    //             }
    //         } catch (err) {

    //             console.log(err)
    //             return res.status(400).json({ msg: "access token err." })
    //             //next();



    //         }
    //     } else {
    //         // console.log("############## get OUT #############")
    //         //app.test="new_test"
    //         //app.locals.test = "new test locals"
    //         return res.redirect("/view_login")
    //     }
    // }


    async isUserAuthorised(req, res, next) {
        //console.log("cookies" + req.cookies.accessToken)
        const accessToken = req.cookies.accessToken;
        //console.log(accessToken);
        const role = req.cookies.role
        //console.log("inside employee "+  req.first)
        // const empl = await Employee.findOne({ _id: user._id }) //Line 1
        if (accessToken) {
            try {
                const user = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET)


                if (user) {
                    if (role === "employee" && user.role==="employee") {
                        try {
                            const empl = await Employee.findOne({ _id: user._id }) //Line 2
                            if (empl.basicProfileCompleted === false) {
                                res.redirect("/employee/basic_profile_form")
                            } else {
                                //console.log("1")
                                // res.redirect("/employee/test")
                                next();
                            }
                        } catch (err) {
                            console.log(err)
                        }
                    } else if (role === "customer") {
                       next()
                    }

                }
            } catch (err) {

                console.log(err)
                return res.status(400).json({ msg: "access token err." })
                //next();


            }
        } else {
            //console.log("############## get OUT #############")
            res.redirect("/")
        }
    }


    async basicProfileAuthorization(req, res, next) {
        //console.log("cookies" + req.cookies.accessToken)
        const accessToken = req.cookies.accessToken;
        const role = req.cookies.role
        //console.log("inside employee " + req.first)
        // const empl = await Employee.findOne({ _id: user._id }) //Line 1
        if (accessToken) {
            try {
                const user = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET)


                if (user) {
                    if (role === "employee") {
                        try {
                            const empl = await Employee.findOne({ _id: user._id }) //Line 2
                            if (empl.basicProfileCompleted === false) {
                                req.employee = empl
                                next();
                            } else {
                                //console.log("1")
                                res.redirect("/employee/home")

                            }
                        } catch (err) {
                            console.log(err)
                        }
                    }
                    //console.log(user)
                    //return res.json(user)
                }
            } catch (err) {

                console.log(err)
                return res.status(400).json({ msg: "access token err." })
                //next();


            }
        } else {
            res.redirect("/")
        }
    }
}

module.exports = new AuthorizationMiddleware();
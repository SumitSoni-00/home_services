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
const fs = require("fs")
const otpService = require("../modules/services/otp-service")
const hashService = require("../modules/services/hash-service");
const { log } = require('console');
class AuthController {


    async verifyOtp(req, res, next) {
        const { hash, phone } = req.cookies;
        const { first, second, third, fourth, fifth, sixth } = req.body
        if (!hash || !phone || !first || !second || !third || !fourth || !fifth || !sixth) {
            res.status(400).json({ message: 'All fields are required!' });
        }

        const [hashedOtp, expires, role] = hash.split('.');
        if (Date.now() > +expires) {
            res.status(400).json({ message: 'OTP expired!' });
        }
        const otp = first + second + third + fourth + fifth + sixth
        console.log(otp);

        const data = `${phone}.${otp}.${expires}.${role}`;
        const isValid = otpService.verifyOtp(hashedOtp, data);
        if (!isValid) {
            res.status(400).json({ message: 'Invalid OTP' });
        }

        let user;
        try {
            if (role === "customer") {
                user = await Customer.findOne({ phone, isActive: false });
            } else if (role === "employee") {
                user = await Employee.findOne({ phone, isActive: false });
            } else {
                return res.send("error")
            }
            if (!user) {
                return res.send("not find /already activated")
            }
            user.isActive = true

            await user.save()
            res.clearCookie("last4")
            res.clearCookie("phone")
            res.clearCookie("hash")

            res.cookie('activated', "true", {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
            });

            return res.redirect("/view_login")

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Db error' });
        }

        // const { accessToken, refreshToken } = tokenService.generateTokens({
        //     _id: user._id,
        //     activated: false,
        // });

        // await tokenService.storeRefreshToken(refreshToken, user._id);

        // res.cookie('refreshToken', refreshToken, {
        //     maxAge: 1000 * 60 * 60 * 24 * 30,
        //     httpOnly: true,
        // });

        // res.cookie('accessToken', accessToken, {
        //     maxAge: 1000 * 60 * 60 * 24 * 30,
        //     httpOnly: true,
        // });

        // const userDto = new UserDto(user);
        // res.json({ user: userDto, auth: true });




    }



    async verifyResetPasswordMail(req, res, next) {

        const resetCode = req.query.reset_code;
        const role = req.query.role
        const email = req.query.email
        //console.log(email + " - " + userType)

        if (!resetCode || !role || !email) {
            return res.render("account_activation_status", { message: 'All fields are required!' });
        }

        try {
            let cust = null, empl = null, resetPasswordToken = null;
            if (role === "cust") {
                cust = await Customer.findOne({ email: email, isActive: true });
                if (cust) {
                    resetPasswordToken = cust.resetPasswordToken;
                } else {
                    return res.send("not exist")
                }
            } else if (role === "empl") {
                empl = await Employee.findOne({ email: email, isActive: true });
                if (empl) {
                    resetPasswordToken = empl.resetPasswordToken;
                } else {
                    return res.send("not exist")
                }
            }
            const user = jwt.verify(resetCode, resetPasswordToken)
            console.log("vfCode_verify " + JSON.stringify(user))
            // const encEmail=jwt.sign({email:user.email},process.env.ACTIVATION_TOKEN_SECRET,{
            //     expiresIn:"60m"
            // })




            if (user && user.userType === "employee" && role === "empl" && email === user.email) {

                const userExist = await Employee.exists({ email: user.email, isActive: true });


                if (userExist) {
                    return res.render("make_new_password", { "message": "change_password", "secretLink": resetCode, "email": email, "role": "empl" })
                } else {
                    return res.json("email not exist")
                }
            } else if (user && user.userType === "customer" && role === "cust" && email === user.email) {
                const userExist = await Customer.exists({ email: user.email, isActive: true });

                if (userExist) {
                    return res.render("make_new_password", { "message": "change_password", "secretLink": resetCode, "email": email, "role": "cust" })
                } else {
                    return res.json("email not exist")
                }
            }
        } catch (err) {
            console.log(err);
            return res.render("account_activation_status", { message: 'Some Error' });
        }





        //return res.render("account_activation_status", { message: "expired", request: req })

        // try {
        //     if (userType === "employee") {

        //         const userExist = await Employee.exists({ email: email, isActive: true });

        //         if (userExist) {
        //             return res.render("make_new_password", { "message": "change_password", "email": email })
        //         } else {
        //             return res.json("email not exist")
        //         }
        //     } else if (userType === "customer") {
        //         const employeeExist = await Customer.exists({ email: email, isActive: true });
        //         if (employeeExist) {
        //             return res.render("make_new_password", { "message": "change_password" })
        //         }
        //     }
        // } catch (err) {
        //     console.log(err);
        //     return res.render("account_activation_status", { message: 'Db error' });
        // }







        // try {
        //     const filter = { email: email, isActive: false, vfCode: vfCode };
        //     const update = { isActive: true };
        //     let doc = await Employee.findOneAndUpdate(filter, update, {
        //         new: true
        //     });
        //     return res.render("account_activation_status", { "message": "user activated" })
        // } catch (err) {
        //     console.log(err)
        //     return res.render("account_activation_status", { "message": "db error" })
        // }
    }


    async updateNewPassword(req, res, next) {
        const secretLink = req.body.secret_link;
        const email = req.body.email;
        const role = req.body.role;
        const password = req.body.password;
        const repeatPassword = req.body.repeat_password;
        if (!secretLink || !password || !repeatPassword || !email || !role) {
            return res.send("fields required")
        }
        try {

            if (role === "empl") {
                const empl = await Employee.findOne({ email: email, isActive: true, })
                if (empl) {
                    const resetPasswordSecret = empl.resetPasswordToken
                    const user = jwt.verify(secretLink, resetPasswordSecret)

                    if (user && user.email === email && user.userType === "employee") {
                        const hashedPassword = await bcrypt.hash(password, 10);
                        empl.password = hashedPassword
                        empl.resetPasswordToken = resetPasswordSecret.split("::")[0]
                        await empl.save()
                        return res.send("changed successfully")
                    } else {
                        console.log(user)
                    }
                } else {
                    console.log(empl)
                }
            } else if (role === "cust") {
                const cust = await Customer.findOne({ email: email, isActive: true, })
                if (cust) {
                    const resetPasswordSecret = cust.resetPasswordToken
                    const user = jwt.verify(secretLink, resetPasswordSecret)

                    if (user && user.email === email && user.userType === "customer") {
                        const hashedPassword = await bcrypt.hash(password, 10);
                        cust.password = hashedPassword
                        cust.resetPasswordToken = secretLink.split("::")[0]
                        await cust.save()
                        return res.send("done")
                    } else {
                        console.log(user)
                    }
                } else {
                    console.log(cust)
                }
            } else {
                return res.send("bad")
            }

        } catch (err) {
            console.log(err)
        }
    }


    async forgotPasswordSendMail(req, res, next) {
        //console.log("forgot")



        const emailPhone = req.body.email_phone


        const isEmailValid = (email) => {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        };


        const isPhoneValid = (phone) => {
            const re = /^[6-9]{1}[0-9]{9}$/;
            return re.test(phone);
        };
        //console.log(email_phone + "!@#" + password)
        let empl, cust;
        let emailValid = false, phoneValid = false;
        if (isEmailValid(emailPhone)) {
            empl = await Employee.findOne({ email: emailPhone })
            cust = await Customer.findOne({ email: emailPhone })
            emailValid = true
        } else if (isPhoneValid(emailPhone)) {
            empl = await Employee.findOne({ phone: emailPhone })
            cust = await Customer.findOne({ phone: emailPhone })
            phoneValid = true
        } else {
            return res.send("bad email phone")
        }

        //console.log("~~" + empl + "~" + cust)
        if (empl && cust) {
            return res.status(400).json("error:both cust and empl exist")
        }






        try {
            //const emailPhone = req.body.email_phone
            //console.log(emailPhone)
            //const empl = await Employee.findOne({ email: emailPhone })
            //const cust = await Customer.findOne({ email: emailPhone })
            //console.log("~~" + empl + "~" + cust)
            if (empl && cust) {
                return res.status(400).json("error:both cust and empl exist")
            }
            else if (empl) {
                if (emailValid) {
                    const resetPasswordToken = empl.resetPasswordToken + "::" + Date.now()
                    const resetPasswordActivation = tokenService.getResetPasswordToken({ email: emailPhone, userType: "employee" }, resetPasswordToken)
                    const url = `${CLIENT_URL}/reset_password?reset_code=${resetPasswordActivation}&role=empl&email=${emailPhone}`
                    const emailText = emailService.getResetPassEmailText(url)
                    req.emailText = emailText
                    //const mailResult = await emailService.sendMail(emailText)
                    console.log(emailText)
                    empl.resetPasswordToken = resetPasswordToken;
                    empl.save()


                    res.json({ msg: "Re-send the password, please check your email." })
                    // } else if (phoneValid) {
                    //     //otp sending
                    //     const phone=emailPhone








                    //         //##########################################################################################


                    //         //##############################################################################################






                    //         const otp = await otpService.generateOtp();
                    //         console.log(otp);
                    //         const ttl = 1000 * 60 * 10; // 10 min
                    //         const expires = Date.now() + ttl;
                    //         const data = `${phone}.${otp}.${expires}`;
                    //         const hash = `${hashService.hashOtp(data)}.${expires}`;

                    //         // send OTP
                    //         // try {
                    //         //     // await otpService.sendBySms(phone, otp);
                    //         //     return res.json({
                    //         //         hash: `${hash}.${expires}`,
                    //         //         phone,
                    //         //         otp,
                    //         //     });
                    //         // } catch (err) {
                    //         //     console.log(err);
                    //         //     res.status(500).json({ message: 'message sending failed' });
                    //         // }

                    //         //#############################################################################################




                    //         try {
                    //             empl.otp=hash
                    //             const result = await empl.save();
                    //             //console.log(result);
                    //             //generate vf code
                    //             //console.log(result);

                    //             //otp sending
                    //             if (result) {
                    //                 //otp sending
                    //             }

                    //             //const custDto = new CustomerDto(Employee);


                    //             res.cookie('hash', `${hash}.${expires}.customer`, {
                    //                 maxAge: 1000 * 60 * 60 * 60,
                    //                 httpOnly: true,
                    //             });

                    //             res.cookie('phone', phone, {
                    //                 maxAge: 1000 * 60 * 60 * 60,
                    //                 httpOnly: true,
                    //             });
                    //             //req.app.locals.otpSending=true

                    //             res.cookie('last4', phone.slice(-4), {
                    //                 maxAge: 1000 * 60 * 60 * 60,
                    //                 httpOnly: true,
                    //             });
                    //             return res.redirect("/verify_otp")

                    //         } catch (err) {
                    //             return next(err);
                    //         }

                    //         //######################################################################################

                    //         // Hash password
                    //         //const hashedPassword = await bcrypt.hash(password, 10); //will be done in pre

                    //         // prepare the model

                    //         // const customer = new Customer({

                    //         //     phone,
                    //         //     password: hashedPassword
                    //         // });


                    //         // try {
                    //         //     const result = await customer.save();
                    //         //     console.log(result);

                    //         //     // // Token
                    //         //     // // access_token = JwtService.sign({ _id: result._id, role: result.role });
                    //         //     // // refresh_token = JwtService.sign({ _id: result._id, role: result.role }, '1y', REFRESH_SECRET);
                    //         //     // // database whitelist
                    //         //     // //await RefreshToken.create({ token: refresh_token });
                    //         //     // const { accessToken, refreshToken } = tokenService.generateTokens({ _id: customer._id, activated: false });
                    //         //     // await tokenService.storeRefreshToken(refreshToken, customer._id);
                    //         //     // res.cookie('refreshToken', refreshToken, {
                    //         //     //     maxAge: 1000 * 60 * 60 * 24 * 30,
                    //         //     //     httpOnly: true,
                    //         //     // });

                    //         //     // res.cookie('accessToken', accessToken, {
                    //         //     //     maxAge: 1000 * 60 * 60 * 24 * 30,
                    //         //     //     httpOnly: true,
                    //         //     // });
                    //         //     const customerDto = new CustomerDto(customer);
                    //         //     res.json({ user: customerDto, auth: true });
                    //         // } catch (err) {
                    //         // return next(err);
                    //     }




                }
            } else if (cust) {
                if (emailValid) {
                    const resetPasswordToken = cust.resetPasswordToken + "::" + Date.now()
                    const resetPasswordActivation = tokenService.getResetPasswordToken({ email: emailPhone, userType: "customer" }, resetPasswordToken)
                    const url = `${CLIENT_URL}/reset_password?reset_code=${resetPasswordActivation}&role=cust&email=${emailPhone}`

                    const emailText = emailService.getResetPassEmailText(url)
                    req.emailText = emailText
                    //const mailResult = await emailService.sendMail(emailText)
                    console.log(emailText)
                    cust.resetPasswordToken = resetPasswordToken;
                    cust.save()


                    res.json({ msg: "Re-send the password, please check your email." })
                } else if (phoneValid) {
                    //otp sending
                }
            } else {
                return res.status(400).json("error:email not exist")
            }
        }



        catch (err) {
            console.log(err)
            return res.status(500).json({ msg: err.message })
        }
    }

    login(app) {
        return async (req, res, next) => {
            try {
                //console.log(req.body);
                const { email_phone, password } = req.body


                const isEmailValid = (email) => {
                    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(email);
                };


                const isPhoneValid = (phone) => {
                    const re = /^[6-9]{1}[0-9]{9}$/;
                    return re.test(phone);
                };
                //console.log(email_phone + "!@#" + password)
                let empl, cust;
                if (isEmailValid(email_phone)) {
                    empl = await Employee.findOne({ email: email_phone }).populate([
                        {
                            path: 'allotedOrder',
                            model: 'Booking'
                        },
                        {
                            path: 'completedOrders',
                            model: 'Booking'
                        }
                    ])
                    cust = await Customer.findOne({ email: email_phone })
                } else if (isPhoneValid(email_phone)) {
                    empl = await Employee.findOne({ email: email_phone }).populate([
                        {
                            path: 'allotedOrder',
                            model: 'Booking'
                        },
                        {
                            path: 'completedOrders',
                            model: 'Booking'
                        }
                    ])
                    cust = await Customer.findOne({ phone: email_phone })
                } else {
                    return res.send("bad email phone")
                }

                //console.log("~~" + empl + "~" + cust)
                if (empl && cust) {
                    return res.status(400).json("error:both cust and empl exist")
                }
                else if (empl) {
                    //console.log("login");
                    const isMatch = await bcrypt.compare(password, empl.password)
                    if (!isMatch) return res.status(400).json({ msg: "Password is incorrect." })

                    const { accessToken, refreshToken } = tokenService.generateTokens({ _id: empl._id, role: "employee" });
                    //await tokenService.storeRefreshToken(refreshToken, customer._id);
                    res.cookie('refreshToken', refreshToken, {
                        maxAge: 1000 * 60 * 60 * 5,
                        httpOnly: true,
                    });

                    res.cookie('accessToken', accessToken, {
                        maxAge: 1000 * 60 * 60 * 60,
                        httpOnly: true,
                    });
                    res.cookie('role', "employee", {
                        maxAge: 1000 * 60 * 60*60,
                        httpOnly: true,
                    });

                    //console.log("hello");
                    if (!empl.basicProfileCompleted) {
                        // req.email = email_phone
                        // res.redirect("/employee/basic_profile_form");
                        console.log("plo");
                        res.render("employee/new_profile_details", {
                            changeUrl: true,
                            url: "http://localhost:3000/employee/basic_profile_form"
                        })
                    } else {
                        
                       console.log(empl);
                    //    let newOrder=null,completedOrders=null;
                    //    if(empl.allotedOrder){

                    //    }
                    //    if(completedOrders.length){

                    //    }
                        res.render("employee_dash",{newOrder:null,completedOrders:null})
                    }
                } else if (cust) {
                    const isMatch = await bcrypt.compare(password, cust.password)
                    if (!isMatch) return res.status(400).json({ msg: "Password is incorrect." })
                    const { accessToken, refreshToken } = tokenService.generateTokens({ _id: cust._id, role: "customer" });
                    //await tokenService.storeRefreshToken(refreshToken, customer._id);
                    res.cookie('refreshToken', refreshToken, {
                        maxAge: 1000 * 60 * 60 * 5 * 60,
                        httpOnly: true,
                    });

                    res.cookie('accessToken', accessToken, {
                        maxAge: 1000 * 60 * 60 * 60,
                        httpOnly: true,
                    });
                    res.cookie('role', "customer", {
                        maxAge: 1000 * 60 * 60 * 60,
                        httpOnly: true,
                    });
                    //console.log("##############");
                    const guestToUserRedirect = req.cookies.guestToUserRedirect
                    if (guestToUserRedirect) {
                        res.clearCookie("guestToUserRedirect")
                        //cookies.set('guestToUserRedirect', {expires: Date.now()});
                        //res.cookie("guestToUserRedirect","",{maxAge: Date.now(),httpOnly:true})
                        res.redirect(guestToUserRedirect)

                    } else {
                        res.render("index",{login:true})
                    }
                } else {
                    if (!empl && !cust) return res.status(400).json({ msg: "This email does not exist." })
                }

                //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");







            } catch (err) {
                console.log(err)
                return res.status(500).json({ msg: err })
            }
        }

    }

    // async login(req, res, next) {
    //     try {
    //         const { email_phone, password } = req.body
    //         //console.log(email_phone + "!@#" + password)
    //         const empl = await Employee.findOne({ email: email_phone })
    //         const cust = await Customer.findOne({ email: email_phone })
    //         //console.log("~~" + empl + "~" + cust)
    //         if (empl && cust) {
    //             return res.status(400).json("error:both cust and empl exist")
    //         }
    //         else if (empl) {
    //             const isMatch = await bcrypt.compare(password, empl.password)
    //             if (!isMatch) return res.status(400).json({ msg: "Password is incorrect." })

    //             const { accessToken, refreshToken } = tokenService.generateTokens({ _id: empl._id, role: "employee" });
    //             //await tokenService.storeRefreshToken(refreshToken, customer._id);
    //             res.cookie('refreshToken', refreshToken, {
    //                 maxAge: 1000 * 60 * 60 * 5,
    //                 httpOnly: true,
    //             });

    //             res.cookie('accessToken', accessToken, {
    //                 maxAge: 1000 * 60 * 60,
    //                 httpOnly: true,
    //             });
    //             res.cookie('role', "employee", {
    //                 maxAge: 1000 * 60 * 60,
    //                 httpOnly: true,
    //             });
    //             if (!empl.basicProfileCompleted) {
    //                 req.email = email_phone
    //                 res.redirect("/employee/basic_profile_form");
    //             } else {
    //                 res.render("employee_dashboard")
    //             }
    //         } else if (cust) {
    //             const isMatch = await bcrypt.compare(password, cust.password)
    //             if (!isMatch) return res.status(400).json({ msg: "Password is incorrect." })
    //             const { accessToken, refreshToken } = tokenService.generateTokens({ _id: cust._id, role: "customer" });
    //             //await tokenService.storeRefreshToken(refreshToken, customer._id);
    //             res.cookie('refreshToken', refreshToken, {
    //                 maxAge: 1000 * 60 * 60 * 5,
    //                 httpOnly: true,
    //             });

    //             res.cookie('accessToken', accessToken, {
    //                 maxAge: 1000 * 60 * 60,
    //                 httpOnly: true,
    //             });
    //             res.cookie('role', "customer", {
    //                 maxAge: 1000 * 60 * 60,
    //                 httpOnly: true,
    //             });
    //             console.log((app.locals.afterRedirectUrl));
    //             res.render("home")
    //         } else {
    //             if (!empl && !cust) return res.status(400).json({ msg: "This email does not exist." })
    //         }

    //         //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");







    //     } catch (err) {
    //         //console.log(err)
    //         return res.status(500).json({ msg: err })
    //     }
    // }


    // // Token
    // // access_token = JwtService.sign({ _id: result._id, role: result.role });
    // // refresh_token = JwtService.sign({ _id: result._id, role: result.role }, '1y', REFRESH_SECRET);
    // // database whitelist
    // //await RefreshToken.create({ token: refresh_token });
    // const { accessToken, refreshToken } = tokenService.generateTokens({ _id: customer._id, activated: false });

    async sendNewActivateLink(req, res, next) {
        const email = req.query.email;
        if (!email) {
            return res.render("account_activation_status", { message: 'All fields are required!' });
        }
        try {
            const customerExist = await Customer.exists({ email: email, isActive: false });
            if (!customerExist) {
                return res.render("account_activation_status", { "message": "some error" })
            }
        } catch (err) {
            console.log(err);
            return res.render("account_activation_status", { message: 'Db error' });
        }
        const vfCode = emailService.getVfCode(email)

        try {
            const filter = { email: email, isActive: false };
            const update = { vfCode: vfCode };
            let doc = await Customer.findOneAndUpdate(filter, update, {
                new: true
            });

            //generate vf code

            //email sending
            const emailText = emailService.getEmailText(email, vfCode, "customer")
            req.emailText = emailText
            //const mailResult = await emailService.sendMail(emailText)
            console.log("new link" + emailText)

            //const customerDto = new CustomerDto(customer);
            return res.json({ auth: true });
        } catch (err) {
            return next(err);
        }






    }

    async activateAccount(req, res, next) {
        const email = req.query.email;
        const vfCode = req.query.vf_code;
        console.log(email + " - " + vfCode)

        if (!email || !vfCode) {
            return res.render("account_activation_status", { message: 'All fields are required!' });
        }

        const startTime = +vfCode.split("~")[1]
        console.log(startTime)
        if (Date.now() - startTime > 10000) {

            return res.render("account_activation_status", { message: "expired", request: req })
        }
        try {
            const customerExist = await Customer.exists({ email: email, isActive: false, vfCode: vfCode });
            if (!customerExist) {
                return res.render("account_activation_status", { "message": "some error" })
            }
        } catch (err) {
            console.log(err);
            return res.render("account_activation_status", { message: 'Db error' });
        }







        try {
            const filter = { email: email, isActive: false, vfCode: vfCode };
            const update = { isActive: true };
            let doc = await Customer.findOneAndUpdate(filter, update, {
                new: true
            });
            console.log(__dirname)
            fs.mkdir(`public/${email}`, (err) => {
                console.log(err)
            })
            return res.render("account_activation_status", { "message": "user activated", "role": "customer" })
        } catch (err) {
            console.log(err)
            return res.render("account_activation_status", { "message": "db error" })
        }
    }

    async register(req, res, next) {

        const email = req.body.email
        const password = req.body.password
        const repeatPassword = req.body.repeat_password
        const which_type = req.body.which_type
        if (!which_type)
            return res.status(400).json({ msg: "Please fill in all fields." })


        if (which_type === "email") {
            if (!email || !password || !repeatPassword)
                return res.status(400).json({ msg: "Please fill in all fields." })

            // Validation //joi validation done by middleware or at validation in modules
            //console.log("~~" + email + "," + password + "," + repeatPassword + "," + which_type)

            // check if user is in the database already
            // console.log(Employee)
            // console.log(CLIENT_URL)
            try {
                const existCustomer = await Customer.exists({ email: email });
                const existEmployee = await Employee.exists({ email: email });
                if (existCustomer || existEmployee) {
                    return res.status(400).json({ "message": "email already taken" });
                }
            } catch (err) {
                console.log(err)
                return res.status(400).json({ "message": "some error" });
            }



            // Hash password will be done in pre
            const hashedPassword = await bcrypt.hash(password, 10); //will be done in pre

            // prepare the model


            const activationToken = emailService.getActivationToken({ email })


            const url = `${CLIENT_URL}/customer/activate_account?vf_code=${activationToken}&email=${email}&user_type=customer`
            // console.log(url)
            const resetPasswordToken = crypto.randomBytes(64).toString("hex") + "~" + email;
            console.log("#############")
            console.log("BIG" + resetPasswordToken + "~~")
            console.log("#############")

            const cust = new Customer({

                email,
                password: hashedPassword,
                vfCode: activationToken,
                resetPasswordToken: resetPasswordToken,
                loginMethod:"EMAIL"
            });



            try {
                const result = await cust.save();
                //console.log(result);
                //generate vf code

                //email sending
                const emailText = emailService.getEmailText(url)
                req.emailText = emailText
                //const mailResult = await emailService.sendMail(emailText)
                //console.log(mailResult)

                const custDto = new CustomerDto(Employee);
                return res.json({ user: custDto, auth: true });
            } catch (err) {
                return next(err);
            }

            //res.json({ access_token, refresh_token });
        }


        /*
    if (req.body.which_type === "email") {
 
        // Validation //joi validation done by middleware or at validation in modules
        const { email, password } = req.body
 
        if (!email || !password)
            return res.status(400).json({ msg: "Please fill in all fields." })
        // check if user is in the database already
        try {
            const exist = await Customer.exists({ email: req.body.email });
            if (exist) {
                return res.json({ "message": "email already taken" });
            }
        } catch (err) {
            return res.json({ "message": "some error" });
        }
 
 
 
        // Hash password will be done in pre
        const hashedPassword = await bcrypt.hash(password, 10); //will be done in pre
 
        // prepare the model
 
 
        const vfCode = emailService.getVfCode(email)
        const customer = new Customer({
 
            email,
            password: hashedPassword,
            vfCode: vfCode
        });
 
 
 
        try {
            const result = await customer.save();
            console.log(result);
            //generate vf code
 
            //email sending
            const emailText = emailService.getEmailText(email, vfCode, "customer")
            req.emailText = emailText
            const mailResult = await emailService.sendMail(emailText)
            console.log(mailResult)
 
            const customerDto = new CustomerDto(customer);
            return res.json({ user: customerDto, auth: true });
        } catch (err) {
            return next(err);
        }
 
        //res.json({ access_token, refresh_token });
    } 
    */

        else if (req.body.which_type === "phone") {
            //Joi  Validation
            console.log("phone ")
            const phone = req.body.phone


            if (!phone || !password || !repeatPassword)
                return res.status(400).json({ msg: "Please fill in all fields." })





            //##########################################################################################

            try {
                const customer = await Customer.findOne({ authPhone: phone });
                const employee = await Employee.findOne({ authPhone: phone });
                if ((customer && customer.isActive) || (employee && employee.isActive) || employee) {
                    return res.status(400).json({ "message": "phone already taken" });
                }

                if (customer && customer.isActive === false) {

                    const result = await customer.deleteOne()
                }

            } catch (err) {
                console.log(err)
                return res.status(400).json({ "message": "some error" });
            }

            //##############################################################################################



            // check if user is in the database already
            // try {
            //     const exist = await Customer.exists({ phone: req.body.phone, isActive: false });
            //     if (exist) {
            //         return res.json({ "message": "phone already taken" });
            //     }
            // } catch (err) {
            //     return res.json({ "message": "some900900 error" });
            // }



            const otp = await otpService.generateOtp();
            console.log(otp);
            const ttl = 1000 * 60 * 10; // 10 min
            const expires = Date.now() + ttl;
            const data = `${phone}.${otp}.${expires}.customer`;
            const hash = hashService.hashOtp(data);

            // send OTP
            // try {
            //     // await otpService.sendBySms(phone, otp);
            //     return res.json({
            //         hash: `${hash}.${expires}`,
            //         phone,
            //         otp,
            //     });
            // } catch (err) {
            //     console.log(err);
            //     res.status(500).json({ message: 'message sending failed' });
            // }

            //#############################################################################################
            const hashedPassword = await bcrypt.hash(password, 10);
            const resetPasswordToken = crypto.randomBytes(64).toString("hex") + "~" + phone;
            const cust = new Customer({

                phone: phone,
                password: hashedPassword,

                resetPasswordToken: resetPasswordToken,
                loginMethod:"PHONE"
            });



            try {
                const result = await cust.save();
                //console.log(result);
                //generate vf code
                //console.log(result);

                //otp sending
                if (result) {
                    //otp sending
                }

                //const custDto = new CustomerDto(Employee);


                res.cookie('hash', `${hash}.${expires}.customer`, {
                    maxAge: 1000 * 60 * 60 * 60,
                    httpOnly: true,
                });

                res.cookie('phone', phone, {
                    maxAge: 1000 * 60 * 60 * 60,
                    httpOnly: true,
                });
                //req.app.locals.otpSending=true

                res.cookie('last4', phone.slice(-4), {
                    maxAge: 1000 * 60 * 60 * 60,
                    httpOnly: true,
                });
                return res.redirect("/verify_otp")

            } catch (err) {
                return next(err);
            }

            //######################################################################################

            // Hash password
            //const hashedPassword = await bcrypt.hash(password, 10); //will be done in pre

            // prepare the model

            // const customer = new Customer({

            //     phone,
            //     password: hashedPassword
            // });


            // try {
            //     const result = await customer.save();
            //     console.log(result);

            //     // // Token
            //     // // access_token = JwtService.sign({ _id: result._id, role: result.role });
            //     // // refresh_token = JwtService.sign({ _id: result._id, role: result.role }, '1y', REFRESH_SECRET);
            //     // // database whitelist
            //     // //await RefreshToken.create({ token: refresh_token });
            //     // const { accessToken, refreshToken } = tokenService.generateTokens({ _id: customer._id, activated: false });
            //     // await tokenService.storeRefreshToken(refreshToken, customer._id);
            //     // res.cookie('refreshToken', refreshToken, {
            //     //     maxAge: 1000 * 60 * 60 * 24 * 30,
            //     //     httpOnly: true,
            //     // });

            //     // res.cookie('accessToken', accessToken, {
            //     //     maxAge: 1000 * 60 * 60 * 24 * 30,
            //     //     httpOnly: true,
            //     // });
            //     const customerDto = new CustomerDto(customer);
            //     res.json({ user: customerDto, auth: true });
            // } catch (err) {
            // return next(err);
        }
    }
}




module.exports = new AuthController();
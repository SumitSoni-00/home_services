const joi = require('joi');
const Employee = require("../modules/models/Employee")
const RefreshToken = require("../modules/models/RefreshToken")
const bcrypt = require('bcrypt');
const EmployeeDto = require("../dtos/Employee-dto")
const tokenService = require('../modules/services/token-service');
//import EmployeerorHandler from '../../services/EmployeerorHandler';
const emailService = require("../utils/email-service")
const express=require("express")
const app=express()
class EmployeeAuthController {

    // async sendNewActivateLink(req,res,next){
    //     const email = req.query.email;
    //     if (!email) {
    //         return res.render("account_activation_status",{ message: 'All fields are required!' });
    //     }
    //     try {
    //         const EmployeeExist = await Employee.exists({ email: email, isActive: false });
    //         if (!EmployeeExist) {
    //             return res.render("account_activation_status",{ "message": "some error" })
    //         }
    //     } catch (err) {
    //         console.log(err);
    //         return res.render("account_activation_status",{ message: 'Db error' });
    //     }
    //     const vfCode = emailService.getVfCode(email)

    //     try {
    //         const filter = { email: email, isActive: false};
    //         const update = {  vfCode: vfCode  };
    //         let doc = await Employee.findOneAndUpdate(filter, update, {
    //             new: true
    //         });
            
    //         //generate vf code
            
    //         //email sending
    //         const emailText = emailService.getEmailText(email, vfCode, "Employee")
    //         req.emailText = emailText
    //         //const mailResult = await emailService.sendMail(emailText)
    //         console.log("new link"+ emailText)

    //         //const EmployeeDto = new EmployeeDto(Employee);
    //         return res.json({  auth: true });
    //     } catch (err) {
    //         return next(err);
    //     }






    // }

    // async activateAccount(req, res, next) {
    //     const email = req.query.email;
    //     const vfCode = req.query.vf_code;
    //     console.log(email +" - "+ vfCode)
        
    //     if (!email || !vfCode) {
    //         return res.render("account_activation_status",{ message: 'All fields are required!' });
    //     }

    //     const startTime = +vfCode.split("~")[1]
    //     console.log(startTime)
    //     if (Date.now() - startTime > 10000) {
           
    //         return res.render("account_activation_status",{message:"expired",request:req})
    //     }
    //     try {
    //         const EmployeeExist = await Employee.exists({ email: email, isActive: false, vfCode: vfCode });
    //         if (!EmployeeExist) {
    //             return res.render("account_activation_status",{ "message": "some error" })
    //         }
    //     } catch (err) {
    //         console.log(err);
    //         return res.render("account_activation_status",{ message: 'Db error' });
    //     }







    //     try {
    //         const filter = { email: email, isActive: false, vfCode: vfCode };
    //         const update = { isActive: true };
    //         let doc = await Employee.findOneAndUpdate(filter, update, {
    //             new: true
    //         });
    //         return res.render("account_activation_status",{ "message": "user activated" })
    //     } catch (err) {
    //         console.log(err)
    //         return res.render("account_activation_status",{ "message": "db error" })
    //     }
    // }

    async register(req, res, next) {
        // CHECKLIST
        // [ ] validate the request
        // [ ] authorise the request
        // [ ] check if user is in the database already
        // [ ] prepare model
        // [ ] store in database
        // [ ] generate jwt token
        // [ ] send response
        if (req.body.which_type === "email") {

            // Validation //joi validation done by middleware or at validation in modules

            // check if user is in the database already
            try {
                const exist = await Employee.exists({ email: req.body.email });
                if (exist) {
                    return res.json({ "message": "email already taken" });
                }
            } catch (err) {
                console.log(err)
                return res.json({ "message": "some error" });
            }

            const { email, password } = req.body;

            // Hash password will be done in pre
            const hashedPassword = await bcrypt.hash(password, 10); //will be done in pre

            // prepare the model


            const vfCode = emailService.getVfCode(email)
            const Employee = new Employee({

                email,
                password: hashedPassword,
                vfCode: vfCode
            });



            try {
                const result = await Employee.save();
                console.log(result);
                //generate vf code
                
                //email sending
                const emailText = emailService.getEmailText(email, vfCode, "Employee")
                req.emailText = emailText
                const mailResult = await emailService.sendMail(emailText)
                console.log(mailResult)

                const EmployeeDto = new EmployeeDto(Employee);
                return res.json({ user: EmployeeDto, auth: true });
            } catch (err) {
                return next(err);
            }

            //res.json({ access_token, refresh_token });
        } else if (req.body.which_type === "phone") {
            //Joi  Validation
            const { phone } = req.body;
            if (!phone) {
                return res.status(400).json({ message: 'Phone field is required!' });
            }

            // check if user is in the database already
            try {
                const exist = await Employee.exists({ phone: req.body.phone, isActive: false });
                if (exist) {
                    return res.json({ "message": "phone already taken" });
                }
            } catch (err) {
                return res.json({ "message": "some error" });
            }



            const otp = await otpService.generateOtp();

            const ttl = 1000 * 60 * 2; // 2 min
            const expires = Date.now() + ttl;
            const data = `${phone}.${otp}.${expires}`;
            const hash = hashService.hashOtp(data);

            // send OTP
            try {
                // await otpService.sendBySms(phone, otp);
                res.json({
                    hash: `${hash}.${expires}`,
                    phone,
                    otp,
                });
            } catch (err) {
                console.log(err);
                res.status(500).json({ message: 'message sending failed' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10); //will be done in pre

            // prepare the model

            const Employee = new Employee({

                phone,
                password: hashedPassword
            });


            try {
                const result = await Employee.save();
                console.log(result);

                // // Token
                // // access_token = JwtService.sign({ _id: result._id, role: result.role });
                // // refresh_token = JwtService.sign({ _id: result._id, role: result.role }, '1y', REFRESH_SECRET);
                // // database whitelist
                // //await RefreshToken.create({ token: refresh_token });
                // const { accessToken, refreshToken } = tokenService.generateTokens({ _id: Employee._id, activated: false });
                // await tokenService.storeRefreshToken(refreshToken, Employee._id);
                // res.cookie('refreshToken', refreshToken, {
                //     maxAge: 1000 * 60 * 60 * 24 * 30,
                //     httpOnly: true,
                // });

                // res.cookie('accessToken', accessToken, {
                //     maxAge: 1000 * 60 * 60 * 24 * 30,
                //     httpOnly: true,
                // });
                const EmployeeDto = new EmployeeDto(Employee);
                res.json({ user: EmployeeDto, auth: true });
            } catch (err) {
                return next(err);
            }
        }
    }

}


module.exports = new EmployeeAuthController();
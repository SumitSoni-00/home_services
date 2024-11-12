
const bcrypt = require('bcrypt');
const { CLIENT_URL } = process.env
//import EmployeerorHandler from '../../services/EmployeerorHandler';
const emailService = require("../utils/email-service")
const express = require("express")
const app = express()
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const Employee = require("../modules/models/Employee")
const EmployeeDto = require("../dtos/Employee-dto")
const tokenService = require("../modules/services/token-service")
const Customer = require("../modules/models/Customer")
const fs = require("fs")
const path = require("path")
const otpService = require("../modules/services/otp-service")
const hashService = require("../modules/services/hash-service")
class EmployeeAuthController {
    async register(req, res, next) {

        //const email = req.body.email
        const password = req.body.password
        const repeatPassword = req.body.repeat_password
        const which_type = req.body.which_type
        if (!which_type)
            return res.status(400).json({ msg: "Please fill in all fields." })


        if (which_type === "email") {

            // Validation //joi validation done by middleware or at validation in modules
            //console.log("~~" + email + "," + password + "," + repeatPassword + "," + which_type)

            // check if user is in the database already
            //console.log(Employee)
            // console.log(CLIENT_URL)
            const email = req.body.email


            //########################################################################################
            try {
                const customer = await Customer.findOne({ email: email });
                const employee = await Employee.findOne({ email: email });
                if ((customer && customer.isActive) || (employee && employee.isActive) || customer) {
                    return res.status(400).json({ "message": "email already taken" });
                }

                if (employee && employee.isActive === false) {

                    const result = await employee.deleteOne()
                }

            } catch (err) {
                console.log(err)
                return res.status(400).json({ "message": "some error" });
            }

            //####################################################################################
            // try {
            //     const existCustomer = await Customer.exists({ email: email });
            //     const existEmployee = await Employee.exists({ email: email });
            //     if (existCustomer || existEmployee) {
            //         return res.status(400).json({ "message": "email already taken" });
            //     }
            // } catch (err) {
            //     console.log(err)
            //     return res.status(400).json({ "message": "some error" });
            // }



            // Hash password will be done in pre
            const hashedPassword = await bcrypt.hash(password, 10); //will be done in pre

            // prepare the model


            const activationToken = emailService.getActivationToken({ email })


            const url = `${CLIENT_URL}/employee/activate_account?vf_code=${activationToken}&email=${email}&user_type=employee`
            //console.log(url)
            const resetPasswordToken = crypto.randomBytes(64).toString("hex") + "~" + email;
            //console.log(resetPasswordToken + "~~")
            const empl = new Employee({

                email,
                password: hashedPassword,
                vfCode: activationToken,
                resetPasswordToken: resetPasswordToken,
                loginMethod:"EMAIL"
            });



            try {
                const result = await empl.save();
                //console.log(result);
                //generate vf code

                //email sending
                const emailText = emailService.getEmailText(url)
                req.emailText = emailText
                //const mailResult = await emailService.sendMail(emailText)
                console.log(emailText)

                const emplDto = new EmployeeDto(Employee);
                return res.json({ user: emplDto, auth: true });
            } catch (err) {
                return next(err);
            }

            //res.json({ access_token, refresh_token });
        } else if (req.body.which_type === "phone") {
            //Joi  Validation


            console.log("phone ")
            const phone = req.body.phone


            if (!phone || !password || !repeatPassword)
                return res.status(400).json({ msg: "Please fill in all fields." })




            //##########################################################################################

            try {
                const customer = await Customer.findOne({ phone: phone });
                const employee = await Employee.findOne({ phone: phone });
                if ((customer && customer.isActive) || (employee && employee.isActive) || customer) {
                    return res.status(400).json({ "message": "phone already taken" });
                }

                if (employee && employee.isActive === false) {

                    const result = await employee.deleteOne()
                }

            } catch (err) {
                console.log(err)
                return res.status(400).json({ "message": "some error" });
            }

            //##############################################################################################

            const otp = await otpService.generateOtp();
            console.log(otp);
            const ttl = 1000 * 60 * 10; // 10 min
            const expires = Date.now() + ttl;
            const data = `${phone}.${otp}.${expires}.employee`;
            const hash = hashService.hashOtp(data);



            const hashedPassword = await bcrypt.hash(password, 10);
            const resetPasswordToken = crypto.randomBytes(64).toString("hex") + "~" + phone;
            const empl = new Employee({

                phone: phone,
                password: hashedPassword,

                resetPasswordToken: resetPasswordToken
            });



            try {
                const result = await empl.save();
                //console.log(result);
                //generate vf code
                //console.log(result);

                //otp sending
                if (result) {
                    //otp sending
                }

                //const custDto = new CustomerDto(Employee);


                res.cookie('hash', `${hash}.${expires}.employee`, {
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
                console.log(error);
            }


            /*
            const phone = req.body;
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
            }*/
        }
    }



    async activateAccount(req, res, next) {
        const email = req.query.email;
        const vfCode = req.query.vf_code;
        const userType = req.query.user_type;
        console.log(email + " - " + vfCode)

        if (!email || !vfCode || !userType) {
            return res.render("account_activation_status", { message: 'All fields are required!' });
        }
        const user = jwt.verify(vfCode, process.env.ACTIVATION_TOKEN_SECRET)
        console.log("vfCode_verify" + user.email)





        //return res.render("account_activation_status", { message: "expired", request: req })

        try {
            const employeeExist = await Employee.exists({ email: email, isActive: false, vfCode: vfCode });
            if (!employeeExist) {
                return res.render("account_activation_status", { "message": "some error" })
            }
        } catch (err) {
            console.log(err);
            return res.render("account_activation_status", { message: 'Db error' });
        }







        try {
            const filter = { email: email, isActive: false, vfCode: vfCode };
            const update = { isActive: true };
            let doc = await Employee.findOneAndUpdate(filter, update, {
                new: true
            });
            const picPath = path.join(__dirname, `../../public/uploads/employees/${email}/profile_pics`)
            fs.mkdir(picPath, { recursive: true }, (err) => {
                console.log(err)
            })
            return res.render("account_activation_status", { "message": "user activated" })
        } catch (err) {
            console.log(err)
            return res.render("account_activation_status", { "message": "db error" })
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({ msg: "please enter email pass ." })
            }
            const user = await Employee.findOne({ email })
            if (!user) return res.status(400).json({ msg: "This email does not exist." })
            console.log(password)

            // const isMatch = await bcrypt.compare(password, user.password)
            // if (!isMatch) return res.status(400).json({ msg: "Password is incorrect." })

            // const refresh_token = createRefreshToken({ id: user._id })
            // res.cookie('refreshtoken', refresh_token, {
            //     httpOnly: true,
            //     path: '/user/refresh_token',
            //     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            // })

            // // Token

            const { accessToken, refreshToken } = tokenService.generateTokens({ user });
            //await tokenService.storeRefreshToken(refreshToken, customer._id);
            res.cookie('refreshToken', refreshToken, {
                path: '/user/refresh_token',
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
            });

            res.cookie('accessToken', accessToken, {
                path: '/user/access_token',
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
            });
            if (!user.basicProfileCompleted) {
                return res.render("new_profile_details", { email: user, profileDetails: user.profileDetails });
            }

            return res.status(200).json({
                success: true,
                user,
                message: "login success"

            });
        } catch (err) {
            console.log(err)
            return res.status(500).json({ msg: err.message })
        }
    }
}

module.exports = new EmployeeAuthController();
const express = require("express");
const authController = require("../controller/auth-controller")
const validationMiddleware = require("../middlewares/validation-middleware")
const router = express.Router();
const authorizationMiddleware = require("../middlewares/authorizationMiddleware")

// router.post("/register",validationMiddleware.validateSignup,authController.register);
// //router.post('/signup',validateSignupRequest, isRequestValidated, signup);
// router.get("/activate_account",authController.activateAccount);
const Reviews = require("../modules/models/Reviews")
router.get("/", (req, res, next) => {
    res.clearCookie("guestToUserRedirect")
    next()
}, authorizationMiddleware.ifAlreadySignin, async (req, res) => {

    //console.log("here");
    return res.render("non_authorised/index", {
        message: 'Register',
        login: false
    })
})


// router.post("/clear_cookie",(req,res)=>{
//     console.log("clear cookie");
//     res.status(200).json({
//         "hello":"lop"
//     })
// })
router.get("/view_signup", authorizationMiddleware.ifAlreadySignin, (req, res) => {
    return res.render('register', {
        title: 'Register'
    })
})
router.get("/view_login", authorizationMiddleware.ifAlreadySignin, (req, res) => {
    // return res.render('non_authorised/login', {
    //     title: 'Login'
    // })
})
module.exports = router;
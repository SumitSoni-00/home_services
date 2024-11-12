const express = require("express");
const authController = require("../controller/auth-controller");
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");
const validationMiddleware = require("../middlewares/validation-middleware")
const router = express.Router();
const customerPageController = require("../controller/customer-page-controller")
//const app=express()

const customerRouteWrapper = (app) => {
   router.post("/register", validationMiddleware.validateSignup, authController.register);
   router.post("/login",/* */authController.login(app));
   //router.post('/signup',validateSignupRequest, isRequestValidated, signup);
   router.get("/activate_account", authController.activateAccount);
   router.get("/new_activate_link", authController.sendNewActivateLink)
   router.get("/home", authorizationMiddleware.isUserAuthorised, (req, res) => {
      return res.render("index", {
         login: true
      })
   })



   router.post("/validate_otp", authController.verifyOtp, (req, res) => {
      res.send("pop")
   })


   router.get("/page", authorizationMiddleware.userBasicAuthorization, customerPageController.initProfilePage, (req, res) => {
      res.render("customer/page", {
         basicDetailsCompleted: req.basicDetailsCompleted
         , cust: req.cust,
         emailAuth:req.emailAuth,
         phoneAuth:req.phoneAuth
      })
   })
   router.post("/save_address", authorizationMiddleware.userBasicAuthorization, customerPageController.saveAddress)
   router.post("/page/update", authorizationMiddleware.customerBasicAuthorization, customerPageController.updateProfile, (req, res, next) => {
      return res.redirect("/customer/page")

      //console.log(req.body);
      // res.render("customer_page", {
      //     basicDetailsCompleted: req.basicDetailsCompleted
      //    , cust: req.cust
      // })
   })

   router.get("/page/bookings", authorizationMiddleware.userBasicAuthorization, customerPageController.initbookingsPage, (req, res) => {
      res.render("new_customer_order")
   })

   router.get("/page/addresses",authorizationMiddleware.customerBasicAuthorization,customerPageController.initManageAddresses,(req,res)=>{
      //console.log(req.cust);
     // console.log(req.cookies);
      const saveAddressFailed=req.cookies.saveAddressFailed
      //console.log(saveAddress);
      const renderObj={
         addresses:req.addresses,
         changeUrl:true,
         url:"/customer/page/addresses",
         saveAddressFailed:false
      }
      if(saveAddressFailed && saveAddressFailed==="true"){
         renderObj.saveAddressFailed=true
         res.clearCookie("saveAddressFailed")
      }
      res.render("customer/manage_addresses",renderObj)
      
   })


   router.post("/page/new_address",authorizationMiddleware.customerBasicAuthorization,customerPageController.addNewAddress,(req,res)=>{
      //console.log(req.cust);
      res.render("customer/manage_addresses",{
         addresses:req.addresses,
         
      })
      
   })



   return router
}
//router.get("/profile_details",authorizationMiddleware.verify,profileController)
module.exports = customerRouteWrapper;
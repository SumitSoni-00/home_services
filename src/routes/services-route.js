const express = require("express")
const router = express.Router();
const serviceController = require("../controller/services-controller");
const authorizationMiddleware = require("../middlewares/authorizationMiddleware");



const serviceRouterWrapper = (app) => {
   router.get("/:category", serviceController.initPage, (req, res) => {
      res.render("services/services_init_v3", {
         category: req.params.category,
         employees: req.employees
      })
   })

   const redirectLoginMiddleware = authorizationMiddleware.unauthorisedUserRedirectLogin
   router.get("/start_booking/:category", redirectLoginMiddleware(app), serviceController.initFinalBooking,(req, res) => {
      

      //console.log(req.customerDetails);
     

    
      return res.render("services/book_service_init_v2", {
         category: req.params.category,
         details:req.customerDetails
      })
   })

   router.post("/book_service/", authorizationMiddleware.userBasicAuthorization,serviceController.bookMyService, (req, res) => {
     res.redirect("/")
   })

   // router.get("/book_service/:category", authorizationMiddleware.userBasicAuthorization,serviceController.bookMyService, (req, res) => {
   //    res.redirect("/")
   //  })

   // code

   return router
}

module.exports = serviceRouterWrapper;
// router.get("/:category", serviceController.initPage,(req,res)=>{
//    res.render("services_init",{
//       category:req.params.category,
//       employees:req.employees
//    })
// })
// router.get("/start_booking/:category",authorizationMiddleware.unauthorisedUserRedirectLogin,(req,res)=>{
//    return res.render("book_service_init",{
//       category:req.params.category
//    })
// })

// router.post("/book_service/:category",authorizationMiddleware.unauthorisedUserRedirectLogin,serviceController.bookMyService,(req,res)=>{
//    res.json(req.cust)
// })


//module.exports = router
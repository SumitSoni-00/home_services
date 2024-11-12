const express = require("express")
const router = express.Router();
const employeeAuthController = require("../controller/employee-auth-controller")
const profileDetailsController = require("../controller/profile-details-controller");
const authorizationMiddleware = require("../middlewares/authorizationMiddleware")
const validationMiddleware = require("../middlewares/validation-middleware")
const multer = require("multer")
const path = require("path")
const employeeDashController=require("../controller/employee-dash-controller")
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log("~~~~~~~~~~~~~~~~")
//     console.log(req.body)
//     //console.log(req.empl)
//     console.log("~~~~~~~~~~~~~~~~")
//     const picPath = `public/uploads/employees/${req.empl.email}`
//     req.picPath = picPath
//     cb(null, picPath);
//   },
//   filename: (req, file, cb) => {
//     const f = file.originalname
//     const ext = path.extname(f)//file.mimetype.split("/")[1];
//     const picName = `${file.fieldname}-${Date.now()}${ext}`
//     console.log(req.picPath);
//     req.picPath = path.join(req.picPath, picName)
//     cb(null, picName);
//   },
// });

// const upload = multer({
//   storage: multerStorage,

// });


router.get("/test", (req, res) => {
  res.json("hello")
})
router.post("/register", authorizationMiddleware.ifAlreadySignin, validationMiddleware.validateSignup, employeeAuthController.register)
//router.post("/login", employeeAuthController.login)
router.post("/profile_details/upload_data_fetch", authorizationMiddleware.basicProfileAuthorization, profileDetailsController.uploadDataFetch)
router.get("/activate_account", employeeAuthController.activateAccount);
router.get("/basic_profile_form", authorizationMiddleware.basicProfileAuthorization, (req, res) => {
  //console.log(req.locals)
  //res.locals.email = "hello email"
  res.render("employee/new_profile_details", {
    employee: req.employee,
    changeUrl: false
  })
})
router.post("/submit_profile_details", authorizationMiddleware.basicProfileAuthorization, profileDetailsController.submitProfileDetails)
router.get("/home", authorizationMiddleware.userBasicAuthorization, (req, res) => {
  res.json("employee home ")
})

router.post("/submit_profile_details/upload_pic", authorizationMiddleware.basicProfileAuthorization, profileDetailsController.uploadProfilePic, profileDetailsController.uploadDataFetch, (req, res) => {
  console.log("upload file")
  console.log(req.files)
  console.log(req.body)
})
router.get("/settings",authorizationMiddleware.userBasicAuthorization,(req,res)=>{
  res.render("employee_profile_settings")
})

router.get("/dash_profile",authorizationMiddleware.userBasicAuthorization,employeeDashController.profilePageInit,(req,res)=>{
  //console.log(req.emplProfile);
  res.render("employee/dash_profile",{emplProfile:req.emplProfile})
})

router.get("/home_dash",authorizationMiddleware.userBasicAuthorization,employeeDashController.homeDashInit,(req,res)=>{
  //console.log(req.empl);
  res.render("employee/home_dash",req.renderObj)
})
router.post("/dash/profile_update",authorizationMiddleware.userBasicAuthorization,employeeDashController.updateProfile,(req,res)=>{
  return res.send(req.body)
})
router.post("/dash/update_pic",authorizationMiddleware.employeeBasicAuthorization,profileDetailsController.uploadProfilePic,profileDetailsController.uploadDataFetch,(req,res)=>{
  console.log(req.body);
  res.send("lkjhgfdsa")
})

module.exports = router
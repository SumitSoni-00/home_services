const express = require("express")
const router = express.Router();
const employeeAuthController = require("../controller/employee-auth-controller")

const authorizationMiddleware=require("../middlewares/authorizationMiddleware")
const validationMiddleware=require("../middlewares/validation-middleware")
const categoriesController=require("../controller/categories-controller")
router.get("*",categoriesController.getEmployees)

module.exports = router
const { CLIENT_URL } = process.env
//import EmployeerorHandler from '../../services/EmployeerorHandler';
const express = require("express")
const app = express()
const Employee = require("../modules/models/Employee")
const EmployeeDto = require("../dtos/Employee-dto")
class EmployeeAuthController {
   async getEmployees(req,res){
       const group=req.query.group
       const type=req.query.category

       const result=await Employee.find({ "profileDetails.category":type})

       console.log(group +"~~"+ type)
       res.render("services_home",{res:result})
   }



 

  
}

module.exports = new EmployeeAuthController();
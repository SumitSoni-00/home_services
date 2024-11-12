const express = require("express")
const { alotNextInit } = require("../controller/admin-controller")

const router = express.Router()
const adminController = require("../controller/admin-controller")
router.get("/", (req, res) => {
  res.send("admin dash prev")
})
router.get("/new_orders", adminController.newOrdersInit, (req, res) => {
  res.render("new_orders_admin_dash")
})

router.post("/new_order_filter", adminController.filterNewOrders, (req, res) => {
  //console.log(req.body);
  return res.json("hello")
})
router.post("/alot_next", adminController.alotNextInit, (req, res) => {

  res.render("alot_next_page", {
    employees: req.employees,
    orderId: req.body.orderId,
    fullName: req.body.full_name,
    pinCode: req.body.pinCode,
    email: req.body.email,
    allotmentDate: req.body.allotment_date,
    city: req.body.city,
    state: req.body.state,
    category: req.body.category




  })
})

router.get("/filtered_employees", (req, res, next) => {
  //console.log(req.query);

})
router.get("/alloted_order_preview",(req,res)=>{
  res.render("admin/final_booking_preview")
})

router.get("/submit_order", adminController.alotOrder, (req, res) => {
  res.send(req.query)
})

module.exports = router
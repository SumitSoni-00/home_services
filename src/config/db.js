const mongoose = require('mongoose')

const EmployeeProfileMeta=require("../modules/models/EmployeeProfileMeta")

const State = require("../modules/models/State")
const City = require("../modules/models/City")
async function fetchStates(app) {

  try {

    const states = await State.find().populate("cities")
    const cities = await City.find()
    //console.log("2222222222222222222")
    app.locals.states = states
    app.locals.cities = cities

  } catch (error) {
    console.log(error)

  }




}



async function fetchEmployeeProfileMetaData(app) {

  try {

    const employeeMeta = await EmployeeProfileMeta.find()
    
    const serviceCategories=employeeMeta[0].serviceCategories
    const serviceSubCategories=employeeMeta[0].serviceSubCategories
   
    app.locals.serviceCategories=serviceCategories
    app.locals.serviceSubCategories=serviceSubCategories
  } catch (error) {
    console.log(error)

  }




}
const connectDB = async (app) => {
  try {
    console.log(process.env.MONGO_URI)
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,

    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
    // const mt = new Meta({
      
    //   serviceCategories: ["Electricity", "Plumbering", "Pest Control", "Furniture", "Painters", "Cleaning", "Gardening"]
    //   ,
    //   serviceSubCategories:["false ceilings","elevation","modular kitchen","wallpaper","chimney"]
    // })
    // await mt.save()
    await fetchEmployeeProfileMetaData(app)

    await fetchStates(app)

  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

module.exports = connectDB

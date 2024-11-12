const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
//const morgan = require('morgan')
//const methodOverride = require('method-override')
const connectDB = require("./src/config/db")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser");
const validationMiddleware = require("./src/middlewares/validation-middleware")
const authorizationMiddleware =require("./src/middlewares/authorizationMiddleware")

//###########################################################################################

const app = express()
app.use(cookieParser());
// Load config
dotenv.config()

// Static folder
app.use(express.static(path.join(__dirname, 'public')))


const ejs = require("ejs");
const authController = require('./src/controller/auth-controller')
const templates_path = path.join(__dirname, "/templates/views")
//console.log(templates_path)

app.set("view engine", "ejs");
app.set("views", templates_path);




connectDB(app)

//console.log(test);
//mongoose.set('debug', true);
//console.log(app.locals.states)
// Body parser

// support parsing of application/json type post data
//app.use(bodyParser.json()); depricated
app.use(express.json());
//support parsing of application/x-www-form-urlencoded post data
//app.use(bodyParser.urlencoded({ extended: true }));depricated
app.use(express.urlencoded({ extended: true }));
// Method override
// app.use(
//   methodOverride(function (req, res) {
//     if (req.body && typeof req.body === 'object' && '_method' in req.body) {
//       // look in urlencoded POST bodies and delete it
//       let method = req.body._method
//       delete req.body._method
//       return method
//     }
//   })
// )

// Logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'))
// }

// Handlebars Helpers
// const {
//   formatDate,
//   stripTags,
//   truncate,
//   editIcon,
//   select,
// } = require('./helpers/hbs')

// Handlebars
// app.engine(
//   '.hbs',
//   exphbs({
//     helpers: {
//       formatDate,
//       stripTags,
//       truncate,
//       editIcon,
//       select,
//     },
//     defaultLayout: 'main',
//     extname: '.hbs',
//   })
// )

// Sessions

// Passport middleware


// Set global var
// app.use(function (req, res, next) {
//   res.locals.user = req.user || null
//   next()
// })


// const { requireSignin, userMiddleware } = require("./middleware/auth");
// // Routes
// const indexRoutes=require("./routes/index")
//#########################################################################
app.post("/clear_cookie", (req, res) => {
  //console.log("clear cookie");
  res.clearCookie("guestToUserRedirect")
  return res.status(200).json("")
})

//#####################################################################
const passport = require('passport')

require("./src/config/passport")(passport)
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))

// @desc    Google auth callback
// @route   GET /auth/google/callback
app.get(
  '/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/google/failed' }),
  (req, res) => {
    res.send('you logged in ')
  }
)
app.get("/google/failed", (req, res) => {
  res.send("google failed")
})
// @desc    Logout user
// @route   /auth/logout
app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

// app.use((req,res,next)=>{
//   res.render("index",{
//     login:false
//   });
// })
app.post("/cities_for_state", (req, res) => {
  //console.log(req.body.state)
  const cities = app.locals.states.filter((state) => { return state.name === req.body.state })[0].cities
  // const newCities= cities.map((city)=>{
  //   return city.name
  // })
  //console.log(cities);
  return res.json(cities)
})
app.get("/public/*", (req, res) => {
  res.send("public")
})

app.get("/images/*", (req, res) => {
  res.send("images")
})
app.get("/", require("./src/routes/index-route"))
const serviceRouterWrapper = require("./src/routes/services-route")
app.use("/services", serviceRouterWrapper(app))
app.get("/view_signup", authorizationMiddleware.ifAlreadySignin, (req, res) => {
  return res.render('non_authorised/new_signup', {
    title: 'Register'
  })
})
// app.get("/profile_details",(req,res)=>{
//   res.render("profile_details",{"email":req.email})
// })
app.get("/view_login",authorizationMiddleware.ifAlreadySignin, (req, res) => {
  //console.log(app.locals.test);
  let message = null
  if (req.cookies.activated === "true") {
    message = "account_activated"
    res.clearCookie("activated")
  }

  return res.render('non_authorised/new_login', {
    title: 'Login',
    message: message
  })
})


app.get("/verify_otp", (req, res) => {
  //console.log(req.app.locals);
  if (req.cookies.hash) {//actually verified hash
    res.render("verify_otp", { last4: req.cookies.last4 })
  } else {
    res.send("not found")
  }

})



app.get("/book_service/:serviceCategory", authorizationMiddleware.userBasicAuthorization, (req, res) => {
  res.send(req.params.serviceCategory)
})

app.get("/login", validationMiddleware.validateSignup, (req, res) => {
  res.render("login")
})

app.post("/forgot_password", authorizationMiddleware.ifAlreadySignin, authController.forgotPasswordSendMail)
//################################################################################################
const multer = require("multer")
const { nextTick } = require('process')
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const f = file.originalname
    const ext = path.extname(f)//file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const upload = multer({
  storage: multerStorage,

});

app.post("/upload_pic", authorizationMiddleware.userBasicAuthorization, upload.single("myImage"), (req, res) => {
  console.log("upload file")
  console.log(req.files)
  console.log(req.body)
})
//#########################################################################################
app.get("/view_forgot_password", authorizationMiddleware.ifAlreadySignin, (req, res) => {
  res.render("new_forgot_password_page", { message: "change_password" })
})
//app.post("/login",/*validationMiddleware.ifAlreadySignin,*/ authController.signin)
//app.use('/',)
//app.use('/auth', require('./routes/auth'))
//app.use('/stories', require('./routes/stories'))
const customerRouteWrapper = require('./src/routes/customer-route')
app.use('/customer', customerRouteWrapper(app))

//  app.use('/dealer', require('./routes/dealer/dealer'))
app.use('/employee', require('./src/routes/employee-route'))
app.use("/services_categories", require("./src/routes/services-categories-route"))
app.use("/admin",require("./src/routes/admin-route"))
app.get("/reset_password", authController.verifyResetPasswordMail)
app.get("/http_test",(req,res)=>{
  return res.send("got it")
})
app.post("/forgot/update_password", authController.updateNewPassword)
const PORT = process.env.PORT || 3000
//console.log(process.env.PORT)
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)


// mongoose.on("connected",()=>{
//   console.log("connected event")
// })
// mongoose.
// process.on("SIGINT",()=>{
//   console.log("exit")
//   mongoose.disconnect()
//   process.exit(0)
// })
//console.log("done")
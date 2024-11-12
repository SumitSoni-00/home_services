const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const profileDetailsSchema = require("./ProfileDetail")
const Schema = mongoose.Schema
const EmployeeSchema = mongoose.Schema({
  name: {
    type: String,
    //required: [false, 'Name is required'],
    minlength: [2, 'Name can\'t be smaller than 2 characters'],
    maxlength: [64, 'Name can\'t be greater than 64 characters']
  },
  firstName: {
    type: String,
    default: null,

  },

  lastName: {
    type: String,
    default: null,

  },
  email: {
    type: String,
    lowercase: true,
    // required: [true, 'Email is required'],
    // maxlength: [128, 'Email can\'t be greater than 128 characters'],
    // index: true,
    unique: true
  },
  allotedOrder: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
    default: null
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  vfCode: {
    type: String
  },
  phone: {
    type: String,
    default: ""
  },
  aadharNo: {
    type: String,
    default: null,

  },
  rating: {
    type: Number,
    default: 0
  },
  basicProfileCompleted: {
    type: Boolean,
    default: false
  },
  profileDetails: {
    type: profileDetailsSchema, default: () => ({})
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Reviews"
  }],
  completedOrders: [{
    type: Schema.Types.ObjectId,
    ref: "Booking"
  }],
  resetPasswordToken: {
    type: String
  },
  loginMethod: {
    type: String,

    enum: {
      values: ["EMAIL", "PHONE"],
      message: "bad method"
    },
    required:true
  }
}, {
  timestamps: true
})

/**
 * Validates unique email
 */
//  EmployeeSchema.path('email').validate(async (email) => {
//   const emailCount = await mongoose.models.Employee.countDocuments({ email })
//   return !emailCount
// }, 'Email already  exists')

/**
 * Encrypts password if value is changed
 */
//  EmployeeSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) next()
//   this.password = await bcrypt.hash(this.password, 10)
//   return next()
// })

EmployeeSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.password)
  return result
}

const Employee = mongoose.model('Employee', EmployeeSchema)

module.exports = Employee
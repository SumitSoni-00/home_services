const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema
const customerSchema = mongoose.Schema({
  name: {
    type: String,
    //required: [false, 'Name is required'],
    minlength: [2, 'Name can\'t be smaller than 2 characters'],
    maxlength: [64, 'Name can\'t be greater than 64 characters']
  },
  googleId: {
    type: String,

  },
  displayName: {
    type: String,

  },
  firstName: {
    type: String,
    default: ""

  },
  lastName: {
    type: String,
    default: ""

  },
  image: {
    type: String,
  },
  contactPhone: {
    type: String,
    default: null
  },
  alternatePhone: {
    type: String,
    default: null
  },
  email: {
    type: String,
    // lowercase: true,
    // required: [true, 'Email is required'],
    // maxlength: [128, 'Email can\'t be greater than 128 characters'],
    // index: true
  },
  authPhone: {
    type: String,
    default: null
  },
  city: {
    type: String,
    lowercase: true,
    default: ""
  },
  state: {
    type: String,
    lowercase: true,
    default: ""
  },
  address: {
    type: String,
    lowercase: true,
    default: ""
  },
  loginMethod: {
    type: String,

    enum: {
      values: ["EMAIL", "PHONE"],
      message: "bad method"
    },
    required: true
  },
  addresses: {
    type: [
      {
        address: {
          type: String,
          default: null,
          required: true
        },
        city: {
          type: String,
          default: null,
          required: true
        },
        state: {
          type: String,
          default: null,
          required: true
        },
        pinCode: {
          type: String,
          default: null,
          required: true
        },
        fullName: {
          type: String,
          default: null,
          required: true
        },
        alternatePhone: {
          type: String,
          default: null
        },
        contactPhone: {
          type: String,
          default: null,
          required: true
        },
        locality: {
          type: String,
          default: null,
          required: true
        }
      }
    ], default: () => ([]),
    validate: [addressesLimit, '{PATH} exceeds the limit of 4']
  },
  pincode: {
    type: String,
    default: ""
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
  resetPasswordToken: {
    type: String
  },
  feedback: [{
    type: Schema.Types.ObjectId,
    ref: "Reviews"
  }],
  bookings: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    }
  ],
}, {
  timestamps: true
})

function addressesLimit(val) {
  console.log(val.length);
  return val.length <= 4;
}
/**
 * Validates unique email
 */
// customerSchema.path('email').validate(async (email) => {
//   const emailCount = await mongoose.models.Customer.countDocuments({ email })
//   return !emailCount
// }, 'Email already  exists')

/**
 * Encrypts password if value is changed
 */
//  customerSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) next()
//   this.password = await bcrypt.hash(this.password, 10)
//   return next()
// })

customerSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.password)
  return result
}

const Customer = mongoose.model('Customer', customerSchema)

module.exports = Customer
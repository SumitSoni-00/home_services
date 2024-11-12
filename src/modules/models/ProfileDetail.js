const mongoose = require('mongoose')


const profileDetailsSchema = mongoose.Schema({
  firstName:{
    type:String
  },
  lastName:{
    type:String
  },
  serviceCategory: {
    type: String,
    default:null
    
    
  },
  serviceSubCategory:[ {
    type: String,default:null
    
  }],
  skills:{
      type:[String]
  },
  serviceRate:{
    type:String,default:null
  },
  title:{
    type:String,default:null
  },
  extraDetails:{
    type:String,default:null
  },
  profilePhoto:{
    type:String,default:null
  },
  city:{
    type:String,default:null
  },
  state:{
    type:String,default:null
  },
  address:{
    type:String,default:null
  },
  pincode:{
    type:String,default:null
  },
  phone:{
    type:String,default:null
  },
  aadharNo:{
    type:String,default:null
  }
  
}, {
  timestamps: true
})





//const ProfileDetail = mongoose.model('ProfileDetail', profileDetailsSchema)

module.exports = profileDetailsSchema
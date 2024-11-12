const mongoose = require('mongoose')
const Schema = mongoose.Schema

const employeeProfileMetaSchema = new Schema({
    id:{
        type:Number
    },
    serviceCategories: [{
        type: String
    }],
    serviceSubCategories: [{
        type: String
    }],
    skills: [
        {
            type: String
        }
    ],



}, {
    timestamps: true
});



const EmployeeProfileMeta = mongoose.model('EmployeeProfileMeta', employeeProfileMetaSchema)

module.exports = EmployeeProfileMeta


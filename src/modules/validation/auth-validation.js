const joi = require('joi');
class AuthValidation {
  registerEmailSchema = joi.object({


    password: joi.string()
      .required(),
    which_type:joi.string(),

    repeat_password: joi.ref('password'),

    email: joi.string()
      .trim()
      .lowercase()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } })
  })
    .with('password', 'repeat_password');



  registerPhoneSchema = joi.object({


    password: joi.string()
      .required(),

    repeat_password: joi.ref('password'),

    phone: joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).required()
  })
    .with('password', 'repeat_password')
}
module.exports = new AuthValidation();
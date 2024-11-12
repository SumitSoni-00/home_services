const authValidation = require("../modules/validation/auth-validation")
class ValidationMiddleware {
    validateSignup(req, res, next) {
        next();
        // if (req.body.which_type === "email") {
        //     try {
        //         const validationResult = authValidation.registerEmailSchema.validate(req.body, { abortEarly: false })
        //         console.log("validation done passed")

        //         if (validationResult.error) {
        //             return res.status(400).json({"message":"validation failed"})
        //             // return res.render('register', {
        //             //     message: {
        //             //         type: 'error',
        //             //         body: 'Validation Errors'
        //             //     },
        //             //     errors: joiErrorFormatter(validationResult.error),
        //             //     formData: req.body
        //             // })
        //         }
        //     } catch (e) {
        //         console.error(e)
        //         return res.status(400).json({"message":"internal db error"})
        //         // render('register', {
        //         //     message: {
        //         //         type: 'error',
        //         //         body: 'Validation Errors'
        //         //     },
        //         //     errors: mongooseErrorFormatter(e),
        //         //     formData: req.body
        //         // })
        //     }
        //     next();
        // }
    }
}
module.exports=new ValidationMiddleware();
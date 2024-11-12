// include nodemailer
nodemailer = require('nodemailer');
const fs = require("fs")
const crypto = require("crypto")
const path = require("path")
const lineReader = require('line-reader');
const jwt = require("jsonwebtoken")
class EmailService {
    fromMail = 'sonipc1998@outlook.com';
    toMail = 'sonis9355@gmail.com';

    constructor(fromMail, toMail) {

        this.fromMail = fromMail;
        this.toMail = toMail;
    }

    getEmailText(url) {
        const mailPath = path.join(__dirname, "../../extras/activation_mail.txt")
        let retData = null
        try {

            retData = fs.readFileSync(mailPath, "utf-8")
            const mailArr = retData.split("<temp>")

            retData = mailArr[0] + url + mailArr[1]
            console.log(retData)
        } catch (err) {
            throw err;
        }
        return retData
    }


    getResetPassEmailText(url) {
        const mailPath = path.join(__dirname, "../../extras/activation_mail.txt")
        let retData = null
        try {

            retData = fs.readFileSync(mailPath, "utf-8")
            const mailArr = retData.split("<temp>")

            retData = "TO RESET PASSWORD"+ mailArr[0] + url + mailArr[1]
            //console.log(retData)
        } catch (err) {
            throw err;
        }
        return retData
    }




    // declare vars







    getActivationToken(email) {
        const activateToken = jwt.sign(email, process.env.ACTIVATION_TOKEN_SECRET, { expiresIn: '100m' })
        //const vfCode = activateToken +"~"+ Date.now()
        //console.log("inside - " + vfCode)
        return activateToken
    }



    async sendMail(mailBody) {
        const subject = 'An email using sumit soni nodejs app';
        // auth
        const transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: "sonipc1998@outlook.com",
                pass: '5797atm@#$'
            }
        });

        // email options
        const mailOptions = {
            from: "sonipc1998@outlook.com",
            to: 'sonis9355@gmail.com',
            subject: subject,
            text: mailBody
        };

        // send email
        await transporter.sendMail(mailOptions, (error, response) => {
            if (error) {
                console.log(error);
                return error
            }
            console.log(response)
        });
    }
}
module.exports = new EmailService();

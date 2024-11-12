const path=require("path")
class EmployeeDashController {
    async profilePageInit(req, res, next) {
        //console.log(req.empl);
        const empl = req.empl
        try {
            const emplProfile = {
                email: empl.email,
                phone: empl.phone,
                rating: empl.rating,
                firstName: empl.profileDetails.firstName,
                lastName: empl.profileDetails.lastName,
                serviceCategory: empl.profileDetails.serviceCategory,
                serviceSubCategory: empl.profileDetails.serviceSubCategory,
                profilePhoto: empl.profileDetails.profilePhoto.slice(6),
                city: empl.profileDetails.city,
                state: empl.profileDetails.state,
                pinCode: empl.profileDetails.pincode,
                phone: empl.profileDetails.phone,
                aadharNo:empl.profileDetails.aadharNo,
                address: empl.profileDetails.address,
                title: empl.profileDetails.title,
                extraDetails: empl.profileDetails.extraDetails,
                loginMethod: empl.loginMethod



            }

           

            path.join("../",empl.profileDetails.profilePhoto)
            if(empl.loginMethod==="EMAIL"){
                emplProfile.emailAuth=true
            }else{
                emplProfile.emailAuth=false
            }


            req.emplProfile = emplProfile
            next()
        } catch (error) {

        }
        next()
    }


    async updateProfile(req,res,next){
        try {
            const firstName=req.body.first_name
            const lastName=req.body.last_name
            const address=req.body.address
            const {city,state}=req.body
            const pinCode=req.body.pin_code

            const empl=req.empl

            empl.profileDetails.firstName=firstName
            empl.profileDetails.lastName=lastName
            empl.profileDetails.address=address
            empl.profileDetails.city=city
            empl.profileDetails.state=state
            empl.profileDetails.pincode=pinCode

            const updatedEmpl=await empl.save()
            



            //console.log(updatedEmpl.profileDetails.firstName);
            const emplProfile = {
                email: updatedEmpl.email,
                phone: updatedEmpl.phone,
                rating: updatedEmpl.rating,
                firstName: updatedEmpl.profileDetails.firstName,
                lastName: updatedEmpl.profileDetails.lastName,
                serviceCategory: updatedEmpl.profileDetails.serviceCategory,
                serviceSubCategory: updatedEmpl.profileDetails.serviceSubCategory,
                profilePhoto: updatedEmpl.profileDetails.profilePhoto,
                city: updatedEmpl.profileDetails.city,
                state: updatedEmpl.profileDetails.state,
                pinCode: updatedEmpl.profileDetails.pincode,
                phone: updatedEmpl.profileDetails.contactPhone,

                address: updatedEmpl.profileDetails.address,
                title: updatedEmpl.profileDetails.title,
                extraDetails: updatedEmpl.profileDetails.extraDetails,
                loginMethod: updatedEmpl.loginMethod



            }
            if(updatedEmpl){
                //next()
                //console.log("got");

                //console.log(emplProfile);
                return res.render("employee_dash_profile",{emplProfile:emplProfile,updated:true})
                
            }
            
        } catch (error) {
            
        }
    }


    async homeDashInit(req,res,next){
        const empl=req.empl;
        //console.log(empl);

        try {
            let newOrder=null,completedOrders=null
            if(empl.allotedOrder){

            }
            if(empl.completedOrders.length){
                console.log("true");
            }
            req.renderObj={
                newOrder:newOrder,
                completedOrders:completedOrders
            }
            next()
            
        } catch (error) {
            console.log(error);
        }
    }
}


module.exports = new EmployeeDashController()
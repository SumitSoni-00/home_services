const ProfileDetail = require("../modules/models/ProfileDetail")
const Employee = require("../modules/models/Employee")
const multer = require("multer")
const path = require("path")
class ProfileDetailsController {
    async uploadDataFetch(req, res) {

        const pageNo = req.body.pageNo;
        if (pageNo == 1) {

            try {
                console.log(req.body)
                const fieldsMapStr = req.body.fieldsMap
                const fieldsMap = new Map(JSON.parse(fieldsMapStr))
                const empl = req.employee

                if (fieldsMap.size) {
                    if (fieldsMap.has("service_category")) {
                        empl.profileDetails.serviceCategory = fieldsMap.get("service_category");
                    } if (fieldsMap.has("service_subcategory")) {
                        empl.profileDetails.serviceSubCategory = fieldsMap.get("service_subcategory");
                    }


                    const saveRes = await empl.save()
                    if (saveRes) {
                        res.status(200).json("success");
                    }
                } else {
                    res.status(200).json("no data");
                }


            } catch (error) {
                res.status(400).send(error.message);
            }

        } else if (pageNo == 3) {
            try {
                console.log(req.body)
                const fieldsMapStr = req.body.fieldsMap
                const fieldsMap = new Map(JSON.parse(fieldsMapStr))
                const empl = req.employee

                if (fieldsMap.size) {
                    if (fieldsMap.has("first_name")) {
                        empl.firstName = fieldsMap.get("first_name");
                        empl.profileDetails.firstName = fieldsMap.get("first_name");
                    }

                    if (fieldsMap.has("last_name")) {
                        empl.lastName = fieldsMap.get("last_name");
                        empl.profileDetails.lastName = fieldsMap.get("last_name");
                    } if (fieldsMap.has("extra_details")) {

                        empl.profileDetails.extraDetails = fieldsMap.get("extra_details");
                    }


                    const saveRes = await empl.save()
                    if (saveRes) {
                        res.status(200).json("success");
                    }
                } else {
                    res.status(200).json("no data");
                }


            } catch (error) {
                res.status(400).send(error.message);
            }

        } else if (pageNo == 4) {
            console.log("pic received")



            try {
                //console.log(req.body)

                const empl = req.employee


                const picPath = req.picPath
                empl.profileDetails.profilePhoto = picPath;



                const saveRes = await empl.save()
                //console.log(saveRes);

                if (saveRes) {
                    res.status(200).json("success");
                }



            } catch (error) {
                console.log(error);
            }





        } else if (pageNo == 5) {
            try {
                console.log(req.body)
                const fieldsMapStr = req.body.fieldsMap
                const fieldsMap = new Map(JSON.parse(fieldsMapStr))
                const empl = req.employee

                if (fieldsMap.size) {
                    if (fieldsMap.has("state")) {
                        empl.profileDetails.state = fieldsMap.get("state");
                    } if (fieldsMap.has("city")) {
                        empl.profileDetails.city = fieldsMap.get("city");
                    } if (fieldsMap.has("address")) {
                        empl.profileDetails.address = fieldsMap.get("address");
                    }
                    if (fieldsMap.has("pincode")) {
                        empl.profileDetails.pincode = fieldsMap.get("pincode");
                    }


                    const saveRes = await empl.save()
                    if (saveRes) {
                        res.status(200).json("success");
                    }
                } else {
                    res.status(200).json("no data");
                }


            } catch (error) {
                res.status(400).send(error.message);
            }

        }



        else if (pageNo == 6) {
            try {
                console.log(`${req.body} 6`)
                const fieldsMapStr = req.body.fieldsMap
                const fieldsMap = new Map(JSON.parse(fieldsMapStr))
                const empl = req.employee

                if (fieldsMap.size) {
                    if (fieldsMap.has("phone")) {
                        empl.profileDetails.phone = fieldsMap.get("phone");
                    } if (fieldsMap.has("aadhar")) {
                        empl.profileDetails.aadharNo = fieldsMap.get("aadhar");
                    }


                    const saveRes = await empl.save()
                    if (saveRes) {
                        res.status(200).json("success");
                    }
                } else {
                    res.status(200).json("no data");
                }


            } catch (error) {
                res.status(400).send(error.message);
            }

        }

       // console.log(req.employee);




    }



    async uploadProfilePic(req, res, next) {
        //console.log("ee");
        const multerStorage = multer.diskStorage({
            destination: (req, file, cb) => {


                

                const picPath = `public/uploads/employees/${req.employee.email}`
                req.picPath = picPath
                cb(null, picPath);
            },
            filename: (req, file, cb) => {
                const f = file.originalname
                const ext = path.extname(f)//file.mimetype.split("/")[1];
                const picName = `${file.fieldname}-${Date.now()}${ext}`

                req.picPath = path.join(req.picPath, picName)
                cb(null, picName);
            },
        });

        const upload = multer({
            storage: multerStorage,

        }).single("myImage")

        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                console.log("Multer error");
                console.log(err);
            } else if (err) {
                console.log("My error");
                console.log(err);
            }
            // Everything went fine. 
            next()

        })
    }



    async submitProfileDetails(req, res, next) {

        const serviceCategory = req.body.service_category
        const serviceSubCategory = req.body.service_subcategory

        const firstName = req.body.first_name;
        const lastName = req.body.last_name;
        const extraDetails = req.body.extra_details
        //console.log(`${extraDetails.length} details`);
        //pic not attached here
        const city = req.body.city;
        const state = req.body.state;
        const address = req.body.address;
        const pincode = req.body.pincode;
        const phone = req.body.phone;
        const aadhar = req.body.aadhar;



        if (!serviceCategory || !serviceSubCategory || !firstName || !lastName || !city || !state || !address || !pincode || !phone || !aadhar) {
            return res.json("fields required")
        }



        try {
            const empl = req.employee;
            empl.profileDetails.serviceCategory = serviceCategory;
            empl.profileDetails.serviceSubCategory = serviceSubCategory;
            empl.profileDetails.firstName = firstName
            empl.profileDetails.lastName = lastName
            empl.firstName = firstName
            empl.lastName = lastName
            empl.profileDetails.extraDetails = extraDetails;
            empl.profileDetails.city = city;
            empl.profileDetails.state = state;
            empl.profileDetails.address = address;
            empl.profileDetails.pincode = pincode;
            empl.profileDetails.phone = phone;
            empl.profileDetails.aadharNo = aadhar;
            empl.profileDetails.extraDetails = extraDetails.trim().length ? extraDetails : null;
            empl.basicProfileCompleted = true
            const updated = await empl.save();
            console.log(updated)
            res.json(updated)

        } catch (err) {
            console.log(err)
            res.json(err)
        }



        
    }
}

module.exports = new ProfileDetailsController()
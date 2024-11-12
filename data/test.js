// const all_cities = require("./all_cities")

// const indianCities = all_cities.filter((element) => {
//     if (element.state_id <= 41) {
//         return true;
//     } else {
//         return false
//     }
// })

// //console.log(indianCities[5738])
// const fs = require("fs")
// indianCities.forEach((element) => {

//         fs.appendFileSync("indian_cities.js",`${JSON.stringify(element)},`)


// })

// //fs.writeFileSync("indian_cities.json","indianCities")





const mongoose = require('mongoose')

// const profileDetailsSchema = require("./../../backened/src/modules/models/ProfileDetail")
const connectDB = async () => {
    try {

        const conn = await mongoose.connect("mongodb://localhost:27017/homework", {
            useNewUrlParser: true,
            useUnifiedTopology: true,

        })

        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}


var Schema = mongoose.Schema;
var indian_states = require("./states")
var indian_cities = require("./indian_cities")



const stateSchema = new Schema({
    id: {
        type: Number
    },
    name: {
        type: String
    },
    cities: [
        {
            type: Schema.Types.ObjectId,
            ref: 'City'
        },

    ],
    country: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        default: null
    }
});

const citySchema = new Schema({
    id: {
        type: Number
    },
    name: {
        type: String
    },
    state: {
        type: Schema.Types.ObjectId,
        ref: 'State',
        default: null
    }
});

var State = mongoose.model('State', stateSchema);
var City = mongoose.model('City', citySchema);
async function doDb() {
    await connectDB();

    indian_states.forEach(async (state) => {
        const newState = new State(state)
        await newState.save()
    })

    console.log("done")
}

//doDb();


async function doCity() {
    await connectDB();
    var i = 1;
    for (i = 1; i <= 41; i++) {
        var st = await State.findOne({ id: i })
        indian_cities.forEach(async (city) => {
            if (+(city.state_id) == i) {
                var ct = new City({ id: city.id, name: city.name, state: st })
                st.cities.push(ct)
                await ct.save();


            }
        })
        await st.save()
        console.log("done")
    }


}
//doCity();
//doDb();

const countrySchema = new Schema({
    id: {
        type: Number
    },
    sortname: {
        type: String
    },
    name: {
        type: String
    },
    states: [
        {
            type: Schema.Types.ObjectId,
            ref: 'State'
        }
    ]
});

var Country = mongoose.model('Country', countrySchema);
// async function saveIndia() {
//     await connectDB()
//     var countr = new Country({
//         id: 1,
//         sortname: "in",
//         name: "India"
//     })
//     await countr.save()
// }
// saveIndia();

const allUsers = async () => {
    await connectDB();
    const india =await Country.findOne({id:1})
    console.log(india)
    var stats = await State.find()
    stats.forEach(async (state)=>{
        state.country=india
        await state.save()
    })
    
}

allUsers();
//doDb();
//doCity()
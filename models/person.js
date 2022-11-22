//Määritellään Mongoose

const mongoose = require('mongoose')

const url = process.env.MONGODB_URI //yhteysosoite phonenumberapp, annetaan ympäristömuuttujana
console.log('connecting to', url) //logataan yhteysosoite

mongoose.connect(url) //yhteys tietokantaan
    .then(result => { //jos yhteys onnistuu
        console.log('connected to MongoDB')
    })
    .catch((error) => { //jos yhteys epäonnistuu
        console.log('error connecting to MongoDB:', error.message)
    })


const personSchema = new mongoose.Schema({ //luodaan skeema
    name: String,
    number: String
})

personSchema.set('toJSON', { //Muutetaan kannasta haetut tiedot JSON-muotoon
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', personSchema) //luodaan model

module.exports = Person //exportataan Person model
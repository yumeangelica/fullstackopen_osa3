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


const personSchema = new mongoose.Schema({ //luodaan skeema validointisäännöillä
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        return /\d{2,3}-\d{7,8}/.test(v)
      },
      message: '{VALUE} is not a valid phone number!'
    },
    minlength: 8,
    required: true
  }
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
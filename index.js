const express = require('express')
const morgan = require('morgan')
const app = express()

require('dotenv').config() //luetaan .env-tiedosto

const Person = require('./models/person') //importataan Person model

app.use(express.static('build')) //static middlewaren käyttöön, jotta sovellus palauttaa build-kansion sisällön
app.use(express.json()) //json parser json datan käsittelemiseen, otetaan käyttöön ennen middlewarea

//middleware requestien loggaamiseen
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next() //siirtää kontrollin seuraavalle middlewarelle
}

app.use(requestLogger) //käytetään middlewarea

const cors = require('cors') //cors middlewaren käyttöön, sallitaan kaikki pyynnöt

app.use(cors())





//morgan middleware post requestien loggaamiseen
morgan.token('post-data', (req, res) => {
    const body = req.body //haetaan body
    let data = { name: body.name, number: body.number } //luodaan uusi objekti, joka sisältää name ja number
    return JSON.stringify(data) //palautetaan data stringinä
}
)

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data')) //using morgan middleware, logataan post requestit morganin avulla




//määrittelee tapahtumankäsittelijän, joka hoitaa sovelluksen juureen eli polkuun / tulevia HTTP GET -pyyntöjä:
app.get('/', (req, res) => {
    res.send('<h1>Phonenumber backend test!</h1>')
})


//määrittelee tapahtumankäsittelijän, joka hoitaa sovelluksen polkuun /api/persons tulevia HTTP GET -pyyntöjä:
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})



// määrittelee info-sivun, missä nykyinen päivämäärä, aika ja henkilöiden määrä näytetään:
app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        const today = new Date()
        res.send(`<p> Phonebook has info for ${persons.length} people <br> ${today} </p>`)
    })
})



//haetaan yksi henkilö id:n perusteella
app.get('/api/persons/:id', (request, response, next) => { //route, joka palauttaa yhden henkilön id:n perusteella
    Person.findById(request.params.id) //haetaan id
        .then(person => { //jos henkilö löytyy
            if (person) {
                response.json(person) //palautetaan henkilö
            } else { //jos henkilöä ei löydy
                response.status(404).end() //palautetaan 404 status
            }
        })
        .catch(error => next(error)) //jos tapahtuu virhe, siirrytään errorhandleriin
})



//yksittäisen henkilön tietojen poistaminen:
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})



//henkilön muokkaaminen:
app.put('/api/persons/:id', (req, res, next) => {

    const request_body = req.body //haetaan request_body

    const person = { //luodaan uusi henkilö objekti
        name: request_body.name, //nimi
        number: request_body.number //numero  
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true }) //haetaan id ja päivitetään henkilö
        .then(updatedPerson => { //jos henkilö löytyy
            res.json(updatedPerson.toJSON()) //palautetaan henkilö responseen
        })
        .catch(error => next(error))
})





//uuden henkilön lisääminen:
const generateId = () => { //Id:n generointi
    let id = Math.random() * 100000 //lisätään random numero id:hen
    return Math.floor(id) //palautetaan id pyöristettynä
}

app.post('/api/persons', (request, response, next) => {
    const body = request.body //haetaan body

    if (!body.name || !body.number) { //jos nimi tai numero puuttuu, palautetaan status 400
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
        id: generateId(),
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
        .catch(error => next(error))

})




//middleware, jonka ansiosta saadaan routejen käsittelemättömistä virhetilanteista JSON-muotoinen virheilmoitus
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}


//käytetään middlewarea
app.use(unknownEndpoint)



//middleware virheiden käsittelyyn

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}


// tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
app.use(errorHandler)





//määritellään portti, jossa sovellus pyörii. Jos ympäristömuuttujassa ei ole porttia, käytetään porttia 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})




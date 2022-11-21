const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json()) //json parser json datan käsittelemiseen, otetaan käyttöön ennen middlewarea

const cors = require('cors') //cors middlewaren käyttöön, sallitaan kaikki pyynnöt
app.use(cors())


app.use(express.static('build')) //static middlewaren käyttöön, jotta sovellus palauttaa build-kansion sisällön



//middleware requestien loggaamiseen
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next() //siirtää kontrollin seuraavalle middlewarelle
}

app.use(requestLogger) //käytetään middlewarea


//morgan middleware post requestien loggaamiseen
morgan.token('post-data', (req, res) => {
    const body = req.body //haetaan body
    let data = { name: body.name, number: body.number } //luodaan uusi objekti, joka sisältää name ja number
    return JSON.stringify(data) //palautetaan data stringinä
}
)

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data')) //using morgan middleware, logataan post requestit morganin avulla




let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
]


//määrittelee tapahtumankäsittelijän, joka hoitaa sovelluksen juureen eli polkuun / tulevia HTTP GET -pyyntöjä:
app.get('/', (req, res) => {
    res.send('<h1>Phonenumber backend test!</h1>')
})


//määrittelee tapahtumankäsittelijän, joka hoitaa sovelluksen polkuun /api/persons tulevia HTTP GET -pyyntöjä:
app.get('/api/persons', (req, res) => {
    res.json(persons)
})


// määrittelee info-sivun, missä nykyinen päivämäärä, aika ja henkilöiden määrä näytetään:
app.get('/info', (req, res) => {
    const date = new Date()
    res.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>`)
})



//yksittäisen henkilön tietojen näyttäminen:
app.get('/api/persons/:id', (request, response) => { //:id on dynaaminen parametri
    const id = Number(request.params.id) //muutetaan id-numeroksi
    const person = persons.find(person => person.id === id) //etsitään henkilö id:n perusteella


    if (person) {
        response.json(person) //palautetaan henkilö responseen
    } else {
        response.status(404).end() //jos henkilöä ei löydy, palautetaan status 404
    }
})


//yksittäisen henkilön tietojen poistaminen:
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id) //poistetaan henkilö id:n perusteella

    response.status(204).end() //palautetaan status 204 no content
})


//uuden henkilön lisääminen:

const generateId = () => { //Id:n generointi
    let id = Math.random() * 100000 //lisätään random numero id:hen
    return Math.floor(id) //palautetaan id pyöristettynä
}



app.post('/api/persons', (request, response) => {
    const body = request.body //tallennetaan bodyyn pyynnön body

    if (!body.name) { //jos nimeä ei ole, palautetaan status 400 bad request
        return response.status(400).json({ //ohjelman suoritus pysähtyy tähän
            error: 'name missing' //virheilmoitus
        })
    }
    else if (!body.number) { //jos numeroa ei ole, palautetaan status 400 bad request
        return response.status(400).json({ //ohjelman suoritus pysähtyy tähän
            error: 'number missing' //virheilmoitus
        })
    } else if (persons.find(person => person.name === body.name)) { //jos nimi on jo olemassa, palautetaan status 400 bad request
        return response.status(400).json({ //ohjelman suoritus pysähtyy tähän
            error: 'name must be unique' //virheilmoitus
        })
    }
    else { //jos nimi on, lisätään henkilö
        const person = {
            name: body.name, //nimi tulee pyynnön bodystä
            number: body.number, //numero tulee pyynnön bodystä
            id: generateId(), //id generoidaan funktiolla
        }

        persons = persons.concat(person) //lisätään henkilö arrayhin

        response.json(person) //palautetaan lisätty henkilö responseen
    }
}
)



//middleware, jonka ansiosta saadaan routejen käsittelemättömistä virhetilanteista JSON-muotoinen virheilmoitus
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

//käytetään middlewarea
app.use(unknownEndpoint)



//määritellään portti, jossa sovellus pyörii. Jos ympäristömuuttujassa ei ole porttia, käytetään porttia 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

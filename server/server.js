require('dotenv').config()

const openAIFactory = require('./openai/openaiFactory')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
const jwt = require('jsonwebtoken');

const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || '5000'
const apiKey = process.env.OPENAI_API_KEY
const jwtSecret = process.env.JWT_KEY

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const openai = openAIFactory.create()

app.get("/models", async (req, res, handler) => {

    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(" ")[1]
        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) return res.sendStatus(403)
            req.user = user

            const { username } = jwt.decode(token)
            handler()
        })
    } else res.sendStatus(401)

}, async (req, res) => {
    
    res.json({
        models: (await openai.api.listModels()).data
    })
})

app.post("/", async (req, res) => {
    const { message, currentModel } = req.body
    
    res.json({
        message: await openai.callApi(message, currentModel),
    })
})

app.post("/register", async (req, res) => {
    const { username } = req.body
    const token = jwt.sign({ date: Date.now(), user: username }, jwtSecret, { algorithm: 'HS256' });

    console.log(token)
    res.json({
        token: token
    })
})

app.listen(port, hostname, () => {
    console.log(`Server is running on http://${hostname}:${port}`)
    console.log(typeof(apiKey) === undefined ? 
        "Error: your OpenAI api key is undefined. See .env file" :
        "Your OpenAI api key is : " + apiKey)
})
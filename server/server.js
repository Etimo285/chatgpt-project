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
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const openai = openAIFactory.create()

app.get("/models", async (req, res) => {
    
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

    res.send({
        token: token
    })
})

app.listen(port, hostname, () => {
    console.log(`Server is running on http://${hostname}:${port}`)
    if (apiKey === undefined) console.log("Error: your OpenAI api key is undefined")
})
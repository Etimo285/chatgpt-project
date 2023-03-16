require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const { Configuration, OpenAIApi } = require("openai")
const port = 3080

const configuration = new Configuration({
    organization: process.env.OPENAI_ORG,
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

app.post('/', async (req, res)=>{

    const {message} = req.body
    console.log(message)

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt : `${message}`,
        temperature: 0.5,
        max_tokens: 100,
    })

    res.json({
        GPTresponse: response.data.choices[0].text,
    })
    
})

app.listen(port, () => {
    
    console.log(`Server is running on port ${port}`)
})
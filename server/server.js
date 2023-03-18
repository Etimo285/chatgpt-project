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

app.post('/', async (req, res) => {

    const { messages, model, temperature, maxTokens } = req.body

    let response
    let errMessage

    // Debug outputs
    console.log("Modèle : " + model)
    console.log("Temperature : " + temperature)
    console.log("maxTokens : " + maxTokens)

    if (model.includes("3.5")) {
        response = await openai.createChatCompletion({
            model: model,
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens,
        }).catch((e) => { errMessage = e.message ; console.log(errMessage) })
    } else {
        response = await openai.createCompletion({
            model: model,
            prompt: messages.content,
            temperature: temperature,
            max_tokens: maxTokens,
        }).catch((e) => { errMessage = e.message ; console.log(errMessage) })
    }  

    res.json({
        GPTresponse: model.includes("3.5") ?
            response.data.choices[0].message.content :
            response.data.choices[0].text,
        ErrorResponse: errMessage,
        Price: response.data.usage,
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
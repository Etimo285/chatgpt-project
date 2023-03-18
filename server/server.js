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

    const { messages, model, temperature } = req.body

    let response
    let errMessage

    console.log(temperature)

    if (model.includes("3.5")) {
        response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: parseInt(temperature),
            max_tokens: 100,
        }).catch((e) => { errMessage = e.message ; console.log(errMessage) })
    } else {
        response = await openai.createCompletion({
            model: model,
            prompt: messages.content,
            temperature: parseInt(temperature),
            max_tokens: 100,
        }).catch((e) => { errMessage = e.message ; console.log(errMessage) })
    }  

    res.json({
        GPTresponse: model === "gpt-3.5-turbo" ? 
            response.data.choices[0].message.content :
            response.data.choices[0].text,
        ErrorResponse: errMessage,
        Price: response.data.usage,
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
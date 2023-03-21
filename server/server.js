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
    let contextPrompts = messages.filter((msg) => { return msg.role === 'system' })

    // Debug outputs
    function logInputValues() {
        console.log("\n"+`Context prompt : ${contextPrompts[contextPrompts.length-1].content} (${typeof(contextPrompts[contextPrompts.length-1].content)})`)
        console.log(`User Input : ${messages[messages.length-1].content} (${typeof(messages[messages.length-1].content)})`)
        console.log(`Model : ${model} (${typeof(model)})`)
        console.log(`Temperature : ${temperature} (${typeof(temperature)})`)
        console.log(`MaxTokens : ${maxTokens} (${typeof(maxTokens)})`+"\n")
    }

    // Uncomment the next line to test Input values
    logInputValues()

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
            prompt: messages[messages.length-1].content,
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
require('dotenv').config()

const { Configuration, OpenAIApi } = require("openai");

class OpenAI {
    constructor () {
        this.configuration = new Configuration({
            organization: "org-2H4hCkkRj8UJbvwsDMZ4v9xi",
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.api = new OpenAIApi(this.configuration);
    }

    async callApi(message, currentModel) {
        const response = await this.api.createCompletion({
          model: `${currentModel}`,
          prompt: `${message}`,
          max_tokens: 1000,
          temperature: 0.5,
        });
        return response.data.choices[0].text
    }

}

module.exports = OpenAI
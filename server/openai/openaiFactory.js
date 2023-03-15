'use strict'

const OpenAI = require('./openai')

class OpenAIFactory {
  create () {
    return new OpenAI()
  }
}

module.exports = new OpenAIFactory()

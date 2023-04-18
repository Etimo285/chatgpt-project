# chatgpt-project

![openaiIcon](https://mrvian.com/wp-content/uploads/2023/02/logo-open-ai.png) 

## Introduction

### About us

This project has been made in a collaboration of the members :
> Sanbye (https://github.com/Sanbye)  
> Etimo (https://github.com/Etimo285)

### About the project

This project is a web interface based on the [ChatGPT API](https://platform.openai.com/docs/introduction) by [OpenAI](https://openai.com/).

Technologies used for development :

- Node Package Manager (NPM)
- Node.js (with Express)
- React
- Custom CSS

## Installation

### Clone and NPM

Clone the repository in the desired folder
```
git clone https://github.com/Sanbye-and-Etimo-Collaboration/chatgpt-project.git
```

Once you are in the root folder in the terminal, type
```
cd server
npm i
```
Then
```
cd ..
cd client
npm i
```
In order to install the missing packages

### OpenAI API Key

1. Visit the [OpenAI website](https://platform.openai.com) and sign up for an account.
2. Once you have signed up, navigate to the API section or get there by clicking your profile and selecting [View API keys](https://platform.openai.com/account/api-keys).
3. If you need to create a new OpenAI API key, click Create new secret key.
4. Now your new OpenAI API key will be created. Be sure to remember to save the OpenAI API key somewhere secure. You won’t be able to view it again if you forget it or misplace it.
5. Create and Set up your API key in `.env` file, located in `/server` with the following environment variables


```
OPENAI_API_KEY=<your API key>
OPENAI_ORG=<your organization>
```

## How to use

This project use a working method of server and client separation. That means to make it work, you need to have both running. By default :

In `/server` :
```
npm run dev
```

In `/client` :
```
npm start
```

You can edit the `package.json` files as you want in order to make terminal shortcuts.
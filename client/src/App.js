import { useState, useEffect } from 'react'
import './App.css'

function App() {

  useEffect(() => {
    getModels()
  }, [])

  const [input, setInput] = useState("")
  const [models, setModels] = useState([])
  const [currentModel, setCurrentModel] = useState("ada")
  const [chatLog, setChatLog] = useState([])

  function clearChat () {
    setChatLog([])
  }

  async function getModels () {
    fetch(`http://localhost:5000/models`)
      .then(res => res.json())
      .then(data => setModels(data.models.data))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    let chatLogNew = [...chatLog, { user: "me", message: `${input}` }]
    setInput("")
    setChatLog(chatLogNew)
    const messages = chatLogNew.map((message) => message.message).join("\n")
    const response = await fetch(`http://localhost:5000`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: messages,
        currentModel,
      })
    })
    const data = await response.json();
    setChatLog([...chatLogNew, { user: "gpt", message: `${data.message}` }])
    console.log(data.message)
  }

  return (
    <div className='main' style={{ margin: '10px' }}>
      <div className='logs'>
        <ChatLog chatLog={chatLog} className='chatbox' />
      </div>
      <form onSubmit={handleSubmit}>
        <input rows="1"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className='chat-input-textarea'>
        </input>
      </form>
      <button onClick={clearChat}>Réinitialiser</button>
      <div className='models'>
        <select onChange={(e) => {
          setCurrentModel(e.target.value)
        }}>
        {models.map((model, index) => (
            model.id === "text-davinci-003" ?
            <option key={model.id} value={model.id} selected>{model.id}</option> :
            <option key={model.id} value={model.id}>{model.id}</option>
            
          ))}
        </select>
      </div>
    </div>
  )
}

const ChatLog = ({ chatLog }) => {
  return (
    <div className='chat-log'>
        {chatLog.map((message, index) => (
          <ChatMessage index={index} key={index} message={message} />
        ))}
    </div>
  )
}

const ChatMessage = ({ message, index }) => {
  return (
    <div className='chat-message'>
      <div className='author'>
        <span>{message.user + " :"}</span>
      </div>
      <div className='message'>
        {message.message}
      </div>
    </div>
  )
}

export default App
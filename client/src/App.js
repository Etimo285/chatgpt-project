import { useState } from 'react'

function App() {

  const [input, setInput] = useState("")
  const [chatLog, setChatLog] = useState([{
    user: "gpt",
    message: "how can I help you today?"
  },{
    user: "me",
    message: "I want to use chatgpt today"
  }])

  function clearChat () {
    setChatLog([])
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
        message: messages
      })
    })
    const data = await response.json();
    setChatLog([...chatLogNew, { user: "gpt", message: `${data.message}` }])
    console.log(data.message)
  }

  return (
    <div style={{ margin: '10px' }}>
      <section className='chatbox' style={{ width: '50vw' }}>
        <div className='chat-log'>
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </div>

      </section>
      <form onSubmit={handleSubmit}>
        <input rows="1"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className='chat-input-textarea'>
        </input>
      </form>
      <button onClick={clearChat}>Effacer le chat</button>
    </div>
  )
}

const ChatMessage = ({ message }) => {
  return (
    <div className='chat-message' style={{ display: "flex", justifyContent: "space-between" }}>
      <div className='author'>
        <span style={{ fontWeight: 'bold' }}>{message.user + " :"}</span>
      </div>
      <div className='message' style={{ maxWidth: '90%' }}>
        {message.message}
      </div>
    </div>
  )
}

export default App
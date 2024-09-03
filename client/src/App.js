import { useState, useEffect, useRef } from 'react'
import { ChatMessage, TokenPrice, HookSlider } from './library/components'
import './library/functions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import './index.css'
import AudioRecorder from './library/audioRecorder'
import FlagsContainer from './library/flagsContainer'

function App() {

  const [model, setModel] = useState("gpt-4o-mini")
  const [input, setInput] = useState("")
  const [contextPrompt, setContextPrompt] = useState("")
  const [chatLog, setChatLog] = useState([{ role: "system", content: "" }])
  const [maxTokens, setMaxTokens] = useState(100)
  const messagesEndRef = useRef(null);
  const [transcription, setTranscription] = useState('');
  const handleTranscription = (text) => {
    console.log(text)
    setTranscription(text);
  };
  const [selectedLang, setSelectedLang] = useState({flag: null, name: "Select a langage"})

  const handleToggleAside = (bool) =>{

  }

  const handleSelectLang = (lang) => {
    setSelectedLang(lang)
    setContextPrompt(`Je veux que tu agisse comme un correcteur ${lang.promptInfo.determinant} ${lang.name}. Tu vas pointer du doigt mes erreurs en français et me donner une correction. Tu continue la conversation normalement en ${lang.name} que tu mettra dans des balises commencent et finnissant par ${"<"+lang.promptInfo.codeIso.toUpperCase()}>`)
  }

  useEffect(()=>{
    setInput(transcription)
  },[transcription])

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [chatLog]);

  async function handleSubmit(e){

    e.preventDefault()
    let chatLogRefresh =([...chatLog, {role: "user", content: `${input}`} ])
    setInput("")
    setChatLog(chatLogRefresh)

    const response = await fetch("http://localhost:4080/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: chatLogRefresh,
        model: model,
        maxTokens: maxTokens
      })
    }).then(setChatLog([...chatLogRefresh, { role: "assistant", isWaiting: true } ]))

    const data = await response.json()
    console.log(data.GPTresponse)
    const audioRes = await fetch(`http://localhost:4080${data.audioUrl}`, {
      method: "GET"
    })

    const audioBlob = await audioRes.blob(); // Get the audio as a blob
    const audioUrl = URL.createObjectURL(audioBlob); // Create a URL for the blob
    const audio = new Audio(audioUrl); // Create a new Audio object
    audio.play(); // Play the audio

    setChatLog([...chatLogRefresh, { role: "assistant", content: `${data.GPTresponse}` }])
  }

  return (
    <div className='app'>

      <aside className='aside'>

        <div onClick={handleToggleAside}>Ouvrir</div>

        <div className='models-list'>
          <select className='models-selector' defaultValue="gpt-4o-mini" onChange={(e) => {
            setModel(e.target.value)
            }}>
            <option value="gpt-4o-mini">gpt-4o-mini</option>
            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            <option value="code-davinci-002">code-davinci-002</option>
            <option value="ada">ada</option>
          </select>
        </div>
        
        <h1>Options</h1>

        <div className='hook-sliders'>
          <HookSlider label="max tokens" description="The amount of maximum tokens allowed for the response" 
          state={maxTokens} setState={setMaxTokens} step="1" min="1" max="200" />
        </div>

        <FlagsContainer handleSelectLang={handleSelectLang} selectedLang={selectedLang}/>

      </aside>

      <section className='chatBox'>

        <nav className='navBar'>
          
          <ul className='navList'>
            <h1>Chat</h1>
            
            <div className='contextCheckbox'>
              <input type="checkbox" id="context" name="context" onClick={(e)=> document.querySelector(".context").classList.toggle("true")}>
              </input><label for="context">Context Prompt</label>

              <div className='tooltip'>
                <FontAwesomeIcon icon={faCircleQuestion} />
                <span className='tooltipText'>"Context prompt" set the behavior of  chatGPT. For example, try "You are a caveman. You will answer using a “caveman” tone ". Please note that this functionality is not always working well.</span>
              </div>

            </div>
            
          
            
          </ul>
          
          <div className='context'>
              
            <form onSubmit={(e) => { 
              e.preventDefault()
              chatLog[0].content = contextPrompt
              console.log(contextPrompt)
              }}>
              <input value={contextPrompt} type='text' className='context-textarea'
                onChange={(e) => setContextPrompt(e.target.value)}
              ></input>
            </form>

          </div>
        </nav>
       
        <div className='chatLog'>      

          <ChatMessage message={{ role: 'assistant', content: 'Bonjour, comment puis-je vous aider ?' }} />
        
          {chatLog.filter((msg) => msg.role === "assistant" || msg.role === "user").map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}

          <div ref={messagesEndRef} />

        </div>
        
        <div className='chat-input-box'>
          <form onSubmit={handleSubmit} className='chat-form'>
            <input  value={input} className='chat-input' onChange={(e)=> setInput(e.target.value)}></input>
            <AudioRecorder onTranscription={handleTranscription} selectedLang={selectedLang}/>
          </form>
          
        </div>
      </section>
    </div>
  )
} 

export default App
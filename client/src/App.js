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
  const modelPriceRatio = {
    gpt3_5:
      {ratio: 0.002},
    ada: 
      {ratio: 0.0004},
    code:
      {ratio: 0.002}
  }
  const [input, setInput] = useState("")
  const [contextPrompt, setContextPrompt] = useState("")
  const [chatLog, setChatLog] = useState([{ role: "system", content: "" }])
  const [currentPrice,  setCurrentPrice] = useState({
    priceType: "current", prices:
      [{numberType: "prompt price", value: 0}, 
      {numberType: "response price", value: 0},
      {numberType: "total" ,value: 0}]
  })
  const [totalPrice, setTotalPrice] = useState({
    priceType: "total", prices:
      [{numberType: "prompt price", value: 0}, 
      {numberType: "response price", value: 0},
      {numberType: "total" ,value: 0}]
  })
  const [maxTokens, setMaxTokens] = useState(100)
  const messagesEndRef = useRef(null);
  const [transcription, setTranscription] = useState('');
  const handleTranscription = (text) => {
    console.log(text)
    setTranscription(text);
  };
  const [selectedLang, setSelectedLang] = useState({flag: null, label: "Select a langage"})

  const handleSelectLang = (lang) => {
    setSelectedLang(lang)
  }

  useEffect(()=>{
    setInput(transcription)
  },[transcription])

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    setTotalPrice({
        priceType: "total" , 
        prices: [
          { numberType: "prompt price", value: currentPrice.prices[0].value + totalPrice.prices[0].value },
          { numberType: "response price", value: currentPrice.prices[1].value + totalPrice.prices[1].value },
          { numberType: "total", value: currentPrice.prices[2].value + totalPrice.prices[2].value }
        ]
    })
  }, [currentPrice]);
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

    setCurrentPrice({
      priceType: "current", prices: 
        [{numberType: "prompt price", value:data.Price.prompt_tokens}, 
        {numberType: "response price", value:data.Price.completion_tokens},
        {numberType: "total" ,value:data.Price.total_tokens}]
      
      })

    setChatLog([...chatLogRefresh, { role: "assistant", content: `${data.GPTresponse}` }])
  }

  return (
    <div className='app'>

      <aside className='aside'>

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
        
        <h1>Aside</h1>
        
        <TokenPrice model={model} modelPriceRatio={modelPriceRatio} priceInfos={currentPrice} />
        <TokenPrice model={model} modelPriceRatio={modelPriceRatio} priceInfos={totalPrice} />

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
              <input type='text' className='context-textarea'
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
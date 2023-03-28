import { useState, useEffect } from 'react'
import { ChatMessage, TokenPrice, HookSlider } from './library/components'
import './library/functions'
import './App.css'

function App() {

  const [model, setModel] = useState("gpt-3.5-turbo")
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
  //const [vocalInput, setVocalInput] = useState({ isActive: false, icon: faMicrophoneSlash })
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
  const [temperature, setTemperature] = useState(1)
  const [presencePenalty, setPresencePenalty] = useState(0)
  const [frequencyPenalty, setFrequencyPenalty] = useState(0)

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

  async function handleSubmit(e){

    e.preventDefault()
    let chatLogRefresh =([...chatLog, {role: "user", content: `${input}`} ])
    setInput("")
    setChatLog(chatLogRefresh)

    const response = await fetch("http://localhost:3080/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: chatLogRefresh,
        model: model,
        maxTokens: maxTokens,
        temperature: temperature,
        presencePenalty: presencePenalty,
        frequencyPenalty: frequencyPenalty
      })
    }).then(setChatLog([...chatLogRefresh, { role: "assistant", isWaiting: true } ]))

    const data = await response.json()

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
          <select className='models-selector' defaultValue="gpt-3.5-turbo" onChange={(e) => {
            setModel(e.target.value)
            }}>
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
          <HookSlider label="temperature" description="Determines the response creativity value"
          state={temperature} setState={setTemperature} step="0.01" min="0" max="2" />
          <HookSlider label="presence penalty" description="Higher value means more likely to talk about new topics"
          state={presencePenalty} setState={setPresencePenalty} step="0.1" min="-2" max="2" />
          <HookSlider label="frequency penalty" description="Higher value means less likely to repeat the same text"
          state={frequencyPenalty} setState={setFrequencyPenalty} step="0.1" min="-2" max="2" />
        </div>

      </aside>

      <section className='chatBox'>

        <h1>Chat</h1>

        <div className='context'>
          
          <form onSubmit={(e) => { 
            e.preventDefault()
            chatLog[0].content = contextPrompt
            console.log(chatLog)
            }}>
            <input type='text' className='context-textarea'
              onChange={(e) => setContextPrompt(e.target.value)}
            >
            </input>
          </form>
            
        </div>

        <div className='chatLog'>   

          <ChatMessage message={{ role: 'assistant', content: 'Hello, how can I help you today ?' }} />
        
          {chatLog.filter((msg) => msg.role === "assistant" || msg.role === "user").map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}

        </div>
        
        <div className='chat-input-box'>
          <form onSubmit={handleSubmit}>
            <input className='chat-input' value={input} onChange={(e)=> setInput(e.target.value)}></input>
          </form>
        </div>
      </section>
    </div>
  )
} 

export default App
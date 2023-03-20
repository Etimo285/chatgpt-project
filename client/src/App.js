import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone, faMicrophoneSlash, faClipboard } from '@fortawesome/free-solid-svg-icons'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Tooltip } from 'react-tooltip'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import './App.css'

function App() {

  const [input, setInput] = useState("")
  const [vocalInput, setVocalInput] = useState({ isActive: false, icon: faMicrophoneSlash })
  const [chatLog, setChatLog] = useState([])
  const [currentPrice,  setCurrentPrice] = useState({
    priceType: "current", prices:
      [{numberType: "prompt price", value: 0}, 
      {numberType: "response price", value: 0},
      {numberType: "total" ,value: 0}]
    })
  const [totalPrice,setTotalPrice] = useState({
    priceType: "total", prices:
      [{numberType: "prompt price", value: 0}, 
      {numberType: "response price", value: 0},
      {numberType: "total" ,value: 0}]
    })
  const [model, setModel] = useState("gpt-3.5-turbo")
  const [temperature, setTemperature] = useState(0.5)
  const [maxTokens, setMaxTokens] = useState(100)
  
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
        temperature: temperature,
        maxTokens: maxTokens
      })

    })

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
        
        <TokenPrice priceInfos={currentPrice} />
        <TokenPrice priceInfos={totalPrice} />

        <div className='temperature'>

          <div className='temperature-header'>
            Temperature : 
            <input type="number" step="0.01" min="0" max="1"
              value={temperature}
              onChange={(e) => {
                if (e.target.value >= 1) e.target.value = 1
                if (e.target.value <= 0) e.target.value = 0
                setTemperature(parseFloat(e.target.value)) 
                }}>
            </input>
          </div>
          <div className="temperature-slider">
            <input type="range" step="0.01" min="0" max="1"
            className="slider"
            value={temperature}
            onChange={(e) => { setTemperature(parseFloat(e.target.value)) }}>
            </input>
          </div>

        </div>

        <div className='max-tokens'>
          
          <div className='max-tokens-header'>
            Max Tokens :
            <input type="number" step="1" min="1" max="200"
              value={maxTokens}
              onChange={(e) => {
                if (e.target.value >= 200) e.target.value = 200
                if (e.target.value <= 1) e.target.value = 1
                setMaxTokens(parseInt(e.target.value))
              }}>
            </input>
          </div>

          <div className="max-tokens-slider">
            <form>
              
              <input type="range" step="1" min="1" max="200"
                className="slider"
                value={maxTokens}
                onChange={(e) => { setMaxTokens(parseInt(e.target.value)) }}>
              </input>
            </form>
          </div>

        </div>

      </aside>

      <section className='chatBox'>
        <h1>Chat</h1>

        <div className='chatLog'>      

          <ChatMessage message={{ role: 'assistant', content: 'Hello, how can I help you today ?' }} />
        
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}

        </div>
        
        <div className='chat-input-box'>
          {/* En maintenance...
          <button onClick={() => {
            vocalInput.isActive ?
            setVocalInput({ isActive: false, icon: faMicrophone }) :
            setVocalInput({ isActive: true, icon: faMicrophoneSlash })
            console.log(vocalInput) }}
          >
          <FontAwesomeIcon icon={vocalInput.icon} />
          </button> */}
          <form onSubmit={(e) => {
            handleSubmit(e)
          }}>
            <input type='text' className='chat-input' value={input}
              onChange={(e) => setInput(e.target.value)}
            ></input>
          </form>
            
        </div>
      </section>
    </div>
  )
} 

const ChatMessage = ({message})=> {

  return (
    <div className={`chatMessage ${message.role === "assistant" && "chatGPT"} `}>
      <div className={`avatar ${message.role === "assistant" && "chatGPT"} `}>
        {message.role === "assistant" && <svg
          width={41}
          height={41}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          strokeWidth={1.5}
          className="h-6 w-6"
        >
          <path
            d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835A9.964 9.964 0 0 0 18.306.5a10.079 10.079 0 0 0-9.614 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 7.516 3.35 10.078 10.078 0 0 0 9.617-6.981 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.243-11.813ZM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496ZM6.392 31.006a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744ZM4.297 13.62A7.469 7.469 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.01L7.04 23.856a7.504 7.504 0 0 1-2.743-10.237Zm27.658 6.437-9.724-5.615 3.367-1.943a.121.121 0 0 1 .113-.01l8.052 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.65-1.132Zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763Zm-21.063 6.929-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225Zm1.829-3.943 4.33-2.501 4.332 2.5v5l-4.331 2.5-4.331-2.5V18Z"
          fill="currentColor"
          />
        </svg>}
      </div>

      <div className='message'>

        <ReactMarkdown children={message.content}
        components={{
          code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <div className='codeblock'>
                <div className='codeblock-header'>
                  <span>{className.slice(9)}</span>
                  <button
                    onClick={(e) => {
                      navigator.clipboard.writeText(children)
                      e.currentTarget.setAttribute('data-tooltip-content', 'Copied!')
                    }}
                    data-tooltip-id='clipboard-tooltip' 
                    data-tooltip-content='Copy to Clipboard'
                    data-tooltip-place='left'
                    >
                    <FontAwesomeIcon icon={faClipboard} />
                  </button>
                  <Tooltip id='clipboard-tooltip' />
                </div>

                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
        }} />

      </div>
    </div>
  )
}

const TokenPrice = ({priceInfos})=> {
  
  return (
    <div className='tokenPrice'>
          <div>{priceInfos.priceType === "current" ? "Current prompt price" : "Total prompts price"}</div>
          
          <ul>
            {priceInfos.prices.map((price, index)=> <li key={index}>{price.numberType} : {price.value}</li>)}
          </ul>
    </div>
  )
}

export default App
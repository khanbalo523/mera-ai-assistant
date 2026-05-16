'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: 'assistant', text: 'Assalam-o-Alaikum Boss! Main aapka AI Assistant hoon. Kya hukm hai aapka?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Speech Recognition (Voice Input)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Aapke phone mein voice support nahi hai. Text type karo.')
      return
    }
    
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'ur-PK'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      sendMessage(transcript)
    }

    recognition.start()
  }

  // Text-to-Speech (Assistant Bole)
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ur-PK'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  // Send Message to AI
  const sendMessage = async (text: string = input) => {
    if (!text.trim()) return

    const userMsg = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Google Gemini API Call
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Tum mera personal AI assistant ho. Tumhari personality: confident, thoda gusse wala, motivational. Urdu/English mix mein jawab do. User ne kaha: ${text}`
              }]
            }]
          })
        }
      )

      const data = await response.json()
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Boss, kuch samajh nahi aaya. Dobara bolo.'

      const aiMsg = { role: 'assistant', text: aiText }
      setMessages(prev => [...prev, aiMsg])
      
      // AI ki awaaz mein bole
      speak(aiText)

    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Boss, internet check karo. Kuch problem aa gayi hai!' 
      }])
    }

    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px 20px',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #e94560, #ff6b6b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          🤖
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Mera AI Assistant</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#00ff88' }}>● Online</p>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            padding: '12px 16px',
            borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            background: msg.role === 'user' 
              ? 'linear-gradient(135deg, #e94560, #c73e54)' 
              : 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            fontSize: '15px',
            lineHeight: '1.5'
          }}>
            {msg.text}
          </div>
        ))}
        
        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px 20px 20px 4px'
          }}>
            <span style={{ animation: 'pulse 1s infinite' }}>Typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} style={{
        padding: '15px 20px',
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <button
          type="button"
          onClick={startListening}
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            border: 'none',
            background: isListening ? '#ff4444' : 'linear-gradient(135deg, #00d4ff, #0099cc)',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: isListening ? 'pulse 1s infinite' : 'none'
          }}
        >
          🎤
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Kuch bolo Boss..."
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: '25px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: '15px',
            outline: 'none'
          }}
        />

        <button
          type="submit"
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #e94560, #c73e54)',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ➤
        </button>
      </form>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

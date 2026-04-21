import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Mic, 
  Send,
  Volume2,
  RotateCcw,
  X,
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from 'lucide-react'
import { getTopicById } from '../data/topics'
import type { Message, GrammarCorrection } from '../types'

// 豆包API调用函数
const callDoubaoAPI = async (userMessage: string, topic: string | undefined): Promise<{ response: string; corrections: GrammarCorrection[]; suggestions: string[] }> => {
  // 这里需要替换为实际的豆包API Key
  const API_KEY = 'YOUR_DOBAO_API_KEY'
  const API_URL = 'https://api.doubao.com/v1/chat/completions'
  
  try {
    const systemPrompt = topic 
      ? `You are a friendly English conversation partner helping the user practice English speaking on the topic of "${topic}". Provide natural English responses, correct grammar errors, and give improvement suggestions.`
      : 'You are a friendly English conversation partner helping the user practice English speaking. Provide natural English responses, correct grammar errors, and give improvement suggestions.'
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'doubao-1.0-pro-20240528',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    const aiResponse = data.choices[0].message.content
    
    // 模拟语法纠正（实际应用中可以让豆包返回纠正信息）
    const corrections: GrammarCorrection[] = []
    const suggestions: string[] = []
    
    // 简单的语法检查
    if (userMessage.length > 20 && !/^[A-Z]/.test(userMessage)) {
      corrections.push({
        original: userMessage,
        corrected: userMessage.replace(/^./, c => c.toUpperCase()),
        explanation: 'Sentences should start with a capital letter.',
        type: 'grammar'
      })
    }
    
    if (!userMessage.includes('.') && userMessage.length > 10) {
      suggestions.push('Try to use complete sentences with proper punctuation.')
    }
    
    return {
      response: aiResponse,
      corrections,
      suggestions
    }
  } catch (error) {
    console.error('API call failed:', error)
    // 失败时使用备用响应
    return {
      response: "I'm sorry, I couldn't process your request. Could you please try again?",
      corrections: [],
      suggestions: []
    }
  }
}

// 模拟AI回复和语法纠正（作为备用）
const mockAIResponse = (userMessage: string, _topicTitle: string): { response: string; corrections: GrammarCorrection[]; suggestions: string[] } => {
  const responses = [
    "That's interesting! Tell me more about that.",
    "I see what you mean. Could you elaborate on that?",
    "Great point! What do you think about...",
    "I understand. Let me share my perspective...",
    "That's a good way to put it! Have you considered...",
  ]
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)]
  
  // 模拟语法纠正
  const corrections: GrammarCorrection[] = []
  const suggestions: string[] = []
  
  if (userMessage.length > 20 && Math.random() > 0.5) {
    corrections.push({
      original: userMessage.split(' ').slice(0, 3).join(' '),
      corrected: userMessage.split(' ').slice(0, 3).join(' ').replace(/^./, c => c.toUpperCase()),
      explanation: '句子开头需要大写',
      type: 'grammar'
    })
  }
  
  if (!userMessage.includes('.') && userMessage.length > 10) {
    suggestions.push('尝试使用更完整的句子，以句号结束。')
  }
  
  if (userMessage.split(' ').length < 5) {
    suggestions.push('可以尝试用更多词汇来表达你的想法，让对话更丰富。')
  }
  
  return {
    response: randomResponse,
    corrections,
    suggestions
  }
}

const MessageBubble = ({ 
  message, 
  onPlayAudio,
  onShowCorrection 
}: { 
  message: Message
  onPlayAudio: (text: string) => void
  onShowCorrection: (message: Message) => void
}) => {
  const isUser = message.role === 'user'
  const [translated, setTranslated] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  
  const handleTranslate = async () => {
    if (translated || isTranslating) return
    
    setIsTranslating(true)
    
    // 模拟翻译功能
    setTimeout(() => {
      const mockTranslations: Record<string, string> = {
        'Hello! I\'m your English speaking practice partner. Today we\'ll practice the "Self Introduction" topic. 学习如何用英语介绍自己，包括姓名、职业、兴趣爱好等. You can start the conversation at any time, and I\'ll help you correct grammar errors and give improvement suggestions.': '你好！我是你的英语口语练习伙伴。今天我们将练习"自我介绍"话题。学习如何用英语介绍自己，包括姓名、职业、兴趣爱好等。你可以随时开始对话，我会帮你纠正语法错误并给出改进建议。',
        'Hello! Im your English speaking practice partner. We can have a free conversation, and Ill help you correct grammar errors and give improvement suggestions. What would you like to talk about?': '你好！我是你的英语口语练习伙伴。我们可以自由对话，我会帮你纠正语法错误并给出改进建议。你想聊些什么呢？',
        "That's interesting! Tell me more about that.": '那很有趣！告诉我更多关于那个的事情。',
        "I see what you mean. Could you elaborate on that?": '我明白你的意思。你能详细说明一下吗？',
        "Great point! What do you think about...": '很好的观点！你觉得...怎么样？',
        "I understand. Let me share my perspective...": '我理解。让我分享我的观点...',
        "That's a good way to put it! Have you considered...": '这样表达很好！你考虑过...吗？',
      }
      
      const translation = mockTranslations[message.content] || '这是一条英语消息的翻译。'
      setTranslated(translation)
      setIsTranslating(false)
    }, 500)
  }
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-slide-up`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-primary-500' : 'bg-gradient-to-br from-accent-400 to-accent-500'
      }`}>
        {isUser ? (
          <span className="text-white font-medium text-sm">我</span>
        ) : (
          <span className="text-white font-medium text-sm">AI</span>
        )}
      </div>
      
      <div className={`flex-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`relative group px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-primary-500 text-white rounded-br-md' 
            : 'bg-white border border-gray-100 rounded-bl-md shadow-sm'
        }`}>
          <p className={`text-[15px] leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>
            {message.content}
          </p>
          
          {/* Translation */}
          {translated && (
            <div className={`mt-2 pt-2 border-t ${isUser ? 'border-white/20' : 'border-gray-100'}`}>
              <p className={`text-sm ${isUser ? 'text-white/80' : 'text-gray-600'}`}>
                {translated}
              </p>
            </div>
          )}
          
          {/* Correction indicator */}
          {isUser && message.corrections && message.corrections.length > 0 && (
            <button
              onClick={() => onShowCorrection(message)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md"
            >
              <AlertCircle className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
        
        <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && (
            <>
              <button 
                onClick={handleTranslate}
                disabled={isTranslating}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                title="翻译"
              >
                {isTranslating ? (
                  <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : translated ? (
                  <span className="text-xs text-green-600 font-medium">已翻译</span>
                ) : (
                  <span className="text-xs text-gray-600 font-medium">翻译</span>
                )}
              </button>
              <button 
                onClick={() => onPlayAudio(message.content)}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                title="播放"
              >
                <Volume2 className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const CorrectionPanel = ({ 
  message, 
  onClose 
}: { 
  message: Message
  onClose: () => void 
}) => {
  if (!message.corrections || message.corrections.length === 0) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">语法纠正</h3>
              <p className="text-sm text-gray-500">发现 {message.corrections.length} 处可改进</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {message.corrections.map((correction, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-lg">
                  原文
                </span>
                <p className="text-gray-700">{correction.original}</p>
              </div>
              <div className="flex items-start gap-3 mb-3">
                <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-lg">
                  修改
                </span>
                <p className="text-green-700 font-medium">{correction.corrected}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-lg">
                  说明
                </span>
                <p className="text-gray-600 text-sm">{correction.explanation}</p>
              </div>
            </div>
          ))}
        </div>

        {message.suggestions && message.suggestions.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h4 className="font-semibold text-gray-900">改进建议</h4>
            </div>
            <ul className="space-y-2">
              {message.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Chat() {
  const { topicId } = useParams<{ topicId?: string }>()
  const navigate = useNavigate()
  const topic = topicId ? getTopicById(topicId) : null
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 初始化欢迎消息
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: topic 
        ? `Hello! I'm your English speaking practice partner. Today we'll practice the "${topic.titleEn}" topic. ${topic.description}. You can start the conversation at any time, and I'll help you correct grammar errors and give improvement suggestions.`
        : 'Hello! Im your English speaking practice partner. We can have a free conversation, and Ill help you correct grammar errors and give improvement suggestions. What would you like to talk about?',
      timestamp: Date.now(),
    }
    setMessages([welcomeMessage])
  }, [topic])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      // 调用豆包API
      const { response, corrections, suggestions } = await callDoubaoAPI(userMessage.content, topic?.titleEn || '')
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }

      // 更新用户消息的纠正信息
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, corrections, suggestions }
          : msg
      ))

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error handling send:', error)
      // 失败时使用模拟响应
      const { response, corrections, suggestions } = mockAIResponse(userMessage.content, topic?.title || '')
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }

      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, corrections, suggestions }
          : msg
      ))

      setMessages(prev => [...prev, aiMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePlayAudio = (text: string) => {
    // 使用Web Speech API播放音频
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const toggleRecording = () => {
    if (!isRecording) {
      // 检查浏览器是否支持语音识别
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        
        recognition.lang = 'en-US'
        recognition.continuous = false
        recognition.interimResults = true
        
        setIsRecording(true)
        
        let finalTranscript = ''
        
        recognition.onresult = (event) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
              setInputText(finalTranscript)
            }
          }
        }
        
        recognition.onend = () => {
          setIsRecording(false)
        }
        
        recognition.onerror = (event) => {
          console.error('语音识别错误:', event.error)
          setIsRecording(false)
        }
        
        recognition.start()
      } else {
        // 浏览器不支持语音识别
        setIsRecording(true)
        setTimeout(() => {
          setIsRecording(false)
          // 不设置固定文本，让用户知道需要手动输入
          setInputText('')
        }, 1000)
      }
    } else {
      // 停止录音
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.stop()
      }
      setIsRecording(false)
    }
  }

  const clearChat = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: topic 
        ? `你好！我是你的英语口语练习伙伴。今天我们来练习"${topic.title}"这个话题。${topic.description}。你可以随时开始对话，我会帮你纠正语法错误并给出改进建议。`
        : '你好！我是你的英语口语练习伙伴。我们可以自由对话，我会帮你纠正语法错误并给出改进建议。你想聊些什么呢？',
      timestamp: Date.now(),
    }
    setMessages([welcomeMessage])
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900">
              {topic ? topic.title : '自由对话'}
            </h1>
            <p className="text-xs text-gray-500">
              {topic ? topic.titleEn : 'AI Conversation Practice'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={clearChat}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="重新开始"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onPlayAudio={handlePlayAudio}
            onShowCorrection={setSelectedMessage}
          />
        ))}
        
        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">AI</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 safe-area-bottom">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-gray-600'}`} />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? '正在聆听...' : '输入消息或点击麦克风说话...'}
              disabled={isRecording}
              className="w-full bg-gray-100 rounded-full px-5 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              inputText.trim() && !isLoading
                ? 'bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-200'
                : 'bg-gray-200'
            }`}
          >
            <Send className={`w-5 h-5 ${inputText.trim() && !isLoading ? 'text-white' : 'text-gray-400'}`} />
          </button>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-3">
          AI 会纠正你的语法错误并提供改进建议
        </p>
      </div>

      {/* Correction Panel */}
      {selectedMessage && (
        <CorrectionPanel 
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  )
}

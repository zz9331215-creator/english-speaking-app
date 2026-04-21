import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Mic, 
  Send,
  Volume2,
  Pause,
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
    "Oh wow, that's really interesting! I'd love to hear more about that. Can you tell me more? 😊",
    "I totally get what you're saying! That's such a cool perspective. What made you think about that?",
    "Haha, I love that! 😄 It's so great to chat with you. Can you share more details?",
    "That's awesome! I really enjoy our conversation. Tell me, what's your favorite part about that?",
    "I hear you! That's a great point. I've never thought about it that way before. What else can you share?",
    "Oh, that's fascinating! I'm learning so much from you. Can you tell me more? 🤔",
    "That's wonderful! I love discussing topics like this. What's your experience been like?",
  ]
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)]
  
  // 模拟语法纠正
  const corrections: GrammarCorrection[] = []
  const suggestions: string[] = []
  
  if (userMessage.length > 20 && Math.random() > 0.5) {
    corrections.push({
      original: userMessage.split(' ').slice(0, 3).join(' '),
      corrected: userMessage.split(' ').slice(0, 3).join(' ').replace(/^./, c => c.toUpperCase()),
      explanation: 'Remember to start your sentence with a capital letter! 😊',
      type: 'grammar'
    })
  }
  
  if (!userMessage.includes('.') && userMessage.length > 10) {
    suggestions.push('Great try! Try using complete sentences with periods to make your English clearer! 💪')
  }
  
  if (userMessage.split(' ').length < 5) {
    suggestions.push('You\'re doing great! Try adding a few more words to express your thoughts more fully! 🌟')
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
  onShowCorrection,
  isPlaying 
}: { 
  message: Message
  onPlayAudio: (text: string) => void
  onShowCorrection: (message: Message) => void
  isPlaying: boolean
}) => {
  const isUser = message.role === 'user'
  const [translated, setTranslated] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  
  const handleTranslate = async () => {
    // 如果已经有翻译，切换显示/隐藏状态
    if (translated) {
      setShowTranslation(!showTranslation)
      return
    }
    
    setIsTranslating(true)
    
    // 模拟翻译功能
    setTimeout(() => {
      const mockTranslations: Record<string, string> = {
        'Hey there! I\'m so excited to chat with you today! 🎉 We\'re going to practice "Self Introduction" together. Don\'t worry about making mistakes - that\'s how we learn! Let\'s start with you telling me a bit about yourself, or ask me anything!': '嘿，你好！我今天真的很兴奋能和你聊天！我们要一起练习"自我介绍"。别担心犯错误——这就是我们学习的方式！让我们从你告诉我一些关于你自己的事情开始，或者问我任何问题！',
        'Hey there! I\'m so excited to chat with you today! 🎉 We\'re going to practice "Hobbies & Interests" together. Don\'t worry about making mistakes - that\'s how we learn! Let\'s start with you telling me a bit about yourself, or ask me anything!': '嘿，你好！我今天真的很兴奋能和你聊天！我们要一起练习"兴趣爱好"。别担心犯错误——这就是我们学习的方式！让我们从你告诉我一些关于你自己的事情开始，或者问我任何问题！',
        'Hey there! I\'m so excited to chat with you today! 🎉 We\'re going to practice "Weather" together. Don\'t worry about making mistakes - that\'s how we learn! Let\'s start with you telling me a bit about yourself, or ask me anything!': '嘿，你好！我今天真的很兴奋能和你聊天！我们要一起练习"天气"。别担心犯错误——这就是我们学习的方式！让我们从你告诉我一些关于你自己的事情开始，或者问我任何问题！',
        'Hey there! I\'m so excited to chat with you today! 🎉 We\'re going to practice "Weekend Plans" together. Don\'t worry about making mistakes - that\'s how we learn! Let\'s start with you telling me a bit about yourself, or ask me anything!': '嘿，你好！我今天真的很兴奋能和你聊天！我们要一起练习"周末安排"。别担心犯错误——这就是我们学习的方式！让我们从你告诉我一些关于你自己的事情开始，或者问我任何问题！',
        'Hey there! How are you doing today? 😊 I\'m really excited to practice English with you! Feel free to talk about anything you like - your day, your hobbies, what\'s on your mind... I\'m here to help you improve your English and have fun at the same time! What would you like to discuss?': '嘿，你好！你今天怎么样？我真的很兴奋能和你一起练习英语！随便聊你想聊的任何东西——你的一天，你的爱好，你在想什么...我在这里帮助你提高英语，同时也要玩得开心！你想讨论什么？',
        "Oh wow, that's really interesting! I'd love to hear more about that. Can you tell me more? 😊": '哦哇，这真的很有趣！我想听更多关于那个的。你能告诉我更多吗？',
        "I totally get what you're saying! That's such a cool perspective. What made you think about that?": '我完全理解你在说什么！这是一个很酷的观点。是什么让你想到那个的？',
        "Haha, I love that! 😄 It's so great to chat with you. Can you share more details?": '哈哈哈，我太喜欢那个了！和你聊天真是太棒了。你能分享更多细节吗？',
        "That's awesome! I really enjoy our conversation. Tell me, what's your favorite part about that?": '太棒了！我真的很享受我们的对话。告诉我，你最喜欢哪一部分？',
        "I hear you! That's a great point. I've never thought about it that way before. What else can you share?": '我听到了！这是一个很好的观点。我以前从没那样想过。你还能分享什么？',
        "Oh, that's fascinating! I'm learning so much from you. Can you tell me more? 🤔": '哦，那真是令人着迷！我从你这里学到了很多。你能告诉我更多吗？',
        "That's wonderful! I love discussing topics like this. What's your experience been like?": '太棒了！我喜欢讨论这样的主题。你的经历是什么样的？',
      }
      
      const translation = mockTranslations[message.content] || 'Sorry, this message cannot be translated at the moment.'
      setTranslated(translation)
      setShowTranslation(true)
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
          
          {/* Translation - 根据showTranslation状态显示/隐藏 */}
          {translated && showTranslation && (
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
                title={translated ? (showTranslation ? '隐藏翻译' : '显示翻译') : '翻译'}
              >
                {isTranslating ? (
                  <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : translated ? (
                  <span className={`text-xs font-medium ${showTranslation ? 'text-green-600' : 'text-gray-600'}`}>
                    {showTranslation ? '隐藏' : '译'}
                  </span>
                ) : (
                  <span className="text-xs text-gray-600 font-medium">译</span>
                )}
              </button>
              <button 
                onClick={() => onPlayAudio(message.content)}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                title={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 text-primary-600" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-gray-600" />
                )}
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
  const [isPlaying, setIsPlaying] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 初始化欢迎消息
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: topic 
        ? `Hey there! I'm so excited to chat with you today! 🎉 We're going to practice "${topic.titleEn}" together. Don't worry about making mistakes - that's how we learn! Let's start with you telling me a bit about yourself, or ask me anything!`
        : `Hey there! How are you doing today? 😊 I'm really excited to practice English with you! Feel free to talk about anything you like - your day, your hobbies, what's on your mind... I'm here to help you improve your English and have fun at the same time! What would you like to discuss?`,
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
      // 如果正在播放，先停止
      if (isPlaying) {
        window.speechSynthesis.cancel()
        setIsPlaying(false)
        return
      }
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      
      utterance.onend = () => {
        setIsPlaying(false)
      }
      
      window.speechSynthesis.cancel() // 先取消任何正在播放的语音
      window.speechSynthesis.speak(utterance)
      setIsPlaying(true)
    }
  }

  const toggleRecording = () => {
    if (!isRecording) {
      // 检查浏览器是否支持语音识别
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        
        recognition.lang = 'en-US'
        recognition.continuous = true
        recognition.interimResults = true
        
        setIsRecording(true)
        
        let finalTranscript = ''
        
        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
            } else {
              // 实时显示正在识别的文字
              setInputText(transcript)
            }
          }
        }
        
        recognition.onend = () => {
          // 录音结束时，如果有识别出的文字，自动发送
          if (finalTranscript.trim()) {
            const userMessage: Message = {
              id: Date.now().toString(),
              role: 'user',
              content: finalTranscript.trim(),
              timestamp: Date.now(),
            }
            setMessages(prev => [...prev, userMessage])
            
            // 自动发送AI回复
            setIsLoading(true)
            setTimeout(() => {
              const { response, corrections, suggestions } = mockAIResponse(finalTranscript.trim(), topic?.titleEn || '')
              
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
              setIsLoading(false)
            }, 1000 + Math.random() * 1000)
          }
          setIsRecording(false)
          setInputText('')
        }
        
        recognition.onerror = (event: any) => {
          console.error('语音识别错误:', event.error)
          setIsRecording(false)
          setInputText('')
        }
        
        recognition.start()
      } else {
        // 浏览器不支持语音识别
        setIsRecording(true)
        setTimeout(() => {
          setIsRecording(false)
          setInputText('')
        }, 1000)
      }
    } else {
      // 停止录音
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
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
            isPlaying={isPlaying}
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
        {isRecording ? (
          // 录音模式 - 类似微信
          <div className="flex items-center justify-center gap-8 animate-fade-in">
            <button
              onClick={() => setInputText('')}
              className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse shadow-lg shadow-red-200">
                <div className="w-6 h-6 rounded-full bg-white animate-ping opacity-50" />
                <Mic className="absolute w-7 h-7 text-white" />
              </div>
              <span className="text-sm text-red-500 font-medium animate-pulse">
                {inputText || 'Listening...'}
              </span>
            </div>
            
            <button
              onClick={toggleRecording}
              className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200"
            >
              <Send className="w-6 h-6 text-white rotate-90" />
            </button>
          </div>
        ) : (
          // 普通模式
          <div className="flex items-center gap-3">
            <button
              onClick={toggleRecording}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-gray-100 hover:bg-gray-200"
            >
              <Mic className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Say something or type a message..."
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
        )}
        
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

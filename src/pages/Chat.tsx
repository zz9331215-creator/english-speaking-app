import { useState, useRef, useEffect, useCallback } from 'react'
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
  Languages,
  Eye,
  EyeOff,
  Sparkles,
  Wand2,
  Save,
  Clock,
  MessageSquare
} from 'lucide-react'
import { getTopicById } from '../data/topics'
import { speechRecognition } from '../utils/speechRecognition'
import { translateText } from '../utils/translation'
import { addPracticeTime, addConversation, addMessage } from '../utils/userStats'
import { saveConversation, createConversationHistory } from '../utils/conversationHistory'
import type { Message, GrammarCorrection, GrammarResult, PolishResult } from '../types'

// 调用AI大模型API（支持火山引擎/豆包/OpenAI兼容格式）
const callAIAPI = async (
  userMessage: string,
  topic: string | undefined,
  apiKey: string,
  apiBaseUrl: string,
  modelName: string
): Promise<{ response: string; corrections: GrammarCorrection[]; suggestions: string[] }> => {
  const API_URL = apiBaseUrl.endsWith('/')
    ? `${apiBaseUrl}chat/completions`
    : `${apiBaseUrl}/chat/completions`

  try {
    const systemPrompt = topic
      ? `You are an enthusiastic foreign friend chatting with the user in English about "${topic}". You are warm, friendly, and genuinely interested in the conversation. Do NOT correct the user's grammar or give language learning advice. Just respond naturally like a real friend would - share your thoughts, ask follow-up questions, express emotions, and keep the conversation flowing. Use casual, everyday English with occasional friendly expressions. Keep responses concise (2-4 sentences). NEVER add notes, explanations, or parenthetical remarks like "(Note: ...)". Just chat naturally as a real person.`
      : 'You are an enthusiastic foreign friend chatting with the user in English. You are warm, friendly, and genuinely interested in the conversation. Do NOT correct the user\'s grammar or give language learning advice. Just respond naturally like a real friend would - share your thoughts, ask follow-up questions, express emotions, and keep the conversation flowing. Use casual, everyday English with occasional friendly expressions. Keep responses concise (2-4 sentences). NEVER add notes, explanations, or parenthetical remarks like "(Note: ...)". Just chat naturally as a real person.'

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || data.choices[0]?.text || 'No response'

    // 简单的语法检查
    const corrections: GrammarCorrection[] = []
    const suggestions: string[] = []

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
      response: aiResponse.trim(),
      corrections,
      suggestions
    }
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// 调用AI语法检查和润色API
const callGrammarAPI = async (
  userMessage: string,
  contextMessage: string,
  apiKey: string,
  apiBaseUrl: string,
  modelName: string
): Promise<{ grammarResult: GrammarResult; polishResult: PolishResult }> => {
  const API_URL = apiBaseUrl.endsWith('/')
    ? `${apiBaseUrl}chat/completions`
    : `${apiBaseUrl}/chat/completions`

  try {
    const grammarPrompt = `You are an English grammar checker and writing coach. Analyze the user's English sentence and provide feedback in JSON format.

Context (previous AI message): """${contextMessage}"""
User's sentence: """${userMessage}"""

Respond ONLY with a JSON object in this exact format:
{
  "grammar": {
    "isCorrect": boolean,
    "errors": ["error description 1", "error description 2"]
  },
  "polish": {
    "casual": "natural casual English version",
    "formal": "polished formal/business English version",
    "explanation": "detailed explanation in Chinese about why the polished version is better and what improvements were made"
  }
}

If the sentence is grammatically correct, set isCorrect to true and errors to empty array.
The explanation should be in Chinese and explain the polishing rationale."
`

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: grammarPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      return {
        grammarResult: result.grammar || { isCorrect: true, errors: [] },
        polishResult: result.polish || { casual: userMessage, formal: userMessage, explanation: '' }
      }
    }

    throw new Error('Invalid JSON response')
  } catch (error) {
    console.error('Grammar API failed:', error)
    throw error
  }
}

// 模拟语法检查和润色
const mockGrammarCheck = (userMessage: string, _contextMessage: string): { grammarResult: GrammarResult; polishResult: PolishResult } => {
  const errors: string[] = []

  if (userMessage.length > 10 && !/^[A-Z]/.test(userMessage)) {
    errors.push('句子开头缺少大写字母')
  }
  if (!/[.!?]$/.test(userMessage) && userMessage.length > 10) {
    errors.push('句子末尾缺少标点符号')
  }
  if (/\bi is\b/i.test(userMessage)) {
    errors.push('"I" 后面应该用 "am"，而不是 "is"')
  }
  if (/\bhe don't\b|\bshe don't\b|\bit don't\b/i.test(userMessage)) {
    errors.push('第三人称单数应该用 "doesn\'t"，而不是 "don\'t"')
  }

  const isCorrect = errors.length === 0

  let casual = userMessage
  let formal = userMessage

  if (!isCorrect) {
    casual = userMessage.replace(/^./, c => c.toUpperCase()).replace(/\bi is\b/gi, 'I am')
    if (!/[.!?]$/.test(casual) && casual.length > 10) {
      casual += '.'
    }
    formal = casual
  }

  const explanation = isCorrect
    ? '你的表达语法正确，自然流畅！可以尝试使用更丰富的词汇或更复杂的句式来提升表达水平。'
    : '已修正上述语法错误。注意英语句子的基本规范：句首大写、句末标点，以及主谓一致等规则。'

  return {
    grammarResult: { isCorrect, errors },
    polishResult: { casual, formal, explanation }
  }
}

// 智能模拟AI回复（基于用户输入内容关键词匹配）
const mockAIResponse = (userMessage: string, _topicTitle: string): { response: string; corrections: GrammarCorrection[]; suggestions: string[] } => {
  const lowerMsg = userMessage.toLowerCase().trim()
  const words = lowerMsg.split(/\s+/)

  // 基于关键词的智能回复映射
  const keywordResponses: Array<{ keywords: string[]; responses: string[] }> = [
    {
      keywords: ['hello', 'hi', 'hey'],
      responses: [
        "Hey there! It's so great to meet you! How are you doing today? 😊",
        "Hello! I'm excited to practice English with you. What would you like to talk about?",
        "Hi there! Ready to improve your English today? Let's get started!"
      ]
    },
    {
      keywords: ['name', 'call'],
      responses: [
        "Nice to meet you! I'm your AI English practice partner. What's your name?",
        "I'd love to know your name! I'm here to help you practice English."
      ]
    },
    {
      keywords: ['weather', 'rain', 'sunny', 'cold', 'hot', 'snow'],
      responses: [
        "Oh, the weather is always a great topic! What's the weather like where you are right now?",
        "I love talking about weather! Do you prefer sunny days or rainy days?",
        "The weather affects our mood so much, doesn't it? What's your favorite season?"
      ]
    },
    {
      keywords: ['hobby', 'hobbies', 'like', 'love', 'enjoy', 'interest'],
      responses: [
        "That sounds like a wonderful hobby! How long have you been doing that?",
        "I love hearing about people's interests! What do you enjoy doing in your free time?",
        "It's important to have hobbies! They make life more interesting, don't they?"
      ]
    },
    {
      keywords: ['work', 'job', 'career', 'company', 'office'],
      responses: [
        "Work takes up a big part of our lives! What do you do for work?",
        "I'd love to hear about your career! What's the most interesting part of your job?",
        "Do you enjoy your work? What made you choose that career path?"
      ]
    },
    {
      keywords: ['study', 'student', 'school', 'university', 'major', 'learn'],
      responses: [
        "Being a student is such an exciting time! What are you studying?",
        "Education is so important! What's your favorite subject to study?",
        "What do you want to do after you finish your studies?"
      ]
    },
    {
      keywords: ['travel', 'trip', 'visit', 'country', 'place', 'vacation'],
      responses: [
        "Traveling is amazing! What's the most interesting place you've ever visited?",
        "I love talking about travel! If you could go anywhere in the world, where would you go?",
        "Travel really opens our minds, doesn't it? Do you prefer city trips or nature trips?"
      ]
    },
    {
      keywords: ['food', 'eat', 'cook', 'restaurant', 'delicious', 'meal'],
      responses: [
        "Food is one of life's greatest pleasures! What's your favorite dish?",
        "I love exploring different cuisines! What kind of food do you enjoy most?",
        "Do you like cooking? What's your signature dish?"
      ]
    },
    {
      keywords: ['family', 'parent', 'brother', 'sister', 'mother', 'father'],
      responses: [
        "Family is so important! Tell me about your family.",
        "I'd love to hear about your family! Do you have any siblings?",
        "Family relationships shape who we are. What's your family like?"
      ]
    },
    {
      keywords: ['movie', 'film', 'music', 'song', 'book', 'read'],
      responses: [
        "Entertainment is a great way to learn English! What have you been watching or reading lately?",
        "I love recommendations! What's your favorite movie or book?",
        "Do you prefer movies or books? They both tell great stories in different ways!"
      ]
    },
    {
      keywords: ['sport', 'exercise', 'run', 'swim', 'game', 'play'],
      responses: [
        "Exercise is so good for us! What sports do you enjoy?",
        "Do you play any sports? It's a great way to stay healthy and make friends!",
        "Team sports or individual sports - which do you prefer?"
      ]
    },
    {
      keywords: ['plan', 'future', 'dream', 'goal', 'want to'],
      responses: [
        "It's great to have goals! What are your plans for the future?",
        "Dreams keep us motivated! What do you hope to achieve in the next few years?",
        "The future is full of possibilities! What would you like to do next?"
      ]
    },
    {
      keywords: ['feel', 'happy', 'sad', 'tired', 'excited', 'worried', 'emotion'],
      responses: [
        "It's important to express our feelings! How are you feeling right now?",
        "I understand. Sharing our emotions helps us feel better. Want to talk more about it?",
        "Your feelings are valid! What usually makes you feel better when you're down?"
      ]
    },
    {
      keywords: ['thanks', 'thank', 'grateful', 'appreciate'],
      responses: [
        "You're very welcome! I'm happy to help you practice English. 😊",
        "No problem at all! It's my pleasure to chat with you.",
        "You're so polite! Keep practicing and you'll improve quickly!"
      ]
    },
    {
      keywords: ['sorry', 'apologize', 'mistake', 'wrong'],
      responses: [
        "Don't worry about mistakes at all! That's how we learn and improve. 💪",
        "Making mistakes is completely normal! Even native speakers make mistakes.",
        "No need to apologize! Every mistake is a learning opportunity."
      ]
    },
    {
      keywords: ['difficult', 'hard', 'struggle', 'problem', 'challenge'],
      responses: [
        "I understand it can be challenging! But you're doing great. What specifically is difficult for you?",
        "Learning English takes time and patience. You're already making progress! What can I help you with?",
        "Don't give up! Every challenge you overcome makes you stronger. Let's work through it together!"
      ]
    }
  ]

  // 匹配关键词
  let matchedResponses: string[] = []
  for (const item of keywordResponses) {
    if (item.keywords.some(kw => words.includes(kw) || lowerMsg.includes(kw))) {
      matchedResponses.push(...item.responses)
    }
  }

  // 如果没有匹配到关键词，使用通用回复
  if (matchedResponses.length === 0) {
    const generalResponses = [
      "That's really interesting! I'd love to hear more about that. Can you tell me more? 😊",
      "I totally get what you're saying! That's such a cool perspective. What made you think about that?",
      "Haha, I love that! 😄 It's so great to chat with you. Can you share more details?",
      "That's awesome! I really enjoy our conversation. Tell me, what's your favorite part about that?",
      "I hear you! That's a great point. I've never thought about it that way before. What else can you share?",
      "Oh, that's fascinating! I'm learning so much from you. Can you tell me more? 🤔",
      "That's wonderful! I love discussing topics like this. What's your experience been like?",
      "Really? Tell me more! I'm genuinely interested in what you have to say.",
      "That's a great story! How did that make you feel?",
      "I see what you mean! Have you ever experienced something similar before?"
    ]
    matchedResponses = generalResponses
  }

  const randomResponse = matchedResponses[Math.floor(Math.random() * matchedResponses.length)]

  // 智能语法纠正
  const corrections: GrammarCorrection[] = []
  const suggestions: string[] = []

  if (userMessage.length > 20 && !/^[A-Z]/.test(userMessage)) {
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
  onShowEvaluation,
  onToggleShowContent,
  playingMessageId,
  apiKey,
  apiBaseUrl,
  modelName
}: {
  message: Message
  onPlayAudio: (text: string, messageId: string) => void
  onShowEvaluation: (message: Message) => void
  onToggleShowContent: (messageId: string) => void
  playingMessageId: string | null
  apiKey: string
  apiBaseUrl: string
  modelName: string
}) => {
  const isUser = message.role === 'user'
  const isPlaying = playingMessageId === message.id
  const [translated, setTranslated] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [showPolish, setShowPolish] = useState(false)

  const handleTranslate = async () => {
    if (translated) {
      setShowTranslation(!showTranslation)
      return
    }
    setIsTranslating(true)
    try {
      const result = await translateText(message.content, apiKey, apiBaseUrl, modelName)
      setTranslated(result)
      setShowTranslation(true)
    } catch (error) {
      console.error('翻译失败:', error)
      setTranslated('[翻译失败]')
      setShowTranslation(true)
    } finally {
      setIsTranslating(false)
    }
  }

  const grammarChecked = message.grammarResult !== undefined
  const isGrammarCorrect = message.grammarResult?.isCorrect ?? true

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
          {/* AI消息默认隐藏内容 */}
          {!isUser && message.showContent === false ? (
            <div className="min-h-[40px] flex items-center">
              <p className="text-[15px] leading-relaxed text-gray-400 blur-[3px] select-none">
                {message.content}
              </p>
            </div>
          ) : (
            <p className={`text-[15px] leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>
              {message.content}
            </p>
          )}

          {/* Translation */}
          {translated && showTranslation && (
            <div className={`mt-2 pt-2 border-t ${isUser ? 'border-white/20' : 'border-gray-100'}`}>
              <p className={`text-sm ${isUser ? 'text-white/80' : 'text-gray-600'}`}>
                {translated}
              </p>
            </div>
          )}
        </div>

        {/* 操作栏 */}
        <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>

          {/* AI朗读按钮 - 用户和AI消息都有 */}
          <button
            onClick={() => onPlayAudio(message.content, message.id)}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            title={isPlaying ? "暂停" : "AI朗读"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-primary-600" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-gray-600" />
            )}
          </button>

          {/* 翻译按钮 - 仅AI消息 */}
          {!isUser && (
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title={translated ? (showTranslation ? '隐藏翻译' : '显示翻译') : '翻译'}
            >
              {isTranslating ? (
                <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin block" />
              ) : (
                <Languages className={`w-3.5 h-3.5 ${showTranslation ? 'text-green-600' : 'text-gray-600'}`} />
              )}
            </button>
          )}

          {/* 显示/隐藏按钮 - 仅AI消息 */}
          {!isUser && (
            <button
              onClick={() => onToggleShowContent(message.id)}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title={message.showContent === false ? '显示内容' : '隐藏内容'}
            >
              {message.showContent === false ? (
                <Eye className="w-3.5 h-3.5 text-gray-600" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-gray-600" />
              )}
            </button>
          )}

          {/* 评估按钮 - 仅用户消息 */}
          {isUser && (
            <button
              onClick={() => onShowEvaluation(message)}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title="评估"
            >
              <Sparkles className="w-3.5 h-3.5 text-gray-600" />
            </button>
          )}
        </div>

        {/* 用户消息语法检查提示 */}
        {isUser && grammarChecked && (
          <div className={`flex items-center gap-3 mt-1 ${isUser ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => onShowEvaluation(message)}
              className="flex items-center gap-1 text-xs"
            >
              {isGrammarCorrect ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600">语法正确</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-orange-600">有语法错误</span>
                </>
              )}
              <span className="text-gray-400">{'>'}</span>
            </button>
            {message.polishResult && (
              <button
                onClick={() => setShowPolish(!showPolish)}
                className="flex items-center gap-1 text-xs"
              >
                <Wand2 className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-primary-600">润色</span>
                <span className="text-gray-400">{'>'}</span>
              </button>
            )}
          </div>
        )}

        {/* 润色预览 */}
        {isUser && showPolish && message.polishResult && (
          <div className={`mt-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 ${isUser ? 'ml-auto' : ''}`}>
            <p className="text-xs text-gray-500 mb-1">润色建议：</p>
            <p className="text-sm text-primary-600 font-medium">{message.polishResult.casual}</p>
          </div>
        )}
      </div>
    </div>
  )
}

const EvaluationPanel = ({
  message,
  contextMessage,
  onClose,
  apiKey,
  apiBaseUrl,
  modelName,
  onPlayAudio
}: {
  message: Message
  contextMessage: Message | null
  onClose: () => void
  apiKey: string
  apiBaseUrl: string
  modelName: string
  onPlayAudio: (text: string, messageId: string) => void
}) => {
  const [activeTab, setActiveTab] = useState<'grammar' | 'polish'>('grammar')
  const [polishStyle, setPolishStyle] = useState<'casual' | 'formal'>('casual')
  const [translated, setTranslated] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslatePolish = async () => {
    const text = message.polishResult?.[polishStyle]
    if (!text) return
    if (translated) {
      setTranslated(null)
      return
    }
    setIsTranslating(true)
    try {
      const result = await translateText(text, apiKey, apiBaseUrl, modelName)
      setTranslated(result)
    } catch (error) {
      console.error('翻译失败:', error)
      setTranslated('[翻译失败]')
    } finally {
      setIsTranslating(false)
    }
  }

  const grammarResult = message.grammarResult
  const polishResult = message.polishResult

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-600" />
            <h3 className="font-bold text-gray-900 text-lg">评估</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('grammar')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'grammar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            语法
          </button>
          <button
            onClick={() => setActiveTab('polish')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'polish'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            润色
          </button>
        </div>

        {/* Grammar Tab */}
        {activeTab === 'grammar' && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">你的表达：</p>
              <p className="text-gray-900 font-medium">{message.content}</p>
            </div>

            {grammarResult?.isCorrect ? (
              <div className="flex items-center gap-2 py-8 justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">恭喜你，没有任何语法错误～</span>
              </div>
            ) : (
              <div className="space-y-3">
                {grammarResult?.errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{error}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 旧版 corrections 兼容显示 */}
            {message.corrections && message.corrections.length > 0 && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                {message.corrections.map((correction, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-red-600 mb-1">原文：{correction.original}</p>
                    <p className="text-sm text-green-700 font-medium">修改：{correction.corrected}</p>
                    <p className="text-xs text-gray-500 mt-1">{correction.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Polish Tab */}
        {activeTab === 'polish' && polishResult && (
          <div className="space-y-4">
            {contextMessage && (
              <div>
                <p className="text-sm text-gray-500 mb-1">上文：</p>
                <p className="text-gray-700 text-sm">{contextMessage.content}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 mb-1">原回答：</p>
              <p className="text-gray-900">{message.content}</p>
            </div>

            {/* Style Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setPolishStyle('casual')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  polishStyle === 'casual'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                日常口语
              </button>
              <button
                onClick={() => setPolishStyle('formal')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  polishStyle === 'formal'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                商务正式
              </button>
            </div>

            {/* Polish Result */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">润色后：</p>
              <p className="text-primary-600 font-medium text-lg leading-relaxed">
                {polishResult[polishStyle]}
              </p>

              {/* Translation of polish result */}
              {translated && (
                <p className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                  {translated}
                </p>
              )}

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleTranslatePolish}
                  disabled={isTranslating}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Languages className="w-4 h-4" />
                  {translated ? '隐藏翻译' : '翻译'}
                </button>
                <button
                  onClick={() => onPlayAudio(polishResult[polishStyle], `polish-${message.id}`)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  AI
                </button>
              </div>
            </div>

            {/* Explanation */}
            {polishResult.explanation && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">润色思路：</p>
                <p className="text-sm text-gray-700 leading-relaxed">{polishResult.explanation}</p>
              </div>
            )}
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
  const [evalContext, setEvalContext] = useState<Message | null>(null)
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null)
  const [voiceType, setVoiceType] = useState('default')
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [apiKey, setApiKey] = useState('sk-jpyzkufcdkmypklgdztrletedkohdoqpjpqjwbkniperwkyo')
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.siliconflow.cn/v1')
  const [modelName, setModelName] = useState('deepseek-ai/DeepSeek-V3')
  const [provider, setProvider] = useState<'volcengine' | 'openai' | 'aliyun' | 'siliconflow' | 'custom'>('siliconflow')
  const [autoPlayResponse, setAutoPlayResponse] = useState(true)

  // AI服务商预设配置
  const providerConfigs = {
    volcengine: {
      name: '火山引擎/豆包',
      baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
      modelPlaceholder: 'ep-20250421100000-abc123',
      modelTip: '在火山引擎控制台创建推理接入点，填写ep-开头的ID'
    },
    openai: {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      modelPlaceholder: 'gpt-4o-mini',
      modelTip: '推荐模型: gpt-4o-mini, gpt-4o'
    },
    aliyun: {
      name: '阿里云百炼',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      modelPlaceholder: 'qwen-plus',
      modelTip: '推荐模型: qwen-plus, qwen-turbo, qwen-max'
    },
    siliconflow: {
      name: '硅基流动',
      baseUrl: 'https://api.siliconflow.cn/v1',
      modelPlaceholder: 'deepseek-ai/DeepSeek-V3',
      modelTip: '推荐模型: deepseek-ai/DeepSeek-V3, Qwen/Qwen2.5-72B-Instruct'
    },
    custom: {
      name: '自定义',
      baseUrl: '',
      modelPlaceholder: 'model-name',
      modelTip: '填写你的自定义API地址和模型名称'
    }
  }

  const handleProviderChange = (newProvider: typeof provider) => {
    setProvider(newProvider)
    const config = providerConfigs[newProvider]
    setApiBaseUrl(config.baseUrl)
    if (newProvider !== 'custom') {
      setModelName(config.modelPlaceholder)
    }
  }
  const [showSettings, setShowSettings] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigateRef = useRef(useNavigate())

  // 初始化欢迎消息，并记录对话统计
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

    // 记录对话次数和话题
    if (topicId) {
      addConversation(topicId)
    } else {
      addConversation()
    }
  }, [topic, topicId])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 练习时长计时器
  useEffect(() => {
    let startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 60000)
      if (elapsed >= 1) {
        addPracticeTime(1)
        startTime = Date.now()
      }
    }, 60000)

    return () => {
      clearInterval(interval)
      const totalMinutes = Math.floor((Date.now() - startTime) / 60000)
      if (totalMinutes >= 1) {
        addPracticeTime(totalMinutes)
      }
    }
  }, [])

  // 预加载语音列表
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        setAvailableVoices(voices)
      }
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

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
    addMessage(1) // 统计用户消息

    // 获取上一条AI消息作为上下文
    const prevAiMessage = messages.slice().reverse().find(m => m.role === 'assistant')
    const contextText = prevAiMessage?.content || ''

    try {
      // 并行调用AI对话API和语法检查API
      const [{ response, corrections, suggestions }, { grammarResult, polishResult }] = await Promise.all([
        apiKey
          ? callAIAPI(userMessage.content, topic?.titleEn || '', apiKey, apiBaseUrl, modelName)
          : mockAIResponse(userMessage.content, topic?.title || ''),
        apiKey
          ? callGrammarAPI(userMessage.content, contextText, apiKey, apiBaseUrl, modelName).catch(() =>
              mockGrammarCheck(userMessage.content, contextText)
            )
          : mockGrammarCheck(userMessage.content, contextText)
      ])

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        showContent: false, // 默认隐藏AI回复内容
      }
      addMessage(1) // 统计AI消息

      // 更新用户消息的纠正信息和语法检查结果
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id
          ? { ...msg, corrections, suggestions, grammarResult, polishResult }
          : msg
      ))

      setMessages(prev => [...prev, aiMessage])

      // 如果开启了自动语音播放，播放AI回复
      if (autoPlayResponse) {
        setTimeout(() => {
          handlePlayAudio(response, aiMessage.id)
        }, 300)
      }
    } catch (error) {
      console.error('Error handling send:', error)
      // 失败时使用模拟响应
      const { response, corrections, suggestions } = mockAIResponse(userMessage.content, topic?.title || '')
      const { grammarResult, polishResult } = mockGrammarCheck(userMessage.content, contextText)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        showContent: false,
      }

      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id
          ? { ...msg, corrections, suggestions, grammarResult, polishResult }
          : msg
      ))

      setMessages(prev => [...prev, aiMessage])

      // API失败时也自动播放
      if (autoPlayResponse) {
        setTimeout(() => {
          handlePlayAudio(response, aiMessage.id)
        }, 300)
      }
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

  // 清理文本中的emoji和markdown标记，确保TTS朗读内容与显示一致
  const cleanTextForTTS = (text: string): string => {
    return text
      // 移除emoji
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/[\u{1F018}-\u{1F270}]/gu, '')
      .replace(/[\u{238C}-\u{2454}]/gu, '')
      .replace(/[\u{20D0}-\u{20FF}]/gu, '')
      .replace(/[\u{FE30}-\u{FE4F}]/gu, '')
      // 移除markdown标记
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/__/g, '')
      .replace(/_/g, '')
      .replace(/`{1,3}/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/>\s/g, '')
      .replace(/-{3,}/g, '')
      // 清理多余空白
      .replace(/\n{2,}/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }

  const handlePlayAudio = useCallback((text: string, messageId: string) => {
    // 使用Web Speech API播放音频
    if ('speechSynthesis' in window) {
      // 如果正在播放同一条消息，停止播放
      if (playingMessageId === messageId) {
        window.speechSynthesis.cancel()
        setPlayingMessageId(null)
        return
      }

      // 如果正在播放其他消息，先停止
      if (playingMessageId) {
        window.speechSynthesis.cancel()
      }

      const cleanText = cleanTextForTTS(text)
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = 'en-US'
      utterance.rate = 0.9

      // 设置语音音色
      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices()
      if (voiceType !== 'default' && voices.length > 0) {
        let selectedVoice = voices.find(voice =>
          voice.name.toLowerCase().includes(voiceType) ||
          voice.voiceURI.toLowerCase().includes(voiceType)
        )
        // 如果找不到精确匹配，回退到第一个英文语音
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0]
        }
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }

      utterance.onend = () => {
        setPlayingMessageId(null)
      }

      utterance.onerror = () => {
        setPlayingMessageId(null)
      }

      window.speechSynthesis.cancel() // 先取消任何正在播放的语音
      window.speechSynthesis.speak(utterance)
      setPlayingMessageId(messageId)
    }
  }, [playingMessageId, voiceType])

  const toggleRecording = () => {
    if (!isRecording) {
      // 检查浏览器是否支持语音识别
      if (!speechRecognition.isSupported()) {
        // 浏览器不支持语音识别
        setIsRecording(true)
        setTimeout(() => {
          setIsRecording(false)
          setInputText('')
        }, 1000)
        return
      }

      setIsRecording(true)
      setInputText('')
      speechRecognition.reset()

      // 设置语音识别回调
      speechRecognition.setCallbacks({
        onStart: () => {
          console.log('语音识别已启动')
        },
        onInterimResult: (transcript: string) => {
          // 实时显示正在识别的文字
          setInputText(transcript)
        },
        onFinalResult: (transcript: string) => {
          // 更新输入框显示最终识别结果
          setInputText(transcript)
        },
        onError: (error: string) => {
          console.error('语音识别错误:', error)
          setIsRecording(false)
          setInputText('')
        },
        onEnd: async () => {
          const finalTranscript = speechRecognition.getFinalTranscript()

          // 录音结束时，如果有识别出的文字，自动发送
          if (finalTranscript.trim()) {
            const userMessage: Message = {
              id: Date.now().toString(),
              role: 'user',
              content: finalTranscript.trim(),
              timestamp: Date.now(),
            }
            setMessages(prev => [...prev, userMessage])
            setInputText('')

            // 获取上一条AI消息作为上下文
            const prevAiMessage = messages.slice().reverse().find(m => m.role === 'assistant')
            const contextText = prevAiMessage?.content || ''

            // 自动发送AI回复
            setIsLoading(true)
            try {
              // 并行调用AI大模型API和语法检查API
              const [{ response, corrections, suggestions }, { grammarResult, polishResult }] = await Promise.all([
                apiKey
                  ? callAIAPI(finalTranscript.trim(), topic?.titleEn || '', apiKey, apiBaseUrl, modelName)
                  : mockAIResponse(finalTranscript.trim(), topic?.titleEn || ''),
                apiKey
                  ? callGrammarAPI(finalTranscript.trim(), contextText, apiKey, apiBaseUrl, modelName).catch(() =>
                      mockGrammarCheck(finalTranscript.trim(), contextText)
                    )
                  : mockGrammarCheck(finalTranscript.trim(), contextText)
              ])

              const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: Date.now(),
                showContent: false,
              }

              setMessages(prev => prev.map(msg =>
                msg.id === userMessage.id
                  ? { ...msg, corrections, suggestions, grammarResult, polishResult }
                  : msg
              ))

              setMessages(prev => [...prev, aiMessage])

              // 自动语音播放AI回复
              if (autoPlayResponse) {
                setTimeout(() => {
                  handlePlayAudio(response, aiMessage.id)
                }, 300)
              }
            } catch (error) {
              console.error('API调用失败:', error)
              // 失败时使用备用响应
              const { response, corrections, suggestions } = mockAIResponse(finalTranscript.trim(), topic?.titleEn || '')
              const { grammarResult, polishResult } = mockGrammarCheck(finalTranscript.trim(), contextText)

              const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: Date.now(),
                showContent: false,
              }

              setMessages(prev => prev.map(msg =>
                msg.id === userMessage.id
                  ? { ...msg, corrections, suggestions, grammarResult, polishResult }
                  : msg
              ))

              setMessages(prev => [...prev, aiMessage])

              // 自动语音播放
              if (autoPlayResponse) {
                setTimeout(() => {
                  handlePlayAudio(response, aiMessage.id)
                }, 300)
              }
            } finally {
              setIsLoading(false)
            }
          } else {
            setInputText('')
          }
          setIsRecording(false)
        }
      })

      // 启动语音识别
      const started = speechRecognition.start({
        lang: 'en-US',
        continuous: true,
        interimResults: true
      })

      if (!started) {
        setIsRecording(false)
      }
    } else {
      // 停止录音
      speechRecognition.stop()
      setIsRecording(false)
    }
  }

  const clearChat = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: topic 
        ? `你好！我是你的英语口语练习伙伴。今天我们来练习“${topic.title}”这个话题。${topic.description}。你可以随时开始对话，我会帮你纠正语法错误并给出改进建议。`
        : '你好！我是你的英语口语练习伙伴。我们可以自由对话，我会帮你纠正语法错误并给出改进建议。你想聊些什么呢？',
      timestamp: Date.now(),
    }
    setMessages([welcomeMessage])
  }
  
  // 处理返回按钮点击
  const handleBack = () => {
    // 只有当对话有实际内容（除了欢迎消息外还有消息）时才询问
    const realMessages = messages.filter(m => m.id !== 'welcome')
    if (realMessages.length > 0) {
      setShowSaveDialog(true)
    } else {
      navigate(-1)
    }
  }
  
  // 保存并退出
  const handleSaveAndExit = () => {
    const topicIdStr = topicId || 'free-chat'
    const topicName = topic?.title || '自由对话'
    const topicNameEn = topic?.titleEn || 'Free Chat'
      
    const history = createConversationHistory(
      topicIdStr,
      topicName,
      topicNameEn,
      messages
    )
      
    saveConversation(history)
    navigate(-1)
  }
  
  // 不保存退出
  const handleExitWithoutSave = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
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
          <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="设置"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            onPlayAudio={handlePlayAudio}
            onShowEvaluation={(msg) => {
              setSelectedMessage(msg)
              // 找到上一条AI消息作为上下文
              const prevMessages = messages.slice(0, index)
              const ctxMsg = prevMessages.slice().reverse().find(m => m.role === 'assistant') || null
              setEvalContext(ctxMsg)
            }}
            onToggleShowContent={(messageId) => {
              setMessages(prev => prev.map(msg =>
                msg.id === messageId
                  ? { ...msg, showContent: msg.showContent === false ? true : false }
                  : msg
              ))
            }}
            playingMessageId={playingMessageId}
            apiKey={apiKey}
            apiBaseUrl={apiBaseUrl}
            modelName={modelName}
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

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-t border-gray-100 p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">设置</h3>
            <button 
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* AI服务商选择 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择AI服务商
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(providerConfigs) as [typeof provider, typeof providerConfigs[typeof provider]][]).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleProviderChange(key)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    provider === key
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {config.name}
                </button>
              ))}
            </div>
          </div>

          {/* AI API配置 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`输入${providerConfigs[provider].name}的API Key`}
              className="w-full bg-gray-100 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all mb-2"
            />
            {provider === 'custom' && (
              <input
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="API Base URL，如 https://api.example.com/v1"
                className="w-full bg-gray-100 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all mb-2"
              />
            )}
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder={providerConfigs[provider].modelPlaceholder}
              className="w-full bg-gray-100 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              {providerConfigs[provider].modelTip}
            </p>
            <div className={`mt-2 p-2 rounded-lg text-xs ${apiKey ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
              {apiKey
                ? `✓ 已配置${providerConfigs[provider].name}，将调用真实AI模型`
                : `⚠ 未配置API Key，当前使用本地模拟回复。要接入真实AI，请输入${providerConfigs[provider].name}的API Key`}
            </div>
          </div>

          {/* 自动语音播放 */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                AI回复自动语音播放
              </label>
              <button
                onClick={() => setAutoPlayResponse(!autoPlayResponse)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoPlayResponse ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    autoPlayResponse ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {autoPlayResponse ? 'AI回复后会自动朗读' : '需手动点击播放按钮'}
            </p>
          </div>

          {/* Voice Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              语音音色
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'default', label: '默认' },
                { value: 'samantha', label: 'Samantha' },
                { value: 'jenny', label: 'Jenny' },
                { value: 'alex', label: 'Alex' },
                { value: 'matt', label: 'Matt' },
                { value: 'nina', label: 'Nina' },
              ].map((voice) => (
                <button
                  key={voice.value}
                  onClick={() => setVoiceType(voice.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    voiceType === voice.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {voice.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 safe-area-bottom">
        {isRecording ? (
          // 录音模式 - 类似微信
          <div className="flex items-center justify-center gap-8 animate-fade-in">
            <button
              onClick={() => {
                speechRecognition.abort()
                setIsRecording(false)
                setInputText('')
              }}
              className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              title="取消"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse shadow-lg shadow-red-200">
                <div className="w-6 h-6 rounded-full bg-white animate-ping opacity-50" />
                <Mic className="absolute w-7 h-7 text-white" />
              </div>
              <span className="text-sm text-red-500 font-medium animate-pulse max-w-[200px] truncate">
                {inputText || 'Listening...'}
              </span>
            </div>

            <button
              onClick={() => {
                // 停止录音并立即发送当前识别内容
                speechRecognition.stop()
                const finalTranscript = speechRecognition.getFinalTranscript() || inputText
                if (finalTranscript.trim()) {
                  // 创建用户消息并直接发送
                  const userMessage: Message = {
                    id: Date.now().toString(),
                    role: 'user',
                    content: finalTranscript.trim(),
                    timestamp: Date.now(),
                  }
                  setMessages(prev => [...prev, userMessage])
                  setInputText('')

                  // 获取上一条AI消息作为上下文
                  const prevAiMessage = messages.slice().reverse().find(m => m.role === 'assistant')
                  const contextText = prevAiMessage?.content || ''

                  // 自动发送AI回复
                  setIsLoading(true)
                  const sendAIResponse = async () => {
                    try {
                      const [{ response, corrections, suggestions }, { grammarResult, polishResult }] = await Promise.all([
                        apiKey
                          ? callAIAPI(finalTranscript.trim(), topic?.titleEn || '', apiKey, apiBaseUrl, modelName)
                          : mockAIResponse(finalTranscript.trim(), topic?.titleEn || ''),
                        apiKey
                          ? callGrammarAPI(finalTranscript.trim(), contextText, apiKey, apiBaseUrl, modelName).catch(() =>
                              mockGrammarCheck(finalTranscript.trim(), contextText)
                            )
                          : mockGrammarCheck(finalTranscript.trim(), contextText)
                      ])

                      const aiMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: response,
                        timestamp: Date.now(),
                        showContent: false,
                      }

                      setMessages(prev => prev.map(msg =>
                        msg.id === userMessage.id
                          ? { ...msg, corrections, suggestions, grammarResult, polishResult }
                          : msg
                      ))

                      setMessages(prev => [...prev, aiMessage])

                      if (autoPlayResponse) {
                        setTimeout(() => {
                          handlePlayAudio(response, aiMessage.id)
                        }, 300)
                      }
                    } catch (error) {
                      console.error('API调用失败:', error)
                      const { response, corrections, suggestions } = mockAIResponse(finalTranscript.trim(), topic?.titleEn || '')
                      const { grammarResult, polishResult } = mockGrammarCheck(finalTranscript.trim(), contextText)

                      const aiMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: response,
                        timestamp: Date.now(),
                        showContent: false,
                      }

                      setMessages(prev => prev.map(msg =>
                        msg.id === userMessage.id
                          ? { ...msg, corrections, suggestions, grammarResult, polishResult }
                          : msg
                      ))

                      setMessages(prev => [...prev, aiMessage])

                      if (autoPlayResponse) {
                        setTimeout(() => {
                          handlePlayAudio(response, aiMessage.id)
                        }, 300)
                      }
                    } finally {
                      setIsLoading(false)
                      setIsRecording(false)
                    }
                  }
                  sendAIResponse()
                } else {
                  setIsRecording(false)
                  setInputText('')
                }
              }}
              disabled={!inputText.trim()}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                inputText.trim()
                  ? 'bg-primary-500 hover:bg-primary-600 shadow-primary-200'
                  : 'bg-gray-300 shadow-gray-200'
              }`}
              title="发送"
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

      {/* Evaluation Panel */}
      {selectedMessage && (
        <EvaluationPanel
          message={selectedMessage}
          contextMessage={evalContext}
          onClose={() => {
            setSelectedMessage(null)
            setEvalContext(null)
          }}
          apiKey={apiKey}
          apiBaseUrl={apiBaseUrl}
          modelName={modelName}
          onPlayAudio={handlePlayAudio}
        />
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Save className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">保存对话？</h3>
                <p className="text-sm text-gray-500">是否保存本次对话记录？</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{topic?.title || '自由对话'}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{messages.length} 条消息</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Math.round((messages[messages.length - 1]?.timestamp - messages[0]?.timestamp) / 60000)} 分钟</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExitWithoutSave}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                不保存
              </button>
              <button
                onClick={handleSaveAndExit}
                className="flex-1 py-3 px-4 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
              >
                保存并退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


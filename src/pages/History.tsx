import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  Trash2,
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Sparkles,
  X,
  Volume2,
  Languages
} from 'lucide-react'
import {
  getConversationHistory,
  deleteConversationHistory,
  clearAllConversationHistory
} from '../utils/conversationHistory'
import type { ConversationHistory } from '../types'

export default function History() {
  const navigate = useNavigate()
  const [histories, setHistories] = useState<ConversationHistory[]>([])
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [evalContext, setEvalContext] = useState<any>(null)

  useEffect(() => {
    loadHistories()
  }, [])

  const loadHistories = () => {
    const data = getConversationHistory()
    setHistories(data)
  }

  const handleDelete = (id: string) => {
    deleteConversationHistory(id)
    loadHistories()
  }

  const handleClearAll = () => {
    clearAllConversationHistory()
    setHistories([])
    setShowConfirmClear(false)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">历史对话</h1>
          </div>
          {histories.length > 0 && (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="text-sm text-red-500 font-medium hover:text-red-600 transition-colors"
            >
              清空
            </button>
          )}
        </div>
      </header>

      <div className="px-4 pb-6">
        {histories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium mb-2">暂无历史对话</p>
            <p className="text-sm text-gray-400">开始你的第一次对话练习吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {histories.map((history) => {
              const isExpanded = expandedId === history.id
              
              return (
                <div
                  key={history.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {history.topicName}
                        </h3>
                        <p className="text-xs text-gray-500">{history.topicNameEn}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(history.id)}
                        className="p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(history.startedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTime(history.startedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{history.messageCount} 条消息</span>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : history.id)}
                      className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600 font-medium"
                    >
                      {isExpanded ? '收起对话' : '查看对话内容'}
                      <svg 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                      {history.messages.filter(m => m.id !== 'welcome').map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === 'user' 
                              ? 'bg-primary-500' 
                              : 'bg-gradient-to-br from-accent-400 to-accent-500'
                          }`}>
                            <span className="text-white text-xs font-medium">
                              {message.role === 'user' ? '我' : 'AI'}
                            </span>
                          </div>

                          {/* Message Bubble */}
                          <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            <div className={`px-3 py-2 rounded-2xl ${
                              message.role === 'user'
                                ? 'bg-primary-500 text-white rounded-br-md'
                                : 'bg-white border border-gray-200 rounded-bl-md'
                            }`}>
                              <p className={`text-sm leading-relaxed ${
                                message.role === 'user' ? 'text-white' : 'text-gray-800'
                              }`}>
                                {message.content}
                              </p>
                            </div>
                            
                            {/* Actions for user messages */}
                            {message.role === 'user' && (message.grammarResult || message.corrections) && (
                              <button
                                onClick={() => {
                                  // Find the previous AI message as context
                                  const msgIndex = history.messages.findIndex(m => m.id === message.id)
                                  const contextMsg = history.messages.slice(0, msgIndex).reverse().find(m => m.role === 'assistant') || null
                                  setSelectedMessage(message)
                                  setEvalContext(contextMsg)
                                }}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 transition-colors px-1"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>查看评估</span>
                              </button>
                            )}
                            
                            <span className="text-xs text-gray-400 px-1">
                              {new Date(message.timestamp).toLocaleTimeString('zh-CN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirm Clear Dialog */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">清空历史？</h3>
                <p className="text-sm text-gray-500">将删除所有历史对话记录</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Panel */}
      {selectedMessage && (
        <EvaluationPanel
          message={selectedMessage}
          contextMessage={evalContext}
          onClose={() => {
            setSelectedMessage(null)
            setEvalContext(null)
          }}
        />
      )}
    </div>
  )
}

// Evaluation Panel Component
function EvaluationPanel({
  message,
  contextMessage,
  onClose
}: {
  message: any
  contextMessage: any
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<'grammar' | 'polish'>('grammar')
  const [polishStyle, setPolishStyle] = useState<'casual' | 'formal'>('casual')

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
                {grammarResult?.errors.map((error: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{error}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Old corrections compatibility */}
            {message.corrections && message.corrections.length > 0 && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                {message.corrections.map((correction: any, index: number) => (
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

              {/* Explanation */}
              {polishResult.explanation && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">润色思路：</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{polishResult.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

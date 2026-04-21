import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Mic, 
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Volume2,
  ChevronRight,
  Star,
  TrendingUp,
  Award
} from 'lucide-react'
import { speechRecognition } from '../utils/speechRecognition'
import type { GrammarCorrection } from '../types'

interface PracticeSentence {
  id: string
  english: string
  chinese: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const practiceSentences: PracticeSentence[] = [
  {
    id: '1',
    english: 'The early bird catches the worm.',
    chinese: '早起的鸟儿有虫吃。',
    difficulty: 'easy'
  },
  {
    id: '2',
    english: 'Actions speak louder than words.',
    chinese: '行动胜于言辞。',
    difficulty: 'easy'
  },
  {
    id: '3',
    english: 'Where there is a will, there is a way.',
    chinese: '有志者事竟成。',
    difficulty: 'medium'
  },
  {
    id: '4',
    english: 'The only way to do great work is to love what you do.',
    chinese: '做伟大工作的唯一方法就是热爱你所做的事情。',
    difficulty: 'medium'
  },
  {
    id: '5',
    english: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    chinese: '成功不是终点，失败也不是致命的：重要的是继续前进的勇气。',
    difficulty: 'hard'
  }
]

// 模拟语法分析
const analyzeSentence = (spoken: string, original: string): { 
  score: number
  corrections: GrammarCorrection[]
  suggestions: string[]
  accuracy: number
  fluency: number
  completeness: number
} => {
  const corrections: GrammarCorrection[] = []
  const suggestions: string[] = []
  
  // 简单的模拟分析
  if (spoken !== original) {
    corrections.push({
      original: spoken,
      corrected: original,
      explanation: '建议按照原文准确朗读',
      type: 'pronunciation'
    })
  }
  
  if (spoken.split(' ').length < original.split(' ').length * 0.8) {
    suggestions.push('尝试完整地读出整个句子')
  }
  
  suggestions.push('注意语调和停顿')
  suggestions.push('练习连读技巧')
  
  return {
    score: Math.floor(Math.random() * 20) + 75,
    corrections,
    suggestions,
    accuracy: Math.floor(Math.random() * 15) + 80,
    fluency: Math.floor(Math.random() * 20) + 75,
    completeness: Math.floor(Math.random() * 10) + 85
  }
}

export default function Correction() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [recognizedText, setRecognizedText] = useState('')
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof analyzeSentence> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const currentSentence = practiceSentences[currentIndex]

  const handlePlayAudio = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // 如果正在播放，先停止
      if (isPlaying) {
        window.speechSynthesis.cancel()
        setIsPlaying(false)
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      setIsPlaying(true)
      window.speechSynthesis.speak(utterance)
    }
  }, [isPlaying])

  const performAnalysis = useCallback((spoken: string) => {
    const result = analyzeSentence(spoken, currentSentence.english)
    setAnalysisResult(result)
    setShowAnalysis(true)
    setHasRecorded(true)
    setIsRecording(false)
  }, [currentSentence])

  const toggleRecording = () => {
    if (!isRecording) {
      // 检查浏览器是否支持语音识别
      if (!speechRecognition.isSupported()) {
        // 浏览器不支持，使用模拟模式
        setIsRecording(true)
        setHasRecorded(false)
        setAnalysisResult(null)
        setShowAnalysis(false)
        setRecognizedText('')

        setTimeout(() => {
          const mockSpoken = currentSentence.english
          setRecognizedText(mockSpoken)
          performAnalysis(mockSpoken)
        }, 3000)
        return
      }

      setIsRecording(true)
      setHasRecorded(false)
      setAnalysisResult(null)
      setShowAnalysis(false)
      setRecognizedText('')
      speechRecognition.reset()

      // 设置语音识别回调
      speechRecognition.setCallbacks({
        onStart: () => {
          console.log('语音识别已启动')
        },
        onInterimResult: (transcript: string) => {
          setRecognizedText(transcript)
        },
        onFinalResult: (transcript: string) => {
          setRecognizedText(transcript)
        },
        onError: (error: string) => {
          console.error('语音识别错误:', error)
          setIsRecording(false)
        },
        onEnd: () => {
          const finalTranscript = speechRecognition.getFinalTranscript()
          if (finalTranscript.trim()) {
            setRecognizedText(finalTranscript)
            performAnalysis(finalTranscript)
          } else {
            setIsRecording(false)
          }
        }
      })

      // 启动语音识别
      const started = speechRecognition.start({
        lang: 'en-US',
        continuous: false,
        interimResults: true
      })

      if (!started) {
        setIsRecording(false)
      }
    } else {
      // 停止录音
      speechRecognition.stop()
      const finalTranscript = speechRecognition.getFinalTranscript()
      if (finalTranscript.trim()) {
        setRecognizedText(finalTranscript)
        performAnalysis(finalTranscript)
      } else {
        setIsRecording(false)
      }
    }
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % practiceSentences.length)
    setHasRecorded(false)
    setRecognizedText('')
    setAnalysisResult(null)
    setShowAnalysis(false)
  }

  const handleRetry = () => {
    setHasRecorded(false)
    setRecognizedText('')
    setAnalysisResult(null)
    setShowAnalysis(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'hard': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单'
      case 'medium': return '中等'
      case 'hard': return '困难'
      default: return ''
    }
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
            <div>
              <h1 className="font-bold text-gray-900">每日晨读</h1>
              <p className="text-xs text-gray-500">Daily Reading Practice</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {practiceSentences.length}
            </span>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Progress Bar */}
        <div className="flex gap-1">
          {practiceSentences.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                index <= currentIndex ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Sentence Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentSentence.difficulty)}`}>
              {getDifficultyText(currentSentence.difficulty)}
            </span>
            <button
              onClick={() => handlePlayAudio(currentSentence.english)}
              disabled={isPlaying}
              className="p-2 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-primary-600" />
              ) : (
                <Volume2 className="w-5 h-5 text-primary-600" />
              )}
            </button>
          </div>

          <div className="text-center py-8">
            <p className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
              {currentSentence.english}
            </p>
            <p className="text-gray-500 text-lg">
              {currentSentence.chinese}
            </p>
          </div>

          {/* Recording Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={toggleRecording}
              disabled={hasRecorded}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording
                  ? 'bg-red-500 shadow-lg shadow-red-200'
                  : hasRecorded
                  ? 'bg-green-500'
                  : 'bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-200'
              }`}
            >
              {isRecording ? (
                <div className="flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
                  <Mic className="w-8 h-8 text-white" />
                </div>
              ) : hasRecorded ? (
                <CheckCircle2 className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
          </div>

          {/* 实时识别文本显示 */}
          {isRecording && recognizedText && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                <span className="text-xs text-gray-400 block mb-1">识别中...</span>
                {recognizedText}
              </p>
            </div>
          )}

          {/* 最终识别文本显示 */}
          {hasRecorded && recognizedText && (
            <div className="mt-4 p-3 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-700 text-center">
                <span className="text-xs text-green-600 block mb-1">你的朗读</span>
                {recognizedText}
              </p>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            {isRecording ? '正在聆听...' : hasRecorded ? '朗读完成' : '点击麦克风开始朗读'}
          </p>
        </div>

        {/* Analysis Result */}
        {showAnalysis && analysisResult && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{analysisResult.score}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">评分结果</h3>
                  <p className="text-sm text-gray-500">综合得分</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(analysisResult.score / 20)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="w-4 h-4 text-primary-500" />
                  <span className="text-lg font-bold text-gray-900">{analysisResult.accuracy}</span>
                </div>
                <p className="text-xs text-gray-500">准确度</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-accent-500" />
                  <span className="text-lg font-bold text-gray-900">{analysisResult.fluency}</span>
                </div>
                <p className="text-xs text-gray-500">流利度</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-lg font-bold text-gray-900">{analysisResult.completeness}</span>
                </div>
                <p className="text-xs text-gray-500">完整度</p>
              </div>
            </div>

            {/* Corrections */}
            {analysisResult.corrections.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <h4 className="font-semibold text-gray-900">需要改进</h4>
                </div>
                <div className="space-y-2">
                  {analysisResult.corrections.map((correction, index) => (
                    <div key={index} className="bg-orange-50 rounded-xl p-3">
                      <p className="text-sm text-gray-700">
                        <span className="text-orange-600 font-medium">{correction.original}</span>
                        {' → '}
                        <span className="text-green-600 font-medium">{correction.corrected}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{correction.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h4 className="font-semibold text-gray-900">改进建议</h4>
              </div>
              <ul className="space-y-2">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {hasRecorded && (
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              重新练习
            </button>
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
            >
              下一句
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

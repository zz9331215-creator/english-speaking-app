import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Volume2,
  Mic,
  MicOff,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat1,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { getShadowingItemById } from '../data/shadowing'
import { speechRecognition } from '../utils/speechRecognition'
import { addPracticeTime } from '../utils/userStats'

export default function ShadowingPractice() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const item = getShadowingItemById(id || '')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recognizedText, setRecognizedText] = useState('')
  const [readSentences, setReadSentences] = useState<Set<number>>(new Set())
  const [showTranslation, setShowTranslation] = useState(false)
  const [loopMode, setLoopMode] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const sentences = item?.sentences || []
  const currentSentence = sentences[currentIndex]

  // 练习时长计时
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
      if (totalMinutes >= 1) addPracticeTime(totalMinutes)
    }
  }, [])

  // 播放当前句子
  const playCurrent = useCallback(() => {
    if (!currentSentence || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(currentSentence.english)
    utterance.lang = 'en-US'
    utterance.rate = playbackRate
    utterance.onend = () => {
      setIsPlaying(false)
      if (loopMode) {
        setTimeout(() => playCurrent(), 500)
      }
    }
    utterance.onerror = () => setIsPlaying(false)
    utteranceRef.current = utterance
    setIsPlaying(true)
    window.speechSynthesis.speak(utterance)
  }, [currentSentence, loopMode, playbackRate])

  // 停止播放
  const stopPlaying = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }

  // 切换播放/暂停
  const togglePlay = () => {
    if (isPlaying) {
      stopPlaying()
    } else {
      playCurrent()
    }
  }

  // 上一句
  const prevSentence = () => {
    stopPlaying()
    setCurrentIndex((prev) => {
      const next = prev > 0 ? prev - 1 : sentences.length - 1
      return next
    })
  }

  // 下一句
  const nextSentence = () => {
    stopPlaying()
    setCurrentIndex((prev) => {
      const next = prev < sentences.length - 1 ? prev + 1 : 0
      return next
    })
  }

  // 跳转到指定句子
  const goToSentence = (index: number) => {
    stopPlaying()
    setCurrentIndex(index)
  }

  // 语音识别跟读
  const toggleRecording = () => {
    if (!isRecording) {
      if (!speechRecognition.isSupported()) {
        // 模拟模式
        setIsRecording(true)
        setRecognizedText('')
        setTimeout(() => {
          const mock = currentSentence?.english || ''
          setRecognizedText(mock)
          setIsRecording(false)
          setReadSentences((prev) => new Set(prev).add(currentIndex))
        }, 2000)
        return
      }

      setIsRecording(true)
      setRecognizedText('')
      speechRecognition.reset()
      speechRecognition.setCallbacks({
        onStart: () => {},
        onInterimResult: (text: string) => setRecognizedText(text),
        onFinalResult: (text: string) => {
          setRecognizedText(text)
        },
        onError: () => setIsRecording(false),
        onEnd: () => {
          const final = speechRecognition.getFinalTranscript()
          if (final.trim()) {
            setRecognizedText(final)
            setReadSentences((prev) => new Set(prev).add(currentIndex))
          }
          setIsRecording(false)
        },
      })
      speechRecognition.start({ lang: 'en-US', continuous: false, interimResults: true })
    } else {
      speechRecognition.stop()
      const final = speechRecognition.getFinalTranscript()
      if (final.trim()) {
        setRecognizedText(final)
        setReadSentences((prev) => new Set(prev).add(currentIndex))
      }
      setIsRecording(false)
    }
  }

  // 播放用户录音（通过TTS回放识别的文本）
  const playUserRecording = () => {
    if (!recognizedText || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(recognizedText)
    utterance.lang = 'en-US'
    utterance.rate = playbackRate
    window.speechSynthesis.speak(utterance)
  }

  // 自动滚动当前句子到视野
  useEffect(() => {
    const el = document.getElementById(`sentence-${currentIndex}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentIndex])

  // 切换倍速
  const cyclePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25]
    const idx = rates.indexOf(playbackRate)
    setPlaybackRate(rates[(idx + 1) % rates.length])
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">内容未找到</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              <h1 className="font-bold text-gray-900">{item.title}</h1>
              <p className="text-xs text-gray-500">{item.titleEn}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white px-4 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {sentences.length}
          </span>
          <span className="text-sm text-primary-600 font-medium">
            已读 {readSentences.size}/{sentences.length}
          </span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Current Sentence Display */}
        <div className="p-6 text-center">
          <p className="text-2xl font-bold text-gray-900 leading-relaxed mb-4">
            {currentSentence.english}
          </p>
          {showTranslation && (
            <p className="text-base text-gray-500">{currentSentence.chinese}</p>
          )}
        </div>

        {/* Controls */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-6">
            {/* AI Play */}
            <button
              onClick={isPlaying ? stopPlaying : playCurrent}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isPlaying ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                <Volume2 className={`w-5 h-5 ${isPlaying ? 'text-primary-600' : 'text-gray-600'}`} />
              </div>
              <span className="text-xs text-gray-500">AI</span>
            </button>

            {/* Record */}
            <button
              onClick={toggleRecording}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 shadow-lg shadow-red-200'
                  : 'bg-primary-500 shadow-lg shadow-primary-200'
              }`}>
                {isRecording ? (
                  <MicOff className="w-7 h-7 text-white" />
                ) : (
                  <Mic className="w-7 h-7 text-white" />
                )}
              </div>
              <span className="text-xs text-gray-500">{isRecording ? '停止' : '跟读'}</span>
            </button>

            {/* User Play */}
            <button
              onClick={playUserRecording}
              disabled={!recognizedText}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                recognizedText ? 'bg-gray-100' : 'bg-gray-50'
              }`}>
                <Volume2 className={`w-5 h-5 ${recognizedText ? 'text-gray-600' : 'text-gray-300'}`} />
              </div>
              <span className="text-xs text-gray-500">我的</span>
            </button>
          </div>

          {/* Recognized Text */}
          {recognizedText && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-700 text-center">
                <span className="text-xs text-blue-600 block mb-1">你的朗读</span>
                {recognizedText}
              </p>
            </div>
          )}

          {isRecording && !recognizedText && (
            <div className="mt-4 p-3 bg-red-50 rounded-xl">
              <p className="text-sm text-red-600 text-center animate-pulse">正在聆听，请朗读...</p>
            </div>
          )}
        </div>

        {/* Sentence List */}
        <div ref={listRef} className="px-4 pb-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {sentences.map((sentence, idx) => {
              const isCurrent = idx === currentIndex
              const isRead = readSentences.has(idx)
              return (
                <button
                  key={idx}
                  id={`sentence-${idx}`}
                  onClick={() => goToSentence(idx)}
                  className={`w-full text-left p-4 flex items-start gap-3 transition-all ${
                    isCurrent ? 'bg-primary-50' : 'hover:bg-gray-50'
                  } ${idx !== sentences.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isRead ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${isCurrent ? 'font-semibold text-primary-700' : 'text-gray-700'}`}>
                      {sentence.english}
                    </p>
                    {showTranslation && (
                      <p className="text-xs text-gray-400 mt-1">{sentence.chinese}</p>
                    )}
                  </div>
                  {isCurrent && (
                    <div className="flex-shrink-0">
                      <Volume2 className="w-4 h-4 text-primary-500" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
        {/* Playback Rate & Translation */}
        <div className="flex items-center justify-center gap-6 mb-3">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
              showTranslation ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            译文
          </button>
          <button
            onClick={cyclePlaybackRate}
            className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600"
          >
            {playbackRate}x
          </button>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setLoopMode(!loopMode)}
            className={`p-2 rounded-full transition-colors ${
              loopMode ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Repeat1 className="w-5 h-5" />
          </button>
          <button
            onClick={prevSentence}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-200 hover:bg-primary-600 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>
          <button
            onClick={nextSentence}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`p-2 rounded-full transition-colors ${
              showTranslation ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-xs font-bold">译</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Web Speech API 语音识别封装
 * 提供统一的语音识别接口，处理浏览器兼容性和状态管理
 */

export interface SpeechRecognitionResult {
  transcript: string
  isFinal: boolean
  confidence: number
}

export interface SpeechRecognitionCallbacks {
  onInterimResult?: (transcript: string) => void
  onFinalResult?: (transcript: string) => void
  onError?: (error: string) => void
  onEnd?: () => void
  onStart?: () => void
}

class SpeechRecognitionService {
  private recognition: any = null
  private isListening: boolean = false
  private callbacks: SpeechRecognitionCallbacks = {}
  private finalTranscript: string = ''
  private interimTranscript: string = ''

  /**
   * 检查浏览器是否支持语音识别（静态方法）
   */
  static isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  }

  /**
   * 检查浏览器是否支持语音识别（实例方法）
   */
  isSupported(): boolean {
    return SpeechRecognitionService.isSupported()
  }

  /**
   * 获取 SpeechRecognition 构造函数
   */
  private getRecognitionConstructor(): any {
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  }

  /**
   * 设置回调函数
   */
  setCallbacks(callbacks: SpeechRecognitionCallbacks): void {
    this.callbacks = callbacks
  }

  /**
   * 开始语音识别
   */
  start(options: { lang?: string; continuous?: boolean; interimResults?: boolean } = {}): boolean {
    if (this.isListening) {
      console.warn('语音识别已经在运行中')
      return false
    }

    const SpeechRecognitionConstructor = this.getRecognitionConstructor()
    if (!SpeechRecognitionConstructor) {
      this.callbacks.onError?.('当前浏览器不支持语音识别')
      return false
    }

    try {
      this.recognition = new SpeechRecognitionConstructor()
      this.recognition.lang = options.lang || 'en-US'
      this.recognition.continuous = options.continuous ?? true
      this.recognition.interimResults = options.interimResults ?? true
      this.recognition.maxAlternatives = 1

      this.finalTranscript = ''
      this.interimTranscript = ''

      this.recognition.onstart = () => {
        this.isListening = true
        this.callbacks.onStart?.()
      }

      this.recognition.onresult = (event: any) => {
        this.interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript

          if (result.isFinal) {
            this.finalTranscript += transcript + ' '
            this.callbacks.onFinalResult?.(this.finalTranscript.trim())
          } else {
            this.interimTranscript += transcript
            this.callbacks.onInterimResult?.(this.finalTranscript + this.interimTranscript)
          }
        }

        // 如果没有最终结果，也要通知当前中间结果
        if (this.interimTranscript) {
          this.callbacks.onInterimResult?.(this.finalTranscript + this.interimTranscript)
        }
      }

      this.recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error)
        // 忽略 no-speech 错误（用户没有说话）
        if (event.error === 'no-speech') {
          return
        }
        // 忽略 aborted 错误（用户主动停止）
        if (event.error === 'aborted') {
          return
        }
        this.callbacks.onError?.(event.error)
      }

      this.recognition.onend = () => {
        this.isListening = false
        // 如果有最终的识别结果，再通知一次
        if (this.finalTranscript.trim()) {
          this.callbacks.onFinalResult?.(this.finalTranscript.trim())
        }
        this.callbacks.onEnd?.()
      }

      this.recognition.start()
      return true
    } catch (error) {
      console.error('启动语音识别失败:', error)
      this.callbacks.onError?.('启动语音识别失败')
      return false
    }
  }

  /**
   * 停止语音识别
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop()
      } catch (error) {
        console.error('停止语音识别失败:', error)
      }
    }
    this.isListening = false
  }

  /**
   * 强制中止语音识别
   */
  abort(): void {
    if (this.recognition) {
      try {
        this.recognition.abort()
      } catch (error) {
        console.error('中止语音识别失败:', error)
      }
    }
    this.isListening = false
  }

  /**
   * 获取当前识别状态
   */
  getIsListening(): boolean {
    return this.isListening
  }

  /**
   * 获取当前最终识别文本
   */
  getFinalTranscript(): string {
    return this.finalTranscript.trim()
  }

  /**
   * 获取当前中间识别文本
   */
  getInterimTranscript(): string {
    return this.interimTranscript
  }

  /**
   * 重置识别状态
   */
  reset(): void {
    this.finalTranscript = ''
    this.interimTranscript = ''
  }
}

export const speechRecognition = new SpeechRecognitionService()
export default SpeechRecognitionService

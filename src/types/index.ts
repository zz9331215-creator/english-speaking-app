export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  corrections?: GrammarCorrection[]
  suggestions?: string[]
}

export interface GrammarCorrection {
  original: string
  corrected: string
  explanation: string
  type: 'grammar' | 'vocabulary' | 'pronunciation' | 'style'
}

export interface Topic {
  id: string
  title: string
  titleEn: string
  description: string
  icon: string
  category: 'daily' | 'business' | 'travel' | 'social' | 'academic'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  systemPrompt: string
}

export interface DailyQuote {
  id: string
  english: string
  chinese: string
  author?: string
  date: string
}

export interface UserProgress {
  totalConversations: number
  totalMessages: number
  streakDays: number
  lastPracticeDate: string
  topicProgress: Record<string, number>
}

export interface Conversation {
  id: string
  topicId: string
  messages: Message[]
  startedAt: number
  lastMessageAt: number
}

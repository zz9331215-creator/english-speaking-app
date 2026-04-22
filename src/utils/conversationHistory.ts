// 对话历史管理 - 使用 localStorage 持久化

import type { ConversationHistory, Message } from '../types'

const HISTORY_STORAGE_KEY = 'english_app_conversation_history'

// 获取所有历史对话
export function getConversationHistory(): ConversationHistory[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // ignore
  }
  return []
}

// 保存对话历史
export function saveConversation(history: ConversationHistory) {
  try {
    const histories = getConversationHistory()
    histories.unshift(history) // 添加到最前面
    
    // 最多保留50条历史记录
    if (histories.length > 50) {
      histories.splice(50)
    }
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(histories))
  } catch (error) {
    console.error('保存对话历史失败:', error)
  }
}

// 删除单条历史记录
export function deleteConversationHistory(id: string) {
  try {
    const histories = getConversationHistory()
    const filtered = histories.filter(h => h.id !== id)
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('删除对话历史失败:', error)
  }
}

// 清空所有历史记录
export function clearAllConversationHistory() {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY)
  } catch (error) {
    console.error('清空对话历史失败:', error)
  }
}

// 获取单条历史记录
export function getConversationById(id: string): ConversationHistory | null {
  try {
    const histories = getConversationHistory()
    return histories.find(h => h.id === id) || null
  } catch {
    return null
  }
}

// 创建新的对话历史记录
export function createConversationHistory(
  topicId: string,
  topicName: string,
  topicNameEn: string,
  messages: Message[]
): ConversationHistory {
  return {
    id: Date.now().toString(),
    topicId,
    topicName,
    topicNameEn,
    messages,
    startedAt: messages[0]?.timestamp || Date.now(),
    lastMessageAt: messages[messages.length - 1]?.timestamp || Date.now(),
    messageCount: messages.length
  }
}

// 用户学习数据统计管理 - 使用 localStorage 持久化

const STORAGE_KEY = 'english_app_user_stats'

export interface UserStats {
  checkInDates: string[] // YYYY-MM-DD 格式，已打卡日期列表
  lastCheckInDate: string // 最后打卡日期
  totalPracticeTime: number // 总练习时长（分钟）
  totalConversations: number // 总对话次数
  totalMessages: number // 总对话消息数
  stars: number // 获得星星数
  achievements: string[] // 已解锁成就ID列表
  topicsCompleted: string[] // 已完成话题ID列表
  readingCount: number // 晨读次数
  readingScores: number[] // 晨读分数记录
  joinDate: string // 加入日期
}

const defaultStats: UserStats = {
  checkInDates: [],
  lastCheckInDate: '',
  totalPracticeTime: 0,
  totalConversations: 0,
  totalMessages: 0,
  stars: 0,
  achievements: [],
  topicsCompleted: [],
  readingCount: 0,
  readingScores: [],
  joinDate: new Date().toISOString().split('T')[0],
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getStorage(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return { ...defaultStats, ...JSON.parse(raw) }
    }
  } catch {
    // ignore
  }
  return { ...defaultStats }
}

function setStorage(stats: UserStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

// 获取统计数据
export function getUserStats(): UserStats {
  return getStorage()
}

// 计算连续打卡天数
export function getStreakDays(): number {
  const stats = getStorage()
  if (stats.checkInDates.length === 0) return 0

  const dates = [...stats.checkInDates].sort()
  const today = getToday()
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // 如果今天没打卡，且昨天也没打卡，则连续天数为0
  const lastDate = dates[dates.length - 1]
  if (lastDate !== today && lastDate !== yesterday) return 0

  let streak = 1
  for (let i = dates.length - 1; i > 0; i--) {
    const curr = new Date(dates[i])
    const prev = new Date(dates[i - 1])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// 今天是否已打卡
export function hasCheckedInToday(): boolean {
  const stats = getStorage()
  return stats.checkInDates.includes(getToday())
}

// 执行打卡
export function checkIn(): { success: boolean; newStars: number; message: string } {
  const stats = getStorage()
  const today = getToday()

  if (stats.checkInDates.includes(today)) {
    return { success: false, newStars: 0, message: '今天已经打卡过了哦，明天再来吧！' }
  }

  stats.checkInDates.push(today)
  stats.lastCheckInDate = today

  // 奖励星星：基础1颗 + 连续打卡 bonus
  const streak = getStreakDays() + 1
  let bonusStars = 1
  if (streak >= 30) bonusStars = 5
  else if (streak >= 14) bonusStars = 4
  else if (streak >= 7) bonusStars = 3
  else if (streak >= 3) bonusStars = 2

  stats.stars += bonusStars

  setStorage(stats)

  // 激励语录
  const messages = [
    `太棒了！打卡成功！获得 ${bonusStars} 颗小星星✨`,
    `坚持就是胜利，你已连续打卡 ${streak} 天！`,
    `每一颗星星都是你努力的见证，继续加油！`,
    `今天的打卡完成啦，你是自己的冠军！🏆`,
    `语言学习是马拉松，不是短跑，你在正确的道路上！`,
    `Awesome! Keep up the great work! 🌟`,
    `Practice makes perfect, and you're proving it!`,
    `你的坚持令人敬佩，继续闪闪发光吧！✨`,
    `又进步了一天，为你的自律点赞！👏`,
    `小坚持，大改变，今天的你超棒的！`,
  ]
  const message = messages[Math.floor(Math.random() * messages.length)]

  return { success: true, newStars: bonusStars, message }
}

// 记录练习时长（分钟）
export function addPracticeTime(minutes: number) {
  const stats = getStorage()
  stats.totalPracticeTime += minutes
  setStorage(stats)
}

// 记录对话次数
export function addConversation(topicId?: string) {
  const stats = getStorage()
  stats.totalConversations += 1
  if (topicId && !stats.topicsCompleted.includes(topicId)) {
    stats.topicsCompleted.push(topicId)
  }
  setStorage(stats)
}

// 记录消息数
export function addMessage(count: number = 1) {
  const stats = getStorage()
  stats.totalMessages += count
  setStorage(stats)
}

// 记录晨读
export function addReading(score?: number) {
  const stats = getStorage()
  stats.readingCount += 1
  if (score !== undefined) {
    stats.readingScores.push(score)
  }
  setStorage(stats)
}

// 获取本月打卡日期
export function getMonthCheckInDates(year: number, month: number): number[] {
  const stats = getStorage()
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
  return stats.checkInDates
    .filter((d) => d.startsWith(prefix))
    .map((d) => parseInt(d.split('-')[2], 10))
}

// 获取某月总天数
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// 获取某月第一天是星期几
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

// 激励语录（通用）
export function getEncouragement(): string {
  const quotes = [
    '每一个不曾起舞的日子，都是对生命的辜负。',
    '你比你想象的更强大，继续向前！',
    '今天的努力，是明天最好的礼物。',
    '不怕慢，就怕站，你在进步！',
    '相信自己，你可以做到！',
    'The best way to predict the future is to create it.',
    'Success is the sum of small efforts, repeated day in and day out.',
    "Believe you can and you're halfway there.",
    '你的潜力无限，去成为更好的自己！',
    '学英语的路上，你并不孤单！',
  ]
  return quotes[Math.floor(Math.random() * quotes.length)]
}

// 成就定义
export interface AchievementDef {
  id: string
  title: string
  description: string
  condition: (stats: UserStats, streak: number) => boolean
}

export const achievementDefs: AchievementDef[] = [
  { id: 'first_chat', title: '初出茅庐', description: '完成首次对话练习', condition: (s) => s.totalConversations >= 1 },
  { id: 'streak_3', title: '坚持不懈', description: '连续打卡3天', condition: (_, streak) => streak >= 3 },
  { id: 'streak_7', title: '持之以恒', description: '连续打卡7天', condition: (_, streak) => streak >= 7 },
  { id: 'streak_30', title: '坚定不移', description: '连续打卡30天', condition: (_, streak) => streak >= 30 },
  { id: 'topic_5', title: '话题达人', description: '完成5个不同话题的对话', condition: (s) => s.topicsCompleted.length >= 5 },
  { id: 'topic_10', title: '话题专家', description: '完成10个不同话题的对话', condition: (s) => s.topicsCompleted.length >= 10 },
  { id: 'msg_10', title: '口语新手', description: '累计对话10句', condition: (s) => s.totalMessages >= 10 },
  { id: 'msg_50', title: '口语进阶', description: '累计对话50句', condition: (s) => s.totalMessages >= 50 },
  { id: 'msg_100', title: '口语大师', description: '累计对话100句', condition: (s) => s.totalMessages >= 100 },
  { id: 'reading_3', title: '晨读之星', description: '完成3次晨读练习', condition: (s) => s.readingCount >= 3 },
  { id: 'reading_90', title: '完美发音', description: '晨读获得90分以上', condition: (s) => s.readingScores.some((sc) => sc >= 90) },
  { id: 'time_5h', title: '练习狂人', description: '累计练习5小时', condition: (s) => s.totalPracticeTime >= 300 },
  { id: 'time_20h', title: '英语学霸', description: '累计练习20小时', condition: (s) => s.totalPracticeTime >= 1200 },
  { id: 'stars_50', title: '星星收藏家', description: '获得50颗星星', condition: (s) => s.stars >= 50 },
  { id: 'stars_200', title: '星星富翁', description: '获得200颗星星', condition: (s) => s.stars >= 200 },
]

// 检查并解锁新成就，返回新解锁的成就列表
export function checkAchievements(): AchievementDef[] {
  const stats = getStorage()
  const streak = getStreakDays()
  const newlyUnlocked: AchievementDef[] = []

  for (const def of achievementDefs) {
    if (!stats.achievements.includes(def.id) && def.condition(stats, streak)) {
      stats.achievements.push(def.id)
      newlyUnlocked.push(def)
      // 解锁成就奖励星星
      stats.stars += 5
    }
  }

  if (newlyUnlocked.length > 0) {
    setStorage(stats)
  }

  return newlyUnlocked
}

// 获取成就列表（带解锁状态）
export function getAchievementsWithProgress() {
  const stats = getStorage()
  const streak = getStreakDays()

  return achievementDefs.map((def) => {
    const unlocked = stats.achievements.includes(def.id)
    let progress = 0
    if (def.id === 'first_chat') progress = Math.min(100, stats.totalConversations * 100)
    else if (def.id.startsWith('streak_')) {
      const target = parseInt(def.id.split('_')[1], 10)
      progress = Math.min(100, (streak / target) * 100)
    } else if (def.id.startsWith('topic_')) {
      const target = parseInt(def.id.split('_')[1], 10)
      progress = Math.min(100, (stats.topicsCompleted.length / target) * 100)
    } else if (def.id.startsWith('msg_')) {
      const target = parseInt(def.id.split('_')[1], 10)
      progress = Math.min(100, (stats.totalMessages / target) * 100)
    } else if (def.id === 'reading_3') progress = Math.min(100, (stats.readingCount / 3) * 100)
    else if (def.id === 'reading_90') progress = stats.readingScores.some((s) => s >= 90) ? 100 : Math.min(100, (Math.max(...stats.readingScores, 0) / 90) * 100)
    else if (def.id === 'time_5h') progress = Math.min(100, (stats.totalPracticeTime / 300) * 100)
    else if (def.id === 'time_20h') progress = Math.min(100, (stats.totalPracticeTime / 1200) * 100)
    else if (def.id === 'stars_50') progress = Math.min(100, (stats.stars / 50) * 100)
    else if (def.id === 'stars_200') progress = Math.min(100, (stats.stars / 200) * 100)

    return { ...def, unlocked, progress: Math.round(progress) }
  })
}

// 重置数据（测试用）
export function resetUserStats() {
  localStorage.removeItem(STORAGE_KEY)
}

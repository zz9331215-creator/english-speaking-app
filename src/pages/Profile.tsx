import { useState, useEffect, useCallback } from 'react'
import {
  Settings,
  ChevronRight,
  Trophy,
  Flame,
  Clock,
  MessageSquare,
  Star,
  Zap,
  CheckCircle2,
  Sparkles,
  RotateCcw,
} from 'lucide-react'
import {
  getUserStats,
  getStreakDays,
  hasCheckedInToday,
  checkIn,
  getEncouragement,
  type UserStats,
  resetUserStats,
} from '../utils/userStats'

export default function Profile() {
  const [stats, setStats] = useState<UserStats>(getUserStats())
  const [streak, setStreak] = useState(0)
  const [checkedIn, setCheckedIn] = useState(false)
  const [showEncourage, setShowEncourage] = useState(false)
  const [encourageMsg, setEncourageMsg] = useState('')
  const [newStars, setNewStars] = useState(0)

  const refreshData = useCallback(() => {
    const s = getUserStats()
    setStats(s)
    setStreak(getStreakDays())
    setCheckedIn(hasCheckedInToday())
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // 打卡
  const handleCheckIn = () => {
    const result = checkIn()
    if (result.success) {
      setEncourageMsg(result.message)
      setNewStars(result.newStars)
      setShowEncourage(true)
      refreshData()
    } else {
      setEncourageMsg(result.message)
      setNewStars(0)
      setShowEncourage(true)
    }
  }

  // 统计卡片数据
  const statCards = [
    { label: '连续打卡', value: String(streak), unit: '天', icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { label: '对话次数', value: String(stats.totalConversations), unit: '次', icon: MessageSquare, color: 'text-primary-500', bgColor: 'bg-primary-50' },
    { label: '练习时长', value: String((stats.totalPracticeTime / 60).toFixed(1)), unit: '小时', icon: Clock, color: 'text-green-500', bgColor: 'bg-green-50' },
    { label: '获得星星', value: String(stats.stars), unit: '颗', icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  ]

  // 加入天数
  const joinDays = Math.max(1, Math.floor((Date.now() - new Date(stats.joinDate).getTime()) / (1000 * 60 * 60 * 24)))

  // 等级计算
  const level = Math.min(20, Math.floor(stats.stars / 50) + 1)
  const nextLevelStars = level * 50
  const levelProgress = Math.min(100, ((stats.stars % 50) / 50) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">我的</h1>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* User Info Card */}
        <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl p-6 text-white shadow-lg shadow-primary-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              <span className="text-3xl font-bold">U</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">英语学习者</h2>
              <p className="text-white/80 text-sm">已加入 {joinDays} 天</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="text-sm text-white/80">当前等级</span>
              </div>
              <p className="text-2xl font-bold">Level {level}</p>
              <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-300 rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
              </div>
              <p className="text-xs text-white/60 mt-1">{stats.stars}/{nextLevelStars} 星星升级</p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-sm text-white/80">学习积分</span>
              </div>
              <p className="text-2xl font-bold">{stats.stars.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* 打卡按钮 */}
        <button
          onClick={handleCheckIn}
          disabled={checkedIn}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
            checkedIn
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
          }`}
        >
          {checkedIn ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              今日已打卡
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              立即打卡
            </>
          )}
        </button>

        {!checkedIn && (
          <p className="text-xs text-gray-500 text-center -mt-3">
            {getEncouragement()}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Settings List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {[
            { label: '隐私设置', icon: Settings },
            { label: '帮助与反馈', icon: MessageSquare },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  index !== 3 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-900">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            )
          })}
        </div>

        {/* Debug: 重置数据 */}
        <button
          onClick={() => {
            if (confirm('确定要重置所有学习数据吗？')) {
              resetUserStats()
              refreshData()
            }
          }}
          className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          重置学习数据
        </button>
      </div>

      {/* 打卡成功弹窗 */}
      {showEncourage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowEncourage(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">打卡成功！</h3>
            <p className="text-gray-600 mb-4">{encourageMsg}</p>
            {newStars > 0 && (
              <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                +{newStars} 颗星星
              </div>
            )}
            <button
              onClick={() => {
                setShowEncourage(false)
              }}
              className="w-full mt-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              太棒了！
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

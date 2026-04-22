import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings,
  ChevronRight,
  Trophy,
  Clock,
  MessageSquare,
  Zap,
  RotateCcw,
  History as HistoryIcon,
} from 'lucide-react'
import {
  getUserStats,
  type UserStats,
  resetUserStats,
} from '../utils/userStats'

export default function Profile() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<UserStats>(getUserStats())

  const refreshData = useCallback(() => {
    const s = getUserStats()
    setStats(s)
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // 统计卡片数据
  const statCards = [
    { label: '对话次数', value: String(stats.totalConversations), unit: '次', icon: MessageSquare, color: 'text-primary-500', bgColor: 'bg-primary-50' },
    { label: '练习时长', value: String((stats.totalPracticeTime / 60).toFixed(1)), unit: '小时', icon: Clock, color: 'text-green-500', bgColor: 'bg-green-50' },
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

        {/* History Entry */}
        <button
          onClick={() => navigate('/history')}
          className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 group-hover:from-primary-200 group-hover:to-primary-300 transition-all duration-200">
            <HistoryIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">历史对话</h3>
            <p className="text-xs text-gray-500">查看和回顾之前的对话练习</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </button>


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
    </div>
  )
}

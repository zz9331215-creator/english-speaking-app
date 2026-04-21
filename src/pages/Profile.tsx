
import { 
  Settings, 
  ChevronRight, 
  Trophy, 
  Flame, 
  Clock, 
  MessageSquare,
  Star,
  Crown,
  Zap,
  BookOpen,
  Target,
  Calendar,
  CheckCircle2,
  Volume2
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ElementType
  unlocked: boolean
  progress?: number
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: '初出茅庐',
    description: '完成首次对话练习',
    icon: MessageSquare,
    unlocked: true,
  },
  {
    id: '2',
    title: '坚持不懈',
    description: '连续练习7天',
    icon: Flame,
    unlocked: true,
    progress: 100,
  },
  {
    id: '3',
    title: '话题达人',
    description: '完成10个不同话题的对话',
    icon: BookOpen,
    unlocked: false,
    progress: 60,
  },
  {
    id: '4',
    title: '完美发音',
    description: '晨读获得95分以上',
    icon: Star,
    unlocked: false,
    progress: 80,
  },
  {
    id: '5',
    title: '口语大师',
    description: '累计对话100句',
    icon: Crown,
    unlocked: false,
    progress: 45,
  },
]

const stats = [
  { label: '连续打卡', value: '12', unit: '天', icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-50' },
  { label: '对话次数', value: '48', unit: '次', icon: MessageSquare, color: 'text-primary-500', bgColor: 'bg-primary-50' },
  { label: '练习时长', value: '16.5', unit: '小时', icon: Clock, color: 'text-green-500', bgColor: 'bg-green-50' },
  { label: '获得星星', value: '156', unit: '颗', icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
]

export default function Profile() {

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
              <p className="text-white/80 text-sm">已加入 30 天</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="text-sm text-white/80">当前等级</span>
              </div>
              <p className="text-2xl font-bold">Level 5</p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-sm text-white/80">学习积分</span>
              </div>
              <p className="text-2xl font-bold">2,580</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
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

        {/* Learning Progress */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-900">本周目标</h3>
            </div>
            <span className="text-sm text-primary-600 font-medium">3/5 完成</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">完成3次对话练习</p>
                <p className="text-xs text-gray-500">已完成</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">晨读打卡5天</p>
                <p className="text-xs text-gray-500">已完成</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">尝试2个新话题</p>
                <p className="text-xs text-gray-500">进行中 1/2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">成就徽章</h3>
            <button className="text-sm text-primary-600 font-medium flex items-center gap-1">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <div
                  key={achievement.id}
                  className={`bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-4 ${
                    achievement.unlocked ? 'border-gray-100' : 'border-gray-100 opacity-70'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-100 to-orange-100'
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-7 h-7 ${
                      achievement.unlocked ? 'text-orange-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      {achievement.unlocked && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          已获得
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">进度</span>
                          <span className="text-primary-600 font-medium">{achievement.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-500"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {[
            { label: '学习提醒', icon: Calendar },
            { label: '发音设置', icon: Volume2 },
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
      </div>
    </div>
  )
}

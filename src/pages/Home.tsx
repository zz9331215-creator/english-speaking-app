import { useNavigate } from 'react-router-dom'
import { 
  MessageCircle, 
  Sparkles,
  ChevronRight,
  User,
  Heart,
  Cloud,
  Calendar,
  ShoppingCart,
  Coffee,
  Stethoscope,
  Home as HomeIcon,
  Flame,
} from 'lucide-react'
import { getDailyQuote, topics } from '../data/topics'
import type { Topic } from '../types'

const iconMap: Record<string, React.ElementType> = {
  User,
  Heart,
  Cloud,
  Calendar,
  ShoppingCart,
  Coffee,
  Stethoscope,
  Home: HomeIcon,
}

const TopicCard = ({ topic, onClick }: { topic: Topic; onClick: () => void }) => {
  const Icon = iconMap[topic.icon] || MessageCircle
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-all duration-200 hover:shadow-md"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-semibold text-gray-900">{topic.title}</h3>
        <p className="text-xs text-gray-500">{topic.titleEn}</p>
      </div>
    </button>
  )
}

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  color, 
  onClick 
}: { 
  icon: React.ElementType
  title: string
  subtitle: string
  color: string
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${color} active:scale-95 transition-all duration-200`}
  >
    <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
      <Icon className="w-7 h-7 text-gray-700" />
    </div>
    <div className="text-center">
      <p className="font-medium text-sm text-gray-900">{title}</p>
      <p className="text-xs text-gray-600">{subtitle}</p>
    </div>
  </button>
)

export default function Home() {
  const navigate = useNavigate()
  const dailyQuote = getDailyQuote()
  const today = new Date()
  const dateStr = `${today.getDate()}`
  const monthStr = today.toLocaleDateString('en-US', { month: 'short' })
  const yearStr = today.getFullYear()

  const displayedTopics = topics.slice(0, 8)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">口语练习</h1>
              <p className="text-xs text-gray-500">Pro</p>
            </div>
          </div>
          <button className="text-sm text-primary-600 font-medium">
            功能概览 →
          </button>
        </div>
      </header>

      <div className="px-4 pb-6 space-y-6">
        {/* Daily Quote Card */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-6 text-white shadow-lg shadow-primary-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-primary-100 text-sm font-medium mb-1">每日晨读</p>
              <h2 className="text-2xl font-bold">Daily Reading</h2>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{dateStr}</p>
              <p className="text-primary-100 text-sm">{monthStr} {yearStr}</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <p className="text-lg font-medium leading-relaxed mb-2">
              "{dailyQuote.english}"
            </p>
            <p className="text-primary-100 text-sm">
              {dailyQuote.chinese}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-primary-400 border-2 border-primary-500 flex items-center justify-center"
                  >
                    <span className="text-xs font-medium">{String.fromCharCode(64 + i)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Flame className="w-4 h-4 text-orange-300" />
                <span>1,689 人已打卡</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/correction')}
              className="flex items-center gap-1 bg-white text-primary-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-primary-50 transition-colors"
            >
              去晨读
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-4 gap-3">
          <FeatureCard
            icon={MessageCircle}
            title="自由对话"
            subtitle="AI对话练习"
            color="bg-gradient-to-br from-blue-50 to-blue-100"
            onClick={() => navigate('/chat')}
          />
          <FeatureCard
            icon={Sparkles}
            title="话题对话"
            subtitle="场景练习"
            color="bg-gradient-to-br from-purple-50 to-purple-100"
            onClick={() => navigate('/topics')}
          />
        </div>

        {/* Topics Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">对话练习</h2>
            <button 
              onClick={() => navigate('/topics')}
              className="text-sm text-gray-500 flex items-center gap-1 hover:text-primary-600 transition-colors"
            >
              更多
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {displayedTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onClick={() => navigate(`/chat/${topic.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

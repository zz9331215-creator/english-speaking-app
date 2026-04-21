import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Search,
  User,
  Heart,
  Cloud,
  Calendar,
  ShoppingCart,
  Coffee,
  Stethoscope,
  Home as HomeIcon,
  Briefcase,
  Plane,
  UtensilsCrossed,
  Smartphone,
  Film,
  ChefHat,
  Dumbbell,
  GraduationCap,
  MessageCircle,
  Filter
} from 'lucide-react'
import { topics } from '../data/topics'
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
  Briefcase,
  Plane,
  UtensilsCrossed,
  Smartphone,
  Film,
  ChefHat,
  Dumbbell,
  GraduationCap,
}

const categoryLabels: Record<Topic['category'], string> = {
  daily: '日常生活',
  business: '职场商务',
  travel: '旅行出行',
  social: '社交娱乐',
  academic: '学术教育',
}

const difficultyLabels: Record<Topic['difficulty'], { text: string; color: string }> = {
  beginner: { text: '初级', color: 'bg-green-100 text-green-700' },
  intermediate: { text: '中级', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { text: '高级', color: 'bg-red-100 text-red-700' },
}

export default function Topics() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Topic['category'] | 'all'>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Topic['difficulty'] | 'all'>('all')

  const categories: Array<Topic['category'] | 'all'> = ['all', 'daily', 'business', 'travel', 'social', 'academic']
  const difficulties: Array<Topic['difficulty'] | 'all'> = ['all', 'beginner', 'intermediate', 'advanced']

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">选择话题</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索话题..."
            className="w-full bg-gray-100 rounded-2xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
          />
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 space-y-4">
        {/* Category Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">分类</span>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? '全部' : categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-700">难度</span>
          </div>
          <div className="flex gap-2">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedDifficulty === difficulty
                    ? 'bg-accent-500 text-white shadow-md shadow-accent-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {difficulty === 'all' ? '全部' : difficultyLabels[difficulty].text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">
            {selectedCategory === 'all' ? '全部话题' : categoryLabels[selectedCategory]}
          </h2>
          <span className="text-sm text-gray-500">共 {filteredTopics.length} 个</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredTopics.map((topic, index) => {
            const Icon = iconMap[topic.icon] || MessageCircle
            const difficultyInfo = difficultyLabels[topic.difficulty]
            
            return (
              <button
                key={topic.id}
                onClick={() => navigate(`/chat/${topic.id}`)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 text-left animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{topic.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${difficultyInfo.color}`}>
                        {difficultyInfo.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{topic.titleEn}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{topic.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                        {categoryLabels[topic.category]}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">没有找到匹配的话题</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedDifficulty('all')
              }}
              className="mt-4 text-primary-600 font-medium hover:underline"
            >
              清除筛选条件
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

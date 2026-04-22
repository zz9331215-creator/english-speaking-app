import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Quote,
  Film,
  Mic,
  MessageCircle,
  ChevronRight,
} from 'lucide-react'
import { shadowingItems, shadowingCategories } from '../data/shadowing'
import type { ShadowingItem } from '../data/shadowing'

const categoryColors: Record<ShadowingItem['category'], { bg: string; text: string; border: string }> = {
  story: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  quote: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  movie: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
  speech: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
  daily: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
}

const categoryIconMap: Record<string, React.ElementType> = {
  BookOpen,
  Quote,
  Film,
  Mic,
  MessageCircle,
}

export default function ShadowingList() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<ShadowingItem['category'] | 'all'>('all')

  const filteredItems = activeCategory === 'all'
    ? shadowingItems
    : shadowingItems.filter((item) => item.category === activeCategory)

  const groupedItems = shadowingCategories.map((cat) => ({
    ...cat,
    items: filteredItems.filter((item) => item.category === cat.key),
  })).filter((group) => group.items.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="font-bold text-gray-900">跟读练习</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            全部
          </button>
          {shadowingCategories.map((cat) => {
            const Icon = categoryIconMap[cat.icon] || BookOpen
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* Items List */}
        {groupedItems.map((group) => (
          <div key={group.key}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{group.name}</h2>
            <div className="grid grid-cols-2 gap-3">
              {group.items.map((item) => {
                const colors = categoryColors[item.category]
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/shadowing/${item.id}`)}
                    className={`bg-white rounded-2xl p-4 border ${colors.border} shadow-sm text-left active:scale-95 transition-all hover:shadow-md`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className={`text-xs ${colors.text} mb-2 truncate`}>{item.titleEn}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{item.sentences.length} 句</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { NavLink, useLocation } from 'react-router-dom'
import { BookOpen, MessageCircle, User } from 'lucide-react'

const navItems = [
  {
    path: '/',
    label: '基础',
    icon: BookOpen,
  },
  {
    path: '/topics',
    label: '自由练',
    icon: MessageCircle,
  },
  {
    path: '/profile',
    label: '我',
    icon: User,
  },
]

export default function BottomNav() {
  const location = useLocation()
  
  // 在聊天页面不显示底部导航
  if (location.pathname.startsWith('/chat')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-200
                ${isActive 
                  ? 'text-primary-600' 
                  : 'text-gray-400 hover:text-gray-600'
                }
              `}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                <Icon className="w-6 h-6" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-primary-600' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

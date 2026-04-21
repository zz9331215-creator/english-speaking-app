import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Topics from './pages/Topics'
import Correction from './pages/Correction'
import Profile from './pages/Profile'
import BottomNav from './components/BottomNav'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:topicId" element={<Chat />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/correction" element={<Correction />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default App

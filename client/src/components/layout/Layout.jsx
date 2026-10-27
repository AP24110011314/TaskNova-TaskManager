import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close drawer on route or filter change during render
  const locationKey = location.pathname + location.search
  const [prevLocationKey, setPrevLocationKey] = useState(locationKey)
  if (prevLocationKey !== locationKey) {
    setPrevLocationKey(locationKey)
    if (sidebarOpen) {
      setSidebarOpen(false)
    }
  }

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar (in normal document flow on desktop md+, off-canvas drawer on mobile) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 md:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
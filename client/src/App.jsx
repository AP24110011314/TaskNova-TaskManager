import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { TaskProvider } from './context/TaskContext'
import { ToastProvider } from './components/common/Toast'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Spinner from './components/common/Spinner'

const Stats = lazy(() => import('./pages/Stats'))
const Categories = lazy(() => import('./pages/Categories'))

function App() {
  return (
    <ToastProvider>
      <TaskProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/stats"
              element={
                <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
                  <Stats />
                </Suspense>
              }
            />
            <Route
              path="/categories"
              element={
                <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
                  <Categories />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </TaskProvider>
    </ToastProvider>
  )
}

export default App
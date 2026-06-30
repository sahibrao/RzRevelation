import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Store from './pages/Store'
import Blog from './pages/Blog'
import Teams from './pages/Teams'
import TeamDetail from './pages/TeamDetail'
import Contact from './pages/Contact'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/team" element={<Teams />} />
          <Route path="/team/:slug" element={<TeamDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

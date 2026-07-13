import { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import DashboardPage from './pages/dashboard'
import SinglePostPage from './pages/single-post'
import CreatePostPage from './pages/create-post'
import SavedPostsPage from './pages/saved-posts'
import Loader from './shared/components/Loader'

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/posts/:id" element={<SinglePostPage />} />
            <Route path="/create" element={<CreatePostPage />} />
            <Route path="/saved-posts" element={<SavedPostsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Loader from './shared/components/Loader'

const IntroPage = lazy(() => import('./pages/intro'))
const LoginPage = lazy(() => import('./pages/login'))
const SignupPage = lazy(() => import('./pages/signup'))
const DashboardPage = lazy(() => import('./pages/dashboard'))
const SinglePostPage = lazy(() => import('./pages/SinglePost'))
const CreatePostPage = lazy(() => import('./pages/CreatePost'))
const SavedPostsPage = lazy(() => import('./pages/SavedPosts'))

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<IntroPage />} />
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

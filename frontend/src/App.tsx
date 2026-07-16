import { Suspense, lazy, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import type { RootState } from './redux/store'
import { setPosts } from './redux/slices/posts/postsSlice'
import { restoreSaved } from './redux/slices/savedPosts/savedPostsSlice'
import { PostsService } from './services/PostsService'
import Loader from './shared/components/Loader'

const IntroPage = lazy(() => import('./pages/intro'))
const LoginPage = lazy(() => import('./pages/login'))
const SignupPage = lazy(() => import('./pages/signup'))
const VerifyOtpPage = lazy(() => import('./pages/verifyOtp'))
const DashboardPage = lazy(() => import('./pages/dashboard'))
const SinglePostPage = lazy(() => import('./pages/SinglePost'))
const CreatePostPage = lazy(() => import('./pages/CreatePost'))
const SavedPostsPage = lazy(() => import('./pages/SavedPosts'))
const YourPostsPage = lazy(() => import('./pages/YourPosts'))

const App = () => {
  const dispatch = useDispatch()
  const token = useSelector((state: RootState) => state.auth.token)

  useEffect(() => {
    PostsService.getPosts()
      .then((posts) => dispatch(setPosts(posts)))
      .catch(() => dispatch(setPosts([])))
  }, [dispatch])

  useEffect(() => {
    if (!token) {
      dispatch(restoreSaved([]))
      return
    }

    PostsService.getSavedPostIds(token)
      .then((savedPostIds) => dispatch(restoreSaved(savedPostIds)))
      .catch(() => dispatch(restoreSaved([])))
  }, [dispatch, token])

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/posts/:id" element={<SinglePostPage />} />
            <Route path="/create" element={<CreatePostPage />} />
            <Route path="/saved-posts" element={<SavedPostsPage />} />
            <Route path="/your-posts" element={<YourPostsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

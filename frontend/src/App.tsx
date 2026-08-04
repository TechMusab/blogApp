import { Suspense, lazy, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MainLayout from './layouts/MainLayout';
import type { RootState } from './redux/store';
import { setPagedPosts } from './redux/slices/posts/postsSlice';
import { restoreSaved } from './redux/slices/savedPosts/savedPostsSlice';
import { PostsService } from './services/PostsService';
import { Loader } from './shared/components/Loader';
import ProtectedRoute from './shared/components/ProtectedRoute/ProtectedRoute';
import { ToastContainer } from './shared/components/Toast/ToastContainer';

const IntroPage = lazy(() =>
  import('./pages/intro').then((module) => ({ default: module.IntroPage }))
);
const LoginPage = lazy(() =>
  import('./pages/login').then((module) => ({ default: module.LoginPage }))
);
const SignupPage = lazy(() =>
  import('./pages/signup').then((module) => ({ default: module.SignupPage }))
);
const VerifyOtpPage = lazy(() =>
  import('./pages/verifyOtp').then((module) => ({ default: module.VerifyOtpPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/dashboard').then((module) => ({ default: module.DashboardPage }))
);
const SinglePostPage = lazy(() =>
  import('./pages/SinglePost').then((module) => ({ default: module.SinglePostPage }))
);
const CreatePostPage = lazy(() =>
  import('./pages/CreatePost').then((module) => ({ default: module.CreatePostPage }))
);
const SavedPostsPage = lazy(() =>
  import('./pages/SavedPosts').then((module) => ({ default: module.SavedPostsPage }))
);
const YourPostsPage = lazy(() =>
  import('./pages/YourPosts').then((module) => ({ default: module.YourPostsPage }))
);
const PeoplePage = lazy(() =>
  import('./pages/people').then((module) => ({ default: module.PeoplePage }))
);
const FriendRequestsPage = lazy(() =>
  import('./pages/friend-requests').then((module) => ({ default: module.FriendRequestsPage }))
);
const FriendsPage = lazy(() =>
  import('./pages/friends').then((module) => ({ default: module.FriendsPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/Settings/Settings').then((module) => ({ default: module.SettingsPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFound').then((module) => ({ default: module.NotFoundPage }))
);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const App = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    PostsService.getPosts(1, 10)
      .then((pagedResult) => dispatch(setPagedPosts(pagedResult)))
      .catch(() =>
        dispatch(
          setPagedPosts({
            items: [],
            totalCount: 0,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 0,
            hasPrevious: false,
            hasNext: false,
          })
        )
      );
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      dispatch(restoreSaved([]));
      return;
    }

    PostsService.getSavedPostIds(token)
      .then((savedPostIds) => dispatch(restoreSaved(savedPostIds)))
      .catch(() => dispatch(restoreSaved([])));
  }, [dispatch, token]);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<IntroPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route element={<MainLayout />}>
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/posts/:id" element={<SinglePostPage />} />
                <Route path="/create" element={<CreatePostPage />} />
                <Route path="/saved-posts" element={<SavedPostsPage />} />
                <Route path="/your-posts" element={<YourPostsPage />} />
                <Route path="/people" element={<PeoplePage />} />
                <Route path="/friend-requests" element={<FriendRequestsPage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
        <ToastContainer />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;

import './Login.scss';

import { memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthMarketingPanel } from '../../shared/components/AuthMarketingPanel';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
import { LoginForm } from './components/LoginForm';
import { login } from '../../redux/slices/auth/authSlice';
import { addToast } from '../../redux/slices/toasts/toastsSlice';
import { AuthService } from '../../services/AuthService';

export const LoginPage = memo(function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const session = await AuthService.login({ email, password });
      dispatch(login(session));
      dispatch(addToast({ message: 'Logged in successfully', type: 'success' }));
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to sign in.');
      dispatch(addToast({ message: 'Login failed. Please check your credentials.', type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async (credential: string) => {
    setError('');
    setIsSubmitting(true);

    try {
      const session = await AuthService.googleAuth({ idToken: credential });
      dispatch(login(session));
      dispatch(addToast({ message: 'Logged in successfully', type: 'success' }));
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to sign in with Google.');
      dispatch(addToast({ message: 'Login failed. Please try again.', type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login">
      <AuthMarketingPanel variant="login" />
      <div className="login__theme-toggle">
        <ThemeToggle />
      </div>

      <LoginForm
        email={email}
        password={password}
        showPassword={showPassword}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onTogglePassword={() => setShowPassword((value) => !value)}
        onSubmit={handleSubmit}
        onGoogleAuth={handleGoogleAuth}
        error={error}
        isSubmitting={isSubmitting}
      />
    </main>
  );
});

import './Login.scss'

import { memo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AuthMarketingPanel from '../../shared/components/AuthMarketingPanel'
import ThemeToggle from '../../shared/components/ThemeToggle'
import LoginForm from './components/LoginForm'
import { login } from '../../redux/slices/auth/authSlice'
import { AuthService } from '../../services/AuthService'

const LoginPage = memo(function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const session = await AuthService.login({ email, password })
      dispatch(login(session))
      navigate('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        error={error}
        isSubmitting={isSubmitting}
      />
    </main>
  )
})

export default LoginPage

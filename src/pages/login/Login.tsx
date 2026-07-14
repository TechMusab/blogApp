import './Login.scss'

import { memo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AuthMarketingPanel from '../../shared/components/AuthMarketingPanel'
import ThemeToggle from '../../shared/components/ThemeToggle'
import LoginForm from './components/LoginForm'
import usersData from '../../shared/data/users.json'
import { login } from '../../redux/slices/auth/authSlice'

const LoginPage = memo(function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState('ava@example.com')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const user = usersData.find((entry) => entry.email === email)
    if (user) {
      dispatch(login(user))
      navigate('/dashboard')
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
      />
    </main>
  )
})

export default LoginPage

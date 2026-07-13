import { memo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AuthMarketingPanel from '../../shared/components/AuthMarketingPanel'
import ThemeToggle from '../../shared/components/ThemeToggle'
import SignupForm from './components/SignupForm'
import { login } from '../../redux/slices/auth/authSlice'
import type { User } from '../../types'

const SignupPage = memo(function SignupPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const user: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: name.slice(0, 2).toUpperCase(),
      bio: 'New member of Folio Journal.',
    }
    dispatch(login(user))
    navigate('/dashboard')
  }

  return (
    <main className="signup">
      <AuthMarketingPanel variant="signup" />
      <div className="signup__theme-toggle">
        <ThemeToggle />
      </div>

      <SignupForm
        name={name}
        email={email}
        password={password}
        showPassword={showPassword}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onTogglePassword={() => setShowPassword((value) => !value)}
        onSubmit={handleSubmit}
      />
    </main>
  )
})

export default SignupPage

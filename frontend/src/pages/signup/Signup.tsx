import './Signup.scss'

import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthMarketingPanel from '../../shared/components/AuthMarketingPanel'
import ThemeToggle from '../../shared/components/ThemeToggle'
import SignupForm from './components/SignupForm'
import { AuthService } from '../../services/AuthService'

const SignupPage = memo(function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
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
      const challenge = await AuthService.requestRegistrationOtp({ name, email, password })
      navigate('/verify-otp', { state: challenge })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to create account.')
    } finally {
      setIsSubmitting(false)
    }
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
        error={error}
        isSubmitting={isSubmitting}
      />
    </main>
  )
})

export default SignupPage

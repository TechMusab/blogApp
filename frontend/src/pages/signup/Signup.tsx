import './Signup.scss'

import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthMarketingPanel } from '../../shared/components/AuthMarketingPanel'
import { ThemeToggle } from '../../shared/components/ThemeToggle'
import { SignupForm } from './components/SignupForm'
import { AuthService } from '../../services/AuthService'

export const SignupPage = memo(function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setAvatarPreview('')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const challenge = await AuthService.requestRegistrationOtp({ name, email, password })
      navigate('/verify-otp', { state: { ...challenge, avatarFile } })
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
        avatarPreview={avatarPreview}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onTogglePassword={() => setShowPassword((value) => !value)}
        onAvatarChange={handleAvatarChange}
        onSubmit={handleSubmit}
        error={error}
        isSubmitting={isSubmitting}
      />
    </main>
  )
})


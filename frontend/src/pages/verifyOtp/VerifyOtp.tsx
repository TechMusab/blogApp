import './VerifyOtp.scss'

import { memo, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../../redux/slices/auth/authSlice'
import { AuthService } from '../../services/AuthService'
import AuthMarketingPanel from '../../shared/components/AuthMarketingPanel'
import ThemeToggle from '../../shared/components/ThemeToggle'
import type { OtpChallenge } from '../../types'

const VerifyOtpPage = memo(function VerifyOtpPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const challenge = location.state as OtpChallenge | null
  const [email, setEmail] = useState(challenge?.email ?? '')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const expiresAt = challenge ? new Date(challenge.expiresAt).getTime() : null
  const secondsLeft = useMemo(() => {
    if (!expiresAt) return null
    return Math.max(0, Math.ceil((expiresAt - now) / 1000))
  }, [expiresAt, now])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const session = await AuthService.verifyRegistration({ email, otp })
      dispatch(login(session))
      navigate('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to verify code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="verify-otp">
      <AuthMarketingPanel variant="signup" />
      <div className="verify-otp__theme-toggle">
        <ThemeToggle />
      </div>

      <section className="verify-otp__right">
        <div className="verify-otp__form">
          <h2 className="verify-otp__form-title">Verify your email</h2>
          <p className="verify-otp__form-subtitle">
            Enter the 6 digit code sent to your email. The code expires in 2 minutes.
          </p>

          <form className="verify-otp__form-fields" onSubmit={handleSubmit}>
            <label className="verify-otp__field">
              <span className="verify-otp__label">Email</span>
              <input
                className="verify-otp__input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="verify-otp__field">
              <span className="verify-otp__label">Verification code</span>
              <input
                className="verify-otp__input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                required
              />
            </label>

            {secondsLeft !== null ? (
              <p className="verify-otp__timer">
                {secondsLeft > 0 ? `${secondsLeft}s remaining` : 'Code expired. Please sign up again.'}
              </p>
            ) : null}

            {error ? <p className="verify-otp__error">{error}</p> : null}

            <button className="verify-otp__button" type="submit" disabled={isSubmitting || otp.length !== 6}>
              {isSubmitting ? 'Verifying...' : 'Verify account'}
            </button>
          </form>

          <div className="verify-otp__footer">
            <Link className="verify-otp__link" to="/signup">Back to sign up</Link>
          </div>
        </div>
      </section>
    </main>
  )
})

export default VerifyOtpPage

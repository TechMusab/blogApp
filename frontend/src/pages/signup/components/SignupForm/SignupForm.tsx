import { memo } from 'react'
import { Link } from 'react-router-dom'

type SignupFormProps = {
  name: string
  email: string
  password: string
  showPassword: boolean
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onTogglePassword: () => void
  onSubmit: (event: React.FormEvent) => void
  error: string
  isSubmitting: boolean
}

const SignupForm = memo(function SignupForm({
  name,
  email,
  password,
  showPassword,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  error,
  isSubmitting,
}: SignupFormProps) {
  return (
    <section className="signup__right">
      <div className="signup__form">
        <h2 className="signup__form-title">Create your account</h2>
        <p className="signup__form-subtitle">Join the reading room and publish your ideas.</p>

        <form className="signup__form-fields" onSubmit={onSubmit}>
          <label className="signup__field">
            <span className="signup__label">Name</span>
            <input
              className="signup__input"
              type="text"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Your full name"
              required
            />
          </label>

          <label className="signup__field">
            <span className="signup__label">Email</span>
            <input
              className="signup__input"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="signup__field">
            <span className="signup__label">Password</span>
            <div className="signup__password">
              <input
                className="signup__input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                className="signup__toggle"
                onClick={onTogglePassword}
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error ? <p className="signup__error">{error}</p> : null}

          <button className="signup__button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="signup__footer">
          <span className="signup__footer-text">Already a member?</span>
          <Link className="signup__link" to="/login">Sign in</Link>
        </div>
      </div>
    </section>
  )
})

export default SignupForm

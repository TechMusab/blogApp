import './LoginForm.scss'

import { memo } from 'react'
import { Link } from 'react-router-dom'

type LoginFormProps = {
  email: string
  password: string
  showPassword: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onTogglePassword: () => void
  onSubmit: (event: React.FormEvent) => void
  error: string
  isSubmitting: boolean
}

export const LoginForm = memo(function LoginForm({
  email,
  password,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  error,
  isSubmitting,
}: LoginFormProps) {
  return (
    <section className="login__right">
      <div className="login__form">
        <h2 className="login__form-title">Welcome back.</h2>
        <p className="login__form-subtitle">Sign in to continue to your workspace.</p>

        <form className="login__form-fields" onSubmit={onSubmit}>
          <label className="login__field">
            <span className="login__label">Email</span>
            <input
              className="login__input"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="login__field">
            <span className="login__label">Password</span>
            <div className="login__password">
              <input
                className="login__input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="login__toggle"
                onClick={onTogglePassword}
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error ? <p className="login__error">{error}</p> : null}

          <button className="login__button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="login__footer">
          <span className="login__footer-text">No account yet?</span>
          <Link className="login__link" to="/signup">Sign up</Link>
        </div>
      </div>
    </section>
  )
})


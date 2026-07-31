import './NotFound.scss'

import { memo } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState } from '../../redux/store'

export const NotFoundPage = memo(function NotFoundPage() {
  const token = useSelector((state: RootState) => state.auth.token)
  const homePath = token ? '/dashboard' : '/'

  return (
    <div className="not-found">
      <div className="not-found__content">
        <h1 className="not-found__title">404</h1>
        <p className="not-found__message">Page not found</p>
        <p className="not-found__description">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={homePath} className="not-found__link">
          Return to {token ? 'Dashboard' : 'Home'}
        </Link>
      </div>
    </div>
  )
})

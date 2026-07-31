import './Avatar.scss'

import { memo } from 'react'
import { getAvatarUrl } from '../../../utils/api'

type AvatarProps = {
  avatar?: string
  name?: string
  className?: string
  size?: 'small' | 'medium' | 'large' | 'extraLarge'
}

export const Avatar = memo(function Avatar({ avatar, name, className = '', size = 'medium' }: AvatarProps) {
  const getInitials = () => {
    if (!name) return 'MV'
    return name.split(' ').map((part) => part[0]).join('').slice(0, 2)
  }

  const avatarUrl = getAvatarUrl(avatar)
  const initials = getInitials()

  const sizeClass = `avatar--${size}`

  if (avatarUrl) {
    return <img src={avatarUrl} alt={name || 'Avatar'} className={`avatar ${sizeClass} ${className}`} />
  }

  return <span className={`avatar avatar--fallback ${sizeClass} ${className}`}>{initials}</span>
})

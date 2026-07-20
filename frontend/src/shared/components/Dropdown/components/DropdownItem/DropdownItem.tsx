import './DropdownItem.scss'

import { memo } from 'react'

export type DropdownMenuItem = { label: string; icon: string; danger?: boolean; onClick: () => void }

export const DropdownItem = memo(function DropdownItem({ label, icon, danger, onClick }: DropdownMenuItem) {
  return <button type="button" className={`dropdown-item${danger ? ' dropdown-item--danger' : ''}`} onClick={onClick}><span className="dropdown-item__icon" aria-hidden="true">{icon}</span>{label}</button>
})


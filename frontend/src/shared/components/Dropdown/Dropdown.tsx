import { memo, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import DropdownItem, { type DropdownMenuItem } from './components/DropdownItem'

type DropdownProps = { open: boolean; onClose: () => void; header: ReactNode; items: DropdownMenuItem[]; footerItem?: DropdownMenuItem }

const Dropdown = memo(function Dropdown({ open, onClose, header, items, footerItem }: DropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const closeFromOutside = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) onClose() }
    const closeFromEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('mousedown', closeFromOutside)
    document.addEventListener('keydown', closeFromEscape)
    return () => { document.removeEventListener('mousedown', closeFromOutside); document.removeEventListener('keydown', closeFromEscape) }
  }, [open, onClose])
  if (!open) return null
  return <div ref={menuRef} className="dropdown" role="menu">{header}<div className="dropdown__divider" />{items.map((item) => <DropdownItem key={item.label} {...item} />)}{footerItem && <><div className="dropdown__divider" /><DropdownItem {...footerItem} /></>}</div>
})

export default Dropdown

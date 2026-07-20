import './Tabs.scss'

import { memo } from 'react'

type TabsProps = {
  tabs: Array<{ id: string; label: string }>
  activeTab: string
  onChange: (id: string) => void
}

export const Tabs = memo(function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tabs__item ${activeTab === tab.id ? 'tabs__item--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
})


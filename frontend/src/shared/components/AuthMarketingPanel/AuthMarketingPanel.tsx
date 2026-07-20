import './AuthMarketingPanel.scss'

import { memo } from 'react'

type AuthMarketingPanelProps = {
  variant: 'login' | 'signup'
}

export const AuthMarketingPanel = memo(function AuthMarketingPanel({ variant }: AuthMarketingPanelProps) {
  const prefix = variant

  return (
    <section className={`${prefix}__left`}>
      <div className={`${prefix}__grid`} aria-hidden="true" />
      <div className={`${prefix}__logo`}>
        <span className={`${prefix}__icon`}>✦</span>
        <span className={`${prefix}__brand`}>Folio</span>
      </div>

      <div className={`${prefix}__hero`}>
        <h1 className={`${prefix}__heading`}>
          Write what
          <br />
          <span>matters.</span>
        </h1>
        <p className={`${prefix}__description`}>
          A quiet place for long-form writing. No algorithms, no noise — just words and the people who care about them.
        </p>
      </div>

      <div className={`${prefix}__authors`}>
        <div className={`${prefix}__author`}>
          <div className={`${prefix}__avatar`}>{variant === 'login' ? 'MV' : 'AC'}</div>
          <div>
            <div className={`${prefix}__author-name`}>Mara Voss</div>
            <div className={`${prefix}__author-bio`}>Science writer obsessed with deep time and plate tectonics</div>
          </div>
        </div>
        <div className={`${prefix}__author`}>
          <div className={`${prefix}__avatar`}>JR</div>
          <div>
            <div className={`${prefix}__author-name`}>Jonah Reeve</div>
            <div className={`${prefix}__author-bio`}>Photographer, Shoots with film, Slow on Purpose</div>
          </div>
        </div>
      </div>
    </section>
  )
})


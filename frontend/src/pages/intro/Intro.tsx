import './Intro.scss'

import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../../shared/components/ThemeToggle'

export const IntroPage = memo(function IntroPage() {
  return (
    <main className="intro-page">
      <div className="intro-page__grid" aria-hidden="true" />

      <header className="intro-page__header">
        <Link className="intro-page__brand" to="/">
          <span className="intro-page__mark" aria-hidden="true">✦</span>
          Folio 
        </Link>
        <div className="intro-page__actions">
          <ThemeToggle />
          <Link className="intro-page__login" to="/login">Sign in</Link>
        </div>
      </header>

      <section className="intro-page__hero" aria-labelledby="intro-title">
        <p className="intro-page__eyebrow">A home for thoughtful writing</p>
        <h1 id="intro-title">Stories worth<br /><em>staying with.</em></h1>
        <p className="intro-page__description">
          Folio Journal is a quiet space to discover ideas, share your own perspective, and enjoy writing without the noise.
        </p>
        <div className="intro-page__cta-group">
          <Link className="intro-page__cta intro-page__cta--primary" to="/signup">Start writing <span aria-hidden="true">→</span></Link>
          <Link className="intro-page__cta intro-page__cta--secondary" to="/dashboard">Explore the journal</Link>
        </div>
      </section>

      <section className="intro-page__values" aria-label="What Folio offers">
        <article><span>01</span><h2>Read deeply</h2><p>Make room for the ideas that deserve your full attention.</p></article>
        <article><span>02</span><h2>Write freely</h2><p>Publish thoughts, observations, and stories in your own voice.</p></article>
        <article><span>03</span><h2>Keep what matters</h2><p>Save the pieces you want to return to whenever inspiration strikes.</p></article>
      </section>
    </main>
  )
})


import './DashboardGreeting.scss'

import { memo } from 'react'

type DashboardGreetingProps = {
  userName: string
  postCount: number
  onNewPost: () => void
}

export const DashboardGreeting = memo(function DashboardGreeting({
  userName,
  postCount,
  onNewPost,
}: DashboardGreetingProps) {
  return (
    <section className="dashboard__greeting">
      <div>
        <p className="dashboard__feed-label">Your feed</p>
        <h1 className="dashboard__heading">
          Good to see you,
          <br />
          <span className="dashboard__heading-accent">{userName}.</span>
        </h1>
        <p className="dashboard__subtitle">{postCount} posts from the community.</p>
      </div>
      <button className="dashboard__new-post-btn" onClick={onNewPost}>
        <span className="dashboard__new-post-icon">✎</span>
        New post
      </button>
    </section>
  )
})


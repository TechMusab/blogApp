import './DashboardStats.scss';

import { memo, useEffect, useState } from 'react';
import { DashboardService, type DashboardStats } from '../../../../services/DashboardService';
import type { RootState } from '../../../../redux/store';
import { useSelector } from 'react-redux';

export const DashboardStats = memo(function DashboardStats() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    DashboardService.getStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div className="dashboard-stats dashboard-stats--loading">Loading stats...</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="dashboard-stats">
      <div className="dashboard-stats__card">
        <span className="dashboard-stats__label">Total Posts</span>
        <span className="dashboard-stats__value">{stats.totalPosts}</span>
      </div>
      <div className="dashboard-stats__card">
        <span className="dashboard-stats__label">Public</span>
        <span className="dashboard-stats__value dashboard-stats__value--public">{stats.publicPosts}</span>
      </div>
      <div className="dashboard-stats__card">
        <span className="dashboard-stats__label">Friends Only</span>
        <span className="dashboard-stats__value dashboard-stats__value--friends">{stats.friendsOnlyPosts}</span>
      </div>
      <div className="dashboard-stats__card">
        <span className="dashboard-stats__label">Private</span>
        <span className="dashboard-stats__value dashboard-stats__value--private">{stats.privatePosts}</span>
      </div>
      <div className="dashboard-stats__card">
        <span className="dashboard-stats__label">Friends</span>
        <span className="dashboard-stats__value dashboard-stats__value--friends">{stats.friendsCount}</span>
      </div>
      <div className="dashboard-stats__card">
        <span className="dashboard-stats__label">Pending</span>
        <span className="dashboard-stats__value dashboard-stats__value--pending">{stats.pendingRequests}</span>
      </div>
      <div className="dashboard-stats__card">
        <span className="dashboard-stats__label">Received</span>
        <span className="dashboard-stats__value dashboard-stats__value--received">{stats.receivedRequests}</span>
      </div>
    </div>
  );
});

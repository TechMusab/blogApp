import { Suspense, lazy } from 'react'
import { Outlet } from 'react-router-dom'

const Loader = lazy(() => import('../shared/components/Loader'))

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </div>
  )
}

import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Loader from '../shared/components/Loader'

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../components/dashboard/Dashboard'
import { useAppStore } from '../store/useAppStore'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const profile = useAppStore((state) => state.profile)
  return <Dashboard tdee={profile?.tdee ?? 2000} />
}

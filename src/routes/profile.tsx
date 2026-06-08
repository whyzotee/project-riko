import { createFileRoute } from '@tanstack/react-router'
import { Profile } from '../components/profile/Profile'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return <Profile />
}

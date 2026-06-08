import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CameraScanner } from '../components/scan/CameraScanner'

export const Route = createFileRoute('/scan')({
  component: ScanPage,
})

function ScanPage() {
  const navigate = useNavigate()
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex-1">
      <CameraScanner
        onSave={() => {
          navigate({ to: '/' })
          window.location.reload()
        }}
      />
    </div>
  )
}

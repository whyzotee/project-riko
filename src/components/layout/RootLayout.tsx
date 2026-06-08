import { Link, Outlet, useRouter } from '@tanstack/react-router'
import { Home, Camera, User as UserIcon, BarChart3, History } from 'lucide-react'
import { cn } from '../../lib/utils'

export function RootComponent() {
  const router = useRouter()
  const currentPath = router.state.location.pathname

  const navItems = [
    { to: '/', icon: Home, label: 'Diary' },
    { to: '/overview', icon: BarChart3, label: 'Stats' },
    { to: '/scan', icon: Camera, label: 'Scan', isAction: true },
    { to: '/logs', icon: History, label: 'Logs' },
    { to: '/profile', icon: UserIcon, label: 'Profile' },
  ]

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden selection:bg-purple-100">
      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pt-12 no-scrollbar">
        <div className="max-w-md mx-auto min-h-full flex flex-col">
          <Outlet />
          {/* Spacer for Bottom Nav */}
          <div className="h-32 w-full shrink-0" />
        </div>
      </main>

      {/* iOS Style Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 sm:px-6 pb-12 pt-4 ios-blur border-t border-zinc-100/50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = currentPath === item.to
            const Icon = item.icon

            if (item.isAction) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all tap-effect active:scale-90 -mt-12 border-[6px] border-white",
                    isActive
                      ? "bg-purple-600 text-white shadow-purple-300"
                      : "bg-zinc-900 text-white shadow-zinc-400"
                  )}
                >
                  <Icon className="w-8 h-8" />
                </Link>
              )
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300 tap-effect px-2",
                  isActive ? "text-zinc-900" : "text-zinc-300"
                )}
              >
                <Icon
                  className={cn("w-7 h-7", isActive && "fill-zinc-900")}
                />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  )
}

import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useLocation
} from "@tanstack/react-router";
import {
  Camera,
  User as UserIcon,
  BarChart3,
  History,
  Trophy
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAppStore } from "../store/useAppStore";
import { useEffect } from "react";
import { Auth } from "../components/Auth";
import { OnboardingForm } from "../components/OnboardingForm";
import type { MyRouterContext } from "../types/profile";

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent
});

function RootComponent() {
  const { session, profile, loading, initialize, fetchProfile } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) return null;

  if (!session) return <Auth />;

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 transition-colors">
        <div className="w-full max-w-md">
          <OnboardingForm onComplete={() => fetchProfile(session.user.id)} />
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/", icon: Trophy, label: "Quest" },
    { to: "/overview", icon: BarChart3, label: "Stats" },
    { to: "/scan", icon: Camera, label: "Scan", isAction: true },
    { to: "/logs", icon: History, label: "Logs" },
    { to: "/profile", icon: UserIcon, label: "Profile" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 transition-colors">
      {/* Scrollable Content Area */}
      <main className="flex-1 px-4 sm:px-6 pt-12">
        <div className="max-w-md mx-auto min-h-full flex flex-col">
          <Outlet />
          {/* Spacer for Bottom Nav */}
          <div className="h-44 w-full shrink-0" />
        </div>
      </main>

      {/* iOS Style Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 sm:px-6 pb-12 pt-4 ios-blur border-t border-border transition-colors">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.to} to={item.to} className="tap-effect">
                {({ isActive }) => {
                  if (item.isAction) {
                    return (
                      <div
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all -mt-12 border-[6px] border-background",
                          isActive
                             ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                             : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                    );
                  }

                  return (
                    <div
                      className={cn(
                        "flex flex-col items-center gap-1 transition-all duration-300 px-2",
                        isActive ? "text-secondary scale-110" : "text-muted-foreground/40"
                      )}
                    >
                      <Icon className="w-7 h-7" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                        {item.label}
                      </span>
                    </div>
                  );
                }}
              </Link>
            );
          })}
        </div>
      </nav>

      <style>{`
        html, body {
          touch-action: manipulation;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { 
          -ms-overflow-style: none; 
          scrollbar-width: none; 
          -webkit-overflow-scrolling: touch; 
        }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}

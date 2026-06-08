import { useState } from 'react'
import { User as UserIcon, Weight, Scale, Check, Loader2, LogOut, Sun, Moon, Monitor, type LucideIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore, type Theme } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import type { Session } from '@supabase/supabase-js'
import type { Profile as ProfileType } from '@/types/profile'

export function Profile() {
  const session = useAppStore((state) => state.session)
  const profile = useAppStore((state) => state.profile)

  if (!session || !profile) return null

  return <ProfileForm session={session} profile={profile} />
}

function ProfileForm({ session, profile }: { session: Session, profile: ProfileType }) {
  const fetchProfile = useAppStore((state) => state.fetchProfile)
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)
  
  const [weight, setWeight] = useState<string>(profile.weight?.toString() || '')
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleUpdateWeight = async () => {
    if (!weight || isNaN(parseFloat(weight))) return
    
    setUpdating(true)
    setSuccess(false)
    
    const { error } = await supabase
      .from('profiles')
      .update({ weight: parseFloat(weight) })
      .eq('id', session.user.id)

    if (!error) {
      await fetchProfile(session.user.id)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    }
    setUpdating(false)
  }

  const themes: { id: Theme; icon: LucideIcon; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' }
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-20">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-foreground mb-2 px-2 italic uppercase">
          Profile
        </h2>
        <div className="flex items-center gap-2 px-2">
            <UserIcon className="w-3 h-3 text-secondary" />
            <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-[0.25em]">
              Manage your personal stats
            </p>
        </div>
      </div>

      <div className="bg-card p-8 rounded-2xl border border-border shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] -mr-16 -mt-16" />
        
        <div className="w-28 h-28 bg-muted rounded-xl flex items-center justify-center text-foreground shadow-2xl relative z-10 border-[6px] border-card">
          <UserIcon className="w-12 h-12" />
        </div>
        
        <div className="text-center space-y-1 relative z-10">
          <h3 className="font-black text-3xl text-foreground tracking-tighter italic leading-none">
            {session.user.email?.split("@")[0]}
          </h3>
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest mt-1">
            {session.user.email}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mt-4">
           <div className="bg-muted/50 p-6 rounded-2xl border border-border flex flex-col justify-end">
              <Scale className="w-5 h-5 text-secondary mb-3" />
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Height</p>
              <p className="text-2xl font-black text-foreground tracking-tighter italic leading-none">{profile.height}<span className="text-xs ml-1 not-italic opacity-50">CM</span></p>
           </div>
           <div className="bg-muted/50 p-6 rounded-2xl border border-border flex flex-col justify-end">
              <Weight className="w-5 h-5 text-secondary mb-3" />
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Age</p>
              <p className="text-2xl font-black text-foreground tracking-tighter italic leading-none">{profile.age}<span className="text-xs ml-1 not-italic opacity-50">YRS</span></p>
           </div>
         </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-card p-8 rounded-2xl border border-border space-y-6">
        <div>
          <h3 className="font-black text-lg italic tracking-tighter text-foreground">Appearance</h3>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Customize your view</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => {
            const Icon = t.icon
            const isActive = theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all tap-effect",
                  isActive 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Weight Update Card */}
      <div className="bg-card p-8 rounded-2xl border border-border text-foreground shadow-2xl space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[50px] -mr-20 -mt-20 group-hover:bg-primary/20 transition-all duration-700" />
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Weight className="w-5 h-5 text-secondary" />
                </div>
                <div>
                    <h3 className="font-black text-lg italic tracking-tighter">Current Weight</h3>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Update your progress</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-3xl font-black italic tracking-tighter text-secondary">{profile.weight}kg</p>
            </div>
        </div>

        <div className="flex gap-3">
            <div className="relative flex-1">
                <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter weight..."
                    className="w-full bg-background border border-border rounded-xl px-6 py-5 text-xl font-black italic tracking-tight focus:outline-none focus:ring-2 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/30"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">KG</span>
            </div>
            <button
                onClick={handleUpdateWeight}
                disabled={updating || !weight || parseFloat(weight) === Number(profile.weight)}
                className={cn(
                    "px-8 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all tap-effect disabled:opacity-50 disabled:grayscale",
                    success ? "bg-success text-white" : "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                )}
            >
                {updating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : success ? (
                    <Check className="w-5 h-5" />
                ) : (
                    "Save"
                )}
            </button>
        </div>
      </div>
  
      <button
        onClick={() => supabase.auth.signOut()}
        className="w-full flex items-center justify-center gap-3 bg-card text-muted-foreground px-8 py-6 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] border border-border shadow-sm active:scale-95 transition-all hover:text-destructive hover:border-destructive group"
      >
        <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        Sign Out
      </button>
    </div>
  )
}

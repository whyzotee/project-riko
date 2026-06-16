import { useState } from 'react'
import { User as UserIcon, Check, Loader2, LogOut, Sun, Moon, Monitor, type LucideIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore, type Theme } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import type { Session } from '@supabase/supabase-js'
import type { Profile as ProfileType } from '@/types/profile'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select } from '../ui/select'

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
  const [goal, setGoal] = useState<string>(profile.goal || 'maintenance')
  const [activityLevel, setActivityLevel] = useState<string>(profile.activity_level || 'sedentary')
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleUpdateProfile = async () => {
    if (!weight || isNaN(parseFloat(weight))) return
    
    setUpdating(true)
    setSuccess(false)
    
    // Recalculate TDEE based on Mifflin-St Jeor Equation
    let bmr = 10 * parseFloat(weight) + 6.25 * profile.height - 5 * profile.age;
    if (profile.gender === "male") {
      bmr += 5;
    } else if (profile.gender === "female") {
      bmr -= 161;
    } else {
      bmr -= 78; // Neutral average
    }

    const activityFactors = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };

    const goalAdjustments = {
      weight_loss: -500,
      cut: -300,
      maintenance: 0,
      bulk: 300
    };

    const maintenanceCalories = bmr * (activityFactors[activityLevel as keyof typeof activityFactors] || 1.2);
    const targetCalories = Math.round(maintenanceCalories + (goalAdjustments[goal as keyof typeof goalAdjustments] || 0));

    const { error } = await supabase
      .from('profiles')
      .update({ 
        weight: parseFloat(weight),
        goal: goal,
        activity_level: activityLevel,
        tdee: targetCalories
      })
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

      {/* User Info Stats Summary */}
      <div className="bg-card p-8 rounded-2xl border border-border shadow-sm flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] -mr-16 -mt-16" />
        
        <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center text-foreground shadow-sm relative z-10 border-4 border-card">
          <UserIcon className="w-8 h-8" />
        </div>
        
        <div className="text-center space-y-2 relative z-10">
          <h3 className="font-black text-2xl text-foreground tracking-tighter italic leading-none">
            {session.user.email?.split("@")[0]}
          </h3>
          <div className="flex flex-col items-center gap-1">
            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest leading-none">
              TDEE Target: {profile.tdee} kcal
            </p>
            <span className={cn(
              "inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase border mt-1",
              profile.goal === 'bulk' && "bg-secondary/10 text-secondary border-secondary/20",
              (profile.goal === 'cut' || profile.goal === 'weight_loss') && "bg-orange-500/10 text-orange-500 border-orange-500/20",
              (profile.goal === 'maintenance' || !profile.goal) && "bg-primary/10 text-primary border-primary/20"
            )}>
              {profile.goal === 'bulk' ? 'Bulk 📈' : (profile.goal === 'cut' || profile.goal === 'weight_loss' ? 'Cut 📉' : 'Maintain ⚖️')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 w-full mt-2">
          <div className="bg-muted/30 p-3 rounded-xl border border-border text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Height</p>
            <p className="text-base font-black text-foreground italic">{profile.height}cm</p>
          </div>
          <div className="bg-muted/30 p-3 rounded-xl border border-border text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Weight</p>
            <p className="text-base font-black text-secondary italic">{profile.weight}kg</p>
          </div>
          <div className="bg-muted/30 p-3 rounded-xl border border-border text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Age</p>
            <p className="text-base font-black text-foreground italic">{profile.age}y</p>
          </div>
          <div className="bg-muted/30 p-3 rounded-xl border border-border text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Gender</p>
            <p className="text-base font-black text-foreground italic uppercase">{profile.gender}</p>
          </div>
        </div>
      </div>

      {/* Profile Form Stats Edit */}
      <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-5">
        <div>
          <h3 className="text-lg font-black tracking-tight text-foreground">Update Stats & Goals</h3>
          <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Recalculates calorie targets automatically</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">Weight (น้ำหนักปัจจุบัน)</label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="pr-12 text-sm font-semibold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40">KG</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">Goal (เป้าหมายแผนการกิน)</label>
            <Select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="text-sm font-semibold"
            >
              <option value="weight_loss">Cut / Deficit (-500 kcal)</option>
              <option value="cut">Cut / Deficit (-300 kcal)</option>
              <option value="maintenance">Maintain / Maintenance (0 kcal)</option>
              <option value="bulk">Bulk / Surplus (+300 kcal)</option>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">Activity Level (กิจกรรมประจำวัน)</label>
            <Select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="text-sm font-semibold"
            >
              <option value="sedentary">Sedentary (ทำงานออฟฟิศ/ขยับน้อย)</option>
              <option value="lightly_active">Lightly Active (ออกกำลังกาย 1-3 วัน/สัปดาห์)</option>
              <option value="moderately_active">Moderately Active (ออกกำลังกาย 3-5 วัน/สัปดาห์)</option>
              <option value="very_active">Very Active (ออกกำลังกายหนัก 6-7 วัน/สัปดาห์)</option>
              <option value="extra_active">Extra Active (ทำงานใช้แรงงาน/นักกีฬาซ้อมหนัก)</option>
            </Select>
          </div>

          <Button
            onClick={handleUpdateProfile}
            disabled={updating || !weight || (parseFloat(weight) === Number(profile.weight) && goal === profile.goal && activityLevel === profile.activity_level)}
            className={cn(
              "w-full text-xs uppercase tracking-[0.2em]",
              success ? "bg-success hover:bg-success/90 text-white" : ""
            )}
          >
            {updating ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : success ? (
              <Check className="w-4 h-4 mx-auto" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-card p-8 rounded-2xl border border-border space-y-5">
        <div>
          <h3 className="text-lg font-black tracking-tight text-foreground">Appearance</h3>
          <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Customize your view</p>
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
                <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>
  
      <Button
        onClick={() => supabase.auth.signOut()}
        variant="secondary"
        className="w-full flex items-center justify-center gap-3 text-muted-foreground hover:text-destructive border border-border group h-14 rounded-2xl"
      >
        <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sign Out</span>
      </Button>
    </div>
  )
}

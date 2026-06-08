import { useEffect, useState } from "react";
import { TrendingUp, Target, Sparkles } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { supabase } from "../../lib/supabase";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface DailyData {
  day: string;
  calories: number;
  fullDate: string;
  fill?: string;
}

interface MacroStats {
  protein: number;
  carbs: number;
  fat: number;
}

export function Overview() {
  const profile = useAppStore((state) => state.profile);
  const target = profile?.tdee ?? 2000;

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<DailyData[]>([]);
  const [avgIntake, setAvgIntake] = useState(0);
  const [macros, setMacros] = useState<MacroStats>({ protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get last 7 days
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("calorie_logs")
        .select("calories, protein, carbs, fat, created_at")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching overview data:", error);
        setLoading(false);
        return;
      }

      // Process Data for Chart
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const last7Days: DailyData[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - (6 - i));
        return { day: days[d.getDay()], calories: 0, fullDate: d.toLocaleDateString() };
      });

      let totalP = 0, totalC = 0, totalF = 0;
      data?.forEach((log) => {
        const logDate = new Date(log.created_at).toLocaleDateString();
        const chartItem = last7Days.find((item) => item.fullDate === logDate);
        if (chartItem) chartItem.calories += Number(log.calories);
        totalP += Number(log.protein || 0);
        totalC += Number(log.carbs || 0);
        totalF += Number(log.fat || 0);
      });

      last7Days.forEach((item) => {
        item.fill = item.calories > target ? "#ef4444" : "#9810FA";
      });

      const avg = Math.round(last7Days.reduce((acc, curr) => acc + curr.calories, 0) / 7);
      setChartData(last7Days);
      setAvgIntake(avg);

      const totalMacros = totalP + totalC + totalF;
      if (totalMacros > 0) {
        setMacros({
          protein: Math.round((totalP / totalMacros) * 100),
          carbs: Math.round((totalC / totalMacros) * 100),
          fat: Math.round((totalF / totalMacros) * 100)
        });
      }

      setLoading(false);
    }

    fetchData();
  }, [target]);

  const chartConfig = {
    calories: {
      label: "Calories",
      color: "#9810FA"
    }
  } satisfies ChartConfig;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-in fade-in duration-700 bg-background">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <Sparkles className="w-6 h-6 text-secondary fill-secondary animate-pulse" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            Analyzing Trends
          </p>
          <p className="text-xl font-black tracking-tighter text-foreground italic animate-pulse">
            Thinking...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-10">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-foreground mb-2 px-2 italic uppercase">
          Overview
        </h2>
        <div className="flex items-center gap-2 px-2">
          <Sparkles className="w-3 h-3 text-secondary" />
          <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-[0.25em]">
            Real-time weekly insights
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-2xl text-foreground border border-border relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 blur-2xl -mr-10 -mt-10" />
          <Target className="w-6 h-6 text-secondary mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Daily Goal
          </p>
          <p className="text-3xl font-black mt-1 tracking-tighter italic">
            {target}
          </p>
          <p className="text-[9px] font-black text-muted-foreground/60 uppercase mt-1 tracking-widest">
            KCAL TARGET
          </p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-end">
          <TrendingUp className="w-6 h-6 text-secondary mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Avg Intake
          </p>
          <p className="text-3xl font-black mt-1 text-foreground tracking-tighter italic">
            {avgIntake}
          </p>
          <p className="text-[9px] font-black text-muted-foreground uppercase mt-1 tracking-widest">
            7-DAY AVG
          </p>
        </div>
      </div>

      {/* Real Data Chart Card */}
      <div className="bg-card rounded-2xl p-8 border border-border shadow-[0_20px_60px_rgba(0,0,0,0.03)] space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl text-foreground italic tracking-tighter leading-none">
              Calorie Trend
            </h3>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-2">
              Daily performance
            </p>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-border rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ChartContainer config={chartConfig}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="8 8"
                stroke="currentColor"
                className="text-border"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 10, fontWeight: 900 }}
                className="text-muted-foreground"
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 10, fontWeight: 900 }}
                className="text-muted-foreground"
              />
              <ChartTooltip
                cursor={{ fill: "currentColor", radius: 16 }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="calories"
                radius={[16, 16, 16, 16]}
                barSize={36}
                fill="currentColor"
                className="[&_rect]:fill-[--color-calories] transition-all duration-500 hover:opacity-80"
              ></Bar>
            </BarChart>
          </ChartContainer>
        </div>

        <div className="pt-6 border-t border-border flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(152,16,250,0.3)]" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Normal
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-destructive rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Over
              </span>
            </div>
          </div>
          <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
            Last 7 Days
          </p>
        </div>
      </div>

      {/* Macro Breakdown */}
      <div className="bg-card p-8 rounded-2xl border border-border space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[11px] text-muted-foreground uppercase tracking-[0.3em]">
            Macro Balance
          </h3>
          <div className="px-3 py-1 bg-muted rounded-full border border-border">
            <span className="text-[9px] font-black text-foreground uppercase">
              This Week
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5">
          {[
            { label: "Protein", color: "bg-pink-500", percent: macros.protein },
            { label: "Carbs", color: "bg-blue-500", percent: macros.carbs },
            {
              label: "Fat",
              color: "bg-zinc-600",
              percent: macros.fat
            }
          ].map((macro) => (
            <div key={macro.label} className="space-y-2.5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {macro.label}
                </span>
                <span className="text-sm font-black text-foreground">
                  {macro.percent}%
                </span>
              </div>
              <div className="h-3 bg-background rounded-full overflow-hidden border border-border">
                <div
                  className={`h-full ${macro.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${macro.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

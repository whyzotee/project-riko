import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "@tanstack/react-router";
import { History, Utensils, Sparkles, Clock } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface CalorieLog {
  id: number;
  food_name: string;
  calories: number;
  created_at: string;
  image_url?: string;
  signed_url?: string;
}

interface GroupedLogs {
  date: string;
  isToday: boolean;
  isYesterday: boolean;
  totalCalories: number;
  logs: CalorieLog[];
}

function ImageWithSkeleton({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export function Logs() {
  const [groupedLogs, setGroupedLogs] = useState<GroupedLogs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from("calorie_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        let enrichedLogs: CalorieLog[] = data;
        const logsWithImages = enrichedLogs.filter((log) => log.image_url);

        if (logsWithImages.length > 0) {
          const { data: signedData, error: signedError } =
            await supabase.storage.from("food-images").createSignedUrls(
              logsWithImages.map((log) => log.image_url!),
              3600
            );

          if (!signedError && signedData) {
            const urlMap = new Map(
              logsWithImages.map((log, i) => [log.id, signedData[i].signedUrl])
            );
            enrichedLogs = enrichedLogs.map((log) => ({
              ...log,
              signed_url: urlMap.get(log.id)
            }));
          }
        }

        // Grouping logic
        const groups: { [key: string]: GroupedLogs } = {};
        const now = new Date();
        const today = now.toLocaleDateString();
        const yesterday = new Date(
          now.setDate(now.getDate() - 1)
        ).toLocaleDateString();

        enrichedLogs.forEach((log) => {
          const dateObj = new Date(log.created_at);
          const dateStr = dateObj.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric"
          });
          const key = dateObj.toLocaleDateString();

          if (!groups[key]) {
            groups[key] = {
              date: dateStr,
              isToday: key === today,
              isYesterday: key === yesterday,
              totalCalories: 0,
              logs: []
            };
          }
          groups[key].logs.push(log);
          groups[key].totalCalories += Number(log.calories);
        });

        // Convert back to sorted array
        const sortedGroups = Object.keys(groups)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
          .map((key) => groups[key]);

        setGroupedLogs(sortedGroups);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-6">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-foreground mb-2 px-2 italic uppercase">
          History
        </h2>
        <div className="flex items-center gap-2 px-2">
          <History className="w-3.5 h-3.5 text-secondary" />
          <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-[0.25em]">
            Past meal logs by day
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 animate-in fade-in duration-700">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <Sparkles className="w-6 h-6 text-secondary fill-secondary animate-pulse" />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
              Retrieving History
            </p>
            <p className="text-xl font-black tracking-tighter text-foreground italic animate-pulse">
              Thinking...
            </p>
          </div>
        </div>
      ) : groupedLogs.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center space-y-4 border border-border">
          <History className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="font-black text-foreground">
            No logs found
          </p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-loose px-4">
            Scan your first meal to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedLogs.map((group) => (
            <div key={group.date} className="space-y-6">
              {/* Date Header */}
              <div className="flex items-end justify-between px-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">
                    {group.isToday
                      ? "Today"
                      : group.isYesterday
                        ? "Yesterday"
                        : group.date.split(",")[0]}
                  </p>
                  <h3 className="text-2xl font-black text-foreground tracking-tighter italic">
                    {group.isToday || group.isYesterday
                      ? group.date
                      : group.date}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-foreground italic tracking-tighter leading-none">
                    {Math.round(group.totalCalories)}
                  </p>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                    TOTAL KCAL
                  </p>
                </div>
              </div>

              {/* Logs List */}
              <div className="space-y-3">
                {group.logs.map((log) => (
                  <Link
                    key={log.id}
                    to="/logs/$logId"
                    params={{ logId: log.id.toString() }}
                    className="bg-card p-5 rounded-xl border border-border flex items-center gap-5 group hover:bg-card/90 hover:border-border/80 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-secondary transition-all shadow-sm shrink-0 overflow-hidden relative">
                      {log.signed_url ? (
                        <ImageWithSkeleton
                          src={log.signed_url}
                          alt={log.food_name}
                        />
                      ) : (
                        <Utensils className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-black text-foreground tracking-tighter italic truncate leading-tight">
                        {log.food_name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 text-secondary">
                          <Sparkles className="w-3 h-3 fill-secondary/20" />
                          <p className="text-sm font-black italic tracking-tight">
                            {Math.round(log.calories)}{" "}
                            <span className="text-[10px] not-italic opacity-50 uppercase tracking-widest ml-0.5">
                              kcal
                            </span>
                          </p>
                        </div>
                        <div className="w-1 h-1 bg-border rounded-full" />
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {new Date(log.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

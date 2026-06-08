import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft,
  Clock,
  Calendar,
  Trash2,
  Sparkles
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NutritionDisplay } from "@/components/NutritionDisplay";
import type { NutritionData } from "@/components/NutritionDisplay";

interface LogDetail extends NutritionData {
  id: number;
  food_name: string;
  image_url: string | null;
  created_at: string;
}

export const Route = createFileRoute("/logs_/$logId")({
  component: LogDetailPage
});

function LogDetailPage() {
  const { logId } = useParams({ from: "/logs_/$logId" });
  const [log, setLog] = useState<LogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchLogDetail() {
      const { data } = await supabase
        .from("calorie_logs")
        .select("*")
        .eq("id", logId)
        .single();

      if (data) {
        setLog(data);

        if (data.image_url) {
          const { data: imgData } = await supabase.storage
            .from("food-images")
            .createSignedUrl(data.image_url, 3600);
          if (imgData) setImageUrl(imgData.signedUrl);
        }
      }
      setLoading(false);
    }
    fetchLogDetail();
  }, [logId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this log?")) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from("calorie_logs")
      .delete()
      .eq("id", logId);

    if (!error) {
      window.history.back();
    } else {
      setIsDeleting(false);
      alert("Failed to delete log");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 animate-in fade-in duration-700 bg-background">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <Sparkles className="w-6 h-6 text-secondary fill-secondary animate-pulse" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Fetching Details</p>
          <p className="text-xl font-black tracking-tighter text-foreground italic animate-pulse">Thinking...</p>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-muted-foreground font-black uppercase tracking-widest">Log not found</p>
        <Link to="/logs" className="text-secondary font-bold underline underline-offset-4 decoration-2">Go back to History</Link>
      </div>
    );
  }

  const date = new Date(log.created_at);

  return (
    <div className="flex flex-col min-h-full relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 ios-blur px-6 pt-8 pb-4 flex items-center justify-between border-b border-border">
        <div className="max-w-md mx-auto w-full flex items-center justify-between">
          <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-center bg-muted rounded-xl text-muted-foreground tap-effect">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">History Detail</h1>
            <p className="text-xs font-black text-foreground mt-0.5 uppercase tracking-widest">
              {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
          <button 
            onClick={handleDelete} 
            disabled={isDeleting} 
            className="w-10 h-10 flex items-center justify-center bg-muted rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors tap-effect"
          >
            {isDeleting ? <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <main className="flex-1 pt-24 pb-10">
        <div className="max-w-md mx-auto px-6 space-y-8">
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl dark:shadow-none border border-border group">
              {imageUrl ? (
                <>
                  {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full rounded-2xl bg-muted animate-pulse" />}
                  <img
                    src={imageUrl}
                    alt={log.food_name}
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground/30">
                  <Skeleton className="w-full h-full rounded-2xl" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <h2 className="text-4xl font-black text-white tracking-tighter italic leading-tight">{log.food_name}</h2>
              </div>
            </div>

            <div className="flex items-center gap-4 px-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="w-1 h-1 rounded-full bg-border"></div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {date.toLocaleDateString("en-US", { weekday: "long" })}
                </p>
              </div>
            </div>
          </div>

          <NutritionDisplay
            data={log}
            isEditing={false}
            showAIRefine={false}
          />
        </div>
      </main>
    </div>
  );
}

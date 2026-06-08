import React, { useState, useRef } from "react";
import { Check, Sparkles, X, ChevronRight, Clock, Calendar, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { cn } from "@/lib/utils";
import { NutritionDisplay } from "./NutritionDisplay";
import type { NutritionData } from "./NutritionDisplay";
import { ImageSelector } from "./ImageSelector";

interface FoodAnalysis extends NutritionData {
  food_name: string;
  serving_size?: number;
  unit?: string;
}

export const CameraScanner: React.FC<{ onSave: () => void }> = ({ onSave }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [editableName, setEditableName] = useState("");
  const [editableData, setEditableData] = useState<NutritionData>({
    calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, sodium: 0
  });
  const [editableServing, setEditableServing] = useState(100);
  const [editableUnit, setEditableUnit] = useState("g");
  const [refinementText, setRefinementText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalysis(null);
    setImage(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImage(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string, description?: string) => {
    if (description) setIsRefining(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { image: base64, description: description }
      });
      if (error) throw error;
      const res = data as FoodAnalysis;
      setEditableName(res.food_name || "Unknown Food");
      setEditableData({
        calories: parseNumeric(res.calories),
        protein: parseNumeric(res.protein),
        carbs: parseNumeric(res.carbs),
        fat: parseNumeric(res.fat),
        sugar: parseNumeric(res.sugar),
        sodium: parseNumeric(res.sodium)
      });
      setEditableServing(parseNumeric(res.serving_size) || 100);
      setEditableUnit(res.unit || "g");
      if (description) setRefinementText("");
      setAnalysis(res);
    } catch (err: unknown) {
      console.error("Analysis Error:", err);
      const message = err instanceof Error ? err.message : "Error analyzing image. Please try again.";
      alert(message);
      if (!description) setImage(null);
    } finally {
      setLoading(false);
      setIsRefining(false);
    }
  };

  const parseNumeric = (val: string | number | null | undefined): number => {
    if (val === null || val === undefined) return 0;
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const saveLog = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      let imagePath = null;

      if (image) {
        const base64Data = image.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/jpeg" });
        const fileName = `${Date.now()}.jpg`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("food-images")
          .upload(filePath, blob, { contentType: "image/jpeg", upsert: false });

        if (uploadError) throw uploadError;
        imagePath = filePath;
      }

      const { error } = await supabase.from("calorie_logs").insert({
        user_id: user.id,
        food_name: editableName,
        ...editableData,
        image_url: imagePath
      });
      if (error) throw error;
      onSave();
    } catch (err: unknown) {
      console.error("Save Log Error:", err);
      alert(err instanceof Error ? err.message : "Failed to save log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 h-full flex flex-col pb-6">
      {!image && (
        <div className="space-y-2 mb-4 px-2">
          <h2 className="text-4xl font-black tracking-tight text-foreground mb-2 italic uppercase">
            Scan <span className="text-secondary">Food.</span>
          </h2>
          <p className="text-muted-foreground font-bold text-[10px] tracking-[0.2em] uppercase">
            AI Powered Nutrition Analysis
          </p>
        </div>
      )}

      {!image && (
        <ImageSelector
          cameraInputRef={cameraInputRef}
          fileInputRef={fileInputRef}
          onCapture={handleCapture}
        />
      )}

      {image && (
        <div className="flex-1 flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-border group">
              <img src={image} alt="Food" className="w-full h-full object-cover" />
              {loading && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
                  <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <Sparkles className="w-6 h-6 text-secondary fill-secondary animate-pulse" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Scanning Pixels</p>
                  <p className="text-xl font-black tracking-tighter text-foreground italic animate-pulse">Thinking...</p>
                </div>
              )}
              {!loading && (
                <button
                  type="button"
                  onClick={() => { setImage(null); setAnalysis(null); }}
                  className="absolute top-6 right-6 w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-xl flex items-center justify-center transition-all tap-effect z-30"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                <div className="space-y-1 w-full">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editableName}
                        onChange={(e) => setEditableName(e.target.value)}
                        className="text-4xl font-black text-white tracking-tighter italic bg-background/50 border border-border rounded-xl px-2 w-full outline-none"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editableServing}
                          onChange={(e) => setEditableServing(Number(e.target.value))}
                          className="text-xl font-black text-white tracking-tighter italic bg-background/50 border border-border rounded-lg px-2 w-24 outline-none"
                        />
                        <input
                          type="text"
                          value={editableUnit}
                          onChange={(e) => setEditableUnit(e.target.value)}
                          className="text-xl font-black text-white tracking-tighter italic bg-background/50 border border-border rounded-lg px-2 w-20 outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h2 className="text-4xl font-black text-white tracking-tighter italic leading-tight">
                        {editableName || "Scanning..."}
                      </h2>
                      {analysis && (
                        <p className="text-white/60 font-black italic tracking-tight">
                          {editableServing}{editableUnit} serving
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="w-1 h-1 rounded-full bg-border"></div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Today</p>
                </div>
              </div>

              {analysis && !loading && (
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all tap-effect",
                    isEditing ? "bg-success text-white shadow-lg shadow-success/20" : "bg-muted text-muted-foreground border border-border"
                  )}
                >
                  {isEditing ? <><Check className="w-3.5 h-3.5" /> Save</> : "Edit"}
                </button>
              )}
            </div>
          </div>

          {analysis && !loading && (
            <>
              <NutritionDisplay
                data={editableData}
                isEditing={isEditing}
                onDataChange={(newData) => setEditableData((prev) => ({ ...prev, ...newData }))}
                showAIRefine={true}
                refinementText={refinementText}
                onRefinementTextChange={setRefinementText}
                onAIRefine={() => analyzeImage(image!, refinementText)}
                isRefining={isRefining}
              />

              <button
                type="button"
                onClick={saveLog}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground h-24 rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-4 tap-effect hover:scale-[1.02] transition-all group disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-primary-foreground/15 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                  {loading ? <Loader2 className="animate-spin" /> : <Check className="w-7 h-7" />}
                </div>
                {loading ? "Saving..." : "Log Meal"}
                <ChevronRight className="w-7 h-7 text-primary-foreground/60 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

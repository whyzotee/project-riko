import React, { useState } from "react";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PointsCardProps {
  points: number;
  streak: number;
}

export const PointsCard: React.FC<PointsCardProps> = ({ points }) => {
  const [showRankDetails, setShowRankDetails] = useState(false);

  const getRank = (pts: number) => {
    if (pts >= 12000) return "Gym Lord 👑";
    if (pts >= 6000) return "Pro Lifter ⚡";
    if (pts >= 3000) return "Iron Lifter 🏋️";
    if (pts >= 1000) return "Active Walker 👟";
    return "Rookie 🌱";
  };

  const ranks = [
    { name: "Rookie 🌱", target: 0, desc: "เริ่มต้นก้าวแรกแห่งการฟิตร่างกาย (สัปดาห์แรก)" },
    { name: "Active Walker 👟", target: 1000, desc: "เดินชันและขยับตัวต่อเนื่อง (สะสมแต้ม 2-3 สัปดาห์)" },
    { name: "Iron Lifter 🏋️", target: 3000, desc: "เข้ายิมยกเหล็กสร้างกล้ามเนื้อจริงจัง (สะสมแต้ม 1-2 เดือน)" },
    { name: "Pro Lifter ⚡", target: 6000, desc: "วินัยดีเลิศ ร่างกายเริ่มเปลี่ยนแปลงชัดเจน (สะสมแต้ม 3 เดือน)" },
    { name: "Gym Lord 👑", target: 12000, desc: "ราชาฟิตเนสผู้ครองวินัยเหล็กและครอบครองหุ่นในฝัน (สะสมแต้ม 6 เดือนขึ้นไป)" }
  ];

  const currentRankName = getRank(points);

  return (
    <div className="relative group">
      <div className="absolute -inset-4 bg-primary/10 rounded-2xl blur-3xl transition-all duration-700"></div>
      <div 
        onClick={() => setShowRankDetails(!showRankDetails)}
        className="bg-card rounded-2xl p-6 text-foreground relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] border border-border overflow-hidden cursor-pointer hover:border-primary/40 transition-colors select-none"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -mr-32 -mt-32"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-[0.3em] text-secondary uppercase">
              POINTS BALANCE
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <Coins className="w-8 h-8 text-gold fill-gold animate-pulse shrink-0" />
              <h3 className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-200 to-white leading-none pr-3">
                {points.toLocaleString()}
              </h3>
              <span className="text-muted-foreground text-xs font-black uppercase tracking-widest italic self-end pb-0.5">PTS</span>
            </div>
          </div>
          <div className="sm:text-right border-t border-border/50 sm:border-none pt-3 sm:pt-0">
            <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase flex items-center sm:justify-end gap-1.5">
              RANK <span className="text-secondary text-[9px] bg-secondary/15 px-1.5 py-0.5 rounded font-bold">INFO ℹ️</span>
            </span>
            <p className="font-black text-xl italic text-secondary">
              {currentRankName}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {showRankDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-border/50 mt-4 pt-4 space-y-3 overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                  Rank Progression
                </p>
                <p className="text-[9px] font-bold text-secondary">
                  เป้าหมายแต้มสะสม
                </p>
              </div>
              <div className="space-y-2">
                {ranks.map((r) => {
                  const isCurrent = currentRankName === r.name;
                  const isUnlocked = points >= r.target;
                  return (
                    <div
                      key={r.name}
                      className={cn(
                        "p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors",
                        isCurrent
                          ? "bg-primary/15 border-primary/40 text-foreground"
                          : isUnlocked
                            ? "bg-muted/30 border-border/40 text-muted-foreground"
                            : "bg-background/40 border-border/20 text-muted-foreground/50"
                      )}
                    >
                      <div>
                        <p className={cn("font-black", isCurrent ? "text-secondary" : "text-foreground")}>
                          {r.name} {isCurrent && " (แรงค์ปัจจุบัน)"}
                        </p>
                        <p className="text-[9px] text-muted-foreground/80 mt-0.5">{r.desc}</p>
                      </div>
                      <span className="font-black text-right shrink-0">
                        {r.target === 0 ? "เริ่มต้น" : `>= ${r.target} PTS`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

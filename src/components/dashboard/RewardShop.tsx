import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useGamifyStore } from "../../store/useGamifyStore";
import type { Reward } from "../../store/useGamifyStore";

interface RewardShopProps {
  onRedeemSuccess: (reward: Reward) => void;
}

export const RewardShop: React.FC<RewardShopProps> = ({ onRedeemSuccess }) => {
  const {
    points,
    customRewards,
    redeemedHistory,
    addCustomReward,
    deleteCustomReward,
    redeemReward,
  } = useGamifyStore();

  const [showAddReward, setShowAddReward] = useState(false);
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardPoints, setNewRewardPoints] = useState(200);
  const [newRewardEmoji, setNewRewardEmoji] = useState("🍲");

  const defaultRewards: Reward[] = [
    { id: "shabu", name: "ชาบูมื้อใหญ่", points: 500, emoji: "🍲" },
    { id: "bubble-tea", name: "ชานมไข่มุกหวานร้อย", points: 150, emoji: "🧋" },
    { id: "bingsu", name: "บิงซูสตรอว์เบอร์รี", points: 250, emoji: "🍧" },
    { id: "mookata", name: "หมูกระทะเยียวยาใจ", points: 450, emoji: "🥩" },
    { id: "pizza", name: "พิซซ่าถาดใหญ่", points: 400, emoji: "🍕" },
    { id: "starbucks", name: "สตาร์บัคส์หวานเจี๊ยบ", points: 120, emoji: "☕" }
  ];

  const allRewards = [...defaultRewards, ...customRewards];

  const handleRedeem = (reward: Reward) => {
    if (points < reward.points) return;
    const success = redeemReward(reward);
    if (success) {
      onRedeemSuccess(reward);
    }
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardName.trim()) return;
    addCustomReward(newRewardName, newRewardPoints, newRewardEmoji);
    setNewRewardName("");
    setNewRewardPoints(200);
    setNewRewardEmoji("🍲");
    setShowAddReward(false);
  };

  return (
    <div className="space-y-8">
      {/* Rewards Shop Section */}
      <section className="space-y-5">
        <div className="flex justify-between items-end px-1">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter italic uppercase">
              Reward Shop
            </h3>
            <p className="text-muted-foreground font-black text-[9px] tracking-[0.2em] uppercase">
              สะสมแต้มไว้แลกของอร่อย
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddReward(!showAddReward)}
            className="px-4 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Reward
          </motion.button>
        </div>

        {/* Custom Reward Creation Form */}
        <AnimatePresence>
          {showAddReward && (
            <motion.form
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleCreateReward}
              className="bg-card p-6 rounded-2xl border border-border space-y-4 shadow-md"
            >
              <h4 className="font-black text-foreground text-base">สร้างรางวัลใหม่ส่วนตัว</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-[9px] font-black tracking-widest uppercase text-muted-foreground block mb-1">ชื่อของรางวัล</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ชาบูลุยเดี่ยว, โดนัท 2 ชิ้น"
                    value={newRewardName}
                    onChange={(e) => setNewRewardName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black tracking-widest uppercase text-muted-foreground block mb-1">แต้มที่ต้องใช้</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newRewardPoints}
                      onChange={(e) => setNewRewardPoints(parseInt(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black tracking-widest uppercase text-muted-foreground block mb-1">เลือกอิโมจิ</label>
                    <select
                      value={newRewardEmoji}
                      onChange={(e) => setNewRewardEmoji(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                      <option value="🍲">🍲 ชาบู</option>
                      <option value="🧋">🧋 ชานม</option>
                      <option value="🍧">🍧 บิงซู</option>
                      <option value="🥩">🥩 หมูกระทะ</option>
                      <option value="🍕">🍕 พิซซ่า</option>
                      <option value="☕">☕ กาแฟ/คาเฟ่</option>
                      <option value="🍰">🍰 เค้ก/ของหวาน</option>
                      <option value="🍺">🍺 เบียร์/ปาร์ตี้</option>
                      <option value="🛍️">🛍️ ช้อปปิ้ง</option>
                      <option value="🎮">🎮 เกม</option>
                      <option value="😴">😴 นอนเล่น</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddReward(false)}
                  className="px-4 py-2 text-muted-foreground font-bold text-xs uppercase tracking-widest"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/95"
                >
                  บันทึกรางวัล
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 gap-3">
          {allRewards.map((reward) => {
            const canAfford = points >= reward.points;

            return (
              <div
                key={reward.id}
                className="bg-card p-4 sm:p-5 rounded-2xl border border-border flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl relative shadow-inner">
                    {reward.emoji}
                  </div>
                  <div>
                    <h4 className="font-black text-foreground text-base leading-none mb-1">
                      {reward.name}
                    </h4>
                    <p className="text-[10px] font-black text-muted-foreground tracking-wider uppercase">
                      ต้องการ {reward.points} PTS
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {reward.isCustom && (
                    <button
                      type="button"
                      onClick={() => deleteCustomReward(reward.id)}
                      className="text-muted-foreground hover:text-destructive p-2 transition-colors"
                      title="ลบรางวัล"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleRedeem(reward)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all tap-effect",
                      canAfford
                        ? "bg-gold hover:bg-gold/90 text-zinc-950 shadow-[0_4px_12px_rgba(250,204,21,0.25)] hover:scale-[1.02]"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    แลกแต้ม
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Redeemed History Section */}
      {redeemedHistory.length > 0 && (
        <section className="space-y-4">
          <h4 className="font-black text-foreground text-lg tracking-tight px-1">
            ประวัติการแลกรางวัล
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {redeemedHistory.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card px-4 py-3 rounded-xl flex items-center justify-between border border-border"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{item.emoji}</span>
                  <div>
                    <p className="font-black text-xs text-foreground leading-none mb-0.5">
                      {item.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                      {new Date(item.redeemedAt).toLocaleDateString("th-TH")} •{" "}
                      {new Date(item.redeemedAt).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black italic text-destructive">
                  -{item.points} PTS
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

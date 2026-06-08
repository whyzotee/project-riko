import React, { useEffect, useState, useRef } from "react";
import { useGamifyStore } from "../../store/useGamifyStore";
import { useAppStore } from "../../store/useAppStore";
import rikoImg from "../../assets/riko.png";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { getRikoReply } from "../../lib/rikoAgent";

interface Log {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  created_at: string;
}

interface CoachRikoChatProps {
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  tdee: number;
  logs: Log[];
}

export const CoachRikoChat: React.FC<CoachRikoChatProps> = ({
  showChat,
  setShowChat,
  tdee,
  logs,
}) => {
  const { session } = useAppStore();
  const {
    points,
    streak,
    history,
    chatHistory,
    addChatMessage,
    clearChatHistory
  } = useGamifyStore();

  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getUserName = () => {
    if (session?.user?.user_metadata?.full_name) return session.user.user_metadata.full_name as string;
    if (session?.user?.user_metadata?.name) return session.user.user_metadata.name as string;
    if (session?.user?.email) return session.user.email.split("@")[0];
    return "คนเก่ง";
  };

  const getRandomGreeting = (name: string) => {
    const greetings = [
      `สวัสดีค่ะคุณ ${name}! วันนี้เหนื่อยไหมคะ? โค้ชริโกะพร้อมคุยและให้คำแนะนำดีๆ เรื่องออกกำลังกายและอาหารการกินแล้วน้า มีอะไรระบายหรือถามริโกะได้เลยนะ! 🎀🥺💖`,
      `เย้! ดีใจจังที่ได้คุยกับคุณ ${name} อีกครั้งน้า วันนี้ฟิตร่างกายมาหรือยังคะ? หรือถ้ากำลังมีเรื่องท้อใจ คุยกับริโกะได้เสมอนะคะ ริโกะพร้อมส่งพลังบวกให้เต็มที่เลย! 🏋️‍♀️💪✨`,
      `ฮั่นแน่! วันนี้กินของอร่อยอะไรมาหรือยังคะคุณ ${name} 🎀 มาสะสมแต้มแคลฟรีเพื่อไปแลกรางวัลกันเถอะค่ะ! วันนี้มีอะไรอยากปรึกษาเรื่องฟิตเนสถามริโกะได้เลยน้า 💖🧋`,
      `สวัสดีค่ะคุณ ${name} ริโกะสแตนด์บายรอเชียร์อยู่แล้วน้า! วันนี้มาชาเลนจ์ยิมหรือเดินชันดีคะ? คุยกับริโกะได้ทุกเรื่องเลยนะคะ ไม่ว่าจะกินหลุดหรือเหนื่อยแค่ไหนก็ตาม 🥺🎀`,
      `สวัสดีค่ะคุณ ${name} โค้ชริโกะสแตนด์บายแล้วค่ะ! วันนี้เป้าหมายสุขภาพเป็นอย่างไรบ้างคะ? เล่าให้ริโกะฟังหน่อยน้า ริโกะพร้อมคอยช่วยแนะแนวและเป็นกำลังใจให้เสมอเลย! 💖💪`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, chatLoading]);

  useEffect(() => {
    if (showChat && chatHistory.length <= 1) {
      const username = getUserName();
      const currentGreeting = chatHistory[0]?.text;
      
      const greetingPatternList = [
        "สวัสดีค่ะคุณ",
        "เย้! ดีใจจังที่ได้คุยกับคุณ",
        "ฮั่นแน่! วันนี้กินของอร่อยอะไรมาหรือยังคะคุณ",
        "สวัสดีค่ะ! โค้ชริโกะยินดีที่ได้คุยกับคุณ"
      ];
      
      const isCustomGreetingAlreadySet = currentGreeting && greetingPatternList.some(pattern => 
        currentGreeting.startsWith(pattern) && !currentGreeting.includes("สวัสดีค่ะ! โค้ชริโกะยินดีที่ได้คุยกับคุณในวันนี้น้า")
      );

      if (!isCustomGreetingAlreadySet) {
        const randomGreeting = getRandomGreeting(username);
        clearChatHistory(randomGreeting);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChat]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim() || chatLoading) return;

    const newUserMessage = { sender: "user" as const, text: messageText };
    addChatMessage(newUserMessage);
    setChatInput("");
    setChatLoading(true);

    try {
      const reply = await getRikoReply({
        chatHistory,
        messageText,
        userName: getUserName(),
        tdee,
        logs,
        history,
        points,
        streak,
      });
      addChatMessage({ sender: "riko", text: reply });
    } catch (err) {
      console.error(err);
      addChatMessage({
        sender: "riko",
        text: "ริโกะสัญญาณเน็ตขัดข้องนิดหน่อยค่ะ... แต่ใจริโกะยังส่งพลังเชียร์คุณเต็มที่เสมอนะคะ! สู้ๆ น้า! 💖🎀"
      });
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showChat && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowChat(false)}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md h-[80vh] bg-card rounded-t-[2.5rem] border-t border-border shadow-[0_-16px_48px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/20 bg-background/50 shadow-md">
                  <img src={rikoImg} alt="Riko" className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <h5 className="font-black text-foreground text-sm flex items-center gap-1.5 leading-none mb-1">
                    Coach Riko 🎀
                  </h5>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Online / คุยกับริโกะ</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("คุณต้องการล้างประวัติการแชททั้งหมดใช่หรือไม่?")) {
                      const username = getUserName();
                      const randomGreeting = getRandomGreeting(username);
                      clearChatHistory(randomGreeting);
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors tap-effect"
                  title="ล้างประวัติการแชท"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowChat(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages scroll area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {chatHistory.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={cn(
                    "flex gap-2.5 max-w-[85%]",
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  {msg.sender === "riko" && (
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/20 bg-background shrink-0 mt-0.5 shadow-sm">
                      <img src={rikoImg} alt="Riko" className="w-full h-full object-cover object-top" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-xs font-bold leading-relaxed",
                      msg.sender === "user"
                        ? "bg-secondary text-white rounded-tr-none shadow-[0_4px_12px_rgba(192,132,252,0.15)]"
                        : "bg-muted text-foreground rounded-tl-none"
                    )}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {chatLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex gap-2.5 max-w-[85%] mr-auto items-center"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/20 bg-background shrink-0 shadow-sm">
                    <img src={rikoImg} alt="Riko" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="px-4 py-2.5 bg-muted text-muted-foreground rounded-2xl rounded-tl-none text-xs font-bold flex items-center gap-1.5">
                    ริโกะกำลังคิด
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce delay-100"></span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce delay-200"></span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce delay-300"></span>
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-6 py-2.5 overflow-x-auto no-scrollbar flex gap-2 border-t border-border/40 bg-card select-none">
              {[
                "💡 วันนี้กินอะไรดีน้า?",
                "💡 ขอกำลังใจออกกำลังกายหน่อย!",
                "💡 วันนี้กินชานมไข่มุกมา แก้ไงดี?",
                "💡 แนะนำท่าลดหน้าท้องหน่อย"
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={chatLoading}
                  onClick={() => handleSendMessage(chip.replace("💡 ", ""))}
                  className="px-3.5 py-1.5 bg-muted hover:bg-muted/80 text-[10px] font-black text-muted-foreground hover:text-foreground rounded-full border border-border/50 shrink-0 transition-colors tap-effect"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="px-6 pb-8 pt-3 border-t border-border bg-card flex gap-2 items-center"
            >
              <input
                type="text"
                disabled={chatLoading}
                placeholder="คุยอะไรกับริโกะดีน้า..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-background border border-border text-foreground px-4 py-2.5 rounded-full text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="w-9 h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all tap-effect shrink-0 shadow-lg shadow-primary/20"
              >
                <Send className="w-4 h-4 fill-primary-foreground stroke-none" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

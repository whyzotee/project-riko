import type { Meal } from "../store/useMealPlanStore";

export const FALLBACK_MEALS: Record<Meal["type"], Meal[]> = {
  breakfast: [
    { type: "breakfast", name: "อกไก่นุ่มกระเทียม + ไข่ต้ม 2 ฟอง", calories: 270, protein: 32, fat: 10, carbs: 2, location: "7-Eleven" },
    { type: "breakfast", name: "แซนด์วิชกระเป๋าอกไก่หยอง + นมโปรตีนสูงรสจืด", calories: 340, protein: 33, fat: 6, carbs: 38, location: "7-Eleven" },
    { type: "breakfast", name: "ข้าวราดแกงผัดขิงอกไก่ + ไข่ต้ม", calories: 340, protein: 26, fat: 8, carbs: 40, location: "ร้านข้าวแกง" },
    { type: "breakfast", name: "ข้าวต้มอกไก่ฉีกโรยขิงใส่ไข่", calories: 290, protein: 20, fat: 7, carbs: 36, location: "ตามสั่ง" },
  ],
  lunch: [
    { type: "lunch", name: "ข้าวกะเพราอกไก่ชิ้น (น้ำมันน้อย) + ไข่ดาว", calories: 460, protein: 34, fat: 12, carbs: 52, location: "ตามสั่ง" },
    { type: "lunch", name: "เส้นหมี่น้ำใสอกไก่ฉีกพิเศษ", calories: 310, protein: 22, fat: 4, carbs: 45, location: "ร้านก๋วยเตี๋ยว" },
    { type: "lunch", name: "ข้าวราดแกงส้มผักรวม + ปลานึ่ง", calories: 320, protein: 24, fat: 6, carbs: 42, location: "ร้านข้าวแกง" },
    { type: "lunch", name: "เกาเหลาลูกชิ้นปลาต้มยำพิเศษ + ข้าวสวย", calories: 350, protein: 26, fat: 8, carbs: 45, location: "ร้านก๋วยเตี๋ยว" },
  ],
  dinner: [
    { type: "dinner", name: "สุกี้น้ำอกไก่เน้นผักและไข่", calories: 330, protein: 28, fat: 7, carbs: 38, location: "ตามสั่ง" },
    { type: "dinner", name: "แกงจืดเต้าหู้หมูสับสาหร่าย + ข้าวกล้อง", calories: 300, protein: 22, fat: 9, carbs: 35, location: "ร้านข้าวแกง" },
    { type: "dinner", name: "เกาเหลาไก่ฉีกน้ำใสใส่ผักเยอะๆ", calories: 210, protein: 22, fat: 4, carbs: 15, location: "ร้านก๋วยเตี๋ยว" },
    { type: "dinner", name: "สลัดทูน่าในน้ำแร่ + อกไก่นุ่มพริกไทยดำ", calories: 230, protein: 32, fat: 4, carbs: 16, location: "7-Eleven" },
  ],
  snack: [
    { type: "snack", name: "นม Meiji High Protein รสจืด/หวานน้อย", calories: 170, protein: 28, fat: 2, carbs: 10, location: "7-Eleven" },
    { type: "snack", name: "ถั่วแระญี่ปุ่นต้มเซเว่น", calories: 110, protein: 9, fat: 3, carbs: 12, location: "7-Eleven" },
    { type: "snack", name: "ถั่วอัลมอนด์อบธรรมชาติ 1 ซอง", calories: 160, protein: 6, fat: 14, carbs: 5, location: "7-Eleven" },
    { type: "snack", name: "โยเกิร์ตไขมันต่ำ 0% + กล้วยหอมทอง", calories: 160, protein: 7, fat: 0, carbs: 33, location: "7-Eleven" },
  ],
};

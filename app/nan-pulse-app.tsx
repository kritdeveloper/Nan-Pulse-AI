"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type View = "mission" | "copilot" | "planner";
type MissionSection = "today" | "opportunities" | "twin" | "forecast" | "impact" | "evaluation";
type Locale = "th" | "en";

const LocaleContext = createContext<Locale>("th");
const localize = (locale: Locale, th: string, en: string) => locale === "th" ? th : en;
function useLocale() {
  const locale = useContext(LocaleContext);
  return { locale, tr: (th: string, en: string) => localize(locale, th, en) };
}

const views: Array<{ id: View; label: string; note: string; mark: string }> = [
  { id: "mission", label: "Mission Control", note: "For tourism authorities", mark: "◎" },
  { id: "copilot", label: "Community Copilot", note: "For local operators", mark: "✦" },
  { id: "planner", label: "Experience Planner", note: "For travelers", mark: "↗" },
];

const officialSources = [
  { name: "ททท. จังหวัดน่าน", use: "แหล่งท่องเที่ยวและอัตลักษณ์พื้นที่", url: "https://thai.tourismthailand.org/Destinations/Provinces/%E0%B8%99%E0%B9%88%E0%B8%B2%E0%B8%99/108", status: "Verified source" },
  { name: "5 Must Do in Nan", use: "เทศกาล อาหาร กิจกรรม และผลิตภัณฑ์", url: "https://thai.tourismthailand.org/Articles/5-must-do-in-nan", status: "Verified source" },
  { name: "TAT Data API", use: "Tourism data connector", url: "https://tatdataapi.io/", status: "Connector ready" },
  { name: "ททท.สำนักงานน่าน", use: "ข่าวและกิจกรรมล่าสุด", url: "https://www.facebook.com/tat.nan.office/", status: "Monitoring channel" },
  { name: "ท่องเที่ยวและกีฬาจังหวัดน่าน", use: "สถิติการท่องเที่ยวทางการ", url: "https://nan.mots.go.th/", status: "Verified source" },
  { name: "GD Catalog · Tourism Situation", use: "ชุดข้อมูลสรุปสถานการณ์รายเดือน", url: "https://gdcatalog.go.th/dataset/gdpublish-dataset-40-0111", status: "Government dataset" },
  { name: "GD Catalog · Tourism Calendar", use: "ปฏิทินกิจกรรมประจำปี", url: "https://gdcatalog.go.th/dataset/gdpublish-40-021", status: "Government dataset" },
];

const months = [
  { month: "ม.ค.", title: "Maneepruek Coffee", community: "ทุ่งช้าง", confidence: 92, state: "recommended", campaign: "Nan First Harvest", audience: "Coffee lovers", window: "ม.ค. · ตรวจวันจัดอีกครั้ง", channels: "Creator stories · Café partners", impact: "+148K บาท", kpi: "Off-season experiences", need: "High", season: "Coffee learning", demand: "Growing" },
  { month: "ก.พ.", title: "Craft & Flowers", community: "ท่าวังผา", confidence: 81, state: "ready", campaign: "Craft in Bloom", audience: "Families", window: "3–18 ก.พ.", channels: "Family media · Schools", impact: "+84K บาท", kpi: "Community participation", need: "Medium", season: "Good", demand: "Stable" },
  { month: "มี.ค.", title: "Hok Peng Tradition", community: "ภูเพียง", confidence: 91, state: "recommended", campaign: "Faith & Living Nan", audience: "Culture seekers", window: "ขึ้น 15 ค่ำ เดือน 6 เหนือ", channels: "Culture media · Community stories", impact: "+96K บาท", kpi: "Tourism distribution", need: "High", season: "Documented in March", demand: "Opportunity" },
  { month: "เม.ย.", title: "Herbal Retreat", community: "สันติสุข", confidence: 89, state: "recommended", campaign: "Cool Down in Nan", audience: "Wellness Travelers", window: "4–21 เม.ย.", channels: "Wellness media · CRM", impact: "+132K บาท", kpi: "Off-season experiences", need: "High", season: "Ideal", demand: "Growing" },
  { month: "พ.ค.", title: "Paet Peng Tradition", community: "เวียงสา", confidence: 86, state: "ready", campaign: "Living Faith in Wiang Sa", audience: "Culture seekers", window: "พฤษภาคม · ตรวจวันจัดอีกครั้ง", channels: "Culture media · Local network", impact: "+83K บาท", kpi: "Community participation", need: "Medium", season: "Documented in May", demand: "Low" },
  { month: "มิ.ย.", title: "Forest After Rain", community: "สองแคว", confidence: 84, state: "ready", campaign: "After Rain, Nan", audience: "Nature seekers", window: "6–23 มิ.ย.", channels: "Outdoor media · Video", impact: "+98K บาท", kpi: "Tourism distribution", need: "High", season: "Fresh forest", demand: "Emerging" },
  { month: "ก.ค.", title: "Rice & Rivers", community: "ภูเพียง", confidence: 76, state: "watch", campaign: "Green Rice Weekend", audience: "Slow travelers", window: "11–28 ก.ค.", channels: "Community pages · CRM", impact: "+66K บาท", kpi: "Off-season experiences", need: "Medium", season: "Green season", demand: "Low" },
  { month: "ส.ค.", title: "Textile Learning", community: "เวียงสา", confidence: 94, state: "active", campaign: "Textile Learning Month", audience: "Craft learners", window: "8–25 ส.ค.", channels: "Craft creators · Workshops", impact: "+92K บาท", kpi: "Community participation", need: "High", season: "Ideal", demand: "Gap 60 people" },
  { month: "ก.ย.", title: "Tan Kuay Salak", community: "เครือข่ายชุมชนล้านนา", confidence: 90, state: "ready", campaign: "Stories of Giving", audience: "Culture seekers", window: "ก.ย.–ต.ค. ตามปฏิทินจันทรคติ", channels: "Culture media · Local temples", impact: "+105K บาท", kpi: "Tourism distribution", need: "High", season: "Documented tradition", demand: "Emerging" },
  { month: "ต.ค.", title: "Nan Boat Tradition", community: "ชุมชนริมน้ำน่าน", confidence: 87, state: "recommended", campaign: "River of Nan", audience: "Culture seekers", window: "ตรวจวันจัดจากปฏิทินจังหวัด", channels: "Culture media · PR", impact: "+119K บาท", kpi: "Community participation", need: "High", season: "Annual tradition", demand: "Growing" },
  { month: "พ.ย.", title: "Cultural Routes", community: "ปัว", confidence: 71, state: "watch", campaign: "Lanna Living Route", audience: "Culture seekers", window: "2–16 พ.ย.", channels: "Travel media · Partners", impact: "+88K บาท", kpi: "Tourism distribution", need: "Low", season: "High season", demand: "High" },
  { month: "ธ.ค.", title: "Winter Slow Travel", community: "เมืองน่าน", confidence: 68, state: "full", campaign: "Stay Longer, Go Further", audience: "Winter travelers", window: "1–20 ธ.ค.", channels: "Hotel CRM · Route nudges", impact: "+64K บาท", kpi: "Tourism distribution", need: "Low", season: "Peak", demand: "Over capacity" },
];

const communityMissions = [
  { community: "เวียงสา", period: "This week", travelers: ["Coffee lovers", "Families", "Wellness Travelers"], reason: "เวิร์กช็อปพร้อม แต่ demand ต่ำกว่าเป้าหมาย", readiness: 92 },
  { community: "สันติสุข", period: "Next 14 days", travelers: ["Wellness Travelers", "Slow Travelers"], reason: "ครัวเรือนสมุนไพรพร้อมรับผู้เดินทางเพิ่ม", readiness: 86 },
  { community: "แม่จริม", period: "This month", travelers: ["Families", "Culture Seekers"], reason: "ฤดูเพาะปลูกกำลังสร้างประสบการณ์ใหม่", readiness: 78 },
];

const copilotScenarios = [
  { community: "เวียงสา", need: "Need Visitors", campaign: "Wiang Sa Craft Weekend", audience: "นักท่องเที่ยวสายคราฟต์", season: "ฤดูเรียนรู้ผ้าทอ", demand: "ต่ำกว่าเป้าหมาย 42 คน", capacity: 60, confidence: 91, visitors: 38, income: 74000, households: 10, promotionTh: "จองเวิร์กช็อปย้อมสีธรรมชาติ รับชุดลายผ้ากลับบ้าน", promotionEn: "Book a natural-dye workshop and take home your own textile pattern.", captionTh: "ฝนเบาลงแล้ว เวียงสาพร้อมชวนคุณเรียนรู้สีจากธรรมชาติและเรื่องเล่าจากช่างทอในชุมชน", captionEn: "The rain is easing. Meet Wiang Sa artisans and discover natural colors through hands-on textile making.", activity: "Natural Dye + Weaver Story + Local Lunch" },
  { community: "เวียงสา", need: "Need Promotion", campaign: "Textile Rain Stories", audience: "คนรุ่นใหม่และนักเล่าเรื่อง", season: "Green season", demand: "กิจกรรมพร้อม แต่การรับรู้ต่ำ", capacity: 48, confidence: 88, visitors: 32, income: 62000, households: 8, promotionTh: "แพ็กเกจเวิร์กช็อปพร้อมอาหารกลางวัน ราคาพิเศษช่วง Green Season", promotionEn: "Green-season workshop and local lunch package at a community rate.", captionTh: "วันที่ฝนตกไม่ใช่วันที่ต้องหยุดเที่ยว มาฟังเรื่องผ้า เรียนรู้สีธรรมชาติ และใช้เวลาช้าลงที่เวียงสา", captionEn: "Rainy days can still hold beautiful journeys—slow down with textile stories and natural colors in Wiang Sa.", activity: "Rainy-day Textile Studio + Community Meal" },
  { community: "เวียงสา", need: "Need Coffee Lovers", campaign: "Coffee & Craft Route", audience: "คนรักกาแฟและงานฝีมือ", season: "ต้นฤดูเก็บเกี่ยว", demand: "ขาดกลุ่มเฉพาะ 35 คน", capacity: 40, confidence: 90, visitors: 35, income: 68000, households: 9, promotionTh: "จองเส้นทางกาแฟและผ้าทอ รับ Mini Cupping Session ฟรี", promotionEn: "Book the coffee-and-craft route and receive a free mini cupping session.", captionTh: "จากเมล็ดกาแฟสู่เส้นใยผ้า สัมผัสสองเรื่องเล่าของเวียงสาภายในวันเดียว", captionEn: "From coffee beans to textile threads, experience two living stories of Wiang Sa in one day.", activity: "Coffee Cupping + Textile Workshop + Local Lunch" },
  { community: "เวียงสา", need: "Need Family Travelers", campaign: "Family Dye Day", audience: "ครอบครัวที่มีเด็ก", season: "วันหยุด Green season", demand: "ครอบครัวยังไม่รู้จักกิจกรรม", capacity: 36, confidence: 86, visitors: 28, income: 56000, households: 7, promotionTh: "เด็กทำผ้ามัดย้อมฟรีเมื่อจองกิจกรรมแบบครอบครัว", promotionEn: "Kids join the tie-dye activity free with a family booking.", captionTh: "หนึ่งวันของครอบครัวกับสีจากใบไม้ อาหารพื้นบ้าน และรอยยิ้มของช่างฝีมือเวียงสา", captionEn: "A family day of leaf colors, local food, and hands-on craft with Wiang Sa makers.", activity: "Family Tie-dye + Local Snack + Village Walk" },
  { community: "สันติสุข", need: "Need Visitors", campaign: "Forest Reset Week", audience: "นักท่องเที่ยวสายสุขภาพ", season: "ป่าหลังฝน", demand: "ต่ำกว่าเป้าหมาย 30 คน", capacity: 32, confidence: 93, visitors: 30, income: 84000, households: 12, promotionTh: "จอง Forest Therapy รับชาสมุนไพรและประคบเท้าจากชุมชน", promotionEn: "Book Forest Therapy and receive community herbal tea and a foot compress.", captionTh: "พักจากความเร่งรีบ แล้วกลับมาฟังเสียงป่า กลิ่นสมุนไพร และจังหวะของตัวเองที่สันติสุข", captionEn: "Step away from the rush and reconnect with the forest, herbs, and your own pace in Santisuk.", activity: "Forest Therapy + Herbal Lunch + Homestay" },
  { community: "สันติสุข", need: "Need Promotion", campaign: "Green Wellness Stories", audience: "คนทำงานและคู่รัก", season: "ฤดูสมุนไพร", demand: "มีบริการพร้อม แต่ขาดคอนเทนต์", capacity: 28, confidence: 89, visitors: 24, income: 72000, households: 10, promotionTh: "แพ็กเกจพัก 2 วัน 1 คืน พร้อม Herbal Retreat ราคาชุมชน", promotionEn: "Two-day community stay with a seasonal herbal retreat package.", captionTh: "ฤดูเขียวของน่านคือช่วงเวลาที่สมุนไพรและผืนป่ามีพลังที่สุด ให้สันติสุขช่วยรีเซ็ตคุณ", captionEn: "Nan’s green season is when herbs and forests feel most alive. Let Santisuk help you reset.", activity: "Herbal Retreat + Forest Bathing + Community Stay" },
  { community: "สันติสุข", need: "Need Coffee Lovers", campaign: "Mountain Coffee Reset", audience: "คนรักกาแฟแบบ Slow travel", season: "กาแฟบนพื้นที่สูง", demand: "กลุ่มกาแฟยังไม่เชื่อมกับ Wellness", capacity: 26, confidence: 85, visitors: 22, income: 59000, households: 8, promotionTh: "Coffee Walk พร้อมชาสมุนไพรและอาหารเช้าจากสวน", promotionEn: "A coffee walk paired with herbal tea and a farm breakfast.", captionTh: "เริ่มเช้าด้วยกาแฟจากภูเขา แล้วใช้เวลาที่เหลือฟื้นพลังกับสมุนไพรและป่าของสันติสุข", captionEn: "Begin with mountain coffee, then restore your energy through Santisuk’s herbs and forest.", activity: "Coffee Farm Walk + Herbal Breakfast + Forest Pause" },
  { community: "สันติสุข", need: "Need Family Travelers", campaign: "Family Forest Lab", audience: "ครอบครัวรักธรรมชาติ", season: "ป่าเขียวและลำธาร", demand: "กิจกรรมเด็กยังไม่ถูกสื่อสาร", capacity: 30, confidence: 87, visitors: 26, income: 64000, households: 9, promotionTh: "ชุดกิจกรรมนักสำรวจป่าฟรีสำหรับเด็กทุกคน", promotionEn: "Every child receives a free junior forest explorer kit.", captionTh: "ชวนเด็ก ๆ อ่านรอยใบไม้ ทำยาหม่องสมุนไพร และเรียนรู้ป่าจากคนในชุมชน", captionEn: "Let children read leaf patterns, make herbal balm, and learn about the forest from local guides.", activity: "Junior Forest Lab + Herbal Balm + Picnic" },
  { community: "แม่จริม", need: "Need Visitors", campaign: "Mae Charim Green Escape", audience: "นักเดินทางสายธรรมชาติ", season: "แม่น้ำและป่าหลังฝน", demand: "เส้นทางพร้อม แต่ผู้เดินทางน้อย", capacity: 45, confidence: 90, visitors: 40, income: 96000, households: 14, promotionTh: "จองเส้นทางธรรมชาติ รับอาหารกลางวันริมน้ำจากชุมชน", promotionEn: "Book the nature route and enjoy a community riverside lunch.", captionTh: "แม่จริมกำลังเขียวที่สุด ล่องไปตามสายน้ำ ฟังเรื่องป่า และกินอาหารจากครัวชุมชน", captionEn: "Mae Charim is at its greenest—follow the river, hear forest stories, and share a community meal.", activity: "River Route + Forest Guide + Riverside Lunch" },
  { community: "แม่จริม", need: "Need Promotion", campaign: "Hidden Green Mae Charim", audience: "นักถ่ายภาพและกลุ่มเพื่อน", season: "อากาศดีที่สุดในสัปดาห์", demand: "การค้นหาต่ำกว่าศักยภาพ", capacity: 40, confidence: 92, visitors: 36, income: 88000, households: 12, promotionTh: "ทริปกลุ่ม 4 คน รับ Local Guide โดยไม่เพิ่มค่าใช้จ่าย", promotionEn: "Groups of four receive a local guide at no extra cost.", captionTh: "สัปดาห์นี้แม่จริมมีอากาศดีที่สุด แต่ยังมีคนรู้จักน้อย นี่คือเวลาของเส้นทางสีเขียวที่ไม่ต้องแย่งกับใคร", captionEn: "Mae Charim has this week’s best weather and room to breathe—discover a green route without the crowds.", activity: "Photo Route + Local Guide + Community Dinner" },
  { community: "แม่จริม", need: "Need Coffee Lovers", campaign: "Riverside Coffee Camp", audience: "นักเดินทางกาแฟและแคมป์", season: "เช้าเย็นอากาศดี", demand: "มีผลผลิต แต่ยังไม่มีเส้นทาง", capacity: 24, confidence: 84, visitors: 20, income: 54000, households: 7, promotionTh: "กาแฟดริปริมน้ำฟรีสำหรับผู้จอง Community Camp", promotionEn: "A free riverside pour-over for every Community Camp booking.", captionTh: "กาแฟหนึ่งแก้ว ริมน้ำหนึ่งสาย และเรื่องเล่าของแม่จริมที่ยังมีคนรู้จักไม่มาก", captionEn: "One cup of coffee, one riverside morning, and a Mae Charim story few travelers have heard.", activity: "Riverside Drip + Farm Story + Community Camp" },
  { community: "แม่จริม", need: "Need Family Travelers", campaign: "Family River Discovery", audience: "ครอบครัวสายเรียนรู้", season: "ระดับน้ำเหมาะกับกิจกรรม", demand: "ยังขาดแพ็กเกจสำหรับครอบครัว", capacity: 34, confidence: 88, visitors: 30, income: 70000, households: 10, promotionTh: "เด็กเข้าร่วม River Ecology Lab ฟรีเมื่อจองแบบครอบครัว", promotionEn: "Children join the River Ecology Lab free with a family booking.", captionTh: "เรียนรู้สายน้ำ ทดลองอาหารพื้นบ้าน และเปลี่ยนวันหยุดของครอบครัวให้เป็นห้องเรียนธรรมชาติ", captionEn: "Explore the river, taste local food, and turn a family holiday into a living nature classroom.", activity: "River Ecology Lab + Local Cooking + Village Walk" },
  { community: "ทุ่งช้าง", need: "Need Visitors", campaign: "Highland Harvest Journey", audience: "นักเดินทางสายเกษตร", season: "ช่วงผลผลิตบนพื้นที่สูง", demand: "มีรอบกิจกรรมว่าง 44 คน", capacity: 50, confidence: 92, visitors: 42, income: 108000, households: 15, promotionTh: "จองเส้นทางเก็บเกี่ยว รับอาหารกลางวันจากวัตถุดิบในสวน", promotionEn: "Book the harvest route and enjoy a farm-to-table community lunch.", captionTh: "ขึ้นเหนือไปทุ่งช้าง เรียนรู้ผลผลิตตามฤดูกาลและกินอาหารกับครอบครัวเจ้าของสวน", captionEn: "Travel north to Thung Chang for a seasonal harvest and a meal with local farming families.", activity: "Harvest Walk + Farm Lunch + Grower Story" },
  { community: "ทุ่งช้าง", need: "Need Promotion", campaign: "North of Nan Stories", audience: "นักเดินทางค้นหาพื้นที่ใหม่", season: "อากาศเย็นหลังฝน", demand: "การรับรู้ต่ำกว่าความพร้อม", capacity: 46, confidence: 89, visitors: 36, income: 92000, households: 12, promotionTh: "ทริป 2 วัน รับ Local Story Guide ฟรี", promotionEn: "A two-day trip includes a local story guide at no extra cost.", captionTh: "เลยเส้นทางคุ้นเคยไปอีกนิด คุณจะพบทุ่งช้างในฤดูที่สีเขียวและสงบที่สุด", captionEn: "Go beyond the familiar route and find Thung Chang at its greenest and most peaceful.", activity: "Hidden North Route + Story Guide + Homestay" },
  { community: "ทุ่งช้าง", need: "Need Coffee Lovers", campaign: "Maneepruek First Cup", audience: "คนรักกาแฟต้นทาง", season: "หน้าต่างกาแฟล็อตแรก", demand: "ต้องการกลุ่มเฉพาะ 38 คน", capacity: 40, confidence: 95, visitors: 38, income: 116000, households: 11, promotionTh: "ร่วมเก็บกาแฟ รับ Cupping Session กับผู้ปลูก", promotionEn: "Join the coffee harvest and cup the season’s first lot with growers.", captionTh: "กาแฟแก้วแรกเริ่มจากเช้าที่ภูเขา มารู้จักคนปลูกและชิมรสชาติของฤดูกาลที่ทุ่งช้าง", captionEn: "The first cup begins on a mountain morning—meet growers and taste Thung Chang’s new season.", activity: "Coffee Harvest + Processing Lab + Cupping" },
  { community: "ทุ่งช้าง", need: "Need Family Travelers", campaign: "Little Farmer Weekend", audience: "ครอบครัวและเด็ก", season: "วันหยุดช่วงเก็บเกี่ยว", demand: "กิจกรรมครอบครัวยังมีผู้เข้าร่วมน้อย", capacity: 32, confidence: 87, visitors: 28, income: 68000, households: 9, promotionTh: "เด็กเข้าร่วม Little Farmer Lab ฟรี", promotionEn: "Children join the Little Farmer Lab free with a family booking.", captionTh: "ให้เด็กเก็บผลผลิต ทำอาหารง่าย ๆ และเรียนรู้ว่าของกินมาจากไหนกับครอบครัวทุ่งช้าง", captionEn: "Let children harvest, cook, and discover where food comes from with Thung Chang families.", activity: "Little Farmer Lab + Cooking + Seed Craft" },
  { community: "บ่อเกลือ", need: "Need Visitors", campaign: "Salt Village Slow Days", audience: "นักเดินทางแบบ Slow travel", season: "หมู่บ้านสงบหลังฤดูพีค", demand: "จำนวนผู้เข้าพักต่ำกว่าเป้าหมาย", capacity: 36, confidence: 88, visitors: 30, income: 99000, households: 13, promotionTh: "พัก 1 คืน รับกิจกรรมเรียนรู้เกลือสินเธาว์", promotionEn: "Stay one night and join a community rock-salt learning experience.", captionTh: "ใช้เวลาช้าลงที่บ่อเกลือ ฟังเรื่องภูเขา เกลือ และชีวิตที่สืบต่อกันมาหลายรุ่น", captionEn: "Slow down in Bo Kluea and hear stories of mountains, salt, and generations of local life.", activity: "Salt Story + Local Kitchen + Homestay" },
  { community: "บ่อเกลือ", need: "Need Promotion", campaign: "Beyond Winter Bo Kluea", audience: "คนทำงานและคู่รัก", season: "Green season valley", demand: "คนรู้จักเฉพาะฤดูหนาว", capacity: 34, confidence: 86, visitors: 27, income: 88000, households: 11, promotionTh: "แพ็กเกจ Green Season พร้อมอาหารพื้นถิ่น 2 มื้อ", promotionEn: "A green-season stay with two local meals included.", captionTh: "บ่อเกลือไม่ได้สวยเฉพาะหน้าหนาว ฤดูเขียวทำให้ภูเขา ลำธาร และหมู่บ้านมีอีกอารมณ์หนึ่ง", captionEn: "Bo Kluea is more than winter—the green season reveals another side of its valleys and village life.", activity: "Green Valley Walk + Salt Kitchen + Stay" },
  { community: "บ่อเกลือ", need: "Need Coffee Lovers", campaign: "Salt & Mountain Coffee", audience: "นักชิมกาแฟและอาหาร", season: "กาแฟภูเขาและครัวท้องถิ่น", demand: "ยังไม่มีผลิตภัณฑ์เชื่อมกาแฟกับอาหาร", capacity: 22, confidence: 82, visitors: 18, income: 62000, households: 7, promotionTh: "ชุดกาแฟภูเขาคู่ขนมเกลือท้องถิ่น", promotionEn: "A mountain coffee tasting paired with a local salt-inspired snack.", captionTh: "ชิมกาแฟจากภูเขาคู่รสเค็มที่เกิดจากภูมิปัญญาบ่อเกลือในประสบการณ์เดียว", captionEn: "Taste mountain coffee alongside Bo Kluea’s salt heritage in one crafted experience.", activity: "Coffee Tasting + Salt Snack + Maker Talk" },
  { community: "บ่อเกลือ", need: "Need Family Travelers", campaign: "Family Salt Detectives", audience: "ครอบครัวสายเรียนรู้", season: "กิจกรรมในร่มช่วงฝน", demand: "ต้องการกิจกรรมสำรองสำหรับเด็ก", capacity: 28, confidence: 90, visitors: 24, income: 65000, households: 8, promotionTh: "รับชุดนักสืบเกลือสำหรับเด็กทุกการจอง", promotionEn: "Every family booking includes a junior salt detective kit.", captionTh: "วันฝนตกก็เรียนรู้ได้ ชวนเด็กตามหาเรื่องราวของเกลือ ทดลองครัว และฟังคนในชุมชน", captionEn: "Rainy days become discovery days with salt stories, kitchen experiments, and local guides.", activity: "Salt Detective Lab + Family Kitchen + Story Walk" },
  { community: "ภูเพียง", need: "Need Visitors", campaign: "Rice Field Living Route", audience: "นักเดินทางวิถีชุมชน", season: "นาข้าวสีเขียว", demand: "กิจกรรมพร้อมแต่ผู้เข้าร่วมน้อย", capacity: 52, confidence: 91, visitors: 46, income: 102000, households: 16, promotionTh: "จองเส้นทางวิถีนา รับชุดอาหารพื้นบ้าน", promotionEn: "Book the rice-field route and receive a seasonal local meal set.", captionTh: "เดินออกจากเมืองไม่นาน แล้วเข้าสู่จังหวะของนา อาหาร และผู้คนที่ภูเพียง", captionEn: "Just beyond town, step into the rhythm of rice fields, food, and community life in Phu Phiang.", activity: "Rice Field Walk + Local Meal + Village Story" },
  { community: "ภูเพียง", need: "Need Promotion", campaign: "Green Rice Weekend", audience: "นักเดินทางใกล้เมือง", season: "Green rice window", demand: "มีศักยภาพแต่ยังขาดการสื่อสาร", capacity: 48, confidence: 90, visitors: 40, income: 86000, households: 13, promotionTh: "รถรับส่งจากเมืองน่านฟรีสำหรับรอบสุดสัปดาห์", promotionEn: "Weekend bookings include a free shuttle from Nan town.", captionTh: "เปลี่ยนครึ่งวันในเมืองให้เป็นครึ่งวันกลางทุ่งนา พบอาหารและเรื่องเล่าที่ภูเพียง", captionEn: "Turn half a day in town into a half day among rice fields, food, and stories in Phu Phiang.", activity: "Green Rice Route + Community Lunch + Shuttle" },
  { community: "ภูเพียง", need: "Need Coffee Lovers", campaign: "Rice & Coffee Morning", audience: "คนรักกาแฟและอาหารพื้นถิ่น", season: "เช้าหลังฝน", demand: "ต้องการประสบการณ์ครึ่งวัน", capacity: 30, confidence: 84, visitors: 25, income: 58000, households: 8, promotionTh: "กาแฟดริปพร้อมอาหารเช้าจากข้าวท้องถิ่น", promotionEn: "A pour-over coffee paired with a breakfast made from local rice.", captionTh: "เช้าเดียวได้รู้จักทั้งกาแฟ ข้าว และครัวของภูเพียง ผ่านคนทำจริงในชุมชน", captionEn: "Meet coffee, rice, and the kitchens of Phu Phiang in one community-led morning.", activity: "Coffee Drip + Rice Breakfast + Farm Walk" },
  { community: "ภูเพียง", need: "Need Family Travelers", campaign: "Family Rice Classroom", audience: "ครอบครัวและโรงเรียน", season: "ฤดูเรียนรู้การปลูกข้าว", demand: "ยังขาดกิจกรรมสำหรับกลุ่มเรียนรู้", capacity: 42, confidence: 89, visitors: 36, income: 78000, households: 12, promotionTh: "เด็กเข้าร่วม Rice Classroom ฟรีพร้อมชุดเมล็ดพันธุ์", promotionEn: "Children join the Rice Classroom free and receive a seed-learning kit.", captionTh: "ให้ทุ่งนาเป็นห้องเรียน เด็กได้สัมผัสดิน ทำขนมจากข้าว และฟังเรื่องอาหารจากชุมชน", captionEn: "Let the rice field become a classroom for soil, food, and community knowledge.", activity: "Rice Classroom + Local Dessert + Seed Kit" },
];

const opportunityFeed = [
  { id: "workshop", type: "Workshop", place: "บ้านดอนไชย · เวียงสา", title: "ชุมชนพร้อมจัดเวิร์กช็อป แต่ยังไม่มีนักท่องเที่ยว", timing: "Available now · 60 seats", confidence: 94, campaign: "Textile Learning Week", audiences: ["Craft learners", "Families"], income: "+92,000 บาท", households: "11 ครัวเรือน", priority: "Promote now" },
  { id: "harvest", type: "Seasonal window", place: "สวนกาแฟมณีพฤกษ์ · ทุ่งช้าง", title: "ฤดูเก็บเกี่ยวกาแฟจะเริ่มในอีก 5 วัน", timing: "Window · 20–31 Jul", confidence: 92, campaign: "First Harvest Journey", audiences: ["Coffee lovers", "Slow travelers"], income: "+148,000 บาท", households: "8 ครัวเรือน", priority: "Prepare today" },
  { id: "festival", type: "Promotion gap", place: "เทศกาลดนตรีไทลื้อ · ปัว", title: "เทศกาลพร้อมแล้ว แต่ยังไม่มีแคมเปญโปรโมต", timing: "Starts in 12 days", confidence: 87, campaign: "Tai Lue After Dark", audiences: ["Culture seekers", "Young travelers"], income: "+210,000 บาท", households: "17 ธุรกิจ", priority: "Campaign needed" },
  { id: "route", type: "Weather window", place: "เส้นทางแม่จริม–น้ำว้า", title: "เส้นทางนี้มีอากาศดีที่สุดในสัปดาห์นี้", timing: "Best conditions · 4 days", confidence: 89, campaign: "Green Route This Week", audiences: ["Outdoor travelers", "Wellness Travelers"], income: "+76,000 บาท", households: "6 ธุรกิจ", priority: "Time-sensitive" },
];

function Signal({ label, value, tone = "good" }: { label: string; value: string; tone?: "good" | "warn" | "neutral" }) {
  return (
    <div className={`signal signal-${tone}`}>
      <span className="signal-dot" aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DecisionConfidence({ value, factors = ["Weather", "Demand", "Season", "Community"], dark = false }: { value: number; factors?: string[]; dark?: boolean }) {
  const { locale, tr } = useLocale();
  const factorNames: Record<string, string> = { Weather: "อากาศ", Demand: "ความต้องการ", Season: "ฤดูกาล", Community: "ชุมชน", Capacity: "ขีดความสามารถ", "Community Need": "ความต้องการชุมชน", "Community Capacity": "ขีดความสามารถชุมชน", "Traveler Fit": "ความเหมาะสมกับผู้เดินทาง" };
  return <div className={`decision-confidence ${dark ? "confidence-dark" : ""}`}>
    <div><span>{tr("ความเชื่อมั่นของ AI", "AI Confidence")}</span><strong>{value}%</strong></div>
    <div><span>{tr("พิจารณาจาก", "Based on")}</span><p>{factors.map(factor => <b key={factor}>{locale === "th" ? factorNames[factor] ?? factor : factor}</b>)}</p></div>
  </div>;
}

function MissionView({ onNavigate }: { onNavigate: () => void }) {
  const { tr } = useLocale();
  const [executed, setExecuted] = useState(false);
  const [flowActive, setFlowActive] = useState(false);
  const [capacity, setCapacity] = useState<60 | 0>(60);
  const decision = capacity === 60 ? {
    community: "เวียงสา", confidence: 94, households: 18, businesses: 7, campaign: "Wiang Sa Textile Week",
    visitors: 42, income: "120,000", stay: "+0.6 วัน", receipt: "NP-2026-0715-008",
    need: "Need Craft Learners", season: "ช่วงเรียนรู้ผ้าทอ", before: "เวียงสา 3%", after: "เวียงสา 18%", originAfter: "ปัว 55%",
    reason: tr("เวียงสามีความต้องการสูง ประสบการณ์เหมาะกับฤดูกาล และยังรองรับนักท่องเที่ยวเพิ่มได้โดยไม่เกินขีดความสามารถ ส่วนปัวถูกตัดออกเพราะความหนาแน่นสูง", "Wiang Sa has high community need, strong seasonal fit, and available capacity. Pua was rejected because visitor density is already high.")
  } : {
    community: "สันติสุข", confidence: 87, households: 12, businesses: 5, campaign: "Forest Wellness Pilot",
    visitors: 28, income: "78,000", stay: "+0.8 วัน", receipt: "NP-2026-0715-009",
    need: "Need Wellness Travelers", season: "Green season wellness", before: "สันติสุข 5%", after: "สันติสุข 14%", originAfter: "ปัว 63%",
    reason: tr("ขีดความสามารถของเวียงสาเหลือ 0 คน ระบบจึงหยุดแคมเปญเดิมและเลือกสันติสุข ซึ่งมีความต้องการสูง อากาศเหมาะกับกิจกรรมสุขภาพ และยังรองรับนักท่องเที่ยวได้", "Wiang Sa capacity dropped to zero, so AI stopped the original campaign and selected Santisuk for its high need, wellness weather fit, and available capacity.")
  };
  const alternatives = capacity === 60 ? [
    { rank: "01", place: "เวียงสา", score: "94%", state: tr("เลือก", "Selected"), reason: tr("ความต้องการสูง · รองรับได้ 60 คน · ฤดูกาลเหมาะสม", "High need · Capacity 60 · Strong seasonal fit"), tone: "selected" },
    { rank: "02", place: "สันติสุข", score: "87%", state: tr("ทางเลือก", "Alternative"), reason: tr("พร้อมรับกลุ่มสุขภาพ แต่ช่องว่างความต้องการต่ำกว่า", "Ready for wellness travelers, but with a smaller demand gap"), tone: "" },
    { rank: "03", place: "ปัว", score: "42%", state: tr("ไม่เลือก", "Rejected"), reason: tr("ความหนาแน่น 80% · ไม่ควรเพิ่มนักท่องเที่ยว", "Visitor density 80% · Avoid adding pressure"), tone: "" },
    { rank: "04", place: "บ่อเกลือ", score: "38%", state: tr("ไม่เลือก", "Rejected"), reason: tr("ความเสี่ยงด้านอากาศสูงกว่าเกณฑ์", "Weather risk exceeds the threshold"), tone: "" }
  ] : [
    { rank: "01", place: "สันติสุข", score: "87%", state: tr("เลือก", "Selected"), reason: tr("ความต้องการสูง · อากาศเหมาะ · รองรับได้", "High need · Good weather · Capacity available"), tone: "selected" },
    { rank: "02", place: "เวียงสา", score: "0%", state: tr("ระงับ", "Blocked"), reason: tr("ขีดความสามารถเหลือ 0 · ห้ามส่งนักท่องเที่ยวเพิ่ม", "Capacity changed to zero · No additional travelers"), tone: "blocked" },
    { rank: "03", place: "ปัว", score: "42%", state: tr("ไม่เลือก", "Rejected"), reason: tr("ความหนาแน่น 80% · ไม่ควรเพิ่มนักท่องเที่ยว", "Visitor density 80% · Avoid adding pressure"), tone: "" },
    { rank: "04", place: "บ่อเกลือ", score: "38%", state: tr("ไม่เลือก", "Rejected"), reason: tr("ความเสี่ยงด้านอากาศสูงกว่าเกณฑ์", "Weather risk exceeds the threshold"), tone: "" }
  ];
  const changeCapacity = (value: 60 | 0) => { setCapacity(value); setExecuted(false); setFlowActive(false); };
  return (
    <div className="view-stack">
      <section className={`decision-hero killer-moment ${executed ? "mission-executed" : ""}`} aria-labelledby="today-decision">
        <div className="moment-status">
          <span><i aria-hidden="true">✦</i> {tr("Nan Pulse AI · พบโอกาสใหม่", "Nan Pulse AI · New Opportunity Detected")}</span>
          <em>{tr("การจำลองเพื่อสาธิต · ไม่มีการส่งข้อมูลจริง", "Demo simulation · No real data is sent")}</em>
        </div>
        <div className="decision-topline decision-refresh" key={decision.community}>
          <div>
            <p className="eyebrow">{tr("ภารกิจ AI", "AI Mission")} · {decision.community} · {tr("สัปดาห์นี้", "This week")}</p>
            {capacity === 0 && <span className="decision-change-badge">{tr("คำตัดสินเปลี่ยนแล้ว · Capacity มีการอัปเดต", "Decision changed · Capacity signal updated")}</span>}
            <h1 id="today-decision">{tr(`พบโอกาสสร้างรายได้ให้ ${decision.households} ครัวเรือนใน${decision.community}ภายในสัปดาห์นี้`, `A new opportunity could support ${decision.households} households in ${decision.community} this week`)}</h1>
          </div>
          <div className="confidence-ring" aria-label={`AI confidence ${decision.confidence} percent`}>
            <span>{decision.confidence}</span><small>%</small>
            <em>{tr("ความเชื่อมั่น", "confidence")}</em>
          </div>
        </div>

        <p className="decision-copy">{tr("ต้องการให้ AI ", "Would you like AI to ")}<strong>{tr("สร้างแคมเปญและปรับเส้นทางนักท่องเที่ยวอัตโนมัติ", "create the campaign and automatically redirect travelers")}</strong>{tr("หรือไม่?", "?")}</p>
        <DecisionConfidence value={decision.confidence} factors={["Weather", "Demand", "Season", "Community", "Capacity"]} dark />

        <div className="live-decision-control">
          <div>
            <p><span className="live-dot" /> {tr("การเปลี่ยนคำตัดสินแบบทันที", "Live Decision Change")}</p>
            <strong>{tr("เปลี่ยนขีดความสามารถ แล้วดู AI ตัดสินใจใหม่", "Change capacity and watch AI decide again")}</strong>
          </div>
          <div className="live-signal-row"><span>Weather <b>ฝนหยุดพรุ่งนี้</b></span><span>Demand <b>สูง</b></span><span>Season <b>Green season</b></span></div>
          <div className="capacity-toggle" role="group" aria-label="เปลี่ยน capacity ของเวียงสา">
            <small>{tr("ขีดความสามารถเวียงสา", "Wiang Sa Capacity")}</small>
            <button className={capacity === 60 ? "active" : ""} onClick={() => changeCapacity(60)}>60 {tr("คน", "people")}</button>
            <button className={capacity === 0 ? "active danger" : ""} onClick={() => changeCapacity(0)}>0 {tr("คน", "people")}</button>
          </div>
        </div>

        <div className="decision-actions">
          <button className="primary-action execute-action" onClick={() => setExecuted(true)} disabled={executed}>
            {executed ? tr("ดำเนินภารกิจแล้ว ✓", "Mission Executed ✓") : tr("ดำเนินภารกิจ", "Execute Mission")}
          </button>
          {!executed && <button className="text-action" onClick={onNavigate}>{tr("ตรวจสอบโอกาสก่อน", "Review opportunity first")} <span>→</span></button>}
        </div>

        <div className="execution-console" aria-live="polite">
          <div className="execution-head">
            <span>{executed ? "Execution complete · 4 actions" : "Ready to execute · 4 actions"}</span>
            <strong>{executed ? "จังหวัดอนุมัติแล้ว" : "รอการอนุมัติจากจังหวัด"}</strong>
          </div>
          <div className="execution-steps">
            <article className={executed ? "complete" : ""}><b>01</b><i>◆</i><span>Create Campaign</span><strong>{decision.campaign}</strong><small>{executed ? "Campaign created" : "Prepared by Campaign Engine"}</small></article>
            <article className={executed ? "complete" : ""}><b>02</b><i>⌂</i><span>Notify Community</span><strong>{decision.households} ครัวเรือน · {decision.businesses} ธุรกิจ</strong><small>{executed ? "Community notified" : "Awaiting approval"}</small></article>
            <article className={executed ? "complete" : ""}><b>03</b><i>↗</i><span>Update Tourist Journey</span><strong>Redirect {decision.visitors} travelers</strong><small>{executed ? "Recommendation updated" : `ปัว → ${decision.community}`}</small></article>
            <article className={executed ? "complete" : ""}><b>04</b><i>◎</i><span>Simulate Impact</span><strong>+{decision.income} THB</strong><small>{executed ? `${decision.stay} stay` : "Ready to simulate"}</small></article>
          </div>
          {executed && <div className="moment-simulation">
            <div><span>Before AI</span><strong>ปัว 80%</strong><i>{decision.before}</i></div>
            <b aria-hidden="true">→</b>
            <div><span>After AI</span><strong>{decision.originAfter}</strong><i>{decision.after}</i></div>
            <div className="simulation-impact"><span>Expected Impact</span><strong>{decision.households} ครัวเรือน</strong><i>+{decision.income} บาท · {decision.stay}พัก</i></div>
          </div>}
        </div>
      </section>

      <section className="decision-receipt" aria-labelledby="receipt-title">
        <div className="receipt-head">
          <div><p className="eyebrow">{tr("บันทึกคำตัดสิน", "Decision Receipt")}</p><h2 id="receipt-title">{tr("AI เลือกอะไร และไม่เลือกอะไร", "What AI selected — and rejected")}</h2></div>
          <div><span>{tr("รหัสคำตัดสิน", "Decision ID")}</span><strong>{decision.receipt}</strong><small>{tr("15 ก.ค. 2569", "15 Jul 2026")} · 08:30</small></div>
        </div>
        <div className="receipt-grid">
          <div className="receipt-signals">
            <h3>{tr("สัญญาณที่ตรวจพบ", "Observed signals")}</h3>
            <div><span>Weather</span><strong>88</strong><i><b style={{ width: "88%" }} /></i><small>ฝนหยุดพรุ่งนี้</small></div>
            <div><span>Community Need</span><strong>95</strong><i><b style={{ width: "95%" }} /></i><small>ต้องการนักท่องเที่ยวเฉพาะกลุ่ม</small></div>
            <div><span>Demand Gap</span><strong>91</strong><i><b style={{ width: "91%" }} /></i><small>ต่ำกว่าเป้าหมาย</small></div>
            <div><span>Season Fit</span><strong>86</strong><i><b style={{ width: "86%" }} /></i><small>เหมาะกับประสบการณ์</small></div>
            <div className={capacity === 0 ? "signal-blocked" : ""}><span>Wiang Sa Capacity</span><strong>{capacity}</strong><i><b style={{ width: `${capacity}%` }} /></i><small>{capacity === 0 ? "สัญญาณเปลี่ยน · ระบบห้ามเลือก" : "รองรับได้อีก 60 คน"}</small></div>
          </div>
          <div className="alternatives">
            <h3>{tr("ทางเลือกตามลำดับ", "Ranked alternatives")}</h3>
            {alternatives.map(item => <article className={item.tone} key={item.place}>
              <b>{item.rank}</b><div><strong>{item.place}</strong><small>{item.reason}</small></div><em>{item.score}</em><span>{item.state}</span>
            </article>)}
          </div>
        </div>
        <div className="receipt-final">
          <div><span>{tr("คำตัดสินสุดท้าย", "Final decision")}</span><strong>{tr(`เปิดแคมเปญ “${decision.campaign}” และส่งนักท่องเที่ยว ${decision.visitors} คนไป${decision.community}`, `Launch “${decision.campaign}” and redirect ${decision.visitors} travelers to ${decision.community}`)}</strong><small>{decision.reason}</small></div>
          <div><span>{tr("การควบคุม", "Control")}</span><strong>{tr("ต้องได้รับการอนุมัติจากเจ้าหน้าที่", "Human approval required")}</strong><small>{tr("AI เตรียมคำตัดสิน แต่จังหวัดต้องอนุมัติก่อนดำเนินการ", "AI prepares the decision, but the province must approve execution")}</small></div>
        </div>
        <div className="counterfactuals"><strong>{tr("อะไรจะทำให้คำตัดสินเปลี่ยน?", "What would change this decision?")}</strong><span>{tr("ฝน", "Rain")} &gt; 70% → {tr("เลื่อนแคมเปญ", "delay campaign")}</span><span>Capacity &lt; 20 → {tr("เลือกชุมชนถัดไป", "select next community")}</span><span>PM2.5 {tr("สูง → เปลี่ยนเป็นกิจกรรมในร่ม", "high → switch indoors")}</span><span>{tr("ความหนาแน่นปัว", "Pua density")} &lt; 50% → {tr("ลดการส่งต่อ", "reduce redirect")}</span></div>
        <p className="receipt-disclaimer">Demo Decision Engine · คะแนนและผลกระทบเป็น Prototype simulation เพื่อแสดงตรรกะการตัดสินใจ ไม่ใช่ผลจากโมเดล production</p>
      </section>

      <section className={`ai-decision-flow ${flowActive ? "flow-active" : ""}`} aria-labelledby="decision-flow-title">
        <div className="flow-heading"><div><p className="eyebrow">AI Decision Flow</p><h2 id="decision-flow-title">จาก Signal สู่ Impact</h2><p>AI ตรวจจับสัญญาณพร้อมกัน แล้วตัดสินใจสร้าง demand และเปลี่ยนทิศทางนักท่องเที่ยวภายใต้ capacity ของชุมชน</p></div><button onClick={() => setFlowActive(true)} disabled={flowActive}>{flowActive ? "Decision flow complete ✓" : "Run decision flow"}</button></div>
        <div className="flow-track">
          <article className="flow-node node-detect"><span>01 · Detect</span><i>✦</i><strong>AI detects</strong><small>6 live data signals</small></article><b>→</b>
          <article className="flow-node node-signal"><span>02 · Weather</span><i>☂</i><strong>Rain</strong><small>ฝนหยุดพรุ่งนี้</small></article><b>→</b>
          <article className="flow-node node-signal"><span>03 · Calendar</span><i>◫</i><strong>Festival</strong><small>Coffee harvest window</small></article><b>→</b>
          <article className="flow-node node-signal"><span>04 · Community</span><i>⌂</i><strong>Community Need</strong><small>{decision.need}</small></article><b>→</b>
          <article className="flow-node node-signal"><span>05 · Density</span><i>◉</i><strong>Tourist Density</strong><small>ปัว 80% · {decision.before}</small></article><b>→</b>
          <article className="flow-node node-action"><span>06 · Create</span><i>◆</i><strong>Generate Campaign</strong><small>{decision.campaign}</small></article><b>→</b>
          <article className="flow-node node-action"><span>07 · Act</span><i>↗</i><strong>Redirect Tourists</strong><small>ปัว → {decision.community}</small></article><b>→</b>
          <article className="flow-node node-impact"><span>08 · Learn</span><i>+</i><strong>Impact</strong><small>+{decision.income} บาท · {decision.households} ครัวเรือน</small></article>
        </div>
        <div className="flow-logic"><span>Signal layer</span><i>Rain + Festival + Need + Density</i><b>Decision threshold passed · 86/100</b><strong>Human approval required before activation</strong></div>
      </section>

      <section className="official-snapshot" aria-labelledby="official-data-title">
        <div className="snapshot-head"><div><p className="eyebrow">Official Tourism Snapshot</p><h2 id="official-data-title">สถานการณ์จริง ม.ค.–มี.ค. 2569</h2></div><a href="https://nan.mots.go.th/news/2732" target="_blank" rel="noreferrer">สำนักงานการท่องเที่ยวและกีฬาจังหวัดน่าน ↗</a></div>
        <div className="snapshot-metrics"><div><strong>422,362</strong><span>ผู้เยี่ยมเยือนสะสม</span><em>+4.39% YoY</em></div><div><strong>1,186.83M</strong><span>บาท รายได้รวม</span><em>+5.83% YoY</em></div><div><strong>76.55%</strong><span>อัตราเข้าพักเฉลี่ย</span><em>317,758 ผู้เข้าพัก</em></div><div><strong>98.15%</strong><span>ผู้เยี่ยมเยือนชาวไทย</span><em>ต่างชาติ 7,790 คน</em></div></div>
        <p className="snapshot-note"><strong>Decision signal:</strong> เดือนมีนาคมมีผู้เยี่ยมเยือน 108,499 คน รายได้ 305.71 ล้านบาท และอัตราเข้าพัก 53.02% ซึ่งต่ำกว่าค่าเฉลี่ยสะสม—เป็นหลักฐานสำหรับการตัดสินใจสร้าง demand นอกช่วงพีค ไม่ใช่ตัวเลขคาดการณ์ของ AI</p>
      </section>

      <section className="impact-strip" aria-labelledby="impact-title">
        <div className="section-intro">
          <p className="eyebrow">Expected Impact</p>
          <h2 id="impact-title">ผลกระทบที่คาดว่าจะเกิดขึ้น</h2>
          <span className="evidence-tag">Estimated</span>
        </div>
        <div className="impact-grid">
          <div><strong>+{decision.households}</strong><span>ครัวเรือน</span></div>
          <div><strong>{decision.businesses}</strong><span>ธุรกิจท้องถิ่น</span></div>
          <div><strong>{decision.income}</strong><span>บาท · Mock estimate</span></div>
          <div><strong>{decision.stay.replace(" วัน", "")}</strong><span>วันพักเฉลี่ย</span></div>
        </div>
      </section>

      <section className="reason-panel" aria-labelledby="reason-title">
        <div className="reason-heading">
          <div>
            <p className="eyebrow">Reason</p>
            <h2 id="reason-title">ทำไม AI จึงเลือกโอกาสนี้</h2>
          </div>
          <span className="freshness">ข้อมูลอัปเดต 08:30</span>
        </div>
        <div className="signal-grid">
          <Signal label="Weather" value="ฝนหยุดพรุ่งนี้" />
          <Signal label="Season" value={decision.season} />
          <Signal label="Community Need" value="ความต้องการสูง" />
          <Signal label="Demand" value="ต่ำกว่าเป้าหมาย 60 คน" tone="warn" />
          <Signal label="PM2.5" value="18 µg/m³ · ปลอดภัย" />
          <Signal label="Capacity" value={capacity === 0 ? "เวียงสาเต็ม · 0 คน" : "เหลือ 60 คน"} tone={capacity === 0 ? "warn" : "neutral"} />
        </div>
        <div className="reason-note">
          <span className="pulse-icon" aria-hidden="true">⌁</span>
          <p><strong>Decision logic</strong> {decision.reason}</p>
        </div>
      </section>
    </div>
  );
}

function CommunityView() {
  const { tr } = useLocale();
  const [selected, setSelected] = useState(0);
  const mission = communityMissions[selected];
  return (
    <div className="view-stack">
      <header className="content-header">
        <div><p className="eyebrow">{tr("ภารกิจชุมชน", "Community Mission")}</p><h1>{tr("ชุมชนต้องการ", "Who the community")}<br />{tr("นักท่องเที่ยวแบบไหน", "needs right now")}</h1></div>
        <p>{tr("AI แปลความต้องการของชุมชนเป็นกลุ่มผู้เดินทางที่เหมาะสม พร้อมกำหนดช่วงเวลาโดยไม่เกินขีดความสามารถ", "AI translates community needs into the right traveler segments and timing without exceeding local capacity.")}</p>
      </header>
      <section className="community-mission">
        <div className="community-selector" aria-label="เลือกชุมชน">
          {communityMissions.map((item, index) => <button key={item.community} onClick={() => setSelected(index)} className={index === selected ? "active" : ""}><span>0{index + 1}</span><strong>{item.community}</strong><small>{item.period}</small></button>)}
        </div>
        <div className="mission-statement">
          <div className="mission-label"><span className="ai-star">✦</span><p>AI says</p></div>
          <p className="eyebrow">{mission.community} · {mission.period}</p>
          <h2>This community needs</h2>
          <div className="traveler-needs">{mission.travelers.map((traveler) => <span key={traveler}>{traveler}</span>)}</div>
          <p className="mission-reason">{mission.reason}</p>
          <div className="mission-readiness"><span>Community readiness</span><strong>{mission.readiness}%</strong><i><b style={{ width: `${mission.readiness}%` }} /></i></div>
        </div>
      </section>
    </div>
  );
}

function OpportunityView() {
  const { tr } = useLocale();
  const [selected, setSelected] = useState(7);
  const [generated, setGenerated] = useState<string | null>(null);
  const [exchangeFilter, setExchangeFilter] = useState("All opportunities");
  const [seasonalGenerated, setSeasonalGenerated] = useState(false);
  const active = months[selected];
  return (
    <div className="view-stack">
      <header className="content-header compact">
        <div><p className="eyebrow">{tr("ศูนย์แลกเปลี่ยนโอกาส AI", "AI Opportunity Exchange")}</p><h1>{tr("โอกาสของจังหวัด", "Opportunities Nan")}<br />{tr("ที่ยังไม่ได้ใช้", "has not activated")}</h1></div>
        <p>{tr("พื้นที่ตัดสินใจสำหรับจังหวัด AI ตรวจพบทรัพยากรที่พร้อม แต่ยังขาดความต้องการ การประชาสัมพันธ์ หรือจังหวะลงมือทำ", "A provincial decision space where AI detects ready resources that still lack demand, promotion, or timely action.")}</p>
      </header>
      <section className="exchange-summary" aria-label="สรุปโอกาสที่ยังไม่ถูกใช้">
        <div><span>Unused opportunities</span><strong>12</strong><small>ตรวจพบทั่วจังหวัด</small></div>
        <div><span>Potential local income</span><strong>526K</strong><small>บาท · 30 วันข้างหน้า</small></div>
        <div><span>Time-sensitive</span><strong>4</strong><small>ควรตัดสินใจภายในสัปดาห์นี้</small></div>
        <div className="exchange-health"><span>Exchange pulse</span><strong>High potential</strong><small><i><b style={{ width: "82%" }} /></i> 82%</small></div>
      </section>
      <div className="exchange-toolbar">
        <div><span className="live-dot" /><strong>AI scanning 50 communities</strong><small>อัปเดตล่าสุด 08:30</small></div>
        <div role="group" aria-label="กรองประเภทโอกาส">{["All opportunities", "Time-sensitive", "Campaign needed"].map(filter => <button key={filter} className={exchangeFilter === filter ? "active" : ""} onClick={() => setExchangeFilter(filter)}>{filter}</button>)}</div>
      </div>
      <section className="exchange-list" aria-label="รายการโอกาสที่ยังไม่ถูกใช้">
        {opportunityFeed.filter(item => exchangeFilter === "All opportunities" || item.priority === exchangeFilter).map((item, index) => (
          <article className="exchange-item" key={item.id}>
            <div className="exchange-rank"><span>0{index + 1}</span><i>{item.priority}</i></div>
            <div className="exchange-gap"><p>{item.type} · {item.place}</p><h2>{item.title}</h2><span>{item.timing}</span></div>
            <div className="exchange-proposal">
              <p>AI proposed campaign</p><strong>{item.campaign}</strong>
              <div>{item.audiences.map(audience => <span key={audience}>{audience}</span>)}</div>
            </div>
            <div className="exchange-impact"><p>Expected economic impact</p><strong>{item.income}</strong><span>{item.households}</span><em>{item.confidence}% AI Confidence</em><small>Based on Weather · Demand · Season · Community</small></div>
            <button className="exchange-cta" onClick={() => setGenerated(item.id)}>{generated === item.id ? "Campaign ready ✓" : "Generate campaign"}<span>→</span></button>
          </article>
        ))}
      </section>
      <div className="calendar-divider"><span>12-month opportunity horizon</span></div>
      <div className="month-grid" role="list" aria-label="โอกาสท่องเที่ยว 12 เดือน">
        {months.map((item, index) => (
          <button className={`month-card ${selected === index ? "selected" : ""}`} key={item.month} onClick={() => { setSelected(index); setSeasonalGenerated(false); }}>
            <span>{item.month}</span><strong>{item.title}</strong><small>{item.community}</small><em>{item.confidence}%</em>
          </button>
        ))}
      </div>
      <section className="seasonal-campaign" aria-live="polite">
        <div className="seasonal-intro">
          <p className="eyebrow">AI Seasonal Campaign · {active.month}</p><h2>{active.campaign}</h2>
          <p>AI เปลี่ยน seasonal opportunity ของ <strong>{active.community}</strong> ให้เป็น campaign brief ที่พร้อมส่งต่อ โดยอิงจาก Need, Season และ Demand จริง</p>
          <div className="seasonal-confidence"><span>{active.confidence}%</span><small>AI confidence</small></div>
        </div>
        <DecisionConfidence value={active.confidence} dark />
        <div className="seasonal-logic"><span>Community Need <b>{active.need}</b></span><span>Season <b>{active.season}</b></span><span>Demand <b>{active.demand}</b></span></div>
        <div className="campaign-brief">
          <div><span>Target travelers</span><strong>{active.audience}</strong></div>
          <div><span>Activation window</span><strong>{active.window}</strong></div>
          <div><span>Recommended channels</span><strong>{active.channels}</strong></div>
          <div><span>Expected local income</span><strong>{active.impact}</strong></div>
        </div>
        <div className="campaign-footer"><div><span>Primary KPI</span><strong>{active.kpi}</strong></div><button className="primary-action" onClick={() => setSeasonalGenerated(true)}>{seasonalGenerated ? "Campaign brief ready ✓" : "Generate seasonal campaign"}</button></div>
      </section>
    </div>
  );
}

function ForecastView() {
  const { tr } = useLocale();
  return (
    <div className="view-stack">
      <header className="content-header compact">
        <div><p className="eyebrow">{tr("ชีพจรการท่องเที่ยว", "Tourism Pulse")}</p><h1>{tr("สุขภาวะการท่องเที่ยว", "Tourism Health")}<br />{tr("ไม่ใช่แค่จำนวนนักท่องเที่ยว", "Not Visitor Count")}</h1></div>
        <p>{tr("สุขภาวะการท่องเที่ยววัดจากความสมดุลของฤดูกาล พื้นที่ รายได้ และขีดความสามารถ ไม่ใช่การเพิ่มจำนวนผู้เดินทางเพียงอย่างเดียว", "Tourism health measures balance across seasons, places, income, and capacity—not visitor volume alone.")}</p>
      </header>
      <section className="health-card">
        <div className="health-score" aria-label="Tourism health 78 percent"><span>78</span><small>%</small></div>
        <div className="health-copy"><p className="eyebrow">Province Tourism Health</p><h2>Balanced</h2><p>โอกาสเริ่มกระจายออกจากเมืองหลักและช่วงฤดูหนาว โดยไม่มีชุมชนใดเกิน capacity guardrail</p></div>
        <div className="health-signals"><span><b>84</b>Season balance</span><span><b>76</b>Income spread</span><span><b>74</b>Place diversity</span></div>
      </section>
      <section className="forecast-card">
        <div className="forecast-chart" aria-label="Demand forecast chart">
          {[32, 40, 44, 58, 72, 83, 100].map((value, index) => <i key={index} style={{ height: `${value}%` }}><span>{index + 1}</span></i>)}
          <div className="target-line"><span>Responsible target · 100</span></div>
        </div>
        <div className="forecast-summary">
          <p className="eyebrow">August scenario</p>
          <h2>40 → 100</h2>
          <p>คาดการณ์พื้นฐาน 40 คน และ Campaign lift สูงสุด 60 คน ภายใต้ capacity ที่อนุมัติ</p>
          <div className="forecast-range"><span>ช่วงคาดการณ์</span><strong>88–106 คน</strong></div>
          <div className="forecast-range"><span>Confidence</span><strong>82%</strong></div>
        </div>
      </section>
    </div>
  );
}

function ImpactView() {
  const { tr } = useLocale();
  const kpis = [
    { number: "01", title: "Increase Off-Season Experiences", description: "เพิ่มกิจกรรมที่ดึงดูดนักท่องเที่ยวในเดือนที่ไม่ใช่ High Season", value: "38", unit: "experiences", target: "เป้าหมาย 50", progress: 76, change: "+12 ไตรมาสนี้", measure: "จำนวนกิจกรรมที่เปิดขายหรือจัดจริงใน 8 เดือนนอกฤดูพีค" },
    { number: "02", title: "Increase Community Participation", description: "เพิ่มจำนวนชุมชนและผู้ประกอบการที่เข้าร่วมและสร้างกิจกรรมผ่านระบบ", value: "31", unit: "communities", target: "เป้าหมาย 40", progress: 78, change: "+9 ชุมชน", measure: "ชุมชนที่มี Need, Capacity และกิจกรรม Active อย่างน้อย 1 รายการ" },
    { number: "03", title: "Improve Tourism Distribution", description: "กระจายนักท่องเที่ยวและโอกาสทางเศรษฐกิจไปยังพื้นที่ที่ยังไม่เป็นที่รู้จัก", value: "64", unit: "% distributed", target: "เป้าหมาย 75%", progress: 85, change: "+18 จุด", measure: "สัดส่วนผู้เดินทางที่ถูกส่งไปยังพื้นที่รองหรือนอกช่วง High Season" },
  ];
  return (
    <div className="view-stack">
      <header className="content-header compact">
        <div><p className="eyebrow">{tr("3 ตัวชี้วัดหลัก", "Three North-star KPIs")}</p><h1>{tr("วัดเพียง 3 สิ่ง", "Three measures")}<br />{tr("ที่เปลี่ยนน่านได้จริง", "that truly change Nan")}</h1></div>
        <p>{tr("ทุกคำตัดสิน แคมเปญ และผลกระทบ ต้องขยับตัวชี้วัดหลักอย่างน้อยหนึ่งข้อ เพื่อรักษาทิศทางของผลิตภัณฑ์ให้ชัดเจน", "Every decision, campaign, and impact must move at least one core KPI to keep the product focused.")}</p>
      </header>
      <section className="kpi-cards" aria-label="ตัวชี้วัดหลักของ Nan Pulse AI">
        {kpis.map(kpi => <article key={kpi.number}>
          <div className="kpi-heading"><span>{kpi.number}</span><div><p>Primary KPI</p><h2>{kpi.title}</h2></div></div>
          <p className="kpi-description">{kpi.description}</p>
          <div className="kpi-value"><strong>{kpi.value}</strong><span>{kpi.unit}</span><em>{kpi.change}</em></div>
          <div className="kpi-progress"><i><b style={{ width: `${kpi.progress}%` }} /></i><span>{kpi.target}</span></div>
          <div className="kpi-measure"><span>How we measure</span><p>{kpi.measure}</p></div>
        </article>)}
      </section>
      <section className="impact-evidence" aria-labelledby="distribution-evidence-title">
        <div className="evidence-heading"><div><p className="eyebrow">Distribution Simulation</p><h2 id="distribution-evidence-title">Before AI → After AI</h2></div><span>Mock Simulation · ไม่ใช่สถิติจริง</span></div>
        <div className="distribution-compare">
          <div className="distribution-state before"><p>Before AI</p><article><div><strong>ปัว</strong><span>Tourist density</span></div><b>80%</b><i><em style={{ width: "80%" }} /></i></article><article><div><strong>เวียงสา</strong><span>Tourist density</span></div><b>3%</b><i><em style={{ width: "3%" }} /></i></article></div>
          <div className="distribution-arrow"><span>AI redirects</span><strong>→</strong><small>Coffee Route Campaign</small></div>
          <div className="distribution-state after"><p>After AI</p><article><div><strong>ปัว</strong><span>ลดความหนาแน่น</span></div><b>55%</b><i><em style={{ width: "55%" }} /></i></article><article><div><strong>เวียงสา</strong><span>เพิ่มโอกาสอย่างมีขอบเขต</span></div><b>18%</b><i><em style={{ width: "18%" }} /></i></article></div>
        </div>
        <div className="evidence-results"><div><span>Redirected visitors</span><strong>42</strong></div><div><span>Expected income</span><strong>+120K</strong></div><div><span>Stay extension</span><strong>+0.6 day</strong></div><div><span>Communities reached</span><strong>+4</strong></div></div>
      </section>
      <div className="calendar-divider"><span>Evidence from recent missions</span></div>
      <section className="mission-feed">
        <article><span className="feed-time">Today · 08:30</span><div className="feed-event"><i>AI redirected · 94% confidence</i><strong>42 tourists</strong><span>เมืองน่าน → เวียงสา</span></div><b className="flow-arrow">↓</b><div className="feed-result"><i>Income</i><strong>+92,000</strong><span>บาท · 11 ครัวเรือน</span></div></article>
        <article><span className="feed-time">Yesterday · 16:10</span><div className="feed-event"><i>Campaign activated · 89% confidence</i><strong>Herbal Retreat</strong><span>สันติสุข · 2 ธุรกิจ</span></div><b className="flow-arrow">↓</b><div className="feed-result"><i>Expected stays</i><strong>+24 nights</strong><span>ภายใน 14 วัน</span></div></article>
        <article><span className="feed-time">12 Jul · 11:45</span><div className="feed-event"><i>Capacity protected · 86% confidence</i><strong>18 tourists</strong><span>เปลี่ยนจากปัว → แม่จริม</span></div><b className="flow-arrow">↓</b><div className="feed-result"><i>Balance gained</i><strong>+6%</strong><span>Place diversity</span></div></article>
      </section>
      <section className="learning-card">
        <div><p className="eyebrow">AI Feedback Loop</p><h2>สิ่งที่ระบบเรียนรู้จากรอบล่าสุด</h2></div>
        <ol>
          <li><span>01</span><p><strong>กลุ่ม craft learners ตอบสนองสูงกว่าคาด 12%</strong> เพิ่มน้ำหนัก visitor fit สำหรับ workshop แบบลงมือทำ</p></li>
          <li><span>02</span><p><strong>กลุ่มเล็กสร้างความพึงพอใจสูงกว่า</strong> คง group size ไม่เกิน 12 คน แม้ capacity รวมยังเหลือ</p></li>
          <li><span>03</span><p><strong>รายได้กระจายไม่เท่ากันในบางกิจกรรม</strong> ส่งกลับให้ชุมชนทบทวน participation ก่อนรอบถัดไป</p></li>
        </ol>
      </section>
    </div>
  );
}

function OfficialDataSources() {
  const { tr } = useLocale();
  return <section className="source-register">
    <div className="source-register-head"><div><p className="eyebrow">{tr("ที่มาของข้อมูล", "Data Provenance")}</p><h2>{tr("แหล่งข้อมูลที่ใช้ตัดสินใจ", "Decision data sources")}</h2></div><p>{tr("ข้อมูลทางการและค่าประมาณของ AI ถูกแยกจากกันอย่างชัดเจน ระบบไม่แสดงค่าคาดการณ์เป็นสถิติจริง", "Official data and AI estimates remain clearly separated. Forecasts are never presented as actual statistics.")}</p></div>
    <div className="source-grid">{officialSources.map((source, index) => <a key={source.name} href={source.url} target="_blank" rel="noreferrer"><span>0{index + 1}</span><div><strong>{source.name}</strong><small>{source.use}</small></div><em>{source.status}</em><b>↗</b></a>)}</div>
  </section>;
}

function ValidationLearning() {
  const { tr } = useLocale();
  return <div className="view-stack">
    <header className="content-header compact"><div><p className="eyebrow">{tr("การทดสอบและการเรียนรู้ · Design Thinking + Agile", "Validation & Learning · Design Thinking + Agile")}</p><h1>{tr("จากปัญหา", "From problem")}<br />{tr("สู่หลักฐานที่วัดได้", "to measurable evidence")}</h1></div><p>{tr("Nan Pulse AI แยกสิ่งที่รู้จริง สิ่งที่ AI คาดการณ์ และสิ่งที่ยังต้องพิสูจน์ภาคสนาม เพื่อให้ต้นแบบเติบโตเป็นระบบที่ชุมชนใช้ได้จริง", "Nan Pulse AI separates verified facts, AI estimates, and field assumptions so the prototype can grow into a system communities can truly use.")}</p></header>

    <section className="design-thinking-evidence" aria-labelledby="design-thinking-title">
      <div className="evidence-section-head"><div><p className="eyebrow">Design Thinking Summary</p><h2 id="design-thinking-title">เริ่มจากผู้ใช้ ไม่ได้เริ่มจาก Feature</h2></div><span>Problem → Insight → Prototype → Test</span></div>
      <div className="thinking-steps">
        <article><b>01</b><span>Empathize</span><strong>ฟัง Need ของ 3 ผู้ใช้</strong><p>จังหวัดต้องตัดสินใจได้ ชุมชนต้องได้ demand ที่เหมาะ และนักท่องเที่ยวต้องเข้าใจเหตุผลของเส้นทางใหม่</p></article>
        <article><b>02</b><span>Define</span><strong>โอกาสกระจุกในฤดูหนาว</strong><p>โจทย์ไม่ใช่การค้นหาสถานที่ แต่คือการกระจายรายได้และนักท่องเที่ยวตลอด 12 เดือน</p></article>
        <article><b>03</b><span>Ideate</span><strong>Community Need เป็นจุดเริ่ม</strong><p>เปลี่ยนจาก Travel Recommendation เป็น Decision → Campaign → Redirect → Impact</p></article>
        <article><b>04</b><span>Prototype</span><strong>หนึ่ง Mission ที่ลงมือได้</strong><p>Execute ครั้งเดียวแล้วสร้าง Campaign แจ้งชุมชน ปรับ Journey และจำลองผลกระทบ</p></article>
        <article className="pending-step"><b>05</b><span>Test next</span><strong>Field validation</strong><p>ทดสอบกับผู้ใช้จริงก่อนนำตัวเลข Actual Result มาใช้ตัดสินใจรอบถัดไป</p></article>
      </div>
    </section>

    <section className="validation-board" aria-labelledby="validation-title">
      <div className="evidence-section-head"><div><p className="eyebrow">User Validation Plan</p><h2 id="validation-title">Prototype ต้องผ่านงานจริงของผู้ใช้</h2></div><span className="pending-badge">Pending field validation</span></div>
      <div className="validation-cards">
        <article><span>Government</span><h3>ตัดสินใจและอธิบายเหตุผลได้ภายใน 3 นาที</h3><p><b>Test task:</b> เลือก Mission ตรวจ Confidence แล้ว Execute โดยไม่ต้องมีผู้ช่วย</p><small>Success signal · อธิบาย Reason, Risk และ Impact ได้ครบ</small></article>
        <article><span>Community</span><h3>เปลี่ยน Need เป็น Campaign ที่ทำได้จริง</h3><p><b>Test task:</b> ระบุ Need ตรวจ Capacity และแก้ Campaign ให้ตรงกับบริบทชุมชน</p><small>Success signal · ยอมรับ Mission และพร้อมเข้าร่วม Pilot</small></article>
        <article><span>Tourist</span><h3>เข้าใจว่าเหตุใด Journey จึงเปลี่ยน</h3><p><b>Test task:</b> เปรียบเทียบเส้นทางเดิมกับ Experience ที่ AI จับคู่ให้</p><small>Success signal · เลือกพื้นที่รองโดยไม่รู้สึกว่าถูกบังคับ</small></article>
      </div>
      <p className="validation-disclaimer"><strong>Evidence rule:</strong> ระบบจะไม่แสดงผลสัมภาษณ์หรือคะแนนความพึงพอใจจนกว่าจะมีการทดสอบกับผู้ใช้จริงและบันทึกวิธีเก็บข้อมูล</p>
    </section>

    <section className="agile-learning" aria-labelledby="agile-title">
      <div className="evidence-section-head"><div><p className="eyebrow">Agile Learning Evidence</p><h2 id="agile-title">ทุก Sprint ต้องเปลี่ยนสิ่งที่เรียนรู้ให้เป็น Product</h2></div><span>Build → Measure → Learn</span></div>
      <div className="sprint-track">
        <article><span>Sprint 01</span><strong>Frame the problem</strong><p>ตัด Search และ Booking ออก เพื่อโฟกัสการกระจายโอกาส</p><em>Decision system</em></article>
        <article><span>Sprint 02</span><strong>Community first</strong><p>เปลี่ยน Community Profile ให้พูด Need, Readiness และ Capacity</p><em>Community Mission</em></article>
        <article><span>Sprint 03</span><strong>Explain the AI</strong><p>เพิ่ม Reason, Confidence และปัจจัยที่ใช้ตัดสินใจทุก Recommendation</p><em>Trust evidence</em></article>
        <article><span>Sprint 04</span><strong>Prove before action</strong><p>เพิ่ม Execute Mission และ Opportunity Simulator พร้อม Risk</p><em>Action + simulation</em></article>
        <article className="next-sprint"><span>Next Sprint</span><strong>Field pilot</strong><p>เก็บผลจริง เปรียบเทียบกับ Estimate แล้วปรับ Decision รอบถัดไป</p><em>Actual learning</em></article>
      </div>
    </section>

    <section className="impact-proof" aria-labelledby="impact-proof-title">
      <div className="evidence-section-head"><div><p className="eyebrow">Impact Evidence Chain</p><h2 id="impact-proof-title">Official → Estimate → Actual</h2></div><span>ไม่ใช้คำว่า Impact โดยไม่มีหลักฐาน</span></div>
      <div className="evidence-layers">
        <article className="official-layer"><span>01 · Official Baseline</span><strong>422,362 ผู้เยี่ยมเยือน</strong><p>ม.ค.–มี.ค. 2569 · รายได้รวม 1,186.83 ล้านบาท</p><em>Verified government source</em></article>
        <b aria-hidden="true">→</b>
        <article className="estimate-layer"><span>02 · AI Estimate</span><strong>+42 คน · +120K บาท</strong><p>+0.6 วันพัก · 18 ครัวเรือน จาก Scenario เวียงสา</p><em>Mock simulation · Confidence 94%</em></article>
        <b aria-hidden="true">→</b>
        <article className="actual-layer"><span>03 · Actual Result</span><strong>รอ Field Pilot</strong><p>จำนวนผู้เข้าร่วม รายได้ การกระจาย และ Review หลัง Campaign</p><em>Pending · ไม่สร้างข้อมูลจริงปลอม</em></article>
        <b aria-hidden="true">→</b>
        <article className="learn-layer"><span>04 · AI Learns</span><strong>Accuracy + Next Decision</strong><p>วัด Forecast Error แล้วปรับน้ำหนัก Demand, Fit และ Capacity</p><em>Available after actual result</em></article>
      </div>
    </section>

    <section className="year-value-proof"><div><p className="eyebrow">12-Month Value Proposition</p><h2>สร้างเหตุผลให้เดินทางทุกฤดูกาล</h2></div><div><strong>12/12</strong><span>เดือนมี Opportunity</span></div><div><strong>Culture</strong><span>เทศกาล · ผ้าทอ · วิถีชุมชน</span></div><div><strong>Wellness</strong><span>ป่า · สมุนไพร · Slow travel</span></div><div><strong>Food</strong><span>กาแฟ · อาหารพื้นเมือง · Harvest</span></div></section>

  </div>;
}

function TourismDigitalTwin() {
  const { tr } = useLocale();
  const scenarios = [
    { id: "coffee", name: "โปรโมตกาแฟเดือนกรกฎาคม", note: "Coffee Harvest · 20–31 Jul", visitors: "+62 คน", income: "+280K บาท", stay: "+0.8 วัน", communities: "4 ชุมชน", households: "23 ครัวเรือน", risk: "ปานกลาง", riskTone: "medium", riskDetail: "ฝน 35% · ต้องกระจายรอบเข้าชมไม่เกิน 12 คน", pua: 55, wiangsa: 18, confidence: 88 },
    { id: "textile", name: "โปรโมตผ้าทอช่วง Green Season", note: "Textile Learning · 14 days", visitors: "+46 คน", income: "+190K บาท", stay: "+0.5 วัน", communities: "3 ชุมชน", households: "18 ครัวเรือน", risk: "ต่ำ", riskTone: "low", riskDetail: "Capacity พร้อม · ต้องยืนยันวิทยากร 2 กลุ่ม", pua: 62, wiangsa: 15, confidence: 91 },
    { id: "wellness", name: "เปิด Forest Wellness Route", note: "Low-density window · 9 days", visitors: "+38 คน", income: "+156K บาท", stay: "+1.1 วัน", communities: "5 ชุมชน", households: "16 ครัวเรือน", risk: "ปานกลาง", riskTone: "medium", riskDetail: "เส้นทางลื่นหลังฝน · ต้องมี route fallback", pua: 66, wiangsa: 12, confidence: 84 },
  ];
  const [selected, setSelected] = useState<string | null>(null);
  const active = scenarios.find(item => item.id === selected);
  return <div className="view-stack">
    <header className="content-header compact"><div><p className="eyebrow">{tr("ฟีเจอร์หลัก · เครื่องจำลองโอกาส AI", "Core Feature · AI Opportunity Simulator")}</p><h1>{tr("ทดลองโอกาส", "Simulate opportunity")}<br />{tr("ก่อนตัดสินใจจริง", "before taking action")}</h1></div><p>{tr("จังหวัดเลือกสิ่งที่ต้องการส่งเสริม แล้ว AI จำลองผลต่อนักท่องเที่ยว รายได้ ชุมชน และความเสี่ยงทันที นี่คือระบบตัดสินใจ ไม่ใช่ระบบวางแผนเที่ยว", "The province selects what to promote, and AI immediately simulates visitors, income, communities, and risk. This is a decision system—not a trip planner.")}</p></header>
    <section className="twin-workbench">
      <div className="campaign-dock"><p className="eyebrow">Opportunity scenarios</p><h2>จังหวัดต้องการ<br />ทดลองอะไร?</h2><div>{scenarios.map((item, index) => <button draggable key={item.id} onDragStart={event => event.dataTransfer.setData("campaign", item.id)} onClick={() => setSelected(item.id)} className={selected === item.id ? "active" : ""}><span>0{index + 1}</span><strong>{item.name}</strong><small>{item.note} · Run simulation →</small></button>)}</div><p>กด Scenario เพื่อให้ AI ประเมินผลทันที หรือจะลากลงพื้นที่จำลองก็ได้</p></div>
      <div className={`twin-stage ${active ? "has-scenario" : ""}`} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); setSelected(event.dataTransfer.getData("campaign")); }}>
        {!active ? <div className="empty-twin"><span>◎</span><strong>Choose an opportunity</strong><small>AI จะจำลอง Benefit + Risk ก่อนจังหวัดอนุมัติ</small></div> : <>
          <div className="twin-head"><div><p className="eyebrow">AI Simulation Complete</p><h2>{active.name}</h2></div><span>{active.confidence}% confidence</span></div>
          <DecisionConfidence value={active.confidence} factors={["Weather", "Demand", "Season", "Community Capacity"]} />
          <div className="simulation-equation"><span>Weather</span><b>+</b><span>Season</span><b>+</b><span>Demand</span><b>+</b><span>Community Need</span><strong>→ Opportunity Impact</strong></div>
          <div className="twin-density"><div><p>Before AI</p><article><span>ปัว</span><strong>80%</strong><i><b style={{ width: "80%" }} /></i></article><article><span>เวียงสา</span><strong>3%</strong><i><b style={{ width: "3%" }} /></i></article></div><em>→</em><div><p>After AI</p><article><span>ปัว</span><strong>{active.pua}%</strong><i><b style={{ width: `${active.pua}%` }} /></i></article><article><span>เวียงสา</span><strong>{active.wiangsa}%</strong><i><b style={{ width: `${active.wiangsa}%` }} /></i></article></div></div>
          <div className="twin-results opportunity-results"><div><span>นักท่องเที่ยวเพิ่ม</span><strong>{active.visitors}</strong><small>ภายใน Campaign window</small></div><div><span>รายได้โดยประมาณเพิ่ม</span><strong>{active.income}</strong><small>Expected income</small></div><div><span>ชุมชนที่ได้ประโยชน์</span><strong>{active.communities}</strong><small>{active.households}</small></div><div className={`risk-result risk-${active.riskTone}`}><span>ความเสี่ยง</span><strong>{active.risk}</strong><small>{active.riskDetail}</small></div></div>
          <div className="secondary-outcome"><span>Stay extension</span><strong>{active.stay}</strong><p>AI แนะนำให้เริ่มด้วย Controlled Pilot และติดตามผลจริงก่อนขยาย Campaign</p></div>
          <div className="twin-disclaimer"><span>Mock Simulation</span><p>ผลลัพธ์นี้เป็น scenario estimate สำหรับเปรียบเทียบทางเลือก ไม่ใช่ผลลัพธ์จริง จังหวัดต้องอนุมัติก่อน activate campaign</p><button onClick={() => setSelected(null)}>Reset</button></div>
        </>}
      </div>
    </section>
  </div>;
}

function MissionControl() {
  const { tr } = useLocale();
  const [section, setSection] = useState<MissionSection>("today");
  const sections: Array<{ id: MissionSection; label: string }> = [
    { id: "today", label: tr("คำตัดสินวันนี้", "Today’s Decision") },
    { id: "opportunities", label: tr("โอกาสและแคมเปญ", "Opportunity & Campaign") },
    { id: "twin", label: tr("เครื่องจำลองโอกาส AI", "AI Opportunity Simulator") },
    { id: "forecast", label: tr("สุขภาวะการท่องเที่ยว", "Tourism Health") },
    { id: "impact", label: tr("ตัวชี้วัดและผลกระทบ", "KPI & Impact") },
    { id: "evaluation", label: tr("การทดสอบและการเรียนรู้", "Validation & Learning") },
  ];
  return <div className="product-workspace">
    <nav className="workspace-tabs" aria-label={tr("เครื่องมือศูนย์บัญชาการ", "Mission Control tools")}>{sections.map(item => <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => setSection(item.id)}>{item.label}</button>)}</nav>
    {section === "today" && <MissionView onNavigate={() => setSection("opportunities")} />}
    {section !== "today" && <header className="workspace-identity"><div><p className="eyebrow">01 · {tr("ระบบตัดสินใจระดับจังหวัด", "Provincial Decision System")}</p><h1>{tr("ศูนย์บัญชาการ", "Mission Control")}</h1></div><p>{tr("ระบบตัดสินใจว่าจังหวัดควรสร้างโอกาสที่ไหน เมื่อไร และให้ใคร ก่อนส่งคำตัดสินไปสู่แคมเปญ ชุมชน และการเดินทางจริง", "A system that decides where, when, and for whom Nan should create opportunity—before activating campaigns, communities, and journeys.")}</p></header>}
    {section !== "today" && <section className="decision-doctrine"><div><span>{tr("Nan Pulse AI คือ", "Nan Pulse AI is")}</span><strong>{tr("ระบบการตัดสินใจ", "a decision system")}</strong></div><b>≠</b><div><span>{tr("Nan Pulse AI ไม่ใช่", "Nan Pulse AI is not")}</span><strong>{tr("ระบบแนะนำสถานที่", "a place recommender")}</strong></div><ol><li>{tr("ตรวจจับ", "Detect")}</li><li>{tr("สัญญาณ", "Signals")}</li><li>{tr("แคมเปญ", "Campaign")}</li><li>{tr("ส่งต่อ", "Redirect")}</li><li>{tr("ผลกระทบ", "Impact")}</li></ol></section>}
    {section === "opportunities" && <OpportunityView />}
    {section === "twin" && <TourismDigitalTwin />}
    {section === "forecast" && <ForecastView />}
    {section === "impact" && <ImpactView />}
    {section === "evaluation" && <ValidationLearning />}
    <OfficialDataSources />
  </div>;
}

function CommunityCopilot() {
  const { locale, tr } = useLocale();
  const [community, setCommunity] = useState("เวียงสา");
  const [goal, setGoal] = useState("workshop");
  const [mission, setMission] = useState("Need Coffee Lovers");
  const [created, setCreated] = useState(false);
  const [exampleFilter, setExampleFilter] = useState("all");
  const communityNeeds = [
    { id: "Need Visitors", th: "ต้องการนักท่องเที่ยว", en: "Need Visitors" },
    { id: "Need Promotion", th: "ต้องการการประชาสัมพันธ์", en: "Need Promotion" },
    { id: "Need Coffee Lovers", th: "ต้องการคนรักกาแฟ", en: "Need Coffee Lovers" },
    { id: "Need Family Travelers", th: "ต้องการกลุ่มครอบครัว", en: "Need Family Travelers" },
  ];
  const goals = [
    { id: "workshop", th: "เพิ่มผู้เข้าร่วมกิจกรรม", en: "Increase activity participation" },
    { id: "low-season", th: "สร้างโปรโมชันนอกฤดูท่องเที่ยว", en: "Create an off-season promotion" },
    { id: "launch", th: "เปิดตัวประสบการณ์ใหม่", en: "Launch a new experience" },
  ];
  const needIcons: Record<string, string> = { "Need Visitors": "↗", "Need Promotion": "✦", "Need Coffee Lovers": "◉", "Need Family Travelers": "⌂" };
  const communities = Array.from(new Set(copilotScenarios.map(item => item.community)));
  const filteredScenarios = exampleFilter === "all" ? copilotScenarios : copilotScenarios.filter(item => item.community === exampleFilter);
  const active = copilotScenarios.find(item => item.community === community && item.need === mission) ?? copilotScenarios[0];
  const goalConfig = goal === "low-season"
    ? { label: tr("แคมเปญนอกฤดู", "Off-season Campaign"), prefix: "Green Season", confidence: -2, visitorDelta: 10, incomeMultiplier: 1.15, actionTh: "เพิ่มข้อเสนอจองล่วงหน้า 7 วัน", actionEn: "Add a seven-day early-booking offer" }
    : goal === "launch"
      ? { label: tr("กิจกรรมใหม่", "New Experience"), prefix: "New", confidence: -4, visitorDelta: -6, incomeMultiplier: .86, actionTh: "เปิดรอบทดลองไม่เกิน 12 คน", actionEn: "Launch a pilot capped at 12 guests" }
      : { label: tr("เพิ่มผู้เข้าร่วม", "Participation Growth"), prefix: "", confidence: 0, visitorDelta: 0, incomeMultiplier: 1, actionTh: "เปิดรับรอบกิจกรรมตาม Capacity", actionEn: "Open activity slots within capacity" };
  const campaign = `${goalConfig.prefix ? `${goalConfig.prefix} · ` : ""}${active.campaign}`;
  const expectedVisitors = Math.max(12, active.visitors + goalConfig.visitorDelta);
  const expectedIncome = Math.round(active.income * goalConfig.incomeMultiplier / 1000) * 1000;
  const selectExample = (item: typeof copilotScenarios[number], index: number) => {
    setCommunity(item.community); setMission(item.need); setGoal(["workshop", "low-season", "launch"][index % 3]); setCreated(true);
  };
  return <div className="product-workspace">
    <header className="workspace-identity"><div><p className="eyebrow">02 · {tr("เปลี่ยนคำตัดสินเป็นการลงมือทำ", "Decision Activation for Operators")}</p><h1>{tr("ผู้ช่วยชุมชน", "Community Copilot")}</h1></div><p>{tr("รับภารกิจที่จังหวัดตัดสินใจแล้วมาเปลี่ยนเป็นโปรโมชัน เนื้อหาประชาสัมพันธ์ และกิจกรรมที่ชุมชนดำเนินการได้จริง", "Turn the province’s approved mission into promotions, communication content, and activities local operators can deliver.")}</p></header>
    <section className="copilot-example-library" aria-labelledby="copilot-examples-title">
      <div className="copilot-example-head"><div><p className="eyebrow">{tr("คลังข้อมูลจำลอง", "Mock Data Library")}</p><h2 id="copilot-examples-title">{tr("24 ภารกิจที่เปลี่ยนผลลัพธ์ได้จริง", "24 missions with distinct outputs")}</h2></div><span>{tr("เลือกข้อมูลเพื่อเปรียบเทียบทันที", "Select data to compare instantly")}</span></div>
      <div className="copilot-data-summary"><div><strong>6</strong><span>{tr("ชุมชน", "communities")}</span></div><div><strong>24</strong><span>{tr("ภารกิจจำลอง", "mock missions")}</span></div><div><strong>72</strong><span>{tr("รูปแบบผลลัพธ์", "output combinations")}</span></div><div><strong>4</strong><span>{tr("กลุ่มนักท่องเที่ยว", "traveler segments")}</span></div></div>
      <div className="copilot-example-filters" role="group" aria-label={tr("กรองชุมชน", "Filter communities")}><button className={exampleFilter === "all" ? "active" : ""} onClick={() => setExampleFilter("all")}>{tr("ทุกชุมชน", "All communities")}</button>{communities.map(item => <button key={item} className={exampleFilter === item ? "active" : ""} onClick={() => setExampleFilter(item)}>{item}</button>)}</div>
      <div className="copilot-example-grid">{filteredScenarios.map((item, index) => <button key={`${item.community}-${item.need}`} className={active === item ? "active" : ""} onClick={() => selectExample(item, index)}><i className="example-icon" aria-hidden="true">{needIcons[item.need]}</i><span>{item.community}</span><strong>{communityNeeds.find(need => need.id === item.need)?.[locale === "th" ? "th" : "en"]}</strong><small>{item.campaign}</small><em>{item.confidence}%</em></button>)}</div>
    </section>
    <section className="copilot-layout">
      <div className="copilot-input">
        <div className="copilot-orb">✦</div><p className="eyebrow">{tr("เริ่มจากเสียงของชุมชน", "Community speaks first")}</p><h2>{tr("ตอนนี้ชุมชน", "What does the community")}<br />{tr("ต้องการอะไร", "need right now?")}</h2>
        <div className="community-asks" role="group" aria-label="Community missions">{communityNeeds.map(need => <button key={need.id} className={mission === need.id ? "active" : ""} onClick={() => { setMission(need.id); setCreated(true); }}><i aria-hidden="true">{needIcons[need.id]}</i><span>{locale === "th" ? need.th : need.en}</span></button>)}</div>
        <label>{tr("ชุมชน", "Community")}<select value={community} onChange={e => { setCommunity(e.target.value); setCreated(true); }}>{communities.map(item => <option key={item}>{item}</option>)}</select></label>
        <label>{tr("เป้าหมาย", "Goal")}<select value={goal} onChange={e => { setGoal(e.target.value); setCreated(true); }}>{goals.map(item => <option key={item.id} value={item.id}>{locale === "th" ? item.th : item.en}</option>)}</select></label>
        <div className="copilot-context"><span>{tr("ฤดูกาล", "Season")} <b>{active.season}</b></span><span>{tr("ความต้องการ", "Demand")} <b>{active.demand}</b></span><span>{tr("ขีดความสามารถ", "Capacity")} <b>{active.capacity} {tr("คน", "people")}</b></span></div>
        <button className="primary-action" onClick={() => setCreated(true)}>{created ? tr("สร้างแคมเปญแล้ว ✓", "Campaign generated ✓") : tr("สร้างแคมเปญด้วย AI", "Generate campaign with AI")}</button>
      </div>
      <div key={`${community}-${mission}-${goal}`} className={`copilot-output ${created ? "ready" : ""}`}>
        <div className="output-head"><div><p className="eyebrow">{tr("ผลลัพธ์ภารกิจ", "Mission response")} · {goalConfig.label}</p><h2>{campaign}</h2></div><span>{active.confidence + goalConfig.confidence}% fit</span></div>
        <p className="output-lead">{tr(`AI รับฟังภารกิจของ${community} ซึ่งต้องการ${active.audience} แล้วสร้างแคมเปญตามฤดูกาล ความต้องการ และขีดความสามารถของชุมชน`, `AI interpreted ${community}’s need for ${active.audience} and generated a campaign aligned with season, demand, and local capacity.`)}</p>
        <DecisionConfidence value={active.confidence + goalConfig.confidence} factors={["Demand", "Season", "Community Need", "Capacity"]} />
        <div className="copilot-engine-flow" aria-label={tr("ลำดับการทำงานของ AI", "AI processing flow")}><span><i>⌂</i>{tr("ความต้องการชุมชน", "Community Need")}</span><b>→</b><span><i>✦</i>{tr("AI จับคู่", "AI Match")}</span><b>→</b><span><i>◆</i>{tr("สร้างแคมเปญ", "Campaign")}</span><b>→</b><span><i>◎</i>{tr("คาดการณ์ผล", "Impact")}</span></div>
        <div className="copilot-reason"><span>✦</span><div><strong>{tr("เหตุผลที่ AI เลือกแนวทางนี้", "Why AI chose this direction")}</strong><p>{active.demand} · {active.season} · Capacity {active.capacity} · {locale === "th" ? goalConfig.actionTh : goalConfig.actionEn}</p></div></div>
        <div className="content-pack"><article><i className="content-icon" aria-hidden="true">◇</i><span>{tr("โปรโมชัน", "Promotion")}</span><strong>{locale === "th" ? active.promotionTh : active.promotionEn}</strong></article><article><i className="content-icon" aria-hidden="true">ก</i><span>{tr("คำบรรยายภาษาไทย", "Thai caption")}</span><p>{active.captionTh}</p></article><article><i className="content-icon" aria-hidden="true">A</i><span>{tr("คำบรรยายภาษาอังกฤษ", "English caption")}</span><p>{active.captionEn}</p></article><article><i className="content-icon" aria-hidden="true">◎</i><span>{tr("กิจกรรมแนะนำ", "Suggested activity")}</span><strong>{active.activity}</strong></article></div>
        <div className="output-impact"><span>{tr("ผลลัพธ์ที่คาดการณ์", "Expected result")}</span><strong><i>↗</i> +{expectedVisitors} {tr("คน", "visitors")}</strong><strong><i>฿</i> +{expectedIncome.toLocaleString()} {tr("บาท", "THB")}</strong><strong><i>⌂</i> {active.households} {tr("ครัวเรือน", "households")}</strong></div>
        <p className="copilot-mock-note">{tr("ข้อมูลตัวอย่างสำหรับสาธิต · ผลลัพธ์จะเปลี่ยนตามชุมชน ภารกิจ และเป้าหมายที่เลือก", "Mock data for demonstration · Outputs change with the selected community, mission, and goal.")}</p>
      </div>
    </section>
  </div>;
}

const plannerProfiles = [
  { id:"Wellness", icon:"✦", title:"Forest Reset Journey", audience:"คนทำงานที่ต้องการพักใจ", from:"ปัว", to:"สันติสุข + เวียงสา", description:"เชื่อมป่า สมุนไพร อาหารพื้นถิ่น และโฮมสเตย์ เพื่อย้าย demand จากพื้นที่หนาแน่นสู่ชุมชนที่พร้อม", stops:["Forest Therapy · สันติสุข 09:00","Herbal Local Lunch · 12:30","Natural Dye Workshop · เวียงสา 15:00","Community Homestay · บ้านดอนไชย"], communities:2, businesses:6, nights:1, income:18500 },
  { id:"Craft", icon:"◇", title:"Hands of Nan Journey", audience:"นักเดินทางสายงานคราฟต์", from:"เมืองน่าน", to:"เวียงสา + ท่าวังผา", description:"พาผู้เดินทางจากการชมงานฝีมือไปสู่การลงมือทำกับช่างและกลุ่มทอผ้าในชุมชน", stops:["Textile Story Walk · เวียงสา","Natural Dye Lab · กลุ่มแม่บ้าน","Lanna Pattern Workshop · ท่าวังผา","Craft Family Homestay · Overnight"], communities:2, businesses:8, nights:1, income:22400 },
  { id:"Food", icon:"◉", title:"Nan Seasonal Table", audience:"นักชิมและนักเดินทางสายอาหาร", from:"ร้านดังในเมือง", to:"ภูเพียง + บ่อเกลือ", description:"กระจายมื้ออาหารจากร้านยอดนิยมสู่ครัวชุมชนและผู้ผลิตวัตถุดิบตามฤดูกาล", stops:["Rice Field Breakfast · ภูเพียง","Farm Ingredient Walk · 10:30","Salt Kitchen Lab · บ่อเกลือ","Local Chef Table · Community Stay"], communities:2, businesses:9, nights:1, income:26800 },
  { id:"Nature", icon:"↗", title:"Green River Discovery", audience:"นักเดินทางธรรมชาติ", from:"ดอยเสมอดาว", to:"แม่จริม + ทุ่งช้าง", description:"เปลี่ยนจากจุดชมวิวยอดนิยมเป็นเส้นทางแม่น้ำ ป่าชุมชน และเกษตรบนพื้นที่สูงที่รองรับได้", stops:["River Ecology Walk · แม่จริม","Community Picnic · 12:00","Highland Forest Trail · ทุ่งช้าง","Grower Homestay · Overnight"], communities:2, businesses:7, nights:1, income:21100 },
  { id:"Family", icon:"⌂", title:"Little Explorer Mission", audience:"ครอบครัวที่มีเด็ก", from:"แหล่งท่องเที่ยวในเมือง", to:"ภูเพียง + เวียงสา", description:"เปลี่ยนวันหยุดครอบครัวให้เป็นห้องเรียนมีชีวิต พร้อมส่งรายได้ถึงครัวเรือนผู้จัดกิจกรรม", stops:["Rice Classroom · ภูเพียง","Local Dessert Lab · 11:30","Junior Craft Mission · เวียงสา","Family Homestay · บ้านดอนไชย"], communities:2, businesses:7, nights:1, income:19600 },
  { id:"Coffee", icon:"●", title:"First Cup Origin Route", audience:"คนรักกาแฟต้นทาง", from:"คาเฟ่ในเมือง", to:"ทุ่งช้าง + สันติสุข", description:"พาผู้ดื่มกาแฟไปพบผู้ปลูก กระบวนการหลังเก็บเกี่ยว และเรื่องเล่าที่ต้นทาง", stops:["Coffee Harvest · ทุ่งช้าง 08:00","Processing Lab · 11:00","Grower Lunch · 13:00","Sunset Cupping · สันติสุข"], communities:2, businesses:8, nights:1, income:24700 },
];

const plannerConditions = [
  { id:"clear", icon:"☀", labelTh:"อากาศเปิด", labelEn:"Clear weather", weather:"ฝนหยุดพรุ่งนี้ · ทัศนวิสัยดี", season:"Green season · วัตถุดิบพร้อม", density:"ปัว 82% · ชุมชนเป้าหมาย 24%", reason:"เปิดเส้นทางกลางแจ้งและย้ายผู้เดินทางออกจากปัว", confidence:4, visitors:18, income:1.12, risk:"ต่ำ", swap:"Outdoor route activated" },
  { id:"rain", icon:"☂", labelTh:"ฝนต่อเนื่อง", labelEn:"Rain continues", weather:"ฝน 78% ช่วงบ่าย", season:"สมุนไพรและครัวชุมชนพร้อม", density:"เมืองน่าน 71% · เวียงสา 18%", reason:"ลดกิจกรรมกลางแจ้งและสลับเป็น Workshop ในร่ม", confidence:-3, visitors:11, income:1.04, risk:"ปานกลาง", swap:"Indoor route activated" },
  { id:"pm25", icon:"≋", labelTh:"PM2.5 สูง", labelEn:"High PM2.5", weather:"PM2.5 48 µg/m³ ทางเหนือ", season:"กิจกรรมอาหารและงานคราฟต์พร้อม", density:"ทุ่งช้าง 36% · ภูเพียง 22%", reason:"หลีกเลี่ยงพื้นที่ค่าฝุ่นสูงและย้ายลงโซนใต้", confidence:-6, visitors:9, income:.98, risk:"เฝ้าระวัง", swap:"Clean-air route activated" },
  { id:"festival", icon:"✺", labelTh:"เทศกาลหนาแน่น", labelEn:"Festival crowd", weather:"อากาศดี · การเดินทางปกติ", season:"เทศกาลเมืองน่านสุดสัปดาห์นี้", density:"เมืองน่าน 94% · แม่จริม 16%", reason:"หลีกเลี่ยงจุดหนาแน่นและเพิ่มเส้นทางชุมชนรอง", confidence:2, visitors:24, income:1.24, risk:"ต่ำ", swap:"Crowd bypass activated" },
];

function AdaptiveExperiencePlanner() {
  const { tr } = useLocale();
  const [interest, setInterest] = useState("Wellness");
  const [condition, setCondition] = useState("clear");
  const [feedRun, setFeedRun] = useState(0);
  const [dataStage, setDataStage] = useState(6);
  const [updatedAt, setUpdatedAt] = useState("--:--:--");
  const profile = plannerProfiles.find(item => item.id === interest) ?? plannerProfiles[0];
  const live = plannerConditions.find(item => item.id === condition) ?? plannerConditions[0];
  const confidence = Math.max(72, 87 + live.confidence);
  const expectedIncome = Math.round(profile.income * live.income / 100) * 100;
  const adaptedStops = profile.stops.map((stop, index) => condition === "rain" && index === 0 ? `${tr("กิจกรรมในร่ม", "Indoor session")} · ${stop.split("·")[1] ?? profile.to}` : condition === "pm25" && index === 2 ? `${tr("Clean-air Community Lab", "Clean-air Community Lab")} · ภูเพียง` : condition === "festival" && index === 3 ? `${tr("เส้นทางเลี่ยงฝูงชน", "Crowd-free local route")} · ${profile.to}` : stop);
  const pipeline = [
    { icon:"☁", label:"Weather", source:"Weather API · Demo", value:live.weather },
    { icon:"◐", label:"Season", source:"Season Calendar · Demo", value:live.season },
    { icon:"≋", label:"PM2.5", source:"Air Sensor · Demo", value:condition === "pm25" ? "48 µg/m³ · สูง" : "14 µg/m³ · ปกติ" },
    { icon:"◎", label:"Density", source:"Tourism Pulse · Demo", value:live.density },
    { icon:"✦", label:"AI Decision", source:"Decision Engine", value:`${profile.from} → ${profile.to}` },
    { icon:"↗", label:"Route Sent", source:"Experience Planner", value:profile.title },
  ];
  const planned = dataStage >= pipeline.length;
  useEffect(() => {
    setDataStage(0);
    setUpdatedAt("--:--:--");
    const timers = pipeline.map((_, index) => window.setTimeout(() => {
      setDataStage(index + 1);
      if (index === pipeline.length - 1) setUpdatedAt(new Date().toLocaleTimeString("th-TH", { hour12:false }));
    }, 320 + index * 420));
    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [interest, condition, feedRun]);
  const choose = (nextInterest:string, nextCondition:string) => { setInterest(nextInterest); setCondition(nextCondition); setFeedRun(run => run + 1); };
  const rerun = () => setFeedRun(run => run + 1);
  return <div className="product-workspace">
    <header className="workspace-identity"><div><p className="eyebrow">03 · {tr("ส่งต่อคำตัดสินสู่ผู้เดินทาง", "Decision Delivery for Travelers")}</p><h1>{tr("ตัววางแผนประสบการณ์แบบปรับตัว", "Adaptive Experience Planner")}</h1></div><p>{tr("AI ไม่ได้แนะนำสถานที่ แต่เปลี่ยนเส้นทางตามความสนใจ อากาศ ฤดูกาล และความหนาแน่น เพื่อส่งโอกาสไปยังชุมชนที่พร้อม", "AI does not recommend places. It adapts the journey using interest, weather, season, and density to send opportunity to ready communities.")}</p></header>
    <section className="planner-data-library">
      <div className="planner-library-head"><div><p className="eyebrow">{tr("คลังสถานการณ์จำลอง", "Mock Scenario Library")}</p><h2>{tr("24 สถานการณ์ที่ทำให้เส้นทางเปลี่ยน", "24 scenarios that change the journey")}</h2></div><div className="planner-counts"><span><b>6</b>{tr("ความสนใจ", "interests")}</span><span><b>4</b>{tr("สัญญาณสด", "live signals")}</span><span><b>24</b>{tr("ผลลัพธ์", "outcomes")}</span></div></div>
      <div className="planner-scenario-grid">{plannerProfiles.map(profileItem => plannerConditions.map(conditionItem => <button key={`${profileItem.id}-${conditionItem.id}`} className={interest === profileItem.id && condition === conditionItem.id ? "active" : ""} onClick={() => choose(profileItem.id, conditionItem.id)}><i>{profileItem.icon}</i><span>{profileItem.id} · {tr(conditionItem.labelTh, conditionItem.labelEn)}</span><strong>{profileItem.title}</strong><small>{conditionItem.icon} {profileItem.to}</small></button>))}</div>
    </section>
    <section className={`planner-live-pipeline ${planned ? "complete" : "working"}`} aria-live="polite">
      <div className="live-pipeline-head"><div><span className="pipeline-orb">AI</span><div><p>{planned ? tr("ส่งเส้นทางใหม่แล้ว", "New journey delivered") : tr("AI กำลังรับข้อมูลและตัดสินใจ", "AI is receiving data and deciding")}</p><strong>{planned ? tr("ข้อมูลครบ · พร้อมใช้งาน", "All signals received · Ready") : `${tr("กำลังประมวลผล", "Processing")} ${dataStage}/${pipeline.length}`}</strong></div></div><div><span className="demo-live-dot" /> <b>{tr("ข้อมูลสดจำลอง", "Simulated Live Data")}</b><small>{tr("อัปเดต", "Updated")} {updatedAt}</small><button onClick={rerun}>{tr("รับข้อมูลใหม่", "Refresh signals")} ↻</button></div></div>
      <div className="pipeline-track">{pipeline.map((item,index) => { const state = dataStage > index ? "received" : dataStage === index ? "receiving" : "waiting"; return <div key={`${feedRun}-${item.label}`} className={`pipeline-step ${state}`}><span className="pipeline-icon">{state === "received" ? "✓" : item.icon}</span><div><small>{item.source}</small><strong>{item.label}</strong><p>{state === "waiting" ? tr("รอข้อมูล", "Waiting") : state === "receiving" ? tr("กำลังรับข้อมูล…", "Receiving data…") : item.value}</p></div>{index < pipeline.length - 1 && <i>→</i>}</div>; })}</div>
      <div className="pipeline-progress"><i style={{width:`${dataStage / pipeline.length * 100}%`}} /></div>
      <p className="pipeline-disclaimer">{tr("ต้นแบบนี้ใช้ข้อมูลจำลองที่มีโครงสร้างเหมือนข้อมูลจริง เพื่อสาธิตลำดับการรับสัญญาณ เมื่อเชื่อม API จริง สถานะและเวลาจะอัปเดตจากแหล่งข้อมูลโดยตรง", "This prototype uses structured mock data to demonstrate the real ingestion sequence. Once live APIs are connected, status and timestamps will update directly from each source.")}</p>
    </section>
    <section className="planner-hero">
      <div className="planner-question"><p className="eyebrow">{tr("เลือกข้อมูลแล้วดู AI ปรับทันที", "Change inputs and watch AI adapt")}</p><h2>{tr("เปลี่ยนสัญญาณ", "Change the signals")}<br />{tr("เปลี่ยนเส้นทาง", "Change the journey")}</h2><div className="interest-pills">{plannerProfiles.map(item => <button key={item.id} className={interest === item.id ? "active" : ""} onClick={() => choose(item.id, condition)}>{item.icon} {item.id}</button>)}</div><div className="condition-pills">{plannerConditions.map(item => <button key={item.id} className={condition === item.id ? "active" : ""} onClick={() => choose(interest, item.id)}><i>{item.icon}</i>{tr(item.labelTh,item.labelEn)}</button>)}</div><button className="primary-action" onClick={rerun} disabled={!planned}>{planned ? tr("รับข้อมูลใหม่และปรับอีกครั้ง", "Refresh data and adapt again") : tr("AI กำลังทำงาน…", "AI is working…")}</button></div>
      <div key={condition} className={`adaptive-signals signal-change ${dataStage < 4 ? "receiving" : ""}`}><p className="eyebrow">Live conditions · {live.icon}</p><div><span>Weather</span><strong>{dataStage >= 1 ? live.weather : tr("กำลังรับข้อมูล…", "Receiving data…")}</strong><small>{dataStage >= 1 ? live.swap : "Weather API · Demo"}</small></div><div><span>Season</span><strong>{dataStage >= 2 ? live.season : tr("รอสัญญาณฤดูกาล", "Waiting for season signal")}</strong><small>{dataStage >= 2 ? tr("ตรวจสอบหน้าต่างโอกาสแล้ว", "Opportunity window checked") : "Season Calendar · Demo"}</small></div><div><span>Tourism pulse</span><strong>{dataStage >= 4 ? live.density : tr("กำลังคำนวณความหนาแน่น", "Calculating density")}</strong><small>{dataStage >= 4 ? live.reason : "Tourism Pulse · Demo"}</small></div><div className="signal-risk"><span>Route risk</span><strong>{dataStage >= 5 ? live.risk : "—"}</strong><small>{dataStage >= 5 ? tr("AI ประเมินก่อนเปลี่ยนเส้นทาง", "AI evaluated before rerouting") : tr("รอ Decision Engine", "Waiting for Decision Engine")}</small></div></div>
    </section>
    <section key={`${interest}-${condition}-${feedRun}`} className={`experience-plan ${planned ? "ready" : "processing"}`} aria-busy={!planned}>
      <div className="plan-title"><p className="eyebrow">Mission-matched experience · {interest}</p><h2>{profile.title}</h2><p>{profile.description}</p><DecisionConfidence value={confidence} factors={["Weather", "Traveler Fit", "Season", "Community Capacity"]} /></div>
      <ol>{adaptedStops.map((stop,index) => { const [name, place] = stop.split(" · "); return <li key={`${stop}-${index}`}><span>{String(index + 1).padStart(2,"0")}</span><div><strong>{name}</strong><small>{place}</small></div></li>; })}</ol>
      <div className="plan-impact"><p>Trip impact</p><strong>{profile.communities}</strong><span>{tr("ชุมชน", "communities")}</span><strong>{profile.businesses}</strong><span>{tr("ธุรกิจท้องถิ่น", "local businesses")}</span><strong>+{profile.nights}</strong><span>{tr("คืนในน่าน", "night in Nan")}</span><strong>฿{expectedIncome.toLocaleString()}</strong><span>{tr("รายได้คาดการณ์", "expected income")}</span></div>
    </section>
    <section key={`change-${interest}-${condition}-${feedRun}`} className={`planner-change-proof ${planned ? "ready" : "processing"}`} aria-busy={!planned}><div className="change-proof-head"><div><p className="eyebrow">{tr("หลักฐานการเปลี่ยนแปลง", "Decision Change Evidence")}</p><h2>{planned ? tr("AI เปลี่ยนอะไรจากเส้นทางเดิม", "What AI changed from the original route") : tr("กำลังรอผลการตัดสินใจ…", "Waiting for the decision result…")}</h2></div><span>{planned ? `${confidence}% AI confidence` : tr("กำลังคำนวณ", "Calculating")}</span></div><div className="journey-before-after"><article><p>{tr("ก่อน AI", "Before AI")}</p><strong>{profile.from}</strong><small>{tr("เส้นทางยอดนิยม · ความหนาแน่นสูง", "Popular route · high density")}</small><i><b style={{width:"82%"}} /></i><em>82% density</em></article><b>→</b><article className="after"><p>{tr("หลัง AI", "After AI")}</p><strong>{planned ? profile.to : "—"}</strong><small>{planned ? live.reason : tr("Decision Engine กำลังเลือกชุมชน", "Decision Engine is selecting communities")}</small><i><b style={{width:planned ? `${28 + live.visitors / 2}%` : "0%"}} /></i><em>{planned ? `${28 + Math.round(live.visitors / 2)}% density` : tr("รอผล", "Pending")}</em></article></div><div className="journey-deltas"><span><b>{planned ? `+${live.visitors}` : "—"}</b>{tr("นักท่องเที่ยวถูกกระจาย", "travelers redirected")}</span><span><b>{planned ? `+฿${expectedIncome.toLocaleString()}` : "—"}</b>{tr("มูลค่าสู่ท้องถิ่น", "local value")}</span><span><b>{planned ? profile.communities : "—"}</b>{tr("ชุมชนได้รับประโยชน์", "communities benefit")}</span><span><b>{planned ? live.swap : tr("กำลังประมวลผล", "Processing")}</b>{tr("การเปลี่ยนที่ AI ทำ", "AI route change")}</span></div><p className="planner-mock-note">{tr("ข้อมูลจำลองสำหรับสาธิต · เลือกสถานการณ์ด้านบนเพื่อดูเส้นทาง สัญญาณ เหตุผล และผลกระทบเปลี่ยนพร้อมกัน", "Demonstration mock data · Select a scenario above to see route, signals, reasoning, and impact change together.")}</p></section>
  </div>;
}

export function NanPulseApp() {
  const [view, setView] = useState<View>("mission");
  const [locale, setLocale] = useState<Locale>("th");
  useEffect(() => {
    const saved = window.localStorage.getItem("nan-pulse-locale");
    if (saved === "th" || saved === "en") setLocale(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.body.dataset.locale = locale;
    window.localStorage.setItem("nan-pulse-locale", locale);
  }, [locale]);
  const localizedViews = useMemo(() => views.map(item => ({ ...item,
    label: item.id === "mission" ? localize(locale, "ศูนย์บัญชาการ", "Mission Control") : item.id === "copilot" ? localize(locale, "ผู้ช่วยชุมชน", "Community Copilot") : localize(locale, "ตัววางแผนประสบการณ์", "Experience Planner"),
    note: item.id === "mission" ? localize(locale, "สำหรับหน่วยงานท่องเที่ยว", "For tourism authorities") : item.id === "copilot" ? localize(locale, "สำหรับชุมชนและผู้ประกอบการ", "For local operators") : localize(locale, "สำหรับนักท่องเที่ยว", "For travelers")
  })), [locale]);
  const current = useMemo(() => localizedViews.find((item) => item.id === view) ?? localizedViews[0], [view, localizedViews]);

  return (
    <LocaleContext.Provider value={locale}>
    <main className="app-shell" data-locale={locale}>
      <aside className="sidebar">
        <div className="brand"><span className="brand-pulse">AI</span><div><strong>Nan Pulse AI</strong><small>The Operating Pulse<br />of Sustainable Tourism</small></div></div>
        <nav aria-label="เมนูหลัก">
          {localizedViews.map((item) => (
            <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>
              <span className="nav-mark" aria-hidden="true">{item.mark}</span><span><strong>{item.label}</strong><small>{item.note}</small></span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot"><span className="live-dot" /> <div><strong>{localize(locale, "ชีพจรจังหวัดกำลังทำงาน", "Province pulse live")}</strong><small>{localize(locale, "อัปเดต 08:30 · 5 สัญญาณ", "Updated 08:30 · 5 signals")}</small></div></div>
      </aside>

      <section className="main-area">
        <header className="topbar"><div><span className="mobile-mark">AI</span><p>{current.label}</p></div><div className="topbar-tools"><span className="topbar-purpose">{localize(locale, "คำตัดสิน → มูลค่าท้องถิ่น → 12 เดือน", "Decision → Local Value → 12 Months")}</span><div className="locale-switch" role="group" aria-label={localize(locale, "เลือกภาษา", "Choose language")}><button className={locale === "th" ? "active" : ""} onClick={() => setLocale("th")} aria-pressed={locale === "th"}>ไทย</button><button className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")} aria-pressed={locale === "en"}>EN</button></div></div></header>
        <div className="content-area">
          {view === "mission" && <MissionControl />}
          {view === "copilot" && <CommunityCopilot />}
          {view === "planner" && <AdaptiveExperiencePlanner />}
        </div>
      </section>
    </main>
    </LocaleContext.Provider>
  );
}

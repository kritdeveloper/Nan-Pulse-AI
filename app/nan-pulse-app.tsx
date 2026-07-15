"use client";

import { useMemo, useState } from "react";

type View = "mission" | "copilot" | "planner";
type MissionSection = "today" | "opportunities" | "twin" | "forecast" | "impact" | "evaluation";

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
  return <div className={`decision-confidence ${dark ? "confidence-dark" : ""}`}>
    <div><span>AI Confidence</span><strong>{value}%</strong></div>
    <div><span>Based on</span><p>{factors.map(factor => <b key={factor}>{factor}</b>)}</p></div>
  </div>;
}

function MissionView({ onNavigate }: { onNavigate: () => void }) {
  const [executed, setExecuted] = useState(false);
  const [flowActive, setFlowActive] = useState(false);
  const [capacity, setCapacity] = useState<60 | 0>(60);
  const decision = capacity === 60 ? {
    community: "เวียงสา", confidence: 94, households: 18, businesses: 7, campaign: "Wiang Sa Textile Week",
    visitors: 42, income: "120,000", stay: "+0.6 วัน", receipt: "NP-2026-0715-008",
    need: "Need Craft Learners", season: "ช่วงเรียนรู้ผ้าทอ", before: "เวียงสา 3%", after: "เวียงสา 18%", originAfter: "ปัว 55%",
    reason: "เวียงสามี Need สูง ประสบการณ์เหมาะกับฤดูกาล และยังรองรับ Demand เพิ่มได้โดยไม่เกิน Capacity ส่วนปัวถูกตัดออกเพราะความหนาแน่นสูง"
  } : {
    community: "สันติสุข", confidence: 87, households: 12, businesses: 5, campaign: "Forest Wellness Pilot",
    visitors: 28, income: "78,000", stay: "+0.8 วัน", receipt: "NP-2026-0715-009",
    need: "Need Wellness Travelers", season: "Green season wellness", before: "สันติสุข 5%", after: "สันติสุข 14%", originAfter: "ปัว 63%",
    reason: "Capacity เวียงสาเหลือ 0 คน ระบบจึงหยุดแคมเปญเดิมและเลือกสันติสุข ซึ่งมี Need สูง อากาศเหมาะกับกิจกรรมสุขภาพ และยังรองรับนักท่องเที่ยวได้"
  };
  const alternatives = capacity === 60 ? [
    { rank: "01", place: "เวียงสา", score: "94%", state: "Selected", reason: "Need สูง · Capacity 60 · ฤดูกาลเหมาะสม", tone: "selected" },
    { rank: "02", place: "สันติสุข", score: "87%", state: "Alternative", reason: "พร้อมรับ Wellness travelers แต่ Demand gap ต่ำกว่า", tone: "" },
    { rank: "03", place: "ปัว", score: "42%", state: "Rejected", reason: "Tourist density 80% · ไม่ควรเพิ่มความหนาแน่น", tone: "" },
    { rank: "04", place: "บ่อเกลือ", score: "38%", state: "Rejected", reason: "Weather risk สูงกว่าค่าที่กำหนด", tone: "" }
  ] : [
    { rank: "01", place: "สันติสุข", score: "87%", state: "Selected", reason: "Need สูง · อากาศเหมาะ · มี Capacity พร้อม", tone: "selected" },
    { rank: "02", place: "เวียงสา", score: "0%", state: "Blocked", reason: "Capacity เปลี่ยนเป็น 0 · ห้ามส่งนักท่องเที่ยวเพิ่ม", tone: "blocked" },
    { rank: "03", place: "ปัว", score: "42%", state: "Rejected", reason: "Tourist density 80% · ไม่ควรเพิ่มความหนาแน่น", tone: "" },
    { rank: "04", place: "บ่อเกลือ", score: "38%", state: "Rejected", reason: "Weather risk สูงกว่าค่าที่กำหนด", tone: "" }
  ];
  const changeCapacity = (value: 60 | 0) => { setCapacity(value); setExecuted(false); setFlowActive(false); };
  return (
    <div className="view-stack">
      <section className={`decision-hero killer-moment ${executed ? "mission-executed" : ""}`} aria-labelledby="today-decision">
        <div className="moment-status">
          <span><i aria-hidden="true">✦</i> Nan Pulse AI · New Opportunity Detected</span>
          <em>Demo Simulation · ไม่มีการส่งข้อมูลจริง</em>
        </div>
        <div className="decision-topline decision-refresh" key={decision.community}>
          <div>
            <p className="eyebrow">AI Mission · {decision.community} · This week</p>
            {capacity === 0 && <span className="decision-change-badge">Decision changed · Capacity signal updated</span>}
            <h1 id="today-decision">ผมพบโอกาสใหม่ที่จะช่วยสร้างรายได้ให้ {decision.households} ครัวเรือนใน{decision.community}สัปดาห์นี้</h1>
          </div>
          <div className="confidence-ring" aria-label={`AI confidence ${decision.confidence} percent`}>
            <span>{decision.confidence}</span><small>%</small>
            <em>confidence</em>
          </div>
        </div>

        <p className="decision-copy">คุณต้องการให้ผม <strong>สร้างแคมเปญและปรับเส้นทางนักท่องเที่ยวอัตโนมัติ</strong> หรือไม่?</p>
        <DecisionConfidence value={decision.confidence} factors={["Weather", "Demand", "Season", "Community", "Capacity"]} dark />

        <div className="live-decision-control">
          <div>
            <p><span className="live-dot" /> Live Decision Change</p>
            <strong>เปลี่ยน Capacity แล้วดู AI ตัดสินใจใหม่ทันที</strong>
          </div>
          <div className="live-signal-row"><span>Weather <b>ฝนหยุดพรุ่งนี้</b></span><span>Demand <b>สูง</b></span><span>Season <b>Green season</b></span></div>
          <div className="capacity-toggle" role="group" aria-label="เปลี่ยน capacity ของเวียงสา">
            <small>Wiang Sa Capacity</small>
            <button className={capacity === 60 ? "active" : ""} onClick={() => changeCapacity(60)}>60 คน</button>
            <button className={capacity === 0 ? "active danger" : ""} onClick={() => changeCapacity(0)}>0 คน</button>
          </div>
        </div>

        <div className="decision-actions">
          <button className="primary-action execute-action" onClick={() => setExecuted(true)} disabled={executed}>
            {executed ? "Mission Executed ✓" : "Execute Mission"}
          </button>
          {!executed && <button className="text-action" onClick={onNavigate}>ตรวจสอบโอกาสก่อน <span>→</span></button>}
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
          <div><p className="eyebrow">Decision Receipt</p><h2 id="receipt-title">AI เลือกอะไร — และไม่เลือกอะไร</h2></div>
          <div><span>Decision ID</span><strong>{decision.receipt}</strong><small>15 ก.ค. 2569 · 08:30</small></div>
        </div>
        <div className="receipt-grid">
          <div className="receipt-signals">
            <h3>Observed signals</h3>
            <div><span>Weather</span><strong>88</strong><i><b style={{ width: "88%" }} /></i><small>ฝนหยุดพรุ่งนี้</small></div>
            <div><span>Community Need</span><strong>95</strong><i><b style={{ width: "95%" }} /></i><small>ต้องการนักท่องเที่ยวเฉพาะกลุ่ม</small></div>
            <div><span>Demand Gap</span><strong>91</strong><i><b style={{ width: "91%" }} /></i><small>ต่ำกว่าเป้าหมาย</small></div>
            <div><span>Season Fit</span><strong>86</strong><i><b style={{ width: "86%" }} /></i><small>เหมาะกับประสบการณ์</small></div>
            <div className={capacity === 0 ? "signal-blocked" : ""}><span>Wiang Sa Capacity</span><strong>{capacity}</strong><i><b style={{ width: `${capacity}%` }} /></i><small>{capacity === 0 ? "สัญญาณเปลี่ยน · ระบบห้ามเลือก" : "รองรับได้อีก 60 คน"}</small></div>
          </div>
          <div className="alternatives">
            <h3>Ranked alternatives</h3>
            {alternatives.map(item => <article className={item.tone} key={item.place}>
              <b>{item.rank}</b><div><strong>{item.place}</strong><small>{item.reason}</small></div><em>{item.score}</em><span>{item.state}</span>
            </article>)}
          </div>
        </div>
        <div className="receipt-final">
          <div><span>Final decision</span><strong>เปิดแคมเปญ “{decision.campaign}” และ redirect {decision.visitors} คนไป{decision.community}</strong><small>{decision.reason}</small></div>
          <div><span>Control</span><strong>Human approval required</strong><small>AI เตรียมการตัดสินใจ แต่จังหวัดต้องกด Execute ก่อนดำเนินการ</small></div>
        </div>
        <div className="counterfactuals"><strong>What would change this decision?</strong><span>ฝน &gt; 70% → เลื่อนแคมเปญ</span><span>Capacity &lt; 20 → เลือกชุมชนถัดไป</span><span>PM2.5 สูง → เปลี่ยนเป็นกิจกรรมในร่ม</span><span>ปัว density &lt; 50% → ลดการ redirect</span></div>
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
  const [selected, setSelected] = useState(0);
  const mission = communityMissions[selected];
  return (
    <div className="view-stack">
      <header className="content-header">
        <div><p className="eyebrow">Community Mission</p><h1>ชุมชนต้องการ<br />นักท่องเที่ยวแบบไหน</h1></div>
        <p>AI แปล Need ของชุมชนให้เป็นกลุ่มผู้เดินทางที่เหมาะสม พร้อมกำหนดช่วงเวลาโดยไม่เกินขีดความสามารถ</p>
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
  const [selected, setSelected] = useState(7);
  const [generated, setGenerated] = useState<string | null>(null);
  const [exchangeFilter, setExchangeFilter] = useState("All opportunities");
  const [seasonalGenerated, setSeasonalGenerated] = useState(false);
  const active = months[selected];
  return (
    <div className="view-stack">
      <header className="content-header compact">
        <div><p className="eyebrow">AI Opportunity Exchange</p><h1>โอกาสที่จังหวัด<br />ยังไม่ได้ใช้</h1></div>
        <p>พื้นที่ทำงานสำหรับจังหวัด ไม่ใช่หน้าค้นหาของนักท่องเที่ยว AI ตรวจจับ resource ที่พร้อม แต่ยังขาด demand, promotion หรือจังหวะลงมือทำ</p>
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
  return (
    <div className="view-stack">
      <header className="content-header compact">
        <div><p className="eyebrow">Tourism Pulse</p><h1>Tourism Health<br />ไม่ใช่ Visitor Count</h1></div>
        <p>สุขภาพการท่องเที่ยววัดจากความสมดุลของฤดูกาล พื้นที่ รายได้ และ capacity ไม่ใช่การเพิ่มจำนวนนักท่องเที่ยวอย่างเดียว</p>
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
  const kpis = [
    { number: "01", title: "Increase Off-Season Experiences", description: "เพิ่มกิจกรรมที่ดึงดูดนักท่องเที่ยวในเดือนที่ไม่ใช่ High Season", value: "38", unit: "experiences", target: "เป้าหมาย 50", progress: 76, change: "+12 ไตรมาสนี้", measure: "จำนวนกิจกรรมที่เปิดขายหรือจัดจริงใน 8 เดือนนอกฤดูพีค" },
    { number: "02", title: "Increase Community Participation", description: "เพิ่มจำนวนชุมชนและผู้ประกอบการที่เข้าร่วมและสร้างกิจกรรมผ่านระบบ", value: "31", unit: "communities", target: "เป้าหมาย 40", progress: 78, change: "+9 ชุมชน", measure: "ชุมชนที่มี Need, Capacity และกิจกรรม Active อย่างน้อย 1 รายการ" },
    { number: "03", title: "Improve Tourism Distribution", description: "กระจายนักท่องเที่ยวและโอกาสทางเศรษฐกิจไปยังพื้นที่ที่ยังไม่เป็นที่รู้จัก", value: "64", unit: "% distributed", target: "เป้าหมาย 75%", progress: 85, change: "+18 จุด", measure: "สัดส่วนผู้เดินทางที่ถูกส่งไปยังพื้นที่รองหรือนอกช่วง High Season" },
  ];
  return (
    <div className="view-stack">
      <header className="content-header compact">
        <div><p className="eyebrow">Three North-star KPIs</p><h1>วัดเพียง 3 สิ่ง<br />ที่เปลี่ยนน่านจริง</h1></div>
        <p>ทุก Decision, Campaign และ Impact ใน Nan Pulse AI ต้องขยับ KPI อย่างน้อยหนึ่งข้อ โดยไม่เพิ่มตัวชี้วัดหลักอื่นมารบกวนทิศทาง</p>
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
  return <section className="source-register">
    <div className="source-register-head"><div><p className="eyebrow">Data Provenance</p><h2>แหล่งข้อมูลที่ใช้ตัดสินใจ</h2></div><p>Official data และ AI estimates ถูกแยกจากกันอย่างชัดเจน ระบบไม่แสดงค่าคาดการณ์เป็นสถิติจริง</p></div>
    <div className="source-grid">{officialSources.map((source, index) => <a key={source.name} href={source.url} target="_blank" rel="noreferrer"><span>0{index + 1}</span><div><strong>{source.name}</strong><small>{source.use}</small></div><em>{source.status}</em><b>↗</b></a>)}</div>
  </section>;
}

function ValidationLearning() {
  return <div className="view-stack">
    <header className="content-header compact"><div><p className="eyebrow">Validation & Learning · Design Thinking + Agile</p><h1>จากปัญหา<br />สู่หลักฐานที่วัดได้</h1></div><p>Nan Pulse AI แยกสิ่งที่รู้จริง สิ่งที่ AI คาดการณ์ และสิ่งที่ยังต้องพิสูจน์ภาคสนาม เพื่อให้ Prototype เติบโตเป็นระบบที่ชุมชนใช้งานได้จริง</p></header>

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
  const scenarios = [
    { id: "coffee", name: "โปรโมตกาแฟเดือนกรกฎาคม", note: "Coffee Harvest · 20–31 Jul", visitors: "+62 คน", income: "+280K บาท", stay: "+0.8 วัน", communities: "4 ชุมชน", households: "23 ครัวเรือน", risk: "ปานกลาง", riskTone: "medium", riskDetail: "ฝน 35% · ต้องกระจายรอบเข้าชมไม่เกิน 12 คน", pua: 55, wiangsa: 18, confidence: 88 },
    { id: "textile", name: "โปรโมตผ้าทอช่วง Green Season", note: "Textile Learning · 14 days", visitors: "+46 คน", income: "+190K บาท", stay: "+0.5 วัน", communities: "3 ชุมชน", households: "18 ครัวเรือน", risk: "ต่ำ", riskTone: "low", riskDetail: "Capacity พร้อม · ต้องยืนยันวิทยากร 2 กลุ่ม", pua: 62, wiangsa: 15, confidence: 91 },
    { id: "wellness", name: "เปิด Forest Wellness Route", note: "Low-density window · 9 days", visitors: "+38 คน", income: "+156K บาท", stay: "+1.1 วัน", communities: "5 ชุมชน", households: "16 ครัวเรือน", risk: "ปานกลาง", riskTone: "medium", riskDetail: "เส้นทางลื่นหลังฝน · ต้องมี route fallback", pua: 66, wiangsa: 12, confidence: 84 },
  ];
  const [selected, setSelected] = useState<string | null>(null);
  const active = scenarios.find(item => item.id === selected);
  return <div className="view-stack">
    <header className="content-header compact"><div><p className="eyebrow">One Killer Feature · AI Opportunity Simulator</p><h1>ทดลองโอกาส<br />ก่อนตัดสินใจจริง</h1></div><p>จังหวัดเลือกสิ่งที่ต้องการโปรโมต แล้ว AI จำลองผลต่อนักท่องเที่ยว รายได้ ชุมชน และความเสี่ยงทันที—นี่คือระบบตัดสินใจ ไม่ใช่ Trip Planner</p></header>
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
  const [section, setSection] = useState<MissionSection>("today");
  const sections: Array<{ id: MissionSection; label: string }> = [
    { id: "today", label: "Today’s Decision" },
    { id: "opportunities", label: "Opportunity & Campaign" },
    { id: "twin", label: "AI Opportunity Simulator" },
    { id: "forecast", label: "Tourism Health" },
    { id: "impact", label: "KPI & Impact" },
    { id: "evaluation", label: "Validation & Learning" },
  ];
  return <div className="product-workspace">
    <nav className="workspace-tabs" aria-label="เครื่องมือ Mission Control">{sections.map(item => <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => setSection(item.id)}>{item.label}</button>)}</nav>
    {section === "today" && <MissionView onNavigate={() => setSection("opportunities")} />}
    {section !== "today" && <header className="workspace-identity"><div><p className="eyebrow">01 · Provincial Decision System</p><h1>Mission Control</h1></div><p>ระบบตัดสินใจว่า “จังหวัดควรสร้างโอกาสที่ไหน เมื่อไร และให้ใคร” ก่อนส่ง Decision ไปสู่แคมเปญ ชุมชน และการเดินทางจริง</p></header>}
    {section !== "today" && <section className="decision-doctrine"><div><span>Nan Pulse AI is</span><strong>ระบบการตัดสินใจ</strong></div><b>≠</b><div><span>Nan Pulse AI is not</span><strong>ระบบแนะนำสถานที่</strong></div><ol><li>AI Detects</li><li>Signals</li><li>Campaign</li><li>Redirect</li><li>Impact</li></ol></section>}
    {section === "opportunities" && <OpportunityView />}
    {section === "twin" && <TourismDigitalTwin />}
    {section === "forecast" && <ForecastView />}
    {section === "impact" && <ImpactView />}
    {section === "evaluation" && <ValidationLearning />}
    <OfficialDataSources />
  </div>;
}

function CommunityCopilot() {
  const [community, setCommunity] = useState("เวียงสา");
  const [goal, setGoal] = useState("เพิ่มผู้เข้าร่วมเวิร์กช็อป");
  const [mission, setMission] = useState("Need Coffee Lovers");
  const [created, setCreated] = useState(false);
  const communityNeeds = ["Need Visitors", "Need Promotion", "Need Coffee Lovers", "Need Family Travelers"];
  return <div className="product-workspace">
    <header className="workspace-identity"><div><p className="eyebrow">02 · Decision Activation for Operators</p><h1>Community Copilot</h1></div><p>รับ Mission ที่จังหวัดตัดสินใจแล้วมาเปลี่ยนเป็นโปรโมชัน เนื้อหาประชาสัมพันธ์ และกิจกรรมที่ชุมชนดำเนินการได้จริง</p></header>
    <section className="copilot-layout">
      <div className="copilot-input">
        <div className="copilot-orb">✦</div><p className="eyebrow">Community speaks first</p><h2>ตอนนี้ฉัน<br />ต้องการอะไร</h2>
        <div className="community-asks" role="group" aria-label="Community missions">{communityNeeds.map(need => <button key={need} className={mission === need ? "active" : ""} onClick={() => { setMission(need); setCreated(false); }}>{need}</button>)}</div>
        <label>ชุมชน<select value={community} onChange={e => { setCommunity(e.target.value); setCreated(false); }}><option>เวียงสา</option><option>สันติสุข</option><option>แม่จริม</option></select></label>
        <label>เป้าหมาย<select value={goal} onChange={e => { setGoal(e.target.value); setCreated(false); }}><option>เพิ่มผู้เข้าร่วมเวิร์กช็อป</option><option>สร้างโปรโมชันช่วง Low Season</option><option>เปิดตัวกิจกรรมใหม่</option></select></label>
        <div className="copilot-context"><span>Season <b>Green season</b></span><span>Demand <b>ต่ำกว่าเป้าหมาย</b></span><span>Capacity <b>เหลือ 60 คน</b></span></div>
        <button className="primary-action" onClick={() => setCreated(true)}>{created ? "Mission activated ✓" : "Activate this mission"}</button>
      </div>
      <div className={`copilot-output ${created ? "ready" : ""}`}>
        <div className="output-head"><div><p className="eyebrow">Mission response · {mission}</p><h2>{mission === "Need Coffee Lovers" ? "Coffee Route Stories" : "Textile Rain Stories"}</h2></div><span>92% fit</span></div>
        <p className="output-lead">AI รับฟัง Mission “{mission}” ของ {community} แล้วเปลี่ยนเป็น Campaign ที่สอดคล้องกับฤดูกาลและ capacity ของชุมชน</p>
        <DecisionConfidence value={92} factors={["Demand", "Season", "Community Need", "Capacity"]} />
        <div className="content-pack"><article><span>Promotion</span><strong>จอง Coffee Route รับ Mini Cupping Session ฟรี</strong></article><article><span>Thai caption</span><p>พรุ่งนี้กาแฟล็อตแรกเริ่มเก็บเกี่ยว มารู้จักกาแฟน่านตั้งแต่ต้นจนถึงถ้วยกับคนปลูกตัวจริง</p></article><article><span>English caption</span><p>Tomorrow, Nan’s first coffee harvest begins. Follow the bean from mountain farm to cup with local growers.</p></article><article><span>Suggested activity</span><strong>Coffee Harvest + Cupping + Local Lunch</strong></article></div>
        <div className="output-impact"><span>Expected result</span><strong>+42 visitors</strong><strong>+68,000 บาท</strong><strong>8 households</strong></div>
      </div>
    </section>
  </div>;
}

function AdaptiveExperiencePlanner() {
  const [interest, setInterest] = useState("Wellness");
  const [planned, setPlanned] = useState(false);
  return <div className="product-workspace">
    <header className="workspace-identity"><div><p className="eyebrow">03 · Decision Delivery for Travelers</p><h1>Adaptive Experience Planner</h1></div><p>นำ Decision ของจังหวัดมาจับคู่กับความสนใจ อากาศ และฤดูกาล เพื่อสร้าง Experience ที่เหมาะกับผู้เดินทางและกระจายโอกาสไปพร้อมกัน</p></header>
    <section className="planner-hero">
      <div className="planner-question"><p className="eyebrow">Match traveler fit with provincial mission</p><h2>ความสนใจแบบไหน<br />ตรงกับ Mission นี้</h2><div className="interest-pills">{["Wellness","Craft","Food","Nature"].map(item => <button key={item} className={interest === item ? "active" : ""} onClick={() => { setInterest(item); setPlanned(false); }}>{item}</button>)}</div><button className="primary-action" onClick={() => setPlanned(true)}>{planned ? "Mission matched ✓" : "Match this mission to my trip"}</button></div>
      <div className="adaptive-signals"><p className="eyebrow">Live conditions</p><div><span>Weather</span><strong>ฝนหยุดพรุ่งนี้</strong><small>เหมาะกับ forest route</small></div><div><span>Season</span><strong>Herbal green season</strong><small>วัตถุดิบพร้อมที่สุด</small></div><div><span>Tourism pulse</span><strong>เวียงสา capacity พร้อม</strong><small>ปัวหนาแน่นกว่าปกติ</small></div></div>
    </section>
    <section className={`experience-plan ${planned ? "ready" : ""}`}>
      <div className="plan-title"><p className="eyebrow">Mission-matched experience · {interest}</p><h2>Forest Reset Journey</h2><p>ประสบการณ์ 2 วัน 1 คืนที่เกิดจาก Decision ให้กระจาย demand จากพื้นที่หนาแน่นไปยังสันติสุขและเวียงสา</p><DecisionConfidence value={88} factors={["Weather", "Traveler Fit", "Season", "Community Capacity"]} /></div>
      <ol><li><span>01</span><div><strong>Forest Therapy</strong><small>สันติสุข · 09:00</small></div></li><li><span>02</span><div><strong>Herbal Local Lunch</strong><small>ครัวเรือนแม่คำ · 12:30</small></div></li><li><span>03</span><div><strong>Natural Dye Workshop</strong><small>เวียงสา · 15:00</small></div></li><li><span>04</span><div><strong>Community Homestay</strong><small>บ้านดอนไชย · Overnight</small></div></li></ol>
      <div className="plan-impact"><p>Trip impact</p><strong>2</strong><span>communities</span><strong>6</strong><span>local businesses</span><strong>+1</strong><span>night in Nan</span></div>
    </section>
  </div>;
}

export function NanPulseApp() {
  const [view, setView] = useState<View>("mission");
  const current = useMemo(() => views.find((item) => item.id === view) ?? views[0], [view]);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-pulse">AI</span><div><strong>Nan Pulse AI</strong><small>The Operating Pulse<br />of Sustainable Tourism</small></div></div>
        <nav aria-label="เมนูหลัก">
          {views.map((item) => (
            <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>
              <span className="nav-mark" aria-hidden="true">{item.mark}</span><span><strong>{item.label}</strong><small>{item.note}</small></span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot"><span className="live-dot" /> <div><strong>Province pulse live</strong><small>อัปเดต 08:30 · 5 signals</small></div></div>
      </aside>

      <section className="main-area">
        <header className="topbar"><div><span className="mobile-mark">AI</span><p>{current.label}</p></div><span className="topbar-purpose">Decision → Local Value → 12 Months</span></header>
        <div className="content-area">
          {view === "mission" && <MissionControl />}
          {view === "copilot" && <CommunityCopilot />}
          {view === "planner" && <AdaptiveExperiencePlanner />}
        </div>
      </section>
    </main>
  );
}

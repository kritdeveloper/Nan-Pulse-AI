"use client";

import { useMemo, useState } from "react";

type View = "mission" | "copilot" | "planner";
type MissionSection = "today" | "opportunities" | "forecast" | "impact";

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

function MissionView({ onNavigate }: { onNavigate: () => void }) {
  const [approved, setApproved] = useState(false);
  return (
    <div className="view-stack">
      <section className="decision-hero" aria-labelledby="today-decision">
        <div className="decision-topline">
          <div>
            <p className="eyebrow">Today’s Decision · 15 กรกฎาคม 2569</p>
            <h1 id="today-decision">ส่งเสริมเวียงสา<br />ในเดือนสิงหาคม</h1>
          </div>
          <div className="confidence-ring" aria-label="AI confidence 94 percent">
            <span>94</span><small>%</small>
            <em>confidence</em>
          </div>
        </div>

        <p className="decision-copy">เปิดแคมเปญ <strong>“Textile Learning Month”</strong> เพื่อเชื่อมผู้เดินทางสายงานคราฟต์กับเวิร์กช็อปย้อมผ้าและเรื่องเล่าชุมชน ภายในขีดความสามารถที่ชุมชนอนุมัติ</p>

        <div className="decision-actions">
          <button className="primary-action" onClick={() => setApproved(true)} disabled={approved}>
            {approved ? "ส่งเข้ากระบวนการอนุมัติแล้ว" : "ส่งเข้ากระบวนการอนุมัติ"}
          </button>
          <button className="text-action" onClick={onNavigate}>ดูโอกาสเดือนอื่น <span>→</span></button>
        </div>
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
          <div><strong>+11</strong><span>ครัวเรือน</span></div>
          <div><strong>5</strong><span>ธุรกิจท้องถิ่น</span></div>
          <div><strong>72,000</strong><span>บาท รายได้ประมาณการ</span></div>
          <div><strong>+36</strong><span>คืนพักเพิ่มเติม</span></div>
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
          <Signal label="Season" value="ช่วงเรียนรู้ผ้าทอ" />
          <Signal label="Community Need" value="ความต้องการสูง" />
          <Signal label="Demand" value="ต่ำกว่าเป้าหมาย 60 คน" tone="warn" />
          <Signal label="PM2.5" value="18 µg/m³ · ปลอดภัย" />
          <Signal label="Capacity" value="เหลือ 60 คน" tone="neutral" />
        </div>
        <div className="reason-note">
          <span className="pulse-icon" aria-hidden="true">⌁</span>
          <p><strong>Decision logic</strong> เวียงสามี Need สูง ประสบการณ์เหมาะกับฤดูกาล และยังรองรับ Demand เพิ่มได้โดยไม่เกิน Capacity ส่วนปัวถูกตัดออกเพราะเต็มแล้ว</p>
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
            <div className="exchange-impact"><p>Expected economic impact</p><strong>{item.income}</strong><span>{item.households}</span><em>{item.confidence}% confidence</em></div>
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
        <p>ทุก Decision, Campaign และ Impact ใน Nan Pulse ต้องขยับ KPI อย่างน้อยหนึ่งข้อ โดยไม่เพิ่มตัวชี้วัดหลักอื่นมารบกวนทิศทาง</p>
      </header>
      <section className="kpi-cards" aria-label="ตัวชี้วัดหลักของ Nan Pulse">
        {kpis.map(kpi => <article key={kpi.number}>
          <div className="kpi-heading"><span>{kpi.number}</span><div><p>Primary KPI</p><h2>{kpi.title}</h2></div></div>
          <p className="kpi-description">{kpi.description}</p>
          <div className="kpi-value"><strong>{kpi.value}</strong><span>{kpi.unit}</span><em>{kpi.change}</em></div>
          <div className="kpi-progress"><i><b style={{ width: `${kpi.progress}%` }} /></i><span>{kpi.target}</span></div>
          <div className="kpi-measure"><span>How we measure</span><p>{kpi.measure}</p></div>
        </article>)}
      </section>
      <div className="calendar-divider"><span>Evidence from recent missions</span></div>
      <section className="mission-feed">
        <article><span className="feed-time">Today · 08:30</span><div className="feed-event"><i>AI redirected</i><strong>42 tourists</strong><span>เมืองน่าน → เวียงสา</span></div><b className="flow-arrow">↓</b><div className="feed-result"><i>Income</i><strong>+92,000</strong><span>บาท · 11 ครัวเรือน</span></div></article>
        <article><span className="feed-time">Yesterday · 16:10</span><div className="feed-event"><i>Campaign activated</i><strong>Herbal Retreat</strong><span>สันติสุข · 2 ธุรกิจ</span></div><b className="flow-arrow">↓</b><div className="feed-result"><i>Expected stays</i><strong>+24 nights</strong><span>ภายใน 14 วัน</span></div></article>
        <article><span className="feed-time">12 Jul · 11:45</span><div className="feed-event"><i>Capacity protected</i><strong>18 tourists</strong><span>เปลี่ยนจากปัว → แม่จริม</span></div><b className="flow-arrow">↓</b><div className="feed-result"><i>Balance gained</i><strong>+6%</strong><span>Place diversity</span></div></article>
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

function MissionControl() {
  const [section, setSection] = useState<MissionSection>("today");
  const sections: Array<{ id: MissionSection; label: string }> = [
    { id: "today", label: "Today’s Decision" },
    { id: "opportunities", label: "Opportunity & Campaign" },
    { id: "forecast", label: "Tourism Health" },
    { id: "impact", label: "KPI & Impact" },
  ];
  return <div className="product-workspace">
    <header className="workspace-identity"><div><p className="eyebrow">01 · Provincial Decision System</p><h1>Mission Control</h1></div><p>ระบบตัดสินใจว่า “จังหวัดควรสร้างโอกาสที่ไหน เมื่อไร และให้ใคร” ก่อนส่ง Decision ไปสู่แคมเปญ ชุมชน และการเดินทางจริง</p></header>
    <section className="decision-doctrine"><div><span>Nan Pulse is</span><strong>ระบบการตัดสินใจ</strong></div><b>≠</b><div><span>Nan Pulse is not</span><strong>ระบบแนะนำสถานที่</strong></div><ol><li>Community Need</li><li>AI Decision</li><li>Campaign</li><li>Experience</li><li>Impact</li></ol></section>
    <nav className="workspace-tabs" aria-label="เครื่องมือ Mission Control">{sections.map(item => <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => setSection(item.id)}>{item.label}</button>)}</nav>
    {section === "today" && <MissionView onNavigate={() => setSection("opportunities")} />}
    {section === "opportunities" && <OpportunityView />}
    {section === "forecast" && <ForecastView />}
    {section === "impact" && <ImpactView />}
    <OfficialDataSources />
  </div>;
}

function CommunityCopilot() {
  const [community, setCommunity] = useState("เวียงสา");
  const [goal, setGoal] = useState("เพิ่มผู้เข้าร่วมเวิร์กช็อป");
  const [created, setCreated] = useState(false);
  return <div className="product-workspace">
    <header className="workspace-identity"><div><p className="eyebrow">02 · Decision Activation for Operators</p><h1>Community Copilot</h1></div><p>รับ Mission ที่จังหวัดตัดสินใจแล้วมาเปลี่ยนเป็นโปรโมชัน เนื้อหาประชาสัมพันธ์ และกิจกรรมที่ชุมชนดำเนินการได้จริง</p></header>
    <section className="copilot-layout">
      <div className="copilot-input">
        <div className="copilot-orb">✦</div><p className="eyebrow">Mission received · Wiang Sa</p><h2>เปลี่ยน Decision<br />ให้เป็น Campaign</h2>
        <label>ชุมชน<select value={community} onChange={e => { setCommunity(e.target.value); setCreated(false); }}><option>เวียงสา</option><option>สันติสุข</option><option>แม่จริม</option></select></label>
        <label>เป้าหมาย<select value={goal} onChange={e => { setGoal(e.target.value); setCreated(false); }}><option>เพิ่มผู้เข้าร่วมเวิร์กช็อป</option><option>สร้างโปรโมชันช่วง Low Season</option><option>เปิดตัวกิจกรรมใหม่</option></select></label>
        <div className="copilot-context"><span>Season <b>Green season</b></span><span>Demand <b>ต่ำกว่าเป้าหมาย</b></span><span>Capacity <b>เหลือ 60 คน</b></span></div>
        <button className="primary-action" onClick={() => setCreated(true)}>{created ? "Mission activated ✓" : "Activate this mission"}</button>
      </div>
      <div className={`copilot-output ${created ? "ready" : ""}`}>
        <div className="output-head"><div><p className="eyebrow">AI Seasonal Recommendation</p><h2>Textile Rain Stories</h2></div><span>92% fit</span></div>
        <p className="output-lead">ชวนผู้เดินทางมาเรียนรู้สีธรรมชาติหลังฝน ผ่านเรื่องเล่าของช่างย้อมผ้า {community}</p>
        <div className="content-pack"><article><span>Promotion</span><strong>มา 2 คน รับชุดทดลองย้อมสีธรรมชาติฟรี</strong></article><article><span>Thai caption</span><p>หลังฝน สีของป่าจะชัดที่สุด มาสร้างผ้าผืนเดียวในโลกกับช่างย้อมเวียงสา</p></article><article><span>English caption</span><p>After the rain, Nan’s natural colors come alive. Make your own textile story with local artisans.</p></article><article><span>Suggested activity</span><strong>Natural Dye Workshop + Local Lunch</strong></article></div>
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
      <div className="plan-title"><p className="eyebrow">Mission-matched experience · {interest}</p><h2>Forest Reset Journey</h2><p>ประสบการณ์ 2 วัน 1 คืนที่เกิดจาก Decision ให้กระจาย demand จากพื้นที่หนาแน่นไปยังสันติสุขและเวียงสา</p></div>
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
        <div className="brand"><span className="brand-pulse">N</span><div><strong>Nan Pulse</strong><small>The Operating Pulse<br />of Sustainable Tourism</small></div></div>
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
        <header className="topbar"><div><span className="mobile-mark">N</span><p>{current.label}</p></div><div className="topbar-actions"><button aria-label="การแจ้งเตือน">●<span>2</span></button><div className="profile"><span>NP</span><div><strong>{view === "mission" ? "ทีมยุทธศาสตร์ท่องเที่ยว" : view === "copilot" ? "เครือข่ายชุมชนน่าน" : "Nan Explorer"}</strong><small>{view === "mission" ? "จังหวัดน่าน" : view === "copilot" ? "Local operator workspace" : "Adaptive journey"}</small></div></div></div></header>
        <div className="content-area">
          {view === "mission" && <MissionControl />}
          {view === "copilot" && <CommunityCopilot />}
          {view === "planner" && <AdaptiveExperiencePlanner />}
        </div>
      </section>
    </main>
  );
}

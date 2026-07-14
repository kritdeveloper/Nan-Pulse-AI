"use client";

import { useMemo, useState } from "react";

type View = "mission" | "community" | "opportunity" | "forecast" | "impact";

const views: Array<{ id: View; label: string; note: string; mark: string }> = [
  { id: "mission", label: "Mission Control", note: "Today’s Decision", mark: "◎" },
  { id: "community", label: "Community Pulse", note: "Needs & readiness", mark: "⌂" },
  { id: "opportunity", label: "Opportunity", note: "12-month pulse", mark: "◇" },
  { id: "forecast", label: "Forecast", note: "Demand outlook", mark: "↗" },
  { id: "impact", label: "Economic Pulse", note: "Impact & learning", mark: "◉" },
];

const months = [
  { month: "ม.ค.", title: "Coffee Harvest", community: "บ่อเกลือ", confidence: 92, state: "recommended" },
  { month: "ก.พ.", title: "Craft & Flowers", community: "ท่าวังผา", confidence: 81, state: "ready" },
  { month: "มี.ค.", title: "Dry Season Food", community: "นาน้อย", confidence: 74, state: "watch" },
  { month: "เม.ย.", title: "Herbal Retreat", community: "สันติสุข", confidence: 89, state: "recommended" },
  { month: "พ.ค.", title: "Planting Stories", community: "แม่จริม", confidence: 78, state: "ready" },
  { month: "มิ.ย.", title: "Forest After Rain", community: "สองแคว", confidence: 84, state: "ready" },
  { month: "ก.ค.", title: "Rice & Rivers", community: "ภูเพียง", confidence: 76, state: "watch" },
  { month: "ส.ค.", title: "Textile Learning", community: "เวียงสา", confidence: 94, state: "active" },
  { month: "ก.ย.", title: "Forest Food", community: "เชียงกลาง", confidence: 82, state: "ready" },
  { month: "ต.ค.", title: "Harvest Community", community: "บ้านหลวง", confidence: 87, state: "recommended" },
  { month: "พ.ย.", title: "Cultural Routes", community: "ปัว", confidence: 71, state: "watch" },
  { month: "ธ.ค.", title: "Winter Slow Travel", community: "เมืองน่าน", confidence: 68, state: "full" },
];

const needs = [
  { community: "เวียงสา", need: "กระจายรายได้จากงานย้อมผ้าในเดือนที่นักท่องเที่ยวน้อย", readiness: 92, capacity: 60, status: "พร้อม" },
  { community: "สันติสุข", need: "เพิ่มการมีส่วนร่วมของครัวเรือนสมุนไพร", readiness: 86, capacity: 32, status: "พร้อม" },
  { community: "แม่จริม", need: "สร้างมูลค่าเพิ่มจากฤดูเพาะปลูก", readiness: 78, capacity: 24, status: "มีเงื่อนไข" },
  { community: "ปัว", need: "รักษาระดับกิจกรรมงานช่างปัจจุบัน", readiness: 42, capacity: 0, status: "เต็ม" },
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

function MissionView({ onNavigate }: { onNavigate: (view: View) => void }) {
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
          <button className="text-action" onClick={() => onNavigate("opportunity")}>ดูโอกาสเดือนอื่น <span>→</span></button>
        </div>
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
  return (
    <div className="view-stack">
      <header className="content-header">
        <div><p className="eyebrow">Community Pulse</p><h1>เริ่มจาก Need<br />ไม่ใช่รายชื่อชุมชน</h1></div>
        <p>Need คือสิ่งที่ชุมชนประกาศเอง ส่วน readiness, capacity และ experience คือเงื่อนไขที่ทำให้ Need กลายเป็น Opportunity ได้อย่างรับผิดชอบ</p>
      </header>
      <div className="need-list">
        {needs.map((item, index) => (
          <article className="need-row" key={item.community}>
            <span className="need-index">0{index + 1}</span>
            <div className="need-main"><p>{item.community}</p><h2>{item.need}</h2></div>
            <div className="readiness"><span>Readiness</span><strong>{item.readiness}%</strong><i><b style={{ width: `${item.readiness}%` }} /></i></div>
            <div className="capacity"><span>รองรับเพิ่ม</span><strong>{item.capacity} คน</strong></div>
            <span className={`status status-${item.status === "พร้อม" ? "ready" : item.status === "เต็ม" ? "full" : "condition"}`}>{item.status}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function OpportunityView() {
  const [selected, setSelected] = useState(7);
  const active = months[selected];
  return (
    <div className="view-stack">
      <header className="content-header compact">
        <div><p className="eyebrow">Opportunity Calendar</p><h1>12 เดือน<br />12 จังหวะของน่าน</h1></div>
        <p>ไม่ใช่ปฏิทิน Event แต่คือจังหวะที่ Need, Season, Demand และความพร้อมของชุมชนมาบรรจบกัน</p>
      </header>
      <div className="month-grid" role="list" aria-label="โอกาสท่องเที่ยว 12 เดือน">
        {months.map((item, index) => (
          <button className={`month-card ${selected === index ? "selected" : ""}`} key={item.month} onClick={() => setSelected(index)}>
            <span>{item.month}</span><strong>{item.title}</strong><small>{item.community}</small><em>{item.confidence}%</em>
          </button>
        ))}
      </div>
      <section className="opportunity-focus">
        <div><p className="eyebrow">Selected Opportunity</p><h2>{active.title}</h2><p>{active.community} · AI confidence {active.confidence}%</p></div>
        <div className="opportunity-factors"><span>Need <b>สูง</b></span><span>Season <b>เหมาะสม</b></span><span>Capacity <b>พร้อม</b></span></div>
        <button className="primary-action">ส่งไป Mission Control</button>
      </section>
    </div>
  );
}

function ForecastView() {
  return (
    <div className="view-stack">
      <header className="content-header compact">
        <div><p className="eyebrow">Tourism Pulse</p><h1>Demand Forecast<br />สิงหาคม 2569</h1></div>
        <p>แยก Demand ที่จะเกิดขึ้นเองออกจาก Demand ที่ Nan Pulse ตั้งใจสร้าง เพื่อไม่ส่งนักท่องเที่ยวเกินขีดความสามารถ</p>
      </header>
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
  const metrics = [
    { label: "โอกาสนอกช่วงพีค", value: "64%", delta: "+18%" },
    { label: "ชุมชนที่ได้รับประโยชน์", value: "18", delta: "+6" },
    { label: "รายได้ท้องถิ่น", value: "2.4M", delta: "+21%" },
    { label: "คืนพักเพิ่มเติม", value: "486", delta: "+14%" },
  ];
  return (
    <div className="view-stack">
      <header className="content-header compact">
        <div><p className="eyebrow">Economic Pulse</p><h1>Impact ที่วัดได้<br />ไม่ใช่แค่ Reach</h1></div>
        <p>มองว่าใครได้ประโยชน์ ที่ไหน เมื่อไร และ guardrail ของชุมชนยังปลอดภัยหรือไม่</p>
      </header>
      <div className="metric-cards">{metrics.map(metric => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><em>{metric.delta}</em></article>)}</div>
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
        <header className="topbar"><div><span className="mobile-mark">N</span><p>{current.label}</p></div><div className="topbar-actions"><button aria-label="การแจ้งเตือน">●<span>2</span></button><div className="profile"><span>NP</span><div><strong>ทีมยุทธศาสตร์ท่องเที่ยว</strong><small>จังหวัดน่าน</small></div></div></div></header>
        <div className="content-area">
          {view === "mission" && <MissionView onNavigate={setView} />}
          {view === "community" && <CommunityView />}
          {view === "opportunity" && <OpportunityView />}
          {view === "forecast" && <ForecastView />}
          {view === "impact" && <ImpactView />}
        </div>
      </section>
    </main>
  );
}

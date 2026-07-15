import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { communitySignals } from "../../../db/schema";

type Signal = typeof communitySignals.$inferSelect;

const MAX_AGE_HOURS = 24;

function evaluate(signal: Signal) {
  const now = Date.now();
  const collected = Date.parse(signal.collectedAt);
  const ageHours = Number.isFinite(collected) ? Math.max(0, (now - collected) / 3_600_000) : 999;
  const available = Math.max(0, signal.capacityTotal - signal.capacityUsed);
  const availabilityPercent = signal.capacityTotal ? available / signal.capacityTotal * 100 : 0;
  const densityPercent = signal.capacityTotal ? signal.currentVisitors / signal.capacityTotal * 100 : 0;
  const fresh = ageHours <= MAX_AGE_HOURS;
  const eligible = fresh && available > 0 && densityPercent < 75 && signal.needScore >= 60;
  const score = Math.round(signal.needScore * .5 + availabilityPercent * .3 + Math.max(0, 100 - densityPercent) * .2);
  const confidence = Math.round(Math.max(0, Math.min(98, 98 - ageHours * 1.2)));
  const action = !fresh ? "ขอข้อมูลปัจจุบันก่อนตัดสินใจ"
    : available <= 0 || densityPercent >= 75 ? "ชะลอการส่งนักท่องเที่ยว"
    : signal.needScore < 60 ? "ติดตามสถานการณ์"
    : score >= 80 ? `เปิดแคมเปญ ${signal.targetSegment}`
    : `ทดลองแคมเปญแบบจำกัดสำหรับ ${signal.targetSegment}`;
  return {
    ...signal,
    ageHours: Math.round(ageHours * 10) / 10,
    available,
    availabilityPercent: Math.round(availabilityPercent),
    densityPercent: Math.round(densityPercent),
    eligible,
    score,
    confidence,
    action,
    reasons: [
      `Need ${signal.needScore}/100 (${signal.needType})`,
      `รองรับเพิ่มได้ ${available} คน จาก ${signal.capacityTotal} คน`,
      `ความหนาแน่นปัจจุบัน ${Math.round(densityPercent)}%`,
      `เก็บข้อมูลเมื่อ ${signal.collectedAt} โดย ${signal.verifiedBy}`,
    ],
  };
}

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table")) return "Community Signal Registry ยังไม่พร้อมใช้งาน กรุณา deploy migration ของ D1";
  return message;
}

export async function GET() {
  try {
    const rows = await getDb().select().from(communitySignals).orderBy(desc(communitySignals.collectedAt), desc(communitySignals.id)).limit(500);
    const latest = [...new Map(rows.map(row => [row.communityName.trim().toLocaleLowerCase("th"), row])).values()];
    const evaluated = latest.map(evaluate).sort((a, b) => b.score - a.score);
    return Response.json({
      policy: { maxAgeHours: MAX_AGE_HOURS, densityFormula: "currentVisitors / capacityTotal × 100", decisionFormula: "Need 50% + Available Capacity 30% + Low Density 20%" },
      signals: evaluated,
      decision: evaluated.find(item => item.eligible) ?? null,
      alternatives: evaluated.filter(item => item.eligible).slice(1, 4),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: errorMessage(error), signals: [], decision: null, alternatives: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const required = ["communityName", "district", "needType", "targetSegment", "collectionMethod", "evidenceUrl", "collectedAt", "verifiedBy"];
    for (const field of required) if (!String(body[field] ?? "").trim()) return Response.json({ error: `กรุณาระบุ ${field}` }, { status: 400 });
    const needScore = Number(body.needScore), capacityTotal = Number(body.capacityTotal), capacityUsed = Number(body.capacityUsed), currentVisitors = Number(body.currentVisitors);
    if (![needScore, capacityTotal, capacityUsed, currentVisitors].every(Number.isInteger)) return Response.json({ error: "ค่าจำนวนและคะแนนต้องเป็นเลขจำนวนเต็ม" }, { status: 400 });
    if (needScore < 0 || needScore > 100 || capacityTotal <= 0 || capacityUsed < 0 || capacityUsed > capacityTotal || currentVisitors < 0) return Response.json({ error: "Need, Capacity หรือจำนวนผู้มาเยือนไม่อยู่ในช่วงที่ยอมรับได้" }, { status: 400 });
    const evidenceUrl = String(body.evidenceUrl);
    try { const url = new URL(evidenceUrl); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); } catch { return Response.json({ error: "หลักฐานต้องเป็น URL ที่เปิดตรวจสอบได้" }, { status: 400 }); }
    const collectedAt = new Date(String(body.collectedAt));
    if (!Number.isFinite(collectedAt.getTime()) || collectedAt.getTime() > Date.now() + 600_000) return Response.json({ error: "วันเวลาที่เก็บข้อมูลไม่ถูกต้อง" }, { status: 400 });
    const [signal] = await getDb().insert(communitySignals).values({
      communityName: String(body.communityName).trim(), district: String(body.district).trim(), needType: String(body.needType).trim(), targetSegment: String(body.targetSegment).trim(),
      needScore, capacityTotal, capacityUsed, currentVisitors, collectionMethod: String(body.collectionMethod).trim(), evidenceUrl,
      collectedAt: collectedAt.toISOString(), verifiedBy: String(body.verifiedBy).trim(), notes: String(body.notes ?? "").trim(),
    }).returning();
    return Response.json({ signal: evaluate(signal) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

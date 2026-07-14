import type { Metadata } from "next";
import { NanPulseApp } from "./nan-pulse-app";

export const metadata: Metadata = {
  title: "Nan Pulse — The Operating Pulse of Sustainable Tourism",
  description: "ระบบตัดสินใจเพื่อกระจายโอกาสการท่องเที่ยวจังหวัดน่านตลอด 12 เดือน",
};

export default function Home() {
  return <NanPulseApp />;
}

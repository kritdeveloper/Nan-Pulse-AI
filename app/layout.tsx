import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const image = new URL("/og.png", base).toString();

  return {
    metadataBase: base,
    title: "Nan Pulse",
    description: "The Operating Pulse of Sustainable Tourism",
    openGraph: {
      title: "Nan Pulse",
      description: "The Operating Pulse of Sustainable Tourism",
      type: "website",
      images: [{ url: image, width: 1536, height: 1024, alt: "Nan Pulse" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Nan Pulse",
      description: "The Operating Pulse of Sustainable Tourism",
      images: [image],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}

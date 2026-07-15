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
    title: "Nan Pulse AI",
    description: "AI decision system for distributing tourism opportunities across Nan all year",
    openGraph: {
      title: "Nan Pulse AI",
      description: "AI decision system for distributing tourism opportunities across Nan all year",
      type: "website",
      images: [{ url: image, width: 1536, height: 1024, alt: "Nan Pulse AI" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Nan Pulse AI",
      description: "AI decision system for distributing tourism opportunities across Nan all year",
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

// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synapse Secure Comms",
  description: "Futuristic Chat Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Set the base background color here */}
      <body className="antialiased bg-[#050505]">{children}</body>
    </html>
  );
}
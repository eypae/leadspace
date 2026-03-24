import type { Metadata, Viewport } from "next";
import AuthProvider from "@/components/auth/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadSpace",
  description: "WhatsApp CRM for Property Agents.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // prevent zoom on input focus (iOS)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

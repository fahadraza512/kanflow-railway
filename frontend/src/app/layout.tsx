import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import ToastProvider from "@/providers/ToastProvider";
import HydrationProvider from "@/components/providers/HydrationProvider";
import RealtimeNotificationsProvider from "@/components/providers/RealtimeNotificationsProvider";
import AuthGuard from "@/components/auth/AuthGuard";
import TokenValidator from "@/components/auth/TokenValidator";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import SplashScreen from "@/components/pwa/SplashScreen";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ConsoleFilterScript from "@/components/ConsoleFilterScript";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "KanbanFlow",
  description: "Next-gen Kanban project management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KanbanFlow",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ConsoleFilterScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SplashScreen />
        <ErrorBoundary>
          <HydrationProvider>
            <QueryProvider>
              <ToastProvider />
              <RealtimeNotificationsProvider />
              <TokenValidator />
              <AuthGuard>
                {children}
              </AuthGuard>
              <InstallPrompt />
            </QueryProvider>
          </HydrationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

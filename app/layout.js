import { Manrope, Space_Mono } from "next/font/google";
import "@/app/globals.css";
import AppShell from "@/components/layout/AppShell";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { ToastProvider } from "@/components/ui/toast-context";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const metadata = {
  title: "FBT EMS Admin Panel",
  description: "Enterprise Employee Management System administration console",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceMono.variable} antialiased`}>
        <ToastProvider>
          <ErrorBoundary>
            <AppShell>{children}</AppShell>
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}

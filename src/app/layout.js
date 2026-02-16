import "@/app/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "EMS Admin",
  description: "Enterprise Employee Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProtectedRoute>
            <AppShell navbar={<Navbar />} sidebar={<Sidebar />}>
              {children}
            </AppShell>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}

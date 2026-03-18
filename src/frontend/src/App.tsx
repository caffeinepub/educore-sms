import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { AppProvider, useApp } from "./contexts/AppContext";
import ForceChangePassword from "./pages/ForceChangePassword";
import LoginPage from "./pages/LoginPage";
import AccountantDashboard from "./pages/accountant/AccountantDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LibrarianDashboard from "./pages/librarian/LibrarianDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import SuperadminDashboard from "./pages/superadmin/SuperadminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";

function AppRouter() {
  const { userProfile, isLoading, mustChangePassword } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-xl">E</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Loading EduCore SMS...
          </p>
        </div>
      </div>
    );
  }

  if (!userProfile) return <LoginPage />;

  if (mustChangePassword) return <ForceChangePassword />;

  switch (userProfile.role) {
    case "superadmin":
      return <SuperadminDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "accountant":
      return <AccountantDashboard />;
    case "librarian":
      return <LibrarianDashboard />;
    case "student":
      return <StudentDashboard />;
    case "parent":
      return <ParentDashboard />;
    default:
      return <LoginPage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
      <Toaster />
    </AppProvider>
  );
}

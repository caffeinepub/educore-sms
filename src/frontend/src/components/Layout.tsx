import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  ClipboardList,
  DollarSign,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useApp } from "../contexts/AppContext";
import type { AppRole } from "../types";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  section: string;
}

function getNavItems(role: AppRole): NavItem[] {
  const common: NavItem[] = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      section: "dashboard",
    },
  ];
  switch (role) {
    case "superadmin":
      return [
        ...common,
        { label: "Schools", icon: <Building2 size={18} />, section: "schools" },
        {
          label: "System Settings",
          icon: <Settings size={18} />,
          section: "settings",
        },
      ];
    case "admin":
      return [
        ...common,
        {
          label: "Student Info",
          icon: <Users size={18} />,
          section: "students",
        },
        {
          label: "Academics",
          icon: <BookOpen size={18} />,
          section: "academics",
        },
        {
          label: "Fees Collection",
          icon: <DollarSign size={18} />,
          section: "fees",
        },
        {
          label: "Examination",
          icon: <ClipboardList size={18} />,
          section: "examination",
        },
        { label: "Human Resource", icon: <UserCog size={18} />, section: "hr" },
        {
          label: "Communication",
          icon: <MessageSquare size={18} />,
          section: "communication",
        },
        { label: "Reports", icon: <BarChart3 size={18} />, section: "reports" },
      ];
    case "teacher":
      return [
        ...common,
        {
          label: "My Classes",
          icon: <BookOpen size={18} />,
          section: "myclasses",
        },
        {
          label: "Attendance",
          icon: <Users size={18} />,
          section: "attendance",
        },
        {
          label: "Marks Entry",
          icon: <ClipboardList size={18} />,
          section: "marks",
        },
        {
          label: "Study Materials",
          icon: <FileText size={18} />,
          section: "materials",
        },
        {
          label: "Assignments",
          icon: <Calendar size={18} />,
          section: "assignments",
        },
        {
          label: "Communication",
          icon: <MessageSquare size={18} />,
          section: "communication",
        },
      ];
    case "accountant":
      return [
        ...common,
        {
          label: "Collect Fees",
          icon: <DollarSign size={18} />,
          section: "collect",
        },
        {
          label: "Fee Payments",
          icon: <FileText size={18} />,
          section: "payments",
        },
        {
          label: "Fee Dues",
          icon: <ClipboardList size={18} />,
          section: "dues",
        },
        { label: "Reports", icon: <BarChart3 size={18} />, section: "reports" },
      ];
    case "librarian":
      return [
        ...common,
        { label: "Catalog", icon: <Library size={18} />, section: "catalog" },
        {
          label: "Issue/Return",
          icon: <BookOpen size={18} />,
          section: "issue",
        },
        {
          label: "Reservations",
          icon: <Calendar size={18} />,
          section: "reservations",
        },
        { label: "Fines", icon: <DollarSign size={18} />, section: "fines" },
        { label: "Reports", icon: <BarChart3 size={18} />, section: "reports" },
        {
          label: "Inventory",
          icon: <ClipboardList size={18} />,
          section: "inventory",
        },
        { label: "ID Cards", icon: <FileText size={18} />, section: "idcards" },
        {
          label: "Settings",
          icon: <Settings size={18} />,
          section: "settings",
        },
      ];
    case "student":
      return [
        ...common,
        {
          label: "My Schedule",
          icon: <Calendar size={18} />,
          section: "schedule",
        },
        {
          label: "My Marks",
          icon: <GraduationCap size={18} />,
          section: "marks",
        },
        {
          label: "Attendance",
          icon: <Users size={18} />,
          section: "attendance",
        },
        {
          label: "Study Materials",
          icon: <BookOpen size={18} />,
          section: "materials",
        },
        {
          label: "Assignments",
          icon: <FileText size={18} />,
          section: "assignments",
        },
        { label: "My Fees", icon: <DollarSign size={18} />, section: "fees" },
        {
          label: "Communication",
          icon: <MessageSquare size={18} />,
          section: "communication",
        },
        { label: "Library", icon: <Library size={18} />, section: "library" },
      ];
    case "parent":
      return [
        ...common,
        {
          label: "Child Marks",
          icon: <GraduationCap size={18} />,
          section: "marks",
        },
        {
          label: "Attendance",
          icon: <Users size={18} />,
          section: "attendance",
        },
        { label: "Fee", icon: <DollarSign size={18} />, section: "fees" },
        {
          label: "Communication",
          icon: <MessageSquare size={18} />,
          section: "communication",
        },
        { label: "Library", icon: <Library size={18} />, section: "library" },
      ];
    default:
      return common;
  }
}

const roleColors: Record<AppRole, string> = {
  superadmin: "bg-purple-500",
  admin: "bg-blue-500",
  teacher: "bg-green-500",
  accountant: "bg-amber-500",
  librarian: "bg-cyan-500",
  student: "bg-indigo-500",
  parent: "bg-rose-500",
};

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (s: string) => void;
  schoolName?: string;
}

export default function Layout({
  children,
  activeSection,
  onSectionChange,
  schoolName = "EduCore SMS",
}: LayoutProps) {
  const { userProfile, setUserProfile } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = userProfile?.role ?? "admin";
  const navItems = getNavItems(role);

  const SidebarContent = () => (
    <div
      className="flex flex-col h-full"
      style={{ background: "oklch(var(--sidebar))" }}
    >
      <div
        className="p-5 border-b"
        style={{ borderColor: "oklch(var(--sidebar-border))" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap size={20} className="text-primary-foreground" />
          </div>
          <div>
            <div
              className="text-sm font-bold"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            >
              EduCore SMS
            </div>
            <div
              className="text-xs opacity-60"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            >
              {schoolName}
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.section}
            data-ocid={`nav.${item.section}.link`}
            onClick={() => {
              onSectionChange(item.section);
              setMobileOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.section
                ? "bg-primary text-primary-foreground"
                : "hover:bg-white/10"
            }`}
            style={
              activeSection !== item.section
                ? { color: "oklch(var(--sidebar-foreground))" }
                : {}
            }
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div
        className="p-3 border-t"
        style={{ borderColor: "oklch(var(--sidebar-border))" }}
      >
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback
              className={`${roleColors[role]} text-white text-xs`}
            >
              {userProfile?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div
              className="text-xs font-semibold truncate"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            >
              {userProfile?.name}
            </div>
            <Badge
              variant="outline"
              className="text-xs px-1 py-0 capitalize mt-0.5"
              style={{
                color: "oklch(var(--sidebar-foreground))",
                borderColor: "oklch(var(--sidebar-border))",
              }}
            >
              {role}
            </Badge>
          </div>
          <button
            type="button"
            data-ocid="nav.logout.button"
            onClick={() => setUserProfile(null)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: "oklch(var(--sidebar-foreground))" }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0 border-none">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border flex-shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                data-ocid="nav.menu.button"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground">
              {schoolName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {userProfile?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUserProfile(null)}
              data-ocid="header.logout.button"
            >
              <LogOut size={14} className="mr-1" /> Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

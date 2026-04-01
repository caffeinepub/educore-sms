import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText,
  GraduationCap,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  Settings,
  Upload,
  UserCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useApp } from "../contexts/AppContext";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import type { AppRole } from "../types";

// ----- Nav structure types -----
interface NavLeaf {
  kind: "leaf";
  label: string;
  icon: React.ReactNode;
  section: string;
}
interface NavGroup {
  kind: "group";
  label: string;
  icon: React.ReactNode;
  children: NavLeaf[];
}
type NavEntry = NavLeaf | NavGroup;

// ----- Nav definitions per role -----
function getNavEntries(role: AppRole): NavEntry[] {
  const dashboard: NavLeaf = {
    kind: "leaf",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    section: "dashboard",
  };

  switch (role) {
    case "superadmin":
      return [
        dashboard,
        {
          kind: "leaf",
          label: "Schools",
          icon: <Building2 size={16} />,
          section: "schools",
        },
        {
          kind: "leaf",
          label: "User Accounts",
          icon: <UserCog size={16} />,
          section: "accounts",
        },
        {
          kind: "leaf",
          label: "System Settings",
          icon: <Settings size={16} />,
          section: "settings",
        },
      ];

    case "admin":
      return [
        dashboard,
        {
          kind: "group",
          label: "Student MGMT",
          icon: <Users size={16} />,
          children: [
            {
              kind: "leaf",
              label: "Student Info",
              icon: <Users size={15} />,
              section: "students",
            },
            {
              kind: "leaf",
              label: "Academics",
              icon: <BookOpen size={15} />,
              section: "academics",
            },
            {
              kind: "leaf",
              label: "Examination",
              icon: <ClipboardList size={15} />,
              section: "examination",
            },
            {
              kind: "leaf",
              label: "Bulk Import",
              icon: <Upload size={15} />,
              section: "bulkimport",
            },
            {
              kind: "leaf",
              label: "Admissions",
              icon: <UserCheck size={15} />,
              section: "admissions",
            },
          ],
        },
        {
          kind: "group",
          label: "Staff MGMT",
          icon: <UserCog size={16} />,
          children: [
            {
              kind: "leaf",
              label: "Human Resource",
              icon: <UserCog size={15} />,
              section: "hr",
            },
            {
              kind: "leaf",
              label: "Departments",
              icon: <Building2 size={15} />,
              section: "departments",
            },
          ],
        },
        {
          kind: "group",
          label: "College MGMT",
          icon: <GraduationCap size={16} />,
          children: [
            {
              kind: "leaf",
              label: "Course Management",
              icon: <BookOpen size={15} />,
              section: "coursemanagement",
            },
            {
              kind: "leaf",
              label: "Exams (College)",
              icon: <GraduationCap size={15} />,
              section: "collegeexams",
            },
          ],
        },
        {
          kind: "group",
          label: "Finance",
          icon: <DollarSign size={16} />,
          children: [
            {
              kind: "leaf",
              label: "Fees Collection",
              icon: <DollarSign size={15} />,
              section: "fees",
            },
          ],
        },
        {
          kind: "group",
          label: "Library",
          icon: <Library size={16} />,
          children: [
            {
              kind: "leaf",
              label: "Library Module",
              icon: <Library size={15} />,
              section: "library",
            },
            {
              kind: "leaf",
              label: "Books Management",
              icon: <BookMarked size={15} />,
              section: "books",
            },
          ],
        },
        {
          kind: "leaf",
          label: "Communication",
          icon: <MessageSquare size={16} />,
          section: "communication",
        },
        {
          kind: "leaf",
          label: "Front Office",
          icon: <Building2 size={16} />,
          section: "frontoffice",
        },
        {
          kind: "leaf",
          label: "Reports",
          icon: <BarChart3 size={16} />,
          section: "reports",
        },
        {
          kind: "leaf",
          label: "User Accounts",
          icon: <KeyRound size={16} />,
          section: "accounts",
        },
      ];

    case "teacher":
      return [
        dashboard,
        {
          kind: "group",
          label: "Teaching",
          icon: <BookOpen size={16} />,
          children: [
            {
              kind: "leaf",
              label: "My Classes",
              icon: <BookOpen size={15} />,
              section: "myclasses",
            },
            {
              kind: "leaf",
              label: "Attendance",
              icon: <Users size={15} />,
              section: "attendance",
            },
            {
              kind: "leaf",
              label: "Marks Entry",
              icon: <ClipboardList size={15} />,
              section: "marks",
            },
            {
              kind: "leaf",
              label: "Assignments",
              icon: <Calendar size={15} />,
              section: "assignments",
            },
            {
              kind: "leaf",
              label: "Notes",
              icon: <BookMarked size={15} />,
              section: "notes",
            },
            {
              kind: "leaf",
              label: "Study Materials",
              icon: <FileText size={15} />,
              section: "materials",
            },
            {
              kind: "leaf",
              label: "Quiz",
              icon: <HelpCircle size={15} />,
              section: "quiz",
            },
          ],
        },
        {
          kind: "leaf",
          label: "Communication",
          icon: <MessageSquare size={16} />,
          section: "communication",
        },
        {
          kind: "leaf",
          label: "Front Office",
          icon: <Building2 size={16} />,
          section: "frontoffice",
        },
        {
          kind: "leaf",
          label: "My HR",
          icon: <UserCheck size={16} />,
          section: "myhr",
        },
      ];

    case "accountant":
      return [
        dashboard,
        {
          kind: "leaf",
          label: "Fee Structure",
          icon: <Settings size={16} />,
          section: "feestructure",
        },
        {
          kind: "leaf",
          label: "Collect Fee",
          icon: <DollarSign size={16} />,
          section: "collect",
        },
        {
          kind: "leaf",
          label: "Fee Records",
          icon: <FileText size={16} />,
          section: "records",
        },
        {
          kind: "leaf",
          label: "Defaulters",
          icon: <AlertTriangle size={16} />,
          section: "defaulters",
        },
        {
          kind: "leaf",
          label: "Reports",
          icon: <BarChart3 size={16} />,
          section: "reports",
        },
      ];

    case "librarian":
      return [
        dashboard,
        {
          kind: "leaf",
          label: "Catalog",
          icon: <Library size={16} />,
          section: "catalog",
        },
        {
          kind: "leaf",
          label: "Issue / Return",
          icon: <BookOpen size={16} />,
          section: "issue",
        },
        {
          kind: "leaf",
          label: "Reservations",
          icon: <Calendar size={16} />,
          section: "reservations",
        },
        {
          kind: "leaf",
          label: "Fines",
          icon: <DollarSign size={16} />,
          section: "fines",
        },
        {
          kind: "leaf",
          label: "Reports",
          icon: <BarChart3 size={16} />,
          section: "reports",
        },
        {
          kind: "leaf",
          label: "Inventory",
          icon: <ClipboardList size={16} />,
          section: "inventory",
        },
        {
          kind: "leaf",
          label: "ID Cards",
          icon: <FileText size={16} />,
          section: "idcards",
        },
        {
          kind: "leaf",
          label: "Settings",
          icon: <Settings size={16} />,
          section: "settings",
        },
      ];

    case "student":
      return [
        dashboard,
        {
          kind: "group",
          label: "Academics",
          icon: <GraduationCap size={16} />,
          children: [
            {
              kind: "leaf",
              label: "My Schedule",
              icon: <Calendar size={15} />,
              section: "schedule",
            },
            {
              kind: "leaf",
              label: "My Marks",
              icon: <GraduationCap size={15} />,
              section: "marks",
            },
            {
              kind: "leaf",
              label: "Exam Results",
              icon: <ClipboardList size={15} />,
              section: "examresults",
            },
            {
              kind: "leaf",
              label: "Study Materials",
              icon: <BookOpen size={15} />,
              section: "materials",
            },
            {
              kind: "leaf",
              label: "Assignments",
              icon: <FileText size={15} />,
              section: "assignments",
            },
          ],
        },
        {
          kind: "leaf",
          label: "Attendance",
          icon: <Users size={16} />,
          section: "attendance",
        },
        {
          kind: "leaf",
          label: "My Fees",
          icon: <DollarSign size={16} />,
          section: "fees",
        },
        {
          kind: "leaf",
          label: "Library",
          icon: <Library size={16} />,
          section: "library",
        },
        {
          kind: "leaf",
          label: "Communication",
          icon: <MessageSquare size={16} />,
          section: "communication",
        },
        {
          kind: "leaf",
          label: "Complaints & Enquiries",
          icon: <MessageCircle size={16} />,
          section: "frontoffice",
        },
      ];

    case "parent":
      return [
        dashboard,
        {
          kind: "leaf",
          label: "My Children",
          icon: <Users size={16} />,
          section: "children",
        },
        {
          kind: "leaf",
          label: "Fee Records",
          icon: <DollarSign size={16} />,
          section: "fees",
        },
        {
          kind: "leaf",
          label: "Academic Records",
          icon: <GraduationCap size={16} />,
          section: "academics",
        },
        {
          kind: "leaf",
          label: "Attendance",
          icon: <Calendar size={16} />,
          section: "attendance",
        },
        {
          kind: "leaf",
          label: "Notices",
          icon: <Bell size={16} />,
          section: "notices",
        },
        {
          kind: "leaf",
          label: "Communication",
          icon: <MessageSquare size={16} />,
          section: "communication",
        },
        {
          kind: "leaf",
          label: "Library",
          icon: <Library size={16} />,
          section: "library",
        },
      ];

    default:
      return [dashboard];
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

const roleBadgeColors: Record<AppRole, string> = {
  superadmin: "bg-purple-500/20 text-purple-200",
  admin: "bg-blue-500/20 text-blue-200",
  teacher: "bg-green-500/20 text-green-200",
  accountant: "bg-amber-500/20 text-amber-200",
  librarian: "bg-cyan-500/20 text-cyan-200",
  student: "bg-indigo-500/20 text-indigo-200",
  parent: "bg-rose-500/20 text-rose-200",
};

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (s: string) => void;
  schoolName?: string;
  currentSession?: string;
}

function isActiveInGroup(children: NavLeaf[], activeSection: string) {
  return children.some((c) => c.section === activeSection);
}

export default function Layout({
  children,
  activeSection,
  onSectionChange,
  schoolName = "EduCore SMS",
  currentSession = "2024-25",
}: LayoutProps) {
  const { userProfile, setUserProfile } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const role = userProfile?.role ?? "admin";
  const navEntries = getNavEntries(role);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isGroupOpen = (label: string, children: NavLeaf[]) => {
    if (label in openGroups) return openGroups[label];
    // Auto-open if a child is active
    return isActiveInGroup(children, activeSection);
  };

  const handleNav = (section: string) => {
    onSectionChange(section);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: "#1e293b" }}>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white leading-tight truncate">
              EduCore SMS
            </div>
            <div className="text-xs text-slate-400 truncate">{schoolName}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
        {navEntries.map((entry) => {
          if (entry.kind === "leaf") {
            const active = activeSection === entry.section;
            return (
              <button
                type="button"
                key={entry.section}
                data-ocid={`nav.${entry.section}.link`}
                onClick={() => handleNav(entry.section)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className={active ? "text-white" : "text-slate-400"}>
                  {entry.icon}
                </span>
                {entry.label}
              </button>
            );
          }

          // Group
          const open = isGroupOpen(entry.label, entry.children);
          const groupActive = isActiveInGroup(entry.children, activeSection);
          return (
            <div key={entry.label}>
              <button
                type="button"
                onClick={() => toggleGroup(entry.label)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  groupActive
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={groupActive ? "text-blue-400" : "text-slate-400"}
                >
                  {entry.icon}
                </span>
                <span className="flex-1 text-left">{entry.label}</span>
                <span className="text-slate-500">
                  {open ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </span>
              </button>
              {open && (
                <div className="mt-0.5 ml-4 pl-3 border-l border-white/10 space-y-0.5">
                  {entry.children.map((child) => {
                    const active = activeSection === child.section;
                    return (
                      <button
                        type="button"
                        key={child.section}
                        data-ocid={`nav.${child.section}.link`}
                        onClick={() => handleNav(child.section)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                          active
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span
                          className={active ? "text-white" : "text-slate-500"}
                        >
                          {child.icon}
                        </span>
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 p-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback
              className={`${roleColors[role]} text-white text-xs font-bold`}
            >
              {userProfile?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {userProfile?.name}
            </div>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize inline-block mt-0.5 ${roleBadgeColors[role]}`}
            >
              {role}
            </span>
          </div>
          <button
            type="button"
            data-ocid="nav.change_password.button"
            onClick={() => setShowChangePw(true)}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            title="Change Password"
          >
            <KeyRound size={15} />
          </button>
          <button
            type="button"
            data-ocid="nav.logout.button"
            onClick={() => setUserProfile(null)}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: "#f8fafc" }}
      >
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-60 flex-col flex-shrink-0 shadow-xl z-20">
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
          <header
            className="flex items-center gap-3 px-5 py-3 bg-white border-b border-slate-200 flex-shrink-0 shadow-sm"
            style={{ minHeight: 56 }}
          >
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(true)}
              data-ocid="nav.menu.button"
            >
              <Menu size={20} />
            </button>

            {/* School + Session branding */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-sm font-bold text-slate-800 truncate">
                  {schoolName}
                </h1>
                <span className="hidden sm:flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">
                  <Calendar size={11} />
                  Session: {currentSession}
                </span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 hidden md:block">
                {userProfile?.name}
              </span>
              <button
                type="button"
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors relative"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>
              <button
                type="button"
                data-ocid="header.change_password.button"
                onClick={() => setShowChangePw(true)}
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                title="Change Password"
              >
                <KeyRound size={18} />
              </button>
              <button
                type="button"
                data-ocid="header.logout.button"
                onClick={() => setUserProfile(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        type="button"
        className="lg:hidden fixed bottom-5 right-5 z-50 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <ChangePasswordPage
        open={showChangePw}
        onClose={() => setShowChangePw(false)}
      />
    </>
  );
}

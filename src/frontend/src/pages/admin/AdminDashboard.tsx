import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  ClipboardList,
  DollarSign,
  GraduationCap,
  Upload,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import Layout from "../../components/Layout";
import { useApp } from "../../contexts/AppContext";
import CommunicationModule from "../communication/CommunicationModule";
import FrontOfficePage from "../frontoffice/FrontOfficePage";
import AcademicsModule from "./AcademicsModule";
import AdminLibraryModule from "./AdminLibraryModule";
import AdmissionsModule from "./AdmissionsModule";
import BooksManagementModule from "./BooksManagementModule";
import BulkImportModule from "./BulkImportModule";
import CollegeExamsModule from "./CollegeExamsModule";
import CourseManagementModule from "./CourseManagementModule";
import DepartmentModule from "./DepartmentModule";
import ExaminationModule from "./ExaminationModule";
import FeesModule from "./FeesModule";
import HRModule from "./HRModule";
import ReportsModule from "./ReportsModule";
import StudentInfoModule from "./StudentInfoModule";
import UserAccountsModule from "./UserAccountsModule";

type Section =
  | "dashboard"
  | "students"
  | "academics"
  | "fees"
  | "examination"
  | "hr"
  | "reports"
  | "communication"
  | "library"
  | "books"
  | "frontoffice"
  | "accounts"
  | "bulkimport"
  | "departments"
  | "coursemanagement"
  | "collegeexams"
  | "admissions";

export default function AdminDashboard() {
  const {
    students,
    staff,
    feePayments,
    examSchedules,
    currentSchoolId,
    schools,
    userProfile,
  } = useApp();
  const [section, setSection] = useState<Section>("dashboard");

  const school = schools.find((s) => s.id === currentSchoolId);
  const myStudents = students.filter((s) => s.schoolId === currentSchoolId);
  const myStaff = staff.filter((s) => s.schoolId === currentSchoolId);
  const myPayments = feePayments.filter((p) => p.schoolId === currentSchoolId);
  const myExams = examSchedules.filter((e) => e.schoolId === currentSchoolId);
  const monthRevenue = myPayments.reduce((a, p) => a + p.amountPaid, 0);
  const atRiskCount = myStudents.filter((s) => {
    if (!s.isActive) return false;
    const idNum = s.id
      .split("")
      .reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
    const pct = ((idNum * 7) % 50) + 50;
    return pct < 75;
  }).length;

  const today = new Date();
  const timeOfDay =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const quickActions = [
    {
      label: "Take Attendance",
      section: "students" as Section,
      icon: <Users size={16} />,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Collect Fee",
      section: "fees" as Section,
      icon: <DollarSign size={16} />,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      label: "Add Student",
      section: "students" as Section,
      icon: <UserCheck size={16} />,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      label: "View Reports",
      section: "reports" as Section,
      icon: <BarChart2 size={16} />,
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      label: "Manage Staff",
      section: "hr" as Section,
      icon: <UserCog size={16} />,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      label: "Admissions",
      section: "admissions" as Section,
      icon: <GraduationCap size={16} />,
      color: "bg-rose-500 hover:bg-rose-600",
    },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="rounded-xl p-6 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #3b82f6 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 right-24 w-56 h-56 rounded-full bg-white/5" />
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1">{dateStr}</p>
          <h2 className="text-2xl font-bold mb-1">
            {timeOfDay}, {userProfile?.name?.split(" ")[0] ?? "Admin"} 👋
          </h2>
          <p className="text-blue-100 text-sm mb-5">
            {school?.name ?? "School Overview"} &mdash; you have {atRiskCount}{" "}
            at-risk student{atRiskCount !== 1 ? "s" : ""} to review today.
          </p>
          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <button
                key={`${a.label}-${a.section}`}
                type="button"
                onClick={() => setSection(a.section)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors shadow-sm ${a.color}`}
                data-ocid={`admin.quickaction.${a.section}.button`}
              >
                {a.icon}
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Total Students",
            value: myStudents.length,
            icon: <Users size={20} />,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
          },
          {
            label: "Total Staff",
            value: myStaff.length,
            icon: <UserCog size={20} />,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100",
          },
          {
            label: "Fees Collected",
            value: `₹${monthRevenue.toLocaleString()}`,
            icon: <DollarSign size={20} />,
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-100",
          },
          {
            label: "Upcoming Exams",
            value: myExams.length,
            icon: <ClipboardList size={20} />,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
          },
          {
            label: "At-Risk Students",
            value: atRiskCount,
            icon: <AlertTriangle size={20} />,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-100",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className={`border ${stat.border}`}
            data-ocid={"admin.stat.card"}
          >
            <CardContent className="pt-4">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}
              >
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-slate-800">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick access + Recent payments */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Module Quick Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              {
                label: "Manage Students",
                section: "students" as Section,
                icon: <Users size={15} />,
                desc: "Add, edit, promote students",
              },
              {
                label: "Academics",
                section: "academics" as Section,
                icon: <BookOpen size={15} />,
                desc: "Classes, subjects, routines",
              },
              {
                label: "Collect Fees",
                section: "fees" as Section,
                icon: <DollarSign size={15} />,
                desc: "Payments and dues",
              },
              {
                label: "Examinations",
                section: "examination" as Section,
                icon: <ClipboardList size={15} />,
                desc: "Schedule and marks",
              },
              {
                label: "Bulk Import",
                section: "bulkimport" as Section,
                icon: <Upload size={15} />,
                desc: "Import students, staff, books",
              },
              {
                label: "Track Performance",
                section: "reports" as Section,
                icon: <BarChart2 size={15} />,
                desc: "At-risk and analytics",
              },
            ].map((a) => (
              <button
                type="button"
                key={a.section + a.label}
                onClick={() => setSection(a.section)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left border border-transparent hover:border-slate-200"
                data-ocid={`admin.quicklink.${a.section}.button`}
              >
                <span className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                  {a.icon}
                </span>
                <div>
                  <div className="text-sm font-medium text-slate-700">
                    {a.label}
                  </div>
                  <div className="text-xs text-slate-400">{a.desc}</div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myPayments.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                No payment records yet.
              </p>
            ) : (
              <div className="space-y-2">
                {myPayments.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-700">
                        {p.receiptNumber}
                      </div>
                      <div className="text-xs text-slate-400">
                        {p.paymentDate}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      ₹{p.amountPaid.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Layout
      activeSection={section}
      onSectionChange={(s) => setSection(s as Section)}
      schoolName={school?.name}
      currentSession="2024-25"
    >
      {section === "dashboard" && renderDashboard()}
      {section === "students" && <StudentInfoModule />}
      {section === "academics" && <AcademicsModule />}
      {section === "fees" && <FeesModule />}
      {section === "examination" && <ExaminationModule />}
      {section === "hr" && <HRModule />}
      {section === "communication" && <CommunicationModule />}
      {section === "library" && <AdminLibraryModule />}
      {section === "books" && <BooksManagementModule />}
      {section === "frontoffice" && <FrontOfficePage />}
      {section === "accounts" && <UserAccountsModule />}
      {section === "reports" && <ReportsModule />}
      {section === "bulkimport" && <BulkImportModule />}
      {section === "departments" && <DepartmentModule />}
      {section === "coursemanagement" && <CourseManagementModule />}
      {section === "collegeexams" && <CollegeExamsModule />}
      {section === "admissions" && <AdmissionsModule />}
    </Layout>
  );
}

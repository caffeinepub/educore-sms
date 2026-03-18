import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  ClipboardList,
  DollarSign,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import Layout from "../../components/Layout";
import { useApp } from "../../contexts/AppContext";
import CommunicationModule from "../communication/CommunicationModule";
import AcademicsModule from "./AcademicsModule";
import ExaminationModule from "./ExaminationModule";
import FeesModule from "./FeesModule";
import HRModule from "./HRModule";
import StudentInfoModule from "./StudentInfoModule";

type Section =
  | "dashboard"
  | "students"
  | "academics"
  | "fees"
  | "examination"
  | "hr"
  | "reports"
  | "communication";

export default function AdminDashboard() {
  const {
    students,
    staff,
    feePayments,
    examSchedules,
    currentSchoolId,
    schools,
  } = useApp();
  const [section, setSection] = useState<Section>("dashboard");

  const school = schools.find((s) => s.id === currentSchoolId);
  const myStudents = students.filter((s) => s.schoolId === currentSchoolId);
  const myStaff = staff.filter((s) => s.schoolId === currentSchoolId);
  const myPayments = feePayments.filter((p) => p.schoolId === currentSchoolId);
  const myExams = examSchedules.filter((e) => e.schoolId === currentSchoolId);
  const monthRevenue = myPayments.reduce((a, p) => a + p.amountPaid, 0);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          {school?.name ?? "School Overview"}
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Students",
            value: myStudents.length,
            icon: <Users size={20} />,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Total Staff",
            value: myStaff.length,
            icon: <UserCog size={20} />,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Fees Collected",
            value: `$${monthRevenue}`,
            icon: <DollarSign size={20} />,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Upcoming Exams",
            value: myExams.length,
            icon: <ClipboardList size={20} />,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((stat) => (
          <Card key={stat.label} data-ocid={`admin.stat.card.${stat.label}`}>
            <CardContent className="pt-4">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}
              >
                {stat.icon}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                label: "Manage Students",
                section: "students" as Section,
                icon: <Users size={16} />,
              },
              {
                label: "Academics",
                section: "academics" as Section,
                icon: <BookOpen size={16} />,
              },
              {
                label: "Collect Fees",
                section: "fees" as Section,
                icon: <DollarSign size={16} />,
              },
              {
                label: "Examinations",
                section: "examination" as Section,
                icon: <ClipboardList size={16} />,
              },
            ].map((a) => (
              <button
                type="button"
                key={a.section}
                onClick={() => setSection(a.section)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                data-ocid={`admin.quicklink.${a.section}.button`}
              >
                <span className="text-primary">{a.icon}</span>
                <span className="text-sm font-medium">{a.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myPayments.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                >
                  <div>
                    <div className="text-sm font-medium">{p.receiptNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.paymentDate}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-green-600">
                    ${p.amountPaid}
                  </div>
                </div>
              ))}
            </div>
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
    >
      {section === "dashboard" && renderDashboard()}
      {section === "students" && <StudentInfoModule />}
      {section === "academics" && <AcademicsModule />}
      {section === "fees" && <FeesModule />}
      {section === "examination" && <ExaminationModule />}
      {section === "hr" && <HRModule />}
      {section === "communication" && <CommunicationModule />}
      {section === "reports" && (
        <div className="text-muted-foreground p-4">
          Reports module coming in next phase.
        </div>
      )}
    </Layout>
  );
}

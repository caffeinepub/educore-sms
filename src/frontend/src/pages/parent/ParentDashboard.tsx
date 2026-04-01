import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  GraduationCap,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import Layout from "../../components/Layout";
import { useApp } from "../../contexts/AppContext";
import CommunicationView from "../communication/CommunicationView";
import ParentLibraryView from "./ParentLibraryView";

type ParentSection =
  | "dashboard"
  | "children"
  | "fees"
  | "academics"
  | "attendance"
  | "notices"
  | "communication"
  | "library";

function getGrade(
  percentage: number,
  grades: { minPercentage: number; maxPercentage: number; grade: string }[],
): string {
  const g = grades.find(
    (g) => percentage >= g.minPercentage && percentage <= g.maxPercentage,
  );
  return g?.grade ?? "N/A";
}

export default function ParentDashboard() {
  const {
    userProfile,
    students,
    classes,
    sections,
    feePayments,
    feeMasters,
    feeTypes,
    examMarks,
    examSchedules,
    examTypes,
    subjects,
    attendanceRecords,
    marksGrades,
    noticesList,
    currentSchoolId,
  } = useApp();

  const [section, setSection] = useState<ParentSection>("dashboard");

  const childrenIds = userProfile?.childrenIds ?? [];
  const myChildren = students.filter((s) => childrenIds.includes(s.id));
  const [activeChildId, setActiveChildId] = useState(myChildren[0]?.id ?? "");

  // Helpers
  const getClassName = (id: string) =>
    classes.find((c) => c.id === id)?.name ?? id;
  const getSectionName = (id: string) =>
    sections.find((s) => s.id === id)?.name ?? "";
  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name ?? id;
  const getExamTypeName = (id: string) =>
    examTypes.find((e) => e.id === id)?.name ?? id;
  const getFeeTypeName = (feeMasterId: string) => {
    const fm = feeMasters.find((f) => f.id === feeMasterId);
    if (!fm) return "Unknown";
    return feeTypes.find((ft) => ft.id === fm.feeTypeId)?.name ?? "Unknown";
  };
  const getFeeMasterAmount = (feeMasterId: string) =>
    feeMasters.find((f) => f.id === feeMasterId)?.amount ?? 0;
  const getFeeMasterDueDate = (feeMasterId: string) =>
    feeMasters.find((f) => f.id === feeMasterId)?.dueDate ?? "";

  const getAttendanceStats = (studentId: string) => {
    const records = attendanceRecords.filter((a) => a.studentId === studentId);
    const present = records.filter((a) => a.status === "present").length;
    const absent = records.filter((a) => a.status === "absent").length;
    const late = records.filter((a) => a.status === "late").length;
    const total = records.length;
    const pct = total ? Math.round((present / total) * 100) : 0;
    return { present, absent, late, total, pct, records };
  };

  const getChildFeeStats = (studentId: string) => {
    const payments = feePayments.filter((p) => p.studentId === studentId);
    const paid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    // Find relevant fee masters by the student's classId
    const child = students.find((s) => s.id === studentId);
    const billed = feeMasters
      .filter((fm) => fm.classId === child?.classId)
      .reduce((sum, fm) => sum + fm.amount, 0);
    const outstanding = Math.max(0, billed - paid);
    return { paid, billed, outstanding, payments };
  };

  const getChildExamStats = (studentId: string) => {
    const marks = examMarks.filter((m) => m.studentId === studentId);
    const enriched = marks.map((m) => {
      const schedule = examSchedules.find((es) => es.id === m.examScheduleId);
      const pct = schedule
        ? Math.round((m.marksObtained / schedule.totalMarks) * 100)
        : 0;
      return {
        ...m,
        schedule,
        subjectName: schedule ? getSubjectName(schedule.subjectId) : "Unknown",
        examTypeName: schedule ? getExamTypeName(schedule.examTypeId) : "",
        total: schedule?.totalMarks ?? 100,
        pct,
        grade: getGrade(pct, marksGrades),
      };
    });
    const avgPct = enriched.length
      ? Math.round(enriched.reduce((s, e) => s + e.pct, 0) / enriched.length)
      : 0;
    const best = enriched.reduce(
      (best, e) => (e.pct > (best?.pct ?? -1) ? e : best),
      enriched[0],
    );
    return { marks: enriched, avgPct, best };
  };

  // Dashboard summary
  const totalFeesPaid = myChildren.reduce(
    (sum, c) => sum + getChildFeeStats(c.id).paid,
    0,
  );
  const avgAttendance = myChildren.length
    ? Math.round(
        myChildren.reduce((sum, c) => sum + getAttendanceStats(c.id).pct, 0) /
          myChildren.length,
      )
    : 0;

  const schoolNotices = noticesList.filter(
    (n) => n.schoolId === currentSchoolId,
  );

  // Active child data
  const activeChild = myChildren.find((c) => c.id === activeChildId);
  const activeAttendance = activeChild
    ? getAttendanceStats(activeChild.id)
    : null;
  const activeExams = activeChild ? getChildExamStats(activeChild.id) : null;
  const activeFees = activeChild ? getChildFeeStats(activeChild.id) : null;

  // Child tab selector component
  const ChildTabs = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (id: string) => void;
  }) =>
    myChildren.length > 1 ? (
      <Tabs value={value} onValueChange={onChange}>
        <TabsList data-ocid="parent.child.tab">
          {myChildren.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {c.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    ) : null;

  return (
    <Layout
      activeSection={section}
      onSectionChange={(s) => setSection(s as ParentSection)}
      schoolName="Parent Portal"
    >
      {/* ── DASHBOARD ─────────────────────────────────── */}
      {section === "dashboard" && (
        <div className="space-y-6">
          {/* Welcome */}
          <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Welcome back, {userProfile?.name} 👋
                </h2>
                <p className="text-muted-foreground mt-1">
                  You have {myChildren.length}{" "}
                  {myChildren.length === 1 ? "child" : "children"} enrolled at
                  this school.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {myChildren.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Children</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {avgAttendance}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg Attendance
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    ₹{totalFeesPaid.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Fees Paid</div>
                </div>
              </div>
            </div>
          </div>

          {/* Child Cards */}
          <div>
            <h3 className="text-lg font-semibold mb-3">My Children</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myChildren.map((child) => {
                const att = getAttendanceStats(child.id);
                const fees = getChildFeeStats(child.id);
                return (
                  <Card
                    key={child.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-border"
                    onClick={() => {
                      setActiveChildId(child.id);
                      setSection("children");
                    }}
                    data-ocid={`parent.child.card.${myChildren.indexOf(child) + 1}`}
                  >
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                          {child.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">
                            {child.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getClassName(child.classId)} •{" "}
                            {getSectionName(child.sectionId)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Roll: {child.rollNumber}
                          </div>
                        </div>
                        <Badge
                          variant={child.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {child.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                          <div className="text-sm font-bold text-green-600">
                            {att.pct}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Attendance
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                          <div className="text-sm font-bold text-amber-600">
                            ₹{fees.paid.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Fees Paid
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress value={att.pct} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Notices Preview */}
          {schoolNotices.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Recent Notices</h3>
              <div className="space-y-2">
                {schoolNotices.slice(0, 3).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card"
                  >
                    <div
                      className={`mt-0.5 ${n.priority === "urgent" ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {n.priority === "urgent" ? (
                        <AlertCircle size={16} />
                      ) : (
                        <BookOpen size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{n.title}</span>
                        {n.priority === "urgent" && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {n.content}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {n.postedAt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MY CHILDREN ───────────────────────────────── */}
      {section === "children" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">My Children</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myChildren.map((child) => {
              const att = getAttendanceStats(child.id);
              const fees = getChildFeeStats(child.id);
              const exams = getChildExamStats(child.id);
              return (
                <Card
                  key={child.id}
                  className={`border-2 transition-colors cursor-pointer ${
                    activeChildId === child.id
                      ? "border-primary"
                      : "border-border"
                  }`}
                  onClick={() => setActiveChildId(child.id)}
                  data-ocid={`parent.children.card.${myChildren.indexOf(child) + 1}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{child.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {getClassName(child.classId)} |{" "}
                          {getSectionName(child.sectionId)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Roll No: {child.rollNumber}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                        <div className="text-lg font-bold text-green-600">
                          {att.pct}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Attendance
                        </div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                        <div className="text-lg font-bold text-blue-600">
                          {exams.avgPct}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg Score
                        </div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                        <div className="text-lg font-bold text-amber-600">
                          ₹{fees.outstanding}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Pending
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Attendance
                        </span>
                        <span>{att.pct}%</span>
                      </div>
                      <Progress value={att.pct} className="h-1.5" />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{child.gender}</Badge>
                      <Badge variant="outline">DOB: {child.dateOfBirth}</Badge>
                      <Badge variant={child.isActive ? "default" : "secondary"}>
                        {child.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FEE RECORDS ───────────────────────────────── */}
      {section === "fees" && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Fee Records</h2>
          <ChildTabs value={activeChildId} onChange={setActiveChildId} />
          {activeChild && activeFees && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: "Total Billed",
                    value: `₹${activeFees.billed.toLocaleString()}`,
                    icon: <DollarSign size={18} />,
                    color: "text-foreground",
                    bg: "bg-muted/50",
                  },
                  {
                    label: "Total Paid",
                    value: `₹${activeFees.paid.toLocaleString()}`,
                    icon: <CheckCircle2 size={18} />,
                    color: "text-green-600",
                    bg: "bg-green-50 dark:bg-green-950/20",
                  },
                  {
                    label: "Outstanding",
                    value: `₹${activeFees.outstanding.toLocaleString()}`,
                    icon: <AlertCircle size={18} />,
                    color:
                      activeFees.outstanding > 0
                        ? "text-destructive"
                        : "text-green-600",
                    bg:
                      activeFees.outstanding > 0
                        ? "bg-red-50 dark:bg-red-950/20"
                        : "bg-green-50 dark:bg-green-950/20",
                  },
                ].map((stat) => (
                  <Card key={stat.label} className={stat.bg}>
                    <CardContent className="pt-4">
                      <div className={`${stat.color} mb-1`}>{stat.icon}</div>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Payments Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Payment History — {activeChild.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table data-ocid="parent.fees.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Receipt No.</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Billed</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeFees.payments.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center text-muted-foreground py-8"
                            data-ocid="parent.fees.empty_state"
                          >
                            No payment records found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        activeFees.payments.map((p, i) => {
                          const billed = getFeeMasterAmount(p.feeMasterId);
                          const status =
                            p.amountPaid >= billed
                              ? "Paid"
                              : p.amountPaid > 0
                                ? "Partial"
                                : "Pending";
                          return (
                            <TableRow
                              key={p.id}
                              data-ocid={`parent.fees.item.${i + 1}`}
                            >
                              <TableCell>
                                <Badge variant="outline">
                                  {p.receiptNumber}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {getFeeTypeName(p.feeMasterId)}
                              </TableCell>
                              <TableCell>₹{billed}</TableCell>
                              <TableCell className="font-medium">
                                ₹{p.amountPaid}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {getFeeMasterDueDate(p.feeMasterId)}
                              </TableCell>
                              <TableCell>{p.paymentDate}</TableCell>
                              <TableCell>{p.paymentMethod}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    status === "Paid"
                                      ? "default"
                                      : status === "Partial"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ── ACADEMIC RECORDS ──────────────────────────── */}
      {section === "academics" && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Academic Records</h2>
          <ChildTabs value={activeChildId} onChange={setActiveChildId} />
          {activeChild && activeExams && (
            <>
              {/* Performance Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-blue-50 dark:bg-blue-950/20">
                  <CardContent className="pt-4">
                    <TrendingUp size={18} className="text-blue-600 mb-1" />
                    <div className="text-2xl font-bold text-blue-600">
                      {activeExams.avgPct}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Score
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950/20">
                  <CardContent className="pt-4">
                    <GraduationCap size={18} className="text-green-600 mb-1" />
                    <div className="text-2xl font-bold text-green-600">
                      {getGrade(activeExams.avgPct, marksGrades)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Overall Grade
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 dark:bg-purple-950/20">
                  <CardContent className="pt-4">
                    <BookOpen size={18} className="text-purple-600 mb-1" />
                    <div className="text-2xl font-bold text-purple-600 truncate">
                      {activeExams.best?.subjectName ?? "—"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Best Subject
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Marks Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Exam Results — {activeChild.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table data-ocid="parent.academics.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Exam Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Marks Obtained</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeExams.marks.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center text-muted-foreground py-8"
                            data-ocid="parent.academics.empty_state"
                          >
                            No exam records found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        activeExams.marks.map((m, i) => (
                          <TableRow
                            key={m.id}
                            data-ocid={`parent.academics.item.${i + 1}`}
                          >
                            <TableCell className="font-medium">
                              {m.subjectName}
                            </TableCell>
                            <TableCell>{m.examTypeName}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {m.schedule?.examDate ?? "—"}
                            </TableCell>
                            <TableCell className="font-bold">
                              {m.marksObtained}
                            </TableCell>
                            <TableCell>{m.total}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{m.pct}%</span>
                                <Progress
                                  value={m.pct}
                                  className="h-1.5 w-16"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  m.pct >= 75
                                    ? "default"
                                    : m.pct >= 35
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {m.grade}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ── ATTENDANCE ────────────────────────────────── */}
      {section === "attendance" && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Attendance</h2>
          <ChildTabs value={activeChildId} onChange={setActiveChildId} />
          {activeChild && activeAttendance && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: "Present",
                    value: activeAttendance.present,
                    icon: <CheckCircle2 size={18} />,
                    color: "text-green-600",
                    bg: "bg-green-50 dark:bg-green-950/20",
                  },
                  {
                    label: "Absent",
                    value: activeAttendance.absent,
                    icon: <XCircle size={18} />,
                    color: "text-destructive",
                    bg: "bg-red-50 dark:bg-red-950/20",
                  },
                  {
                    label: "Late",
                    value: activeAttendance.late,
                    icon: <Clock size={18} />,
                    color: "text-amber-600",
                    bg: "bg-amber-50 dark:bg-amber-950/20",
                  },
                  {
                    label: "Attendance %",
                    value: `${activeAttendance.pct}%`,
                    icon: <Users size={18} />,
                    color:
                      activeAttendance.pct >= 75
                        ? "text-green-600"
                        : "text-destructive",
                    bg: "bg-muted/50",
                  },
                ].map((stat) => (
                  <Card key={stat.label} className={stat.bg}>
                    <CardContent className="pt-4">
                      <div className={`${stat.color} mb-1`}>{stat.icon}</div>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Progress bar */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Overall Attendance</span>
                    <span
                      className={
                        activeAttendance.pct >= 75
                          ? "text-green-600"
                          : "text-destructive"
                      }
                    >
                      {activeAttendance.pct}%
                    </span>
                  </div>
                  <Progress value={activeAttendance.pct} className="h-3" />
                  {activeAttendance.pct < 75 && (
                    <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Attendance below 75% — please contact the school.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Date-wise table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Attendance Log — {activeChild.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table data-ocid="parent.attendance.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeAttendance.records.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            className="text-center text-muted-foreground py-8"
                            data-ocid="parent.attendance.empty_state"
                          >
                            No attendance records found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        [...activeAttendance.records]
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map((rec, i) => (
                            <TableRow
                              key={rec.id}
                              data-ocid={`parent.attendance.item.${i + 1}`}
                            >
                              <TableCell className="flex items-center gap-2">
                                <Calendar
                                  size={14}
                                  className="text-muted-foreground"
                                />
                                {rec.date}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    rec.status === "present"
                                      ? "default"
                                      : rec.status === "late"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className={`capitalize ${
                                    rec.status === "present"
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200"
                                      : rec.status === "late"
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200"
                                        : ""
                                  }`}
                                >
                                  {rec.status === "present" && (
                                    <CheckCircle2 size={12} className="mr-1" />
                                  )}
                                  {rec.status === "absent" && (
                                    <XCircle size={12} className="mr-1" />
                                  )}
                                  {rec.status === "late" && (
                                    <Clock size={12} className="mr-1" />
                                  )}
                                  {rec.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ── NOTICES ───────────────────────────────────── */}
      {section === "notices" && (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">School Notices</h2>
          {schoolNotices.length === 0 ? (
            <Card>
              <CardContent
                className="py-12 text-center text-muted-foreground"
                data-ocid="parent.notices.empty_state"
              >
                No notices at this time.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {schoolNotices.map((n, i) => (
                <Card
                  key={n.id}
                  className={`${
                    n.priority === "urgent"
                      ? "border-destructive/50 bg-red-50/50 dark:bg-red-950/10"
                      : ""
                  }`}
                  data-ocid={`parent.notices.item.${i + 1}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 ${
                            n.priority === "urgent"
                              ? "text-destructive"
                              : "text-primary"
                          }`}
                        >
                          {n.priority === "urgent" ? (
                            <AlertCircle size={18} />
                          ) : (
                            <BookOpen size={18} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{n.title}</h4>
                            {n.priority === "urgent" && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {n.content}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-muted-foreground">
                          {n.postedAt}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          by {n.postedBy}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── COMMUNICATION ─────────────────────────────── */}
      {section === "communication" && (
        <CommunicationView
          classId={activeChild?.classId ?? "c1"}
          senderName={userProfile?.name ?? "Parent"}
          senderRole="parent"
        />
      )}

      {/* ── LIBRARY ───────────────────────────────────── */}
      {section === "library" && <ParentLibraryView />}
    </Layout>
  );
}

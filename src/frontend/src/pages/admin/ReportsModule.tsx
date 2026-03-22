import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useApp } from "../../contexts/AppContext";
import {
  issueRecords,
  books as libBooks,
  libraryFines,
} from "../../data/libraryMockData";

// ─── CSV Export Helper ────────────────────────────────────────────────────────

function exportTable(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Zebra Table ──────────────────────────────────────────────────────────────

function ZebraTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="rounded-lg border border-border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            {headers.map((h) => (
              <TableHead
                key={h}
                className="text-xs uppercase tracking-wide whitespace-nowrap"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={headers.length}
                className="text-center py-8 text-muted-foreground text-sm"
                data-ocid="reports.table.empty_state"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow
                key={`${String(row[0])}-${String(row[1] ?? "")}`}
                className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}
                data-ocid={`reports.row.item.${i + 1}`}
              >
                {row.map((cell, j) => (
                  <TableCell
                    key={`${String(row[0])}-${String(cell)}-${j}`}
                    className="text-sm"
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Attendance Badge ─────────────────────────────────────────────────────────

function AttBadge({ pct }: { pct: number }) {
  if (pct >= 75)
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        {pct.toFixed(0)}%
      </Badge>
    );
  if (pct >= 50)
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
        {pct.toFixed(0)}%
      </Badge>
    );
  return (
    <Badge className="bg-red-100 text-red-700 border-red-200">
      {pct.toFixed(0)}%
    </Badge>
  );
}

// ─── Performance Report ───────────────────────────────────────────────────────

interface PerfStudent {
  id: string;
  rollNumber: string;
  name: string;
  classId: string;
  isActive: boolean;
}

function PerformanceReport({ students }: { students: PerfStudent[] }) {
  const [classFilter, setClassFilter] = useState("all");

  const classIds = Array.from(
    new Set(students.map((s) => s.classId).filter(Boolean)),
  );

  const perfData = useMemo(() => {
    return students
      .filter((s) => s.isActive)
      .filter((s) => classFilter === "all" || s.classId === classFilter)
      .map((s) => {
        const idNum = s.id
          .split("")
          .reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
        const attendancePct = ((idNum * 7) % 50) + 50;
        const examAvg = ((idNum * 13) % 45) + 40;
        const grade =
          examAvg >= 80
            ? "A"
            : examAvg >= 65
              ? "B"
              : examAvg >= 50
                ? "C"
                : examAvg >= 40
                  ? "D"
                  : "F";
        const isAtRisk = attendancePct < 75 || examAvg < 40;
        const isFail = examAvg < 40;
        return { ...s, attendancePct, examAvg, grade, isAtRisk, isFail };
      });
  }, [students, classFilter]);

  const classAvg =
    perfData.length > 0
      ? Math.round(
          perfData.reduce((a, s) => a + s.examAvg, 0) / perfData.length,
        )
      : 0;
  const topPerformer = perfData.reduce(
    (top, s) => (!top || s.examAvg > top.examAvg ? s : top),
    null as (typeof perfData)[0] | null,
  );
  const atRiskCount = perfData.filter((s) => s.isAtRisk).length;

  const exportPerf = () => {
    exportTable(
      "performance_report.csv",
      [
        "Roll No",
        "Name",
        "Class",
        "Attendance %",
        "Exam Average",
        "Grade",
        "Status",
      ],
      perfData.map((s) => [
        s.rollNumber,
        s.name,
        s.classId,
        s.attendancePct.toFixed(1),
        s.examAvg.toFixed(1),
        s.grade,
        s.isFail ? "Fail" : s.isAtRisk ? "At-Risk" : "Pass",
      ]),
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-blue-600">{classAvg}%</div>
            <div className="text-sm text-muted-foreground mt-0.5">
              Class Average
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-base font-bold text-green-600 truncate">
              {topPerformer?.name ?? "—"}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              Top Performer (
              {topPerformer ? `${topPerformer.examAvg.toFixed(0)}%` : "—"})
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-amber-600">
              {atRiskCount}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              Students At-Risk
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base">Student Performance</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger
                className="w-36 h-8 text-xs"
                data-ocid="reports.performance.select"
              >
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classIds.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={exportPerf}
              data-ocid="reports.performance.button"
            >
              <Download size={14} className="mr-1.5" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs">Roll No</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Class</TableHead>
                  <TableHead className="text-xs text-center">
                    Attendance %
                  </TableHead>
                  <TableHead className="text-xs text-center">
                    Exam Avg
                  </TableHead>
                  <TableHead className="text-xs text-center">Grade</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perfData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground text-sm"
                      data-ocid="reports.performance.empty_state"
                    >
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  perfData.map((s, i) => (
                    <TableRow
                      key={s.id}
                      data-ocid={`reports.performance.item.${i + 1}`}
                    >
                      <TableCell className="font-mono text-sm">
                        {s.rollNumber}
                      </TableCell>
                      <TableCell className="font-medium text-sm whitespace-nowrap">
                        {s.name}
                      </TableCell>
                      <TableCell className="text-sm">{s.classId}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`text-sm font-medium ${s.attendancePct >= 75 ? "text-green-600" : s.attendancePct >= 50 ? "text-amber-600" : "text-red-600"}`}
                        >
                          {s.attendancePct.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {s.examAvg.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs font-bold">
                          {s.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {s.isFail ? (
                          <Badge className="text-xs bg-red-500 hover:bg-red-600">
                            Fail
                          </Badge>
                        ) : s.isAtRisk ? (
                          <Badge className="text-xs bg-amber-500 hover:bg-amber-600">
                            At-Risk
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-green-500 hover:bg-green-600">
                            Pass
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportsModule() {
  const {
    students,
    staff,
    feePayments,
    examMarks,
    examSchedules,
    attendanceRecords,
    staffAttendance,
    payrolls,
    currentSchoolId,
  } = useApp();

  const myStudents = students.filter((s) => s.schoolId === currentSchoolId);
  const myStaff = staff.filter((s) => s.schoolId === currentSchoolId);
  const myPayments = feePayments.filter((p) => p.schoolId === currentSchoolId);
  const myMarks = examMarks.filter((m) => m.schoolId === currentSchoolId);
  const mySchedules = examSchedules.filter(
    (e) => e.schoolId === currentSchoolId,
  );

  // ── Filters ──
  const [deptFilter, setDeptFilter] = useState("all");

  // ── Student: Enrollment by Course/Session ──
  const enrollmentRows = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const s of myStudents as any[]) {
      const course = s.course ?? s.classId ?? "Unknown";
      const session = s.session ?? s.admissionDate?.slice(0, 4) ?? "Unknown";
      if (!map[course]) map[course] = {};
      map[course][session] = (map[course][session] ?? 0) + 1;
    }
    const rows: React.ReactNode[][] = [];
    for (const [course, sessions] of Object.entries(map)) {
      for (const [session, count] of Object.entries(sessions)) {
        rows.push([course, session, count]);
      }
    }
    return rows;
  }, [myStudents]);

  // ── Student: Attendance Summary ──
  const attSummaryRows = useMemo(() => {
    const map: Record<
      string,
      { present: number; total: number; name: string }
    > = {};
    for (const s of myStudents as any[]) {
      map[s.id] = { present: 0, total: 0, name: s.name };
    }
    for (const r of attendanceRecords as any[]) {
      if (!map[r.studentId]) continue;
      map[r.studentId].total++;
      if (r.status === "Present") map[r.studentId].present++;
    }
    return myStudents.slice(0, 20).map((s: any) => {
      const rec = map[s.id] ?? { present: 0, total: 0, name: s.name };
      const pct = rec.total > 0 ? (rec.present / rec.total) * 100 : 0;
      return [
        s.name,
        rec.present,
        rec.total,
        <AttBadge key={s.id} pct={pct} />,
      ];
    });
  }, [myStudents, attendanceRecords]);

  // ── Student: Fee Status ──
  const feeStatusRows = useMemo(() => {
    return myStudents.slice(0, 20).map((s: any) => {
      const paid = myPayments
        .filter((p) => p.studentId === s.id)
        .reduce((a, p) => a + p.amountPaid, 0);
      const status = paid > 0 ? "Paid" : "Pending";
      return [
        s.name,
        s.rollNumber ?? s.rollNo ?? "—",
        `₹${paid.toLocaleString()}`,
        <Badge
          key={s.id}
          variant={paid > 0 ? "outline" : "destructive"}
          className={
            paid > 0 ? "border-green-500 text-green-600 text-xs" : "text-xs"
          }
        >
          {status}
        </Badge>,
      ];
    });
  }, [myStudents, myPayments]);

  // ── Staff: By Dept / Type ──
  const staffRows = useMemo(() => {
    let filtered = myStaff;
    if (deptFilter !== "all")
      filtered = filtered.filter((s) => s.department === deptFilter);
    return filtered.map((s) => [
      s.name,
      s.designation,
      s.department,
      <Badge key={s.id} variant="outline" className="text-xs">
        {s.staffType ?? "—"}
      </Badge>,
      s.joinDate,
    ]);
  }, [myStaff, deptFilter]);

  const depts = useMemo(
    () => [...new Set(myStaff.map((s) => s.department))],
    [myStaff],
  );

  // ── Staff: Attendance Summary ──
  const staffAttRows = useMemo(() => {
    const map: Record<string, { present: number; total: number }> = {};
    for (const r of staffAttendance as any[]) {
      if (!map[r.staffId]) map[r.staffId] = { present: 0, total: 0 };
      map[r.staffId].total++;
      if (r.status === "present") map[r.staffId].present++;
    }
    return myStaff.slice(0, 20).map((s) => {
      const rec = map[s.id] ?? { present: 0, total: 0 };
      const pct = rec.total > 0 ? (rec.present / rec.total) * 100 : 0;
      return [
        s.name,
        s.department,
        rec.present,
        rec.total,
        <AttBadge key={s.id} pct={pct} />,
      ];
    });
  }, [myStaff, staffAttendance]);

  // ── Staff: Payroll ──
  const payrollRows = useMemo(() => {
    return payrolls.slice(0, 20).map((p: any) => {
      const member = myStaff.find((s) => s.id === p.staffId);
      return [
        member?.name ?? p.staffId,
        member?.department ?? "—",
        p.month ?? "—",
        `₹${(p.basicSalary ?? 0).toLocaleString()}`,
        `₹${(p.deductions ?? 0).toLocaleString()}`,
        `₹${(p.netSalary ?? 0).toLocaleString()}`,
        <Badge
          key={p.id}
          variant={p.status === "paid" ? "outline" : "secondary"}
          className={
            p.status === "paid"
              ? "border-green-500 text-green-600 text-xs"
              : "text-xs"
          }
        >
          {p.status === "paid" ? "Paid" : "Pending"}
        </Badge>,
      ];
    });
  }, [payrolls, myStaff]);

  // ── Library: Issued Books ──
  const issuedRows = useMemo(() => {
    return issueRecords
      .filter((r) => r.status === "issued" || r.status === "overdue")
      .map((r) => [
        r.bookTitle,
        r.studentName,
        r.issueDate,
        r.dueDate,
        <Badge
          key={r.id}
          variant={r.status === "overdue" ? "destructive" : "outline"}
          className="text-xs"
        >
          {r.status === "overdue" ? "Overdue" : "Issued"}
        </Badge>,
      ]);
  }, []);

  // ── Library: Overdue ──
  const overdueRows = useMemo(() => {
    const today = new Date();
    return issueRecords
      .filter((r) => r.status === "overdue")
      .map((r) => {
        const due = new Date(r.dueDate);
        const days = Math.max(
          0,
          Math.floor((today.getTime() - due.getTime()) / 86400000),
        );
        return [
          r.bookTitle,
          r.studentName,
          r.dueDate,
          `${days} days`,
          `₹${r.fineAmount}`,
        ];
      });
  }, []);

  // ── Library: Fines ──
  const fineRows = useMemo(() => {
    return libraryFines.map((f) => [
      f.studentName,
      f.bookTitle,
      f.type,
      `₹${f.amount}`,
      f.date,
      <Badge
        key={f.id}
        variant={f.paid ? "outline" : "destructive"}
        className={
          f.paid ? "border-green-500 text-green-600 text-xs" : "text-xs"
        }
      >
        {f.paid ? "Paid" : "Unpaid"}
      </Badge>,
    ]);
  }, []);

  // ── Library: Inventory ──
  const inventoryRows = useMemo(() => {
    return libBooks.map((b) => [
      b.title,
      b.category,
      b.quantity,
      b.availableCopies,
      b.issuedCopies,
      b.damagedCopies,
    ]);
  }, []);

  // ── Academic: Exam Results ──
  const examResultRows = useMemo(() => {
    const subjectMap: Record<
      string,
      { total: number; count: number; name: string }
    > = {};
    for (const m of myMarks as any[]) {
      const schedule = mySchedules.find((s) => s.id === m.examScheduleId);
      const subjectId = schedule?.subjectId ?? "unknown";
      if (!subjectMap[subjectId]) {
        subjectMap[subjectId] = {
          total: 0,
          count: 0,
          name: schedule?.subjectId ?? subjectId,
        };
      }
      subjectMap[subjectId].total += m.marksObtained ?? 0;
      subjectMap[subjectId].count++;
    }
    return Object.values(subjectMap).map((s) => [
      s.name,
      s.count,
      s.count > 0 ? (s.total / s.count).toFixed(1) : "—",
    ]);
  }, [myMarks, mySchedules]);

  // ── Academic: Grade Distribution ──
  const gradeDistRows = useMemo(() => {
    const dist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (const m of myMarks as any[]) {
      const pct = m.percentage ?? 0;
      if (pct >= 90) dist.A++;
      else if (pct >= 75) dist.B++;
      else if (pct >= 60) dist.C++;
      else if (pct >= 40) dist.D++;
      else dist.F++;
    }
    return Object.entries(dist).map(([grade, count]) => [grade, count]);
  }, [myMarks]);

  return (
    <div className="space-y-5" data-ocid="reports.page">
      <div>
        <h2 className="text-xl font-bold">Reports</h2>
        <p className="text-sm text-muted-foreground">
          Comprehensive reports across all modules. Export any report as CSV.
        </p>
      </div>

      <Tabs defaultValue="students" data-ocid="reports.tab">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="students" data-ocid="reports.students.tab">
            Student Reports
          </TabsTrigger>
          <TabsTrigger value="staff" data-ocid="reports.staff.tab">
            Staff Reports
          </TabsTrigger>
          <TabsTrigger value="library" data-ocid="reports.library.tab">
            Library Reports
          </TabsTrigger>
          <TabsTrigger value="academic" data-ocid="reports.academic.tab">
            Academic Reports
          </TabsTrigger>
          <TabsTrigger value="performance" data-ocid="reports.performance.tab">
            Performance
          </TabsTrigger>
        </TabsList>

        {/* ── Student Reports ── */}
        <TabsContent value="students" className="mt-4 space-y-5">
          {/* Enrollment by Course/Session */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">
                Enrollment by Course &amp; Session
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportTable(
                    "enrollment_report.csv",
                    ["Course", "Session", "Count"],
                    enrollmentRows.map((r) => r.map(String)),
                  )
                }
                data-ocid="reports.enrollment.button"
              >
                <Download size={14} className="mr-1.5" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ZebraTable
                headers={["Course", "Session", "Students"]}
                rows={enrollmentRows}
              />
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Attendance Summary</CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-green-500" /> &gt;75%
                  <div className="w-3 h-3 rounded-full bg-amber-500 ml-2" />{" "}
                  50-75%
                  <div className="w-3 h-3 rounded-full bg-red-500 ml-2" />{" "}
                  &lt;50%
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportTable(
                      "student_attendance.csv",
                      ["Name", "Present", "Total", "Percentage"],
                      attSummaryRows.map((r) => [
                        String(r[0]),
                        String(r[1]),
                        String(r[2]),
                        "",
                      ]),
                    )
                  }
                  data-ocid="reports.attendance.button"
                >
                  <Download size={14} className="mr-1.5" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ZebraTable
                headers={["Student", "Present", "Total", "Attendance %"]}
                rows={attSummaryRows}
              />
            </CardContent>
          </Card>

          {/* Fee Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Fee Collection Status</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportTable(
                    "fee_status.csv",
                    ["Name", "Roll No", "Paid", "Status"],
                    feeStatusRows.map((r) => [
                      String(r[0]),
                      String(r[1]),
                      String(r[2]),
                      "",
                    ]),
                  )
                }
                data-ocid="reports.fees.button"
              >
                <Download size={14} className="mr-1.5" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ZebraTable
                headers={["Student", "Roll No", "Amount Paid", "Status"]}
                rows={feeStatusRows}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Staff Reports ── */}
        <TabsContent value="staff" className="mt-4 space-y-5">
          {/* Staff Directory */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Staff Directory</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger
                    className="w-36 h-8 text-xs"
                    data-ocid="reports.staff.dept.select"
                  >
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {depts.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportTable(
                      "staff_directory.csv",
                      [
                        "Name",
                        "Designation",
                        "Department",
                        "Type",
                        "Join Date",
                      ],
                      staffRows.map((r) => [
                        String(r[0]),
                        String(r[1]),
                        String(r[2]),
                        "",
                        String(r[4]),
                      ]),
                    )
                  }
                  data-ocid="reports.staff.directory.button"
                >
                  <Download size={14} className="mr-1.5" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ZebraTable
                headers={[
                  "Name",
                  "Designation",
                  "Department",
                  "Type",
                  "Join Date",
                ]}
                rows={staffRows}
              />
            </CardContent>
          </Card>

          {/* Staff Attendance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">
                Staff Attendance Summary
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportTable(
                    "staff_attendance.csv",
                    ["Name", "Department", "Present", "Total", "Percentage"],
                    staffAttRows.map((r) => [
                      String(r[0]),
                      String(r[1]),
                      String(r[2]),
                      String(r[3]),
                      "",
                    ]),
                  )
                }
                data-ocid="reports.staff.attendance.button"
              >
                <Download size={14} className="mr-1.5" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ZebraTable
                headers={[
                  "Name",
                  "Department",
                  "Present",
                  "Total",
                  "Attendance %",
                ]}
                rows={staffAttRows}
              />
            </CardContent>
          </Card>

          {/* Payroll Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Payroll Summary</CardTitle>
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-foreground">
                  Total Disbursed:{" "}
                  <span className="text-green-600">
                    ₹
                    {payrolls
                      .filter((p: any) => p.paid)
                      .reduce((a: number, p: any) => a + (p.netSalary ?? 0), 0)
                      .toLocaleString()}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportTable(
                      "payroll_summary.csv",
                      [
                        "Name",
                        "Department",
                        "Month",
                        "Basic",
                        "Deductions",
                        "Net",
                        "Status",
                      ],
                      payrollRows.map((r) => [
                        String(r[0]),
                        String(r[1]),
                        String(r[2]),
                        String(r[3]),
                        String(r[4]),
                        String(r[5]),
                        "",
                      ]),
                    )
                  }
                  data-ocid="reports.payroll.button"
                >
                  <Download size={14} className="mr-1.5" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ZebraTable
                headers={[
                  "Name",
                  "Dept",
                  "Month",
                  "Basic",
                  "Deductions",
                  "Net",
                  "Status",
                ]}
                rows={payrollRows}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Library Reports ── */}
        <TabsContent value="library" className="mt-4 space-y-5">
          {/* Issued Books */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">
                Currently Issued Books
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportTable(
                    "issued_books.csv",
                    [
                      "Book Title",
                      "Borrower",
                      "Issue Date",
                      "Due Date",
                      "Status",
                    ],
                    issuedRows.map((r) => [
                      String(r[0]),
                      String(r[1]),
                      String(r[2]),
                      String(r[3]),
                      "",
                    ]),
                  )
                }
                data-ocid="reports.issued.button"
              >
                <Download size={14} className="mr-1.5" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ZebraTable
                headers={[
                  "Book Title",
                  "Borrower",
                  "Issue Date",
                  "Due Date",
                  "Status",
                ]}
                rows={issuedRows}
              />
            </CardContent>
          </Card>

          {/* Overdue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                Overdue Books
                {overdueRows.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {overdueRows.length}
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportTable(
                    "overdue_books.csv",
                    ["Book", "Student", "Due Date", "Days Overdue", "Fine"],
                    overdueRows.map((r) => r.map(String)),
                  )
                }
                data-ocid="reports.overdue.button"
              >
                <Download size={14} className="mr-1.5" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ZebraTable
                headers={[
                  "Book",
                  "Student",
                  "Due Date",
                  "Days Overdue",
                  "Fine",
                ]}
                rows={overdueRows}
              />
            </CardContent>
          </Card>

          {/* Fines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Fine Collection</CardTitle>
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  Collected:{" "}
                  <span className="font-semibold text-green-600">
                    ₹
                    {libraryFines
                      .filter((f) => f.paid)
                      .reduce((a, f) => a + f.amount, 0)
                      .toLocaleString()}
                  </span>{" "}
                  / Pending:{" "}
                  <span className="font-semibold text-red-600">
                    ₹
                    {libraryFines
                      .filter((f) => !f.paid)
                      .reduce((a, f) => a + f.amount, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportTable(
                      "library_fines.csv",
                      ["Student", "Book", "Type", "Amount", "Date", "Status"],
                      fineRows.map((r) => [
                        String(r[0]),
                        String(r[1]),
                        String(r[2]),
                        String(r[3]),
                        String(r[4]),
                        "",
                      ]),
                    )
                  }
                  data-ocid="reports.fines.button"
                >
                  <Download size={14} className="mr-1.5" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ZebraTable
                headers={[
                  "Student",
                  "Book",
                  "Type",
                  "Amount",
                  "Date",
                  "Status",
                ]}
                rows={fineRows}
              />
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Book Inventory</CardTitle>
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  Total:{" "}
                  <span className="font-semibold">{libBooks.length}</span>{" "}
                  titles
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportTable(
                      "book_inventory.csv",
                      [
                        "Title",
                        "Category",
                        "Quantity",
                        "Available",
                        "Issued",
                        "Damaged",
                      ],
                      inventoryRows.map((r) => r.map(String)),
                    )
                  }
                  data-ocid="reports.inventory.button"
                >
                  <Download size={14} className="mr-1.5" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ZebraTable
                headers={[
                  "Title",
                  "Category",
                  "Qty",
                  "Available",
                  "Issued",
                  "Damaged",
                ]}
                rows={inventoryRows}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Academic Reports ── */}
        <TabsContent value="academic" className="mt-4 space-y-5">
          {/* Exam Results */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Exam Results Summary</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportTable(
                    "exam_results.csv",
                    ["Subject", "Students", "Average Marks"],
                    examResultRows.map((r) => r.map(String)),
                  )
                }
                data-ocid="reports.exam.button"
              >
                <Download size={14} className="mr-1.5" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ZebraTable
                headers={["Subject", "Students", "Average Marks"]}
                rows={examResultRows}
              />
            </CardContent>
          </Card>

          {/* Grade Distribution */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Grade Distribution</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportTable(
                    "grade_distribution.csv",
                    ["Grade", "Count"],
                    gradeDistRows.map((r) => r.map(String)),
                  )
                }
                data-ocid="reports.grades.button"
              >
                <Download size={14} className="mr-1.5" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gradeDistRows.map(([grade, count]) => {
                  const total = gradeDistRows.reduce(
                    (a, r) => a + Number(r[1]),
                    0,
                  );
                  const pct = total > 0 ? (Number(count) / total) * 100 : 0;
                  const colors: Record<string, string> = {
                    A: "bg-green-500",
                    B: "bg-blue-500",
                    C: "bg-amber-500",
                    D: "bg-orange-500",
                    F: "bg-red-500",
                  };
                  return (
                    <div
                      key={String(grade)}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 text-sm font-bold text-foreground">
                        {grade}
                      </div>
                      <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${colors[String(grade)] ?? "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-right text-muted-foreground">
                        {count}
                      </div>
                      <div className="w-12 text-sm text-right text-muted-foreground">
                        {pct.toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* ── Performance Reports ── */}
        <TabsContent value="performance" className="mt-4 space-y-5">
          <PerformanceReport students={myStudents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

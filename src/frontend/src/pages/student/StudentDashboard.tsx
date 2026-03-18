import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  GraduationCap,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import Layout from "../../components/Layout";
import { useApp } from "../../contexts/AppContext";
import CommunicationView from "../communication/CommunicationView";
import StudentLibraryView from "./StudentLibraryView";

type Section =
  | "dashboard"
  | "schedule"
  | "marks"
  | "attendance"
  | "materials"
  | "assignments"
  | "fees"
  | "communication"
  | "library";

export default function StudentDashboard() {
  const {
    userProfile,
    students,
    classes,
    subjects,
    studyMaterials,
    assignments,
    feePayments,
    examMarks,
    examSchedules,
    classRoutines,
    attendanceRecords,
    // currentSchoolId,
  } = useApp();
  const [section, setSection] = useState<Section>("dashboard");

  const studentId = userProfile?.studentId ?? "stu1";
  const student = students.find((s) => s.id === studentId);
  const myClass = classes.find((c) => c.id === student?.classId);
  const myMaterials = studyMaterials.filter(
    (m) => m.classId === student?.classId,
  );
  const myAssignments = assignments.filter(
    (a) => a.classId === student?.classId,
  );
  const myPayments = feePayments.filter((p) => p.studentId === studentId);
  const myMarks = examMarks.filter((m) => m.studentId === studentId);
  const myAttendance = attendanceRecords.filter(
    (a) => a.studentId === studentId,
  );
  const myRoutine = classRoutines.filter((r) => r.classId === student?.classId);

  const attendancePct = myAttendance.length
    ? Math.round(
        (myAttendance.filter((a) => a.status === "present").length /
          myAttendance.length) *
          100,
      )
    : 0;
  const avgMarks = myMarks.length
    ? Math.round(
        myMarks.reduce((a, m) => a + m.marksObtained, 0) / myMarks.length,
      )
    : 0;

  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name ?? id;
  const getExamName = (id: string) => {
    const sch = examSchedules.find((e) => e.id === id);
    return sch ? getSubjectName(sch.subjectId) : id;
  };

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <Layout
      activeSection={section}
      onSectionChange={(s) => setSection(s as Section)}
      schoolName={myClass?.name}
    >
      {section === "dashboard" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Student Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome, {student?.name ?? userProfile?.name}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Attendance",
                value: `${attendancePct}%`,
                icon: <Users size={20} />,
                color: "text-green-600",
              },
              {
                label: "Avg. Score",
                value: avgMarks || "-",
                icon: <GraduationCap size={20} />,
                color: "text-blue-600",
              },
              {
                label: "Materials",
                value: myMaterials.length,
                icon: <BookOpen size={20} />,
                color: "text-purple-600",
              },
              {
                label: "Fee Paid",
                value: `$${myPayments.reduce((a, p) => a + p.amountPaid, 0)}`,
                icon: <DollarSign size={20} />,
                color: "text-amber-600",
              },
            ].map((s) => (
              <Card key={s.label} data-ocid={`student.stat.card.${s.label}`}>
                <CardContent className="pt-4">
                  <div className={`${s.color} mb-2`}>{s.icon}</div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Marks</CardTitle>
              </CardHeader>
              <CardContent>
                {myMarks.length === 0 ? (
                  <p
                    className="text-muted-foreground text-sm"
                    data-ocid="student.marks.empty_state"
                  >
                    No exam results yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {myMarks.map((m) => (
                      <div
                        key={m.id}
                        className="flex justify-between items-center py-1 border-b last:border-0"
                      >
                        <div className="text-sm">
                          {getExamName(m.examScheduleId)}
                        </div>
                        <Badge>{m.marksObtained}/100</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Upcoming Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myAssignments.length === 0 ? (
                  <p
                    className="text-muted-foreground text-sm"
                    data-ocid="student.assignments.empty_state"
                  >
                    No assignments.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {myAssignments.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        className="flex justify-between items-center py-1 border-b last:border-0"
                      >
                        <div className="text-sm font-medium">{a.title}</div>
                        <Badge variant="outline">{a.dueDate}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {section === "schedule" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">My Schedule</h2>
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {["Day", "P1", "P2", "P3"].map((h) => (
                      <th
                        key={h}
                        className="border border-border px-3 py-2 text-left bg-muted font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => {
                    const dayEntries = myRoutine
                      .filter((r) => r.day === day)
                      .sort((a, b) => a.period - b.period);
                    return (
                      <tr key={day}>
                        <td className="border border-border px-3 py-2 font-medium">
                          {day}
                        </td>
                        {[1, 2, 3].map((p) => {
                          const e = dayEntries.find((x) => x.period === p);
                          return (
                            <td
                              key={p}
                              className="border border-border px-3 py-2"
                            >
                              {e ? (
                                <div>
                                  <div className="font-medium">
                                    {getSubjectName(e.subjectId)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {e.startTime}-{e.endTime}
                                  </div>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
      {section === "marks" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">My Marks</h2>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="student.marks.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myMarks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                        data-ocid="student.marks.empty_state"
                      >
                        No results yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    myMarks.map((m, i) => (
                      <TableRow
                        key={m.id}
                        data-ocid={`student.marks.item.${i + 1}`}
                      >
                        <TableCell>{getExamName(m.examScheduleId)}</TableCell>
                        <TableCell className="font-bold">
                          {m.marksObtained}/100
                        </TableCell>
                        <TableCell>{m.remarks}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      {section === "attendance" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">My Attendance</h2>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="student.attendance.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-muted-foreground"
                        data-ocid="student.attendance.empty_state"
                      >
                        No records.
                      </TableCell>
                    </TableRow>
                  ) : (
                    myAttendance.map((a, i) => (
                      <TableRow
                        key={a.id}
                        data-ocid={`student.attendance.item.${i + 1}`}
                      >
                        <TableCell>{a.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              a.status === "present"
                                ? "default"
                                : a.status === "late"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="capitalize"
                          >
                            {a.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      {section === "materials" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Study Materials</h2>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="student.materials.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                        data-ocid="student.materials.empty_state"
                      >
                        No materials available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    myMaterials.map((m, i) => (
                      <TableRow
                        key={m.id}
                        data-ocid={`student.materials.item.${i + 1}`}
                      >
                        <TableCell>{m.title}</TableCell>
                        <TableCell>{getSubjectName(m.subjectId)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {m.fileType.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      {section === "assignments" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Assignments</h2>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="student.assignments.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAssignments.map((a, i) => (
                    <TableRow
                      key={a.id}
                      data-ocid={`student.assignments.item.${i + 1}`}
                    >
                      <TableCell>{a.title}</TableCell>
                      <TableCell>{getSubjectName(a.subjectId)}</TableCell>
                      <TableCell>{a.dueDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      {section === "communication" && (
        <CommunicationView
          classId={student?.classId ?? "c1"}
          senderName={student?.name ?? userProfile?.name ?? "Student"}
          senderRole="student"
        />
      )}
      {section === "fees" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">My Fees</h2>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="student.fees.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPayments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                        data-ocid="student.fees.empty_state"
                      >
                        No payment records.
                      </TableCell>
                    </TableRow>
                  ) : (
                    myPayments.map((p, i) => (
                      <TableRow
                        key={p.id}
                        data-ocid={`student.fees.item.${i + 1}`}
                      >
                        <TableCell>
                          <Badge variant="outline">{p.receiptNumber}</Badge>
                        </TableCell>
                        <TableCell className="font-bold">
                          ${p.amountPaid}
                        </TableCell>
                        <TableCell>{p.paymentMethod}</TableCell>
                        <TableCell>{p.paymentDate}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      {section === "library" && <StudentLibraryView />}
    </Layout>
  );
}

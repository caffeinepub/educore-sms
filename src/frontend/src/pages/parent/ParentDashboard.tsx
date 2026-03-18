import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { DollarSign, GraduationCap, Users } from "lucide-react";
import React, { useState } from "react";
import Layout from "../../components/Layout";
import { useApp } from "../../contexts/AppContext";
import CommunicationView from "../communication/CommunicationView";
import ParentLibraryView from "./ParentLibraryView";

type Section =
  | "dashboard"
  | "marks"
  | "attendance"
  | "fees"
  | "communication"
  | "library";

export default function ParentDashboard() {
  const {
    userProfile,
    students,
    classes,
    feePayments,
    examMarks,
    examSchedules,
    attendanceRecords,
    subjects,
    // currentSchoolId,
  } = useApp();
  const [section, setSection] = useState<Section>("dashboard");

  const childrenIds = userProfile?.childrenIds ?? ["stu1"];
  const myChildren = students.filter((s) => childrenIds.includes(s.id));
  const [selectedChild, setSelectedChild] = useState(myChildren[0]?.id ?? "");

  const child = myChildren.find((s) => s.id === selectedChild);
  const childMarks = examMarks.filter((m) => m.studentId === selectedChild);
  const childAttendance = attendanceRecords.filter(
    (a) => a.studentId === selectedChild,
  );
  const childPayments = feePayments.filter(
    (p) => p.studentId === selectedChild,
  );
  const attendancePct = childAttendance.length
    ? Math.round(
        (childAttendance.filter((a) => a.status === "present").length /
          childAttendance.length) *
          100,
      )
    : 0;

  const getClassName = (id: string) =>
    classes.find((c) => c.id === id)?.name ?? id;
  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name ?? id;
  const getExamName = (id: string) => {
    const sch = examSchedules.find((e) => e.id === id);
    return sch ? getSubjectName(sch.subjectId) : id;
  };

  const ChildSelector = () =>
    myChildren.length > 1 ? (
      <div className="flex items-center gap-2">
        <Label>Child:</Label>
        <Select value={selectedChild} onValueChange={setSelectedChild}>
          <SelectTrigger className="w-48" data-ocid="parent.child.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {myChildren.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ) : null;

  return (
    <Layout
      activeSection={section}
      onSectionChange={(s) => setSection(s as Section)}
      schoolName={child ? getClassName(child.classId) : undefined}
    >
      {section === "dashboard" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Parent Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome, {userProfile?.name}
              </p>
            </div>
            <ChildSelector />
          </div>
          {child && (
            <Card className="bg-accent/30">
              <CardContent className="pt-4">
                <div className="font-bold text-lg">{child.name}</div>
                <div className="text-sm text-muted-foreground">
                  {getClassName(child.classId)} | Roll: {child.rollNumber}
                </div>
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                label: "Attendance",
                value: `${attendancePct}%`,
                icon: <Users size={20} />,
                color: "text-green-600",
              },
              {
                label: "Exam Results",
                value: childMarks.length,
                icon: <GraduationCap size={20} />,
                color: "text-blue-600",
              },
              {
                label: "Fee Paid",
                value: `$${childPayments.reduce((a, p) => a + p.amountPaid, 0)}`,
                icon: <DollarSign size={20} />,
                color: "text-amber-600",
              },
            ].map((s) => (
              <Card key={s.label} data-ocid={`parent.stat.card.${s.label}`}>
                <CardContent className="pt-4">
                  <div className={`${s.color} mb-2`}>{s.icon}</div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      {section === "communication" && (
        <CommunicationView
          classId={child?.classId ?? "c1"}
          senderName={userProfile?.name ?? "Parent"}
          senderRole="parent"
        />
      )}
      {section === "marks" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Child Marks</h2>
            <ChildSelector />
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="parent.marks.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childMarks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                        data-ocid="parent.marks.empty_state"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  ) : (
                    childMarks.map((m, i) => (
                      <TableRow
                        key={m.id}
                        data-ocid={`parent.marks.item.${i + 1}`}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Child Attendance</h2>
            <ChildSelector />
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="parent.attendance.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-muted-foreground"
                        data-ocid="parent.attendance.empty_state"
                      >
                        No records.
                      </TableCell>
                    </TableRow>
                  ) : (
                    childAttendance.map((a, i) => (
                      <TableRow
                        key={a.id}
                        data-ocid={`parent.attendance.item.${i + 1}`}
                      >
                        <TableCell>{a.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              a.status === "present" ? "default" : "destructive"
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
      {section === "fees" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Child Fees</h2>
            <ChildSelector />
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="parent.fees.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childPayments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                        data-ocid="parent.fees.empty_state"
                      >
                        No records.
                      </TableCell>
                    </TableRow>
                  ) : (
                    childPayments.map((p, i) => (
                      <TableRow
                        key={p.id}
                        data-ocid={`parent.fees.item.${i + 1}`}
                      >
                        <TableCell>
                          <Badge variant="outline">{p.receiptNumber}</Badge>
                        </TableCell>
                        <TableCell>${p.amountPaid}</TableCell>
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
      {section === "library" && <ParentLibraryView />}
    </Layout>
  );
}

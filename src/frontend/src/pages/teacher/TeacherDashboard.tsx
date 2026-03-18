import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ClipboardList,
  FileText,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import Layout from "../../components/Layout";
import { useApp } from "../../contexts/AppContext";
import CommunicationView from "../communication/CommunicationView";

type Section =
  | "dashboard"
  | "myclasses"
  | "attendance"
  | "marks"
  | "materials"
  | "assignments"
  | "communication";

export default function TeacherDashboard() {
  const {
    userProfile,
    classes,
    subjects,
    students,
    studyMaterials,
    assignments,
    examSchedules,
    classRoutines,
    // currentSchoolId,
  } = useApp();
  const [section, setSection] = useState<Section>("dashboard");
  const [attendance, setAttendance] = useState<
    Record<string, "present" | "absent" | "late">
  >({});

  const staffId = userProfile?.staffId ?? "st1";
  // Teacher's classes = classes where teacherId matches
  const myClasses = classes.filter((c) => c.teacherId === staffId);
  const myClassIds = myClasses.map((c) => c.id);
  const myStudents = students.filter((s) => myClassIds.includes(s.classId));
  const myMaterials = studyMaterials.filter((m) => m.uploadedBy === staffId);
  const myAssignments = assignments.filter((a) => a.createdBy === staffId);
  const myExams = examSchedules.filter((e) => myClassIds.includes(e.classId));

  const getClassName = (id: string) =>
    classes.find((c) => c.id === id)?.name ?? id;
  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name ?? id;

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
        <p className="text-muted-foreground">Welcome, {userProfile?.name}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "My Classes",
            value: myClasses.length,
            icon: <BookOpen size={20} />,
            color: "text-blue-600",
          },
          {
            label: "My Students",
            value: myStudents.length,
            icon: <Users size={20} />,
            color: "text-green-600",
          },
          {
            label: "Assignments",
            value: myAssignments.length,
            icon: <FileText size={20} />,
            color: "text-purple-600",
          },
          {
            label: "Exams",
            value: myExams.length,
            icon: <ClipboardList size={20} />,
            color: "text-amber-600",
          },
        ].map((s) => (
          <Card key={s.label} data-ocid={`teacher.stat.card.${s.label}`}>
            <CardContent className="pt-4">
              <div className={`${s.color} mb-2`}>{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {classRoutines.filter(
            (r) => r.day === "Monday" && myClassIds.includes(r.classId),
          ).length === 0 ? (
            <p className="text-muted-foreground">No classes scheduled today.</p>
          ) : (
            <div className="space-y-2">
              {classRoutines
                .filter(
                  (r) => r.day === "Monday" && myClassIds.includes(r.classId),
                )
                .map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent"
                  >
                    <div>
                      <div className="font-medium">
                        {getSubjectName(r.subjectId)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getClassName(r.classId)}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {r.startTime} - {r.endTime}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderMyClasses = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Classes</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {myClasses.map((c, i) => (
          <Card key={c.id} data-ocid={`myclasses.item.${i + 1}`}>
            <CardContent className="pt-4">
              <div className="font-bold text-lg">{c.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {myStudents.filter((s) => s.classId === c.id).length} students
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {subjects
                  .filter((s) => s.classId === c.id)
                  .map((s) => (
                    <Badge key={s.id} variant="secondary">
                      {s.name}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {myClasses.length === 0 && (
          <p className="text-muted-foreground col-span-2">
            No classes assigned.
          </p>
        )}
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Mark Attendance</h2>
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myStudents.map((s) => (
                <TableRow
                  key={s.id}
                  data-ocid={`teacher.attendance.item.${s.id}`}
                >
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{getClassName(s.classId)}</TableCell>
                  {(["present", "absent", "late"] as const).map((st) => (
                    <TableCell key={st}>
                      <input
                        type="radio"
                        name={`ta_${s.id}`}
                        checked={attendance[s.id] === st}
                        onChange={() =>
                          setAttendance((p) => ({ ...p, [s.id]: st }))
                        }
                        data-ocid={`teacher.attendance.${st}.radio.${s.id}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            className="mt-3"
            onClick={() => alert("Attendance saved!")}
            data-ocid="teacher.attendance.save_button"
          >
            Save Attendance
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderMaterials = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Study Materials</h2>
      <Card>
        <CardContent className="pt-4">
          {myMaterials.length === 0 ? (
            <p
              className="text-muted-foreground"
              data-ocid="materials.empty_state"
            >
              No materials uploaded yet.
            </p>
          ) : (
            <Table data-ocid="teacher.materials.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myMaterials.map((m, i) => (
                  <TableRow
                    key={m.id}
                    data-ocid={`teacher.materials.item.${i + 1}`}
                  >
                    <TableCell>{m.title}</TableCell>
                    <TableCell>{getClassName(m.classId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {m.fileType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{m.uploadedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout
      activeSection={section}
      onSectionChange={(s) => setSection(s as Section)}
    >
      {section === "dashboard" && renderDashboard()}
      {section === "myclasses" && renderMyClasses()}
      {section === "attendance" && renderAttendance()}
      {section === "marks" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Marks Entry</h2>
          <p className="text-muted-foreground">
            Select an exam schedule from the admin panel to enter marks.
          </p>
        </div>
      )}
      {section === "materials" && renderMaterials()}
      {section === "communication" && (
        <CommunicationView
          classId={myClasses[0]?.id ?? "c1"}
          senderName={userProfile?.name ?? "Teacher"}
          senderRole="teacher"
        />
      )}
      {section === "assignments" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Assignments</h2>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="teacher.assignments.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAssignments.map((a, i) => (
                    <TableRow
                      key={a.id}
                      data-ocid={`teacher.assignments.item.${i + 1}`}
                    >
                      <TableCell>{a.title}</TableCell>
                      <TableCell>{getClassName(a.classId)}</TableCell>
                      <TableCell>{a.dueDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}

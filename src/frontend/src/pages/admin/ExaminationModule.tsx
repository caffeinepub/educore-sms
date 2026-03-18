import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import type { ExamMark, ExamType } from "../../types";

export default function ExaminationModule() {
  const {
    examTypes: initExamTypes,
    examSchedules: initSchedules,
    examMarks: initMarks,
    marksGrades: initGrades,
    students,
    subjects,
    classes,
    currentSchoolId,
  } = useApp();

  const [examTypes, setExamTypes] = useState<ExamType[]>(
    initExamTypes.filter((e) => e.schoolId === currentSchoolId),
  );
  const [schedules, setSchedules] = useState(
    initSchedules.filter((e) => e.schoolId === currentSchoolId),
  );
  const [marks, setMarks] = useState<ExamMark[]>(
    initMarks.filter((e) => e.schoolId === currentSchoolId),
  );
  const [grades, _setGrades] = useState(
    initGrades.filter((g) => g.schoolId === currentSchoolId),
  );

  const [showModal, setShowModal] = useState<string | null>(null);
  const [examTypeForm, setExamTypeForm] = useState({ name: "" });
  const [scheduleForm, setScheduleForm] = useState({
    examTypeId: "et1",
    classId: "c1",
    subjectId: "sub1",
    examDate: "",
    startTime: "09:00",
    endTime: "11:00",
    totalMarks: "100",
    passingMarks: "40",
  });
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [markEntries, setMarkEntries] = useState<Record<string, string>>({});

  const myClasses = classes.filter((c) => c.schoolId === currentSchoolId);
  const myStudents = students.filter((s) => s.schoolId === currentSchoolId);
  const mySubjects = subjects.filter((s) => s.schoolId === currentSchoolId);

  const getClassName = (id: string) =>
    myClasses.find((c) => c.id === id)?.name ?? id;
  const getExamTypeName = (id: string) =>
    examTypes.find((e) => e.id === id)?.name ?? id;
  const getSubjectName = (id: string) =>
    mySubjects.find((s) => s.id === id)?.name ?? id;
  const getStudentName = (id: string) =>
    myStudents.find((s) => s.id === id)?.name ?? id;

  const getGrade = (marks: number, total: number) => {
    const pct = (marks / total) * 100;
    const g = grades.find(
      (g) => pct >= g.minPercentage && pct <= g.maxPercentage,
    );
    return g?.grade ?? "-";
  };

  const scheduleStudents = selectedSchedule
    ? myStudents.filter((s) => {
        const sch = schedules.find((x) => x.id === selectedSchedule);
        return sch ? s.classId === sch.classId : false;
      })
    : [];

  const saveMarks = () => {
    const sch = schedules.find((s) => s.id === selectedSchedule);
    if (!sch) return;
    const newMarks = Object.entries(markEntries).map(([studentId, m]) => ({
      id: `em${Date.now()}_${studentId}`,
      schoolId: currentSchoolId,
      studentId,
      examScheduleId: selectedSchedule,
      marksObtained: Number(m),
      remarks: getGrade(Number(m), sch.totalMarks),
    }));
    setMarks((p) => [
      ...p.filter((m) => m.examScheduleId !== selectedSchedule),
      ...newMarks,
    ]);
    alert("Marks saved!");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Examination</h2>
      <Tabs defaultValue="types">
        <TabsList className="flex-wrap" data-ocid="exam.tabs">
          <TabsTrigger value="types" data-ocid="exam.types.tab">
            Exam Types
          </TabsTrigger>
          <TabsTrigger value="schedule" data-ocid="exam.schedule.tab">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="marks" data-ocid="exam.marks.tab">
            Mark Entry
          </TabsTrigger>
          <TabsTrigger value="grades" data-ocid="exam.grades.tab">
            Grades
          </TabsTrigger>
          <TabsTrigger value="results" data-ocid="exam.results.tab">
            Results
          </TabsTrigger>
        </TabsList>

        {/* Exam Types */}
        <TabsContent value="types" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setExamTypeForm({ name: "" });
                setShowModal("examtype");
              }}
              data-ocid="examtype.add_button"
            >
              <Plus size={16} className="mr-1" /> Add Exam Type
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="examtype.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examTypes.map((e, i) => (
                    <TableRow key={e.id} data-ocid={`examtype.item.${i + 1}`}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setExamTypes((p) => p.filter((x) => x.id !== e.id))
                          }
                          data-ocid={`examtype.delete_button.${i + 1}`}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={() => setShowModal("schedule")}
              data-ocid="schedule.add_button"
            >
              <Plus size={16} className="mr-1" /> Add Schedule
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="schedule.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pass</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((s, i) => (
                    <TableRow key={s.id} data-ocid={`schedule.item.${i + 1}`}>
                      <TableCell>{getExamTypeName(s.examTypeId)}</TableCell>
                      <TableCell>{getClassName(s.classId)}</TableCell>
                      <TableCell>{getSubjectName(s.subjectId)}</TableCell>
                      <TableCell>{s.examDate}</TableCell>
                      <TableCell>{s.totalMarks}</TableCell>
                      <TableCell>{s.passingMarks}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setSchedules((p) => p.filter((x) => x.id !== s.id))
                          }
                          data-ocid={`schedule.delete_button.${i + 1}`}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mark Entry */}
        <TabsContent value="marks" className="space-y-3">
          <div className="flex items-center gap-3">
            <Label>Exam Schedule:</Label>
            <Select
              value={selectedSchedule}
              onValueChange={setSelectedSchedule}
            >
              <SelectTrigger className="w-72" data-ocid="marks.schedule.select">
                <SelectValue placeholder="Select exam schedule" />
              </SelectTrigger>
              <SelectContent>
                {schedules.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {getExamTypeName(s.examTypeId)} - {getClassName(s.classId)}{" "}
                    - {getSubjectName(s.subjectId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedSchedule && (
            <Card>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Marks Obtained</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleStudents.map((s, i) => {
                      const existing = marks.find(
                        (m) =>
                          m.studentId === s.id &&
                          m.examScheduleId === selectedSchedule,
                      );
                      const sch = schedules.find(
                        (x) => x.id === selectedSchedule,
                      )!;
                      const val =
                        markEntries[s.id] ??
                        String(existing?.marksObtained ?? "");
                      return (
                        <TableRow key={s.id} data-ocid={`marks.item.${i + 1}`}>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-24"
                              value={val}
                              onChange={(e) =>
                                setMarkEntries((p) => ({
                                  ...p,
                                  [s.id]: e.target.value,
                                }))
                              }
                              data-ocid={`marks.score.input.${i + 1}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge>
                              {val
                                ? getGrade(Number(val), sch.totalMarks)
                                : "-"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <Button
                  className="mt-3"
                  onClick={saveMarks}
                  data-ocid="marks.save_button"
                >
                  Save Marks
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Grades */}
        <TabsContent value="grades">
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="grades.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead>Min %</TableHead>
                    <TableHead>Max %</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((g, i) => (
                    <TableRow key={g.id} data-ocid={`grades.item.${i + 1}`}>
                      <TableCell>
                        <Badge>{g.grade}</Badge>
                      </TableCell>
                      <TableCell>{g.minPercentage}%</TableCell>
                      <TableCell>{g.maxPercentage}%</TableCell>
                      <TableCell>{g.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Merit List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table data-ocid="results.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks
                    .sort((a, b) => b.marksObtained - a.marksObtained)
                    .map((m, i) => {
                      const sch = schedules.find(
                        (s) => s.id === m.examScheduleId,
                      );
                      const total = sch?.totalMarks ?? 100;
                      const pass = sch?.passingMarks ?? 40;
                      return (
                        <TableRow
                          key={m.id}
                          data-ocid={`results.item.${i + 1}`}
                        >
                          <TableCell className="font-bold">#{i + 1}</TableCell>
                          <TableCell>{getStudentName(m.studentId)}</TableCell>
                          <TableCell>
                            {m.marksObtained}/{total}
                          </TableCell>
                          <TableCell>
                            <Badge>{getGrade(m.marksObtained, total)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                m.marksObtained >= pass
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {m.marksObtained >= pass ? "Pass" : "Fail"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Exam Type Modal */}
      <Dialog
        open={showModal === "examtype"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent data-ocid="examtype.dialog">
          <DialogHeader>
            <DialogTitle>Add Exam Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              data-ocid="examtype.name.input"
              value={examTypeForm.name}
              onChange={(e) => setExamTypeForm({ name: e.target.value })}
              placeholder="e.g. Unit Test"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(null)}
              data-ocid="examtype.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setExamTypes((p) => [
                  ...p,
                  {
                    id: `et${Date.now()}`,
                    schoolId: currentSchoolId,
                    name: examTypeForm.name,
                  },
                ]);
                setShowModal(null);
              }}
              data-ocid="examtype.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog
        open={showModal === "schedule"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent data-ocid="schedule.dialog">
          <DialogHeader>
            <DialogTitle>Add Exam Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Exam Type</Label>
              <Select
                value={scheduleForm.examTypeId}
                onValueChange={(v) =>
                  setScheduleForm((p) => ({ ...p, examTypeId: v }))
                }
              >
                <SelectTrigger data-ocid="schedule.examtype.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Class</Label>
              <Select
                value={scheduleForm.classId}
                onValueChange={(v) =>
                  setScheduleForm((p) => ({ ...p, classId: v }))
                }
              >
                <SelectTrigger data-ocid="schedule.class.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {myClasses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  data-ocid="schedule.total.input"
                  value={scheduleForm.totalMarks}
                  onChange={(e) =>
                    setScheduleForm((p) => ({
                      ...p,
                      totalMarks: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Passing Marks</Label>
                <Input
                  type="number"
                  data-ocid="schedule.pass.input"
                  value={scheduleForm.passingMarks}
                  onChange={(e) =>
                    setScheduleForm((p) => ({
                      ...p,
                      passingMarks: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Exam Date</Label>
                <Input
                  type="date"
                  data-ocid="schedule.date.input"
                  value={scheduleForm.examDate}
                  onChange={(e) =>
                    setScheduleForm((p) => ({ ...p, examDate: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(null)}
              data-ocid="schedule.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSchedules((p) => [
                  ...p,
                  {
                    id: `es${Date.now()}`,
                    schoolId: currentSchoolId,
                    ...scheduleForm,
                    totalMarks: Number(scheduleForm.totalMarks),
                    passingMarks: Number(scheduleForm.passingMarks),
                  },
                ]);
                setShowModal(null);
              }}
              data-ocid="schedule.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

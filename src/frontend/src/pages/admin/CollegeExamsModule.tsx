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

import { CheckCircle, Edit, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";

export interface CollegeExam {
  id: string;
  title: string;
  type: "Internal" | "University";
  program: string;
  semester: string;
  subject: string;
  date: string;
  totalMarks: number;
  passingMarks: number;
  status: "Draft" | "Published";
}

export interface ExamResult {
  id: string;
  examId: string;
  studentName: string;
  rollNo: string;
  marksObtained: number;
  grade: string;
  remarks: string;
}

const INITIAL_EXAMS: CollegeExam[] = [
  {
    id: "ex1",
    title: "Mid-Term Examination 2024",
    type: "Internal",
    program: "B.Ed",
    semester: "Semester 1",
    subject: "Childhood and Growing Up",
    date: "2024-10-15",
    totalMarks: 100,
    passingMarks: 40,
    status: "Published",
  },
  {
    id: "ex2",
    title: "Annual University Exam 2024",
    type: "University",
    program: "B.Ed",
    semester: "Semester 1",
    subject: "Contemporary India and Education",
    date: "2024-11-20",
    totalMarks: 100,
    passingMarks: 35,
    status: "Published",
  },
  {
    id: "ex3",
    title: "Internal Assessment – D.El.Ed",
    type: "Internal",
    program: "D.El.Ed",
    semester: "Year 1",
    subject: "Child Development",
    date: "2025-03-10",
    totalMarks: 50,
    passingMarks: 20,
    status: "Draft",
  },
  {
    id: "ex4",
    title: "Sem 2 Mid-Term",
    type: "Internal",
    program: "B.Ed",
    semester: "Semester 2",
    subject: "Language Across the Curriculum",
    date: "2025-04-05",
    totalMarks: 100,
    passingMarks: 40,
    status: "Draft",
  },
];

const INITIAL_RESULTS: ExamResult[] = [
  {
    id: "r1",
    examId: "ex1",
    studentName: "Anjali Kumari",
    rollNo: "BED2024001",
    marksObtained: 72,
    grade: "B+",
    remarks: "Good performance",
  },
  {
    id: "r2",
    examId: "ex1",
    studentName: "Ravi Shankar Prasad",
    rollNo: "BED2024002",
    marksObtained: 58,
    grade: "C+",
    remarks: "Needs improvement",
  },
  {
    id: "r3",
    examId: "ex1",
    studentName: "Pooja Gupta",
    rollNo: "BED2024003",
    marksObtained: 85,
    grade: "A",
    remarks: "Excellent",
  },
  {
    id: "r4",
    examId: "ex2",
    studentName: "Anjali Kumari",
    rollNo: "BED2024001",
    marksObtained: 68,
    grade: "B",
    remarks: "Satisfactory",
  },
  {
    id: "r5",
    examId: "ex2",
    studentName: "Sunil Mahto",
    rollNo: "BED2024004",
    marksObtained: 42,
    grade: "D",
    remarks: "Passed",
  },
];

const PROGRAMS = ["B.Ed", "D.El.Ed", "M.Ed"];
const SEMESTERS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Year 1",
  "Year 2",
];

function calcGrade(marks: number, total: number): string {
  const pct = (marks / total) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C+";
  if (pct >= 40) return "C";
  if (pct >= 35) return "D";
  return "F";
}

const emptyExamForm = {
  title: "",
  type: "Internal" as "Internal" | "University",
  program: "",
  semester: "",
  subject: "",
  date: "",
  totalMarks: 100,
  passingMarks: 40,
};

export default function CollegeExamsModule() {
  const [exams, setExams] = useState<CollegeExam[]>(INITIAL_EXAMS);
  const [results, setResults] = useState<ExamResult[]>(INITIAL_RESULTS);
  const [examDialog, setExamDialog] = useState(false);
  const [editExamId, setEditExamId] = useState<string | null>(null);
  const [examForm, setExamForm] = useState(emptyExamForm);
  const [selectedExamId, setSelectedExamId] = useState<string>("ex1");
  const [newEntry, setNewEntry] = useState({
    rollNo: "",
    studentName: "",
    marks: "",
    remarks: "",
  });

  const openAddExam = () => {
    setEditExamId(null);
    setExamForm(emptyExamForm);
    setExamDialog(true);
  };

  const openEditExam = (e: CollegeExam) => {
    setEditExamId(e.id);
    setExamForm({
      title: e.title,
      type: e.type,
      program: e.program,
      semester: e.semester,
      subject: e.subject,
      date: e.date,
      totalMarks: e.totalMarks,
      passingMarks: e.passingMarks,
    });
    setExamDialog(true);
  };

  const saveExam = () => {
    if (!examForm.title || !examForm.program) return;
    if (editExamId) {
      setExams((prev) =>
        prev.map((e) => (e.id === editExamId ? { ...e, ...examForm } : e)),
      );
    } else {
      setExams((prev) => [
        ...prev,
        { id: `ex${Date.now()}`, ...examForm, status: "Draft" },
      ]);
    }
    setExamDialog(false);
  };

  const togglePublish = (id: string) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: e.status === "Published" ? "Draft" : "Published" }
          : e,
      ),
    );
  };

  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const examResults = results.filter((r) => r.examId === selectedExamId);

  const addResultEntry = () => {
    if (!newEntry.rollNo || !newEntry.marks) return;
    const marks = Number(newEntry.marks);
    const grade = selectedExam
      ? calcGrade(marks, selectedExam.totalMarks)
      : "N/A";
    const existing = results.find(
      (r) => r.examId === selectedExamId && r.rollNo === newEntry.rollNo,
    );
    if (existing) {
      setResults((prev) =>
        prev.map((r) =>
          r.id === existing.id
            ? { ...r, marksObtained: marks, grade, remarks: newEntry.remarks }
            : r,
        ),
      );
    } else {
      setResults((prev) => [
        ...prev,
        {
          id: `r${Date.now()}`,
          examId: selectedExamId,
          studentName: newEntry.studentName || newEntry.rollNo,
          rollNo: newEntry.rollNo,
          marksObtained: marks,
          grade,
          remarks: newEntry.remarks,
        },
      ]);
    }
    setNewEntry({ rollNo: "", studentName: "", marks: "", remarks: "" });
  };

  const publishedExams = exams.filter((e) => e.status === "Published");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Examinations</h2>
        <p className="text-muted-foreground">
          Manage exam schedules, enter results, and publish to students
        </p>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList data-ocid="exams.tab">
          <TabsTrigger value="schedule" data-ocid="exams.schedule.tab">
            Exam Schedule
          </TabsTrigger>
          <TabsTrigger value="results" data-ocid="exams.results.tab">
            Results
          </TabsTrigger>
          <TabsTrigger value="published" data-ocid="exams.published.tab">
            Published Results
          </TabsTrigger>
        </TabsList>

        {/* SCHEDULE TAB */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAddExam} data-ocid="exams.schedule.add_button">
              <Plus size={16} className="mr-2" /> Add Exam
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <Table data-ocid="exams.schedule.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((e, i) => (
                    <TableRow
                      key={e.id}
                      data-ocid={`exams.schedule.item.${i + 1}`}
                    >
                      <TableCell className="font-medium max-w-[180px] truncate">
                        {e.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            e.type === "University" ? "default" : "secondary"
                          }
                        >
                          {e.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{e.program}</TableCell>
                      <TableCell className="text-sm">{e.semester}</TableCell>
                      <TableCell className="text-sm">{e.date}</TableCell>
                      <TableCell className="text-sm">
                        {e.totalMarks}/{e.passingMarks}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            e.status === "Published" ? "default" : "outline"
                          }
                        >
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditExam(e)}
                            data-ocid={`exams.schedule.edit_button.${i + 1}`}
                          >
                            <Edit size={13} />
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              e.status === "Published" ? "secondary" : "default"
                            }
                            onClick={() => togglePublish(e.id)}
                            data-ocid={`exams.schedule.toggle.${i + 1}`}
                          >
                            {e.status === "Published" ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setExams((prev) =>
                                prev.filter((x) => x.id !== e.id),
                              )
                            }
                            data-ocid={`exams.schedule.delete_button.${i + 1}`}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RESULTS TAB */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Select Exam to Enter Marks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger
                  className="w-full max-w-md"
                  data-ocid="exams.results.exam.select"
                >
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title} — {e.program} {e.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedExam && (
                <>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg text-sm">
                    <Badge
                      variant={
                        selectedExam.type === "University"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedExam.type}
                    </Badge>
                    <span className="font-medium">{selectedExam.subject}</span>
                    <span className="text-muted-foreground">
                      Total: {selectedExam.totalMarks} | Pass:{" "}
                      {selectedExam.passingMarks}
                    </span>
                  </div>
                  <Table data-ocid="exams.results.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Marks Obtained</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {examResults.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-muted-foreground"
                            data-ocid="exams.results.empty_state"
                          >
                            No results entered. Use inputs below to add.
                          </TableCell>
                        </TableRow>
                      ) : (
                        examResults.map((r, i) => (
                          <TableRow
                            key={r.id}
                            data-ocid={`exams.results.item.${i + 1}`}
                          >
                            <TableCell>{r.studentName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{r.rollNo}</Badge>
                            </TableCell>
                            <TableCell className="font-bold">
                              {r.marksObtained}/{selectedExam.totalMarks}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  r.grade === "F" ? "destructive" : "secondary"
                                }
                              >
                                {r.grade}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {r.remarks}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">
                      Add / Update Marks
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      <Input
                        placeholder="Roll No"
                        value={newEntry.rollNo}
                        onChange={(e) =>
                          setNewEntry((p) => ({ ...p, rollNo: e.target.value }))
                        }
                        data-ocid="exams.results.rollno.input"
                      />
                      <Input
                        placeholder="Student Name"
                        value={newEntry.studentName}
                        onChange={(e) =>
                          setNewEntry((p) => ({
                            ...p,
                            studentName: e.target.value,
                          }))
                        }
                        data-ocid="exams.results.name.input"
                      />
                      <Input
                        type="number"
                        placeholder={`Marks (/${selectedExam.totalMarks})`}
                        value={newEntry.marks}
                        onChange={(e) =>
                          setNewEntry((p) => ({ ...p, marks: e.target.value }))
                        }
                        data-ocid="exams.results.marks.input"
                      />
                      <Input
                        placeholder="Remarks"
                        value={newEntry.remarks}
                        onChange={(e) =>
                          setNewEntry((p) => ({
                            ...p,
                            remarks: e.target.value,
                          }))
                        }
                        data-ocid="exams.results.remarks.input"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={addResultEntry}
                        data-ocid="exams.results.submit_button"
                      >
                        Add Entry
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Grade is auto-calculated. Existing roll number updates
                        the record.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PUBLISHED RESULTS TAB */}
        <TabsContent value="published" className="space-y-4">
          {publishedExams.length === 0 ? (
            <Card>
              <CardContent
                className="pt-6 text-center text-muted-foreground"
                data-ocid="exams.published.empty_state"
              >
                No published exam results yet.
              </CardContent>
            </Card>
          ) : (
            publishedExams.map((exam) => {
              const examRes = results.filter((r) => r.examId === exam.id);
              return (
                <Card key={exam.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {exam.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              exam.type === "University"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {exam.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {exam.program} · {exam.semester} · {exam.subject}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm text-green-600 font-medium">
                          Published
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {examRes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No results entered for this exam.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Marks</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {examRes.map((r, i) => (
                            <TableRow
                              key={r.id}
                              data-ocid={`exams.published.item.${i + 1}`}
                            >
                              <TableCell>{r.studentName}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{r.rollNo}</Badge>
                              </TableCell>
                              <TableCell className="font-bold">
                                {r.marksObtained}/{exam.totalMarks}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    r.grade === "F"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {r.grade}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    r.marksObtained >= exam.passingMarks
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {r.marksObtained >= exam.passingMarks
                                    ? "Pass"
                                    : "Fail"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Exam Dialog */}
      <Dialog open={examDialog} onOpenChange={setExamDialog}>
        <DialogContent className="max-w-lg" data-ocid="exams.schedule.dialog">
          <DialogHeader>
            <DialogTitle>{editExamId ? "Edit Exam" : "Add Exam"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Exam Title *</Label>
              <Input
                value={examForm.title}
                onChange={(e) =>
                  setExamForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Mid-Term Examination 2025"
                data-ocid="exams.schedule.title.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={examForm.type}
                  onValueChange={(v: "Internal" | "University") =>
                    setExamForm((p) => ({ ...p, type: v }))
                  }
                >
                  <SelectTrigger data-ocid="exams.schedule.type.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="University">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Program *</Label>
                <Select
                  value={examForm.program}
                  onValueChange={(v) =>
                    setExamForm((p) => ({ ...p, program: v }))
                  }
                >
                  <SelectTrigger data-ocid="exams.schedule.program.select">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Semester</Label>
                <Select
                  value={examForm.semester}
                  onValueChange={(v) =>
                    setExamForm((p) => ({ ...p, semester: v }))
                  }
                >
                  <SelectTrigger data-ocid="exams.schedule.semester.select">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Exam Date</Label>
                <Input
                  type="date"
                  value={examForm.date}
                  onChange={(e) =>
                    setExamForm((p) => ({ ...p, date: e.target.value }))
                  }
                  data-ocid="exams.schedule.date.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input
                value={examForm.subject}
                onChange={(e) =>
                  setExamForm((p) => ({ ...p, subject: e.target.value }))
                }
                placeholder="Subject name"
                data-ocid="exams.schedule.subject.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  value={examForm.totalMarks}
                  onChange={(e) =>
                    setExamForm((p) => ({
                      ...p,
                      totalMarks: Number(e.target.value),
                    }))
                  }
                  data-ocid="exams.schedule.totalmarks.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Passing Marks</Label>
                <Input
                  type="number"
                  value={examForm.passingMarks}
                  onChange={(e) =>
                    setExamForm((p) => ({
                      ...p,
                      passingMarks: Number(e.target.value),
                    }))
                  }
                  data-ocid="exams.schedule.passingmarks.input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExamDialog(false)}
              data-ocid="exams.schedule.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={saveExam} data-ocid="exams.schedule.save_button">
              Save Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { BookOpen, Edit, Plus, Trash2, UserPlus } from "lucide-react";
import React, { useState } from "react";

interface Program {
  id: string;
  name: string;
  code: string;
  department: string;
  duration: string;
  totalSeats: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  programId: string;
  semester: string;
  credits: number;
}

interface Enrollment {
  id: string;
  studentName: string;
  rollNo: string;
  programId: string;
  semester: string;
  enrolledOn: string;
}

const INITIAL_PROGRAMS: Program[] = [
  {
    id: "p1",
    name: "Bachelor of Education",
    code: "B.Ed",
    department: "Education",
    duration: "2 Years",
    totalSeats: 100,
  },
  {
    id: "p2",
    name: "Diploma in Elementary Education",
    code: "D.El.Ed",
    department: "Education",
    duration: "2 Years",
    totalSeats: 50,
  },
  {
    id: "p3",
    name: "Master of Education",
    code: "M.Ed",
    department: "Education",
    duration: "2 Years",
    totalSeats: 30,
  },
];

const INITIAL_SUBJECTS: Subject[] = [
  {
    id: "sub1",
    name: "Childhood and Growing Up",
    code: "BED101",
    programId: "p1",
    semester: "Semester 1",
    credits: 4,
  },
  {
    id: "sub2",
    name: "Contemporary India and Education",
    code: "BED102",
    programId: "p1",
    semester: "Semester 1",
    credits: 4,
  },
  {
    id: "sub3",
    name: "Learning and Teaching",
    code: "BED103",
    programId: "p1",
    semester: "Semester 1",
    credits: 4,
  },
  {
    id: "sub4",
    name: "Language Across the Curriculum",
    code: "BED201",
    programId: "p1",
    semester: "Semester 2",
    credits: 4,
  },
  {
    id: "sub5",
    name: "Understanding Disciplines",
    code: "BED202",
    programId: "p1",
    semester: "Semester 2",
    credits: 3,
  },
  {
    id: "sub6",
    name: "Child Development",
    code: "DEL101",
    programId: "p2",
    semester: "Year 1",
    credits: 4,
  },
  {
    id: "sub7",
    name: "Mathematics Education",
    code: "DEL102",
    programId: "p2",
    semester: "Year 1",
    credits: 4,
  },
];

const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: "e1",
    studentName: "Anjali Kumari",
    rollNo: "BED2024001",
    programId: "p1",
    semester: "Semester 1",
    enrolledOn: "2024-07-15",
  },
  {
    id: "e2",
    studentName: "Ravi Shankar Prasad",
    rollNo: "BED2024002",
    programId: "p1",
    semester: "Semester 1",
    enrolledOn: "2024-07-15",
  },
  {
    id: "e3",
    studentName: "Meena Devi",
    rollNo: "DEL2024001",
    programId: "p2",
    semester: "Year 1",
    enrolledOn: "2024-07-20",
  },
  {
    id: "e4",
    studentName: "Sunil Mahto",
    rollNo: "BED2024003",
    programId: "p1",
    semester: "Semester 2",
    enrolledOn: "2025-01-10",
  },
];

const SEMESTERS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Year 1",
  "Year 2",
];

export default function CourseManagementModule() {
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [enrollments, setEnrollments] =
    useState<Enrollment[]>(INITIAL_ENROLLMENTS);

  const [programDialog, setProgramDialog] = useState(false);
  const [subjectDialog, setSubjectDialog] = useState(false);
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [editProgId, setEditProgId] = useState<string | null>(null);
  const [editSubId, setEditSubId] = useState<string | null>(null);

  const [progForm, setProgForm] = useState({
    name: "",
    code: "",
    department: "",
    duration: "2 Years",
    totalSeats: 50,
  });
  const [subForm, setSubForm] = useState({
    name: "",
    code: "",
    programId: "",
    semester: "",
    credits: 4,
  });
  const [enrollForm, setEnrollForm] = useState({
    studentName: "",
    rollNo: "",
    programId: "",
    semester: "",
  });

  const [filterProgram, setFilterProgram] = useState("");
  const [filterSemester, setFilterSemester] = useState("");

  const saveProgram = () => {
    if (!progForm.name || !progForm.code) return;
    if (editProgId) {
      setPrograms((prev) =>
        prev.map((p) => (p.id === editProgId ? { ...p, ...progForm } : p)),
      );
    } else {
      setPrograms((prev) => [...prev, { id: `p${Date.now()}`, ...progForm }]);
    }
    setProgramDialog(false);
  };

  const saveSubject = () => {
    if (!subForm.name || !subForm.code || !subForm.programId) return;
    if (editSubId) {
      setSubjects((prev) =>
        prev.map((s) => (s.id === editSubId ? { ...s, ...subForm } : s)),
      );
    } else {
      setSubjects((prev) => [...prev, { id: `sub${Date.now()}`, ...subForm }]);
    }
    setSubjectDialog(false);
  };

  const saveEnrollment = () => {
    if (
      !enrollForm.studentName ||
      !enrollForm.programId ||
      !enrollForm.semester
    )
      return;
    setEnrollments((prev) => [
      ...prev,
      {
        id: `e${Date.now()}`,
        ...enrollForm,
        enrolledOn: new Date().toISOString().split("T")[0],
      },
    ]);
    setEnrollDialog(false);
    setEnrollForm({ studentName: "", rollNo: "", programId: "", semester: "" });
  };

  const filteredSubjects = subjects.filter((s) => {
    if (filterProgram && s.programId !== filterProgram) return false;
    if (filterSemester && s.semester !== filterSemester) return false;
    return true;
  });

  const filteredEnrollments = enrollments.filter((e) => {
    if (filterProgram && e.programId !== filterProgram) return false;
    if (filterSemester && e.semester !== filterSemester) return false;
    return true;
  });

  const getProgramName = (id: string) =>
    programs.find((p) => p.id === id)?.name ?? id;
  const getProgramCode = (id: string) =>
    programs.find((p) => p.id === id)?.code ?? id;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Course Management</h2>
        <p className="text-muted-foreground">
          Manage programs, subjects, and student enrollments
        </p>
      </div>

      <Tabs defaultValue="programs">
        <TabsList data-ocid="course.tab">
          <TabsTrigger value="programs" data-ocid="course.programs.tab">
            Programs
          </TabsTrigger>
          <TabsTrigger value="subjects" data-ocid="course.subjects.tab">
            Subjects
          </TabsTrigger>
          <TabsTrigger value="enrollments" data-ocid="course.enrollments.tab">
            Enrollments
          </TabsTrigger>
        </TabsList>

        {/* PROGRAMS TAB */}
        <TabsContent value="programs" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditProgId(null);
                setProgForm({
                  name: "",
                  code: "",
                  department: "",
                  duration: "2 Years",
                  totalSeats: 50,
                });
                setProgramDialog(true);
              }}
              data-ocid="course.programs.add_button"
            >
              <Plus size={16} className="mr-2" /> Add Program
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="course.programs.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((p, i) => (
                    <TableRow
                      key={p.id}
                      data-ocid={`course.programs.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.code}</Badge>
                      </TableCell>
                      <TableCell>{p.department}</TableCell>
                      <TableCell>{p.duration}</TableCell>
                      <TableCell>{p.totalSeats}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditProgId(p.id);
                              setProgForm({
                                name: p.name,
                                code: p.code,
                                department: p.department,
                                duration: p.duration,
                                totalSeats: p.totalSeats,
                              });
                              setProgramDialog(true);
                            }}
                            data-ocid={`course.programs.edit_button.${i + 1}`}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setPrograms((prev) =>
                                prev.filter((x) => x.id !== p.id),
                              )
                            }
                            data-ocid={`course.programs.delete_button.${i + 1}`}
                          >
                            <Trash2 size={14} />
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

        {/* SUBJECTS TAB */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger
                className="w-52"
                data-ocid="course.subjects.program.select"
              >
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Programs</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger
                className="w-44"
                data-ocid="course.subjects.semester.select"
              >
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Semesters</SelectItem>
                {SEMESTERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Button
                onClick={() => {
                  setEditSubId(null);
                  setSubForm({
                    name: "",
                    code: "",
                    programId: "",
                    semester: "",
                    credits: 4,
                  });
                  setSubjectDialog(true);
                }}
                data-ocid="course.subjects.add_button"
              >
                <Plus size={16} className="mr-2" /> Add Subject
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="course.subjects.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Semester/Year</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                        data-ocid="course.subjects.empty_state"
                      >
                        No subjects found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubjects.map((s, i) => (
                      <TableRow
                        key={s.id}
                        data-ocid={`course.subjects.item.${i + 1}`}
                      >
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{s.code}</Badge>
                        </TableCell>
                        <TableCell>{getProgramCode(s.programId)}</TableCell>
                        <TableCell>{s.semester}</TableCell>
                        <TableCell>{s.credits}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditSubId(s.id);
                                setSubForm({
                                  name: s.name,
                                  code: s.code,
                                  programId: s.programId,
                                  semester: s.semester,
                                  credits: s.credits,
                                });
                                setSubjectDialog(true);
                              }}
                              data-ocid={`course.subjects.edit_button.${i + 1}`}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                setSubjects((prev) =>
                                  prev.filter((x) => x.id !== s.id),
                                )
                              }
                              data-ocid={`course.subjects.delete_button.${i + 1}`}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ENROLLMENTS TAB */}
        <TabsContent value="enrollments" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger
                className="w-52"
                data-ocid="course.enrollments.program.select"
              >
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Programs</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger
                className="w-44"
                data-ocid="course.enrollments.semester.select"
              >
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Semesters</SelectItem>
                {SEMESTERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Button
                onClick={() => {
                  setEnrollForm({
                    studentName: "",
                    rollNo: "",
                    programId: "",
                    semester: "",
                  });
                  setEnrollDialog(true);
                }}
                data-ocid="course.enrollments.add_button"
              >
                <UserPlus size={16} className="mr-2" /> Enroll Student
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="course.enrollments.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Semester/Year</TableHead>
                    <TableHead>Enrolled On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                        data-ocid="course.enrollments.empty_state"
                      >
                        No enrollments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEnrollments.map((e, i) => (
                      <TableRow
                        key={e.id}
                        data-ocid={`course.enrollments.item.${i + 1}`}
                      >
                        <TableCell className="font-medium">
                          {e.studentName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{e.rollNo}</Badge>
                        </TableCell>
                        <TableCell>{getProgramName(e.programId)}</TableCell>
                        <TableCell>{e.semester}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {e.enrolledOn}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Program Dialog */}
      <Dialog open={programDialog} onOpenChange={setProgramDialog}>
        <DialogContent data-ocid="course.programs.dialog">
          <DialogHeader>
            <DialogTitle>
              {editProgId ? "Edit Program" : "Add Program"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Program Name *</Label>
                <Input
                  value={progForm.name}
                  onChange={(e) =>
                    setProgForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Bachelor of Education"
                  data-ocid="course.programs.name.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Code *</Label>
                <Input
                  value={progForm.code}
                  onChange={(e) =>
                    setProgForm((p) => ({ ...p, code: e.target.value }))
                  }
                  placeholder="e.g. B.Ed"
                  data-ocid="course.programs.code.input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input
                  value={progForm.department}
                  onChange={(e) =>
                    setProgForm((p) => ({ ...p, department: e.target.value }))
                  }
                  placeholder="e.g. Education"
                  data-ocid="course.programs.department.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Input
                  value={progForm.duration}
                  onChange={(e) =>
                    setProgForm((p) => ({ ...p, duration: e.target.value }))
                  }
                  placeholder="e.g. 2 Years"
                  data-ocid="course.programs.duration.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Total Seats</Label>
              <Input
                type="number"
                value={progForm.totalSeats}
                onChange={(e) =>
                  setProgForm((p) => ({
                    ...p,
                    totalSeats: Number(e.target.value),
                  }))
                }
                data-ocid="course.programs.seats.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProgramDialog(false)}
              data-ocid="course.programs.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveProgram}
              data-ocid="course.programs.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject Dialog */}
      <Dialog open={subjectDialog} onOpenChange={setSubjectDialog}>
        <DialogContent data-ocid="course.subjects.dialog">
          <DialogHeader>
            <DialogTitle>
              {editSubId ? "Edit Subject" : "Add Subject"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Subject Name *</Label>
                <Input
                  value={subForm.name}
                  onChange={(e) =>
                    setSubForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Subject name"
                  data-ocid="course.subjects.name.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Code *</Label>
                <Input
                  value={subForm.code}
                  onChange={(e) =>
                    setSubForm((p) => ({
                      ...p,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. BED101"
                  data-ocid="course.subjects.code.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Program *</Label>
              <Select
                value={subForm.programId}
                onValueChange={(v) =>
                  setSubForm((p) => ({ ...p, programId: v }))
                }
              >
                <SelectTrigger data-ocid="course.subjects.program_select.select">
                  <SelectValue placeholder="Select Program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Semester/Year</Label>
                <Select
                  value={subForm.semester}
                  onValueChange={(v) =>
                    setSubForm((p) => ({ ...p, semester: v }))
                  }
                >
                  <SelectTrigger data-ocid="course.subjects.semester_select.select">
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
                <Label>Credits</Label>
                <Input
                  type="number"
                  value={subForm.credits}
                  onChange={(e) =>
                    setSubForm((p) => ({
                      ...p,
                      credits: Number(e.target.value),
                    }))
                  }
                  data-ocid="course.subjects.credits.input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubjectDialog(false)}
              data-ocid="course.subjects.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveSubject}
              data-ocid="course.subjects.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enrollment Dialog */}
      <Dialog open={enrollDialog} onOpenChange={setEnrollDialog}>
        <DialogContent data-ocid="course.enrollments.dialog">
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Student Name *</Label>
              <Input
                value={enrollForm.studentName}
                onChange={(e) =>
                  setEnrollForm((p) => ({ ...p, studentName: e.target.value }))
                }
                placeholder="Full name"
                data-ocid="course.enrollments.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Roll No</Label>
              <Input
                value={enrollForm.rollNo}
                onChange={(e) =>
                  setEnrollForm((p) => ({ ...p, rollNo: e.target.value }))
                }
                placeholder="e.g. BED2024001"
                data-ocid="course.enrollments.rollno.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Program *</Label>
              <Select
                value={enrollForm.programId}
                onValueChange={(v) =>
                  setEnrollForm((p) => ({ ...p, programId: v }))
                }
              >
                <SelectTrigger data-ocid="course.enrollments.program_enroll.select">
                  <SelectValue placeholder="Select Program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Semester/Year *</Label>
              <Select
                value={enrollForm.semester}
                onValueChange={(v) =>
                  setEnrollForm((p) => ({ ...p, semester: v }))
                }
              >
                <SelectTrigger data-ocid="course.enrollments.semester_enroll.select">
                  <SelectValue placeholder="Select Semester" />
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEnrollDialog(false)}
              data-ocid="course.enrollments.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveEnrollment}
              data-ocid="course.enrollments.submit_button"
            >
              Enroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

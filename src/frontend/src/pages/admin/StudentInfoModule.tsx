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
import { Pencil, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import type { Student, StudentCategory } from "../../types";

export default function StudentInfoModule() {
  const {
    students: initStudents,
    studentCategories: initCats,
    classes,
    sections,
    currentSchoolId,
  } = useApp();
  const [students, setStudents] = useState<Student[]>(
    initStudents.filter((s) => s.schoolId === currentSchoolId),
  );
  const [categories, setCategories] = useState<StudentCategory[]>(
    initCats.filter((c) => c.schoolId === currentSchoolId),
  );
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [filterClass, setFilterClass] = useState("all");
  const [catName, setCatName] = useState("");
  const [attendance, setAttendance] = useState<
    Record<string, "present" | "absent" | "late">
  >({});
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attClass, setAttClass] = useState("c1");

  const [studentForm, setStudentForm] = useState({
    name: "",
    dateOfBirth: "",
    gender: "Male" as Student["gender"],
    phone: "",
    email: "",
    address: "",
    guardianName: "",
    guardianPhone: "",
    classId: "c1",
    sectionId: "sec1",
    rollNumber: "",
    admissionDate: "",
    categoryId: "sc1",
  });

  const myClasses = classes.filter((c) => c.schoolId === currentSchoolId);
  const filteredStudents =
    filterClass === "all"
      ? students
      : students.filter((s) => s.classId === filterClass);
  const attStudents = students.filter((s) => s.classId === attClass);

  const openAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      name: "",
      dateOfBirth: "",
      gender: "Male",
      phone: "",
      email: "",
      address: "",
      guardianName: "",
      guardianPhone: "",
      classId: "c1",
      sectionId: "sec1",
      rollNumber: "",
      admissionDate: "",
      categoryId: "sc1",
    });
    setShowStudentModal(true);
  };
  const openEditStudent = (s: Student) => {
    setEditingStudent(s);
    setStudentForm({
      name: s.name,
      dateOfBirth: s.dateOfBirth,
      gender: s.gender,
      phone: s.phone,
      email: s.email,
      address: s.address,
      guardianName: s.guardianName,
      guardianPhone: s.guardianPhone,
      classId: s.classId,
      sectionId: s.sectionId,
      rollNumber: s.rollNumber,
      admissionDate: s.admissionDate,
      categoryId: s.categoryId,
    });
    setShowStudentModal(true);
  };
  const saveStudent = () => {
    if (editingStudent) {
      setStudents((p) =>
        p.map((s) =>
          s.id === editingStudent.id ? { ...s, ...studentForm } : s,
        ),
      );
    } else {
      setStudents((p) => [
        ...p,
        {
          id: `stu${Date.now()}`,
          schoolId: currentSchoolId,
          isActive: true,
          ...studentForm,
        },
      ]);
    }
    setShowStudentModal(false);
  };
  const deleteStudent = (id: string) =>
    setStudents((p) => p.filter((s) => s.id !== id));

  const saveCat = () => {
    if (!catName.trim()) return;
    setCategories((p) => [
      ...p,
      {
        id: `sc${Date.now()}`,
        schoolId: currentSchoolId,
        name: catName.trim(),
      },
    ]);
    setCatName("");
    setShowCatModal(false);
  };

  const getClassName = (id: string) =>
    myClasses.find((c) => c.id === id)?.name ?? id;
  const getSectionName = (id: string) =>
    sections.find((s) => s.id === id)?.name ?? id;

  const saveAttendance = () => {
    alert("Attendance saved!");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Student Info</h2>
      <Tabs defaultValue="students">
        <TabsList data-ocid="studentinfo.tabs">
          <TabsTrigger value="students" data-ocid="studentinfo.students.tab">
            Students
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            data-ocid="studentinfo.categories.tab"
          >
            Categories
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            data-ocid="studentinfo.attendance.tab"
          >
            Attendance
          </TabsTrigger>
          <TabsTrigger value="report" data-ocid="studentinfo.report.tab">
            Report
          </TabsTrigger>
        </TabsList>

        {/* Students */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger
                className="w-40"
                data-ocid="students.filter.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {myClasses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openAddStudent} data-ocid="students.add_button">
              <Plus size={16} className="mr-1" /> Add Student
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="students.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((s, i) => (
                    <TableRow key={s.id} data-ocid={`students.item.${i + 1}`}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.rollNumber}</TableCell>
                      <TableCell>{getClassName(s.classId)}</TableCell>
                      <TableCell>{getSectionName(s.sectionId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.gender}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.guardianName}
                      </TableCell>
                      <TableCell className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditStudent(s)}
                          data-ocid={`students.edit_button.${i + 1}`}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteStudent(s.id)}
                          data-ocid={`students.delete_button.${i + 1}`}
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

        {/* Categories */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setShowCatModal(true)}
              data-ocid="categories.add_button"
            >
              <Plus size={16} className="mr-1" /> Add Category
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="categories.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c, i) => (
                    <TableRow key={c.id} data-ocid={`categories.item.${i + 1}`}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setCategories((p) => p.filter((x) => x.id !== c.id))
                          }
                          data-ocid={`categories.delete_button.${i + 1}`}
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

        {/* Attendance */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1">
              <Label>Date</Label>
              <Input
                type="date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                data-ocid="attendance.date.input"
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label>Class</Label>
              <Select value={attClass} onValueChange={setAttClass}>
                <SelectTrigger
                  className="w-36"
                  data-ocid="attendance.class.select"
                >
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
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attStudents.map((s, i) => (
                    <TableRow key={s.id} data-ocid={`attendance.item.${i + 1}`}>
                      <TableCell>{s.name}</TableCell>
                      {(["present", "absent", "late"] as const).map((st) => (
                        <TableCell key={st}>
                          <input
                            type="radio"
                            name={`att_${s.id}`}
                            checked={attendance[s.id] === st}
                            onChange={() =>
                              setAttendance((p) => ({ ...p, [s.id]: st }))
                            }
                            data-ocid={`attendance.${st}.radio.${i + 1}`}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button
                  onClick={saveAttendance}
                  data-ocid="attendance.save_button"
                >
                  Save Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report */}
        <TabsContent value="report">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Days Present</TableHead>
                    <TableHead>Days Absent</TableHead>
                    <TableHead>%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s, i) => (
                    <TableRow key={s.id} data-ocid={`report.item.${i + 1}`}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{getClassName(s.classId)}</TableCell>
                      <TableCell>
                        {Math.floor(Math.random() * 10) + 15}
                      </TableCell>
                      <TableCell>{Math.floor(Math.random() * 3)}</TableCell>
                      <TableCell>
                        <Badge variant="default">92%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Modal */}
      <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="student.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add Student"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["name", "Full Name", "text"],
                ["dateOfBirth", "Date of Birth", "date"],
                ["phone", "Phone", "text"],
                ["email", "Email", "email"],
                ["rollNumber", "Roll Number", "text"],
                ["admissionDate", "Admission Date", "date"],
                ["guardianName", "Guardian Name", "text"],
                ["guardianPhone", "Guardian Phone", "text"],
              ] as [keyof typeof studentForm, string, string][]
            ).map(([f, label, type]) => (
              <div key={f} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  type={type}
                  data-ocid={`student.${f}.input`}
                  value={studentForm[f] as string}
                  onChange={(e) =>
                    setStudentForm((p) => ({ ...p, [f]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label>Gender</Label>
              <Select
                value={studentForm.gender}
                onValueChange={(v) =>
                  setStudentForm((p) => ({
                    ...p,
                    gender: v as Student["gender"],
                  }))
                }
              >
                <SelectTrigger data-ocid="student.gender.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Class</Label>
              <Select
                value={studentForm.classId}
                onValueChange={(v) =>
                  setStudentForm((p) => ({ ...p, classId: v }))
                }
              >
                <SelectTrigger data-ocid="student.class.select">
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
            <div className="col-span-2 space-y-1">
              <Label>Address</Label>
              <Input
                data-ocid="student.address.input"
                value={studentForm.address}
                onChange={(e) =>
                  setStudentForm((p) => ({ ...p, address: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStudentModal(false)}
              data-ocid="student.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={saveStudent} data-ocid="student.save_button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={showCatModal} onOpenChange={setShowCatModal}>
        <DialogContent data-ocid="category.dialog">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input
              data-ocid="category.name.input"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Scholarship"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCatModal(false)}
              data-ocid="category.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={saveCat} data-ocid="category.save_button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

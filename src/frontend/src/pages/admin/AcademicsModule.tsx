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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import type {
  Assignment,
  Class,
  Section,
  StudyMaterial,
  Subject,
} from "../../types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function AcademicsModule() {
  const {
    classes: initClasses,
    sections: initSections,
    subjects: initSubjects,
    studyMaterials: initMaterials,
    assignments: initAssignments,
    classRoutines,
    staff,
    currentSchoolId,
  } = useApp();

  const [classes, setClasses] = useState<Class[]>(
    initClasses.filter((c) => c.schoolId === currentSchoolId),
  );
  const [sections, setSections] = useState<Section[]>(
    initSections.filter((s) => s.schoolId === currentSchoolId),
  );
  const [subjects, setSubjects] = useState<Subject[]>(
    initSubjects.filter((s) => s.schoolId === currentSchoolId),
  );
  const [materials, setMaterials] = useState<StudyMaterial[]>(
    initMaterials.filter((m) => m.schoolId === currentSchoolId),
  );
  const [assignments, setAssignments] = useState<Assignment[]>(
    initAssignments.filter((a) => a.schoolId === currentSchoolId),
  );

  const [showModal, setShowModal] = useState<string | null>(null);
  const [classForm, setClassForm] = useState({ name: "", teacherId: "" });
  const [sectionForm, setSectionForm] = useState({ classId: "c1", name: "" });
  const [subjectForm, setSubjectForm] = useState({
    classId: "c1",
    name: "",
    code: "",
  });
  const [materialForm, setMaterialForm] = useState({
    classId: "c1",
    subjectId: "sub1",
    title: "",
    description: "",
    fileType: "pdf",
  });
  const [assignmentForm, setAssignmentForm] = useState({
    classId: "c1",
    subjectId: "sub1",
    title: "",
    description: "",
    dueDate: "",
  });
  const [routineClass, setRoutineClass] = useState("c1");

  const teachers = staff.filter((s) => s.role === "teacher");
  const getClassName = (id: string) =>
    classes.find((c) => c.id === id)?.name ?? id;
  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name ?? id;
  const getTeacherName = (id: string) =>
    teachers.find((t) => t.id === id)?.name ?? id;

  const routineEntries = classRoutines.filter(
    (r) => r.classId === routineClass,
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Academics</h2>
      <Tabs defaultValue="classes">
        <TabsList className="flex-wrap" data-ocid="academics.tabs">
          <TabsTrigger value="classes" data-ocid="academics.classes.tab">
            Classes
          </TabsTrigger>
          <TabsTrigger value="sections" data-ocid="academics.sections.tab">
            Sections
          </TabsTrigger>
          <TabsTrigger value="subjects" data-ocid="academics.subjects.tab">
            Subjects
          </TabsTrigger>
          <TabsTrigger value="routine" data-ocid="academics.routine.tab">
            Routine
          </TabsTrigger>
          <TabsTrigger value="materials" data-ocid="academics.materials.tab">
            Materials
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            data-ocid="academics.assignments.tab"
          >
            Assignments
          </TabsTrigger>
        </TabsList>

        {/* Classes */}
        <TabsContent value="classes" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setClassForm({ name: "", teacherId: "" });
                setShowModal("class");
              }}
              data-ocid="classes.add_button"
            >
              <Plus size={16} className="mr-1" /> Add Class
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="classes.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((c, i) => (
                    <TableRow key={c.id} data-ocid={`classes.item.${i + 1}`}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        {c.teacherId ? (
                          getTeacherName(c.teacherId)
                        ) : (
                          <span className="text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {sections.filter((s) => s.classId === c.id).length}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setClasses((p) => p.filter((x) => x.id !== c.id))
                          }
                          data-ocid={`classes.delete_button.${i + 1}`}
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

        {/* Sections */}
        <TabsContent value="sections" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSectionForm({ classId: "c1", name: "" });
                setShowModal("section");
              }}
              data-ocid="sections.add_button"
            >
              <Plus size={16} className="mr-1" /> Add Section
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="sections.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((s, i) => (
                    <TableRow key={s.id} data-ocid={`sections.item.${i + 1}`}>
                      <TableCell>{getClassName(s.classId)}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setSections((p) => p.filter((x) => x.id !== s.id))
                          }
                          data-ocid={`sections.delete_button.${i + 1}`}
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

        {/* Subjects */}
        <TabsContent value="subjects" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSubjectForm({ classId: "c1", name: "", code: "" });
                setShowModal("subject");
              }}
              data-ocid="subjects.add_button"
            >
              <Plus size={16} className="mr-1" /> Add Subject
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="subjects.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((s, i) => (
                    <TableRow key={s.id} data-ocid={`subjects.item.${i + 1}`}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.code}</Badge>
                      </TableCell>
                      <TableCell>{getClassName(s.classId)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setSubjects((p) => p.filter((x) => x.id !== s.id))
                          }
                          data-ocid={`subjects.delete_button.${i + 1}`}
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

        {/* Routine */}
        <TabsContent value="routine" className="space-y-3">
          <div className="flex items-center gap-3">
            <Label>Class:</Label>
            <Select value={routineClass} onValueChange={setRoutineClass}>
              <SelectTrigger className="w-36" data-ocid="routine.class.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                    const dayEntries = routineEntries
                      .filter((r) => r.day === day)
                      .sort((a, b) => a.period - b.period);
                    return (
                      <tr key={day}>
                        <td className="border border-border px-3 py-2 font-medium">
                          {day}
                        </td>
                        {[1, 2, 3].map((p) => {
                          const entry = dayEntries.find((e) => e.period === p);
                          return (
                            <td
                              key={p}
                              className="border border-border px-3 py-2"
                            >
                              {entry ? (
                                <div>
                                  <div className="font-medium">
                                    {getSubjectName(entry.subjectId)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {entry.startTime}-{entry.endTime}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
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
        </TabsContent>

        {/* Materials */}
        <TabsContent value="materials" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setMaterialForm({
                  classId: "c1",
                  subjectId: "sub1",
                  title: "",
                  description: "",
                  fileType: "pdf",
                });
                setShowModal("material");
              }}
              data-ocid="materials.add_button"
            >
              <Plus size={16} className="mr-1" /> Upload Material
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="materials.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((m, i) => (
                    <TableRow key={m.id} data-ocid={`materials.item.${i + 1}`}>
                      <TableCell className="font-medium">{m.title}</TableCell>
                      <TableCell>{getClassName(m.classId)}</TableCell>
                      <TableCell>{getSubjectName(m.subjectId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {m.fileType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{m.uploadedAt}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setMaterials((p) => p.filter((x) => x.id !== m.id))
                          }
                          data-ocid={`materials.delete_button.${i + 1}`}
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

        {/* Assignments */}
        <TabsContent value="assignments" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setAssignmentForm({
                  classId: "c1",
                  subjectId: "sub1",
                  title: "",
                  description: "",
                  dueDate: "",
                });
                setShowModal("assignment");
              }}
              data-ocid="assignments.add_button"
            >
              <Plus size={16} className="mr-1" /> Add Assignment
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="assignments.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a, i) => (
                    <TableRow
                      key={a.id}
                      data-ocid={`assignments.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">{a.title}</TableCell>
                      <TableCell>{getClassName(a.classId)}</TableCell>
                      <TableCell>{getSubjectName(a.subjectId)}</TableCell>
                      <TableCell>{a.dueDate}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setAssignments((p) =>
                              p.filter((x) => x.id !== a.id),
                            )
                          }
                          data-ocid={`assignments.delete_button.${i + 1}`}
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
      </Tabs>

      {/* Class Modal */}
      <Dialog
        open={showModal === "class"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent data-ocid="class.dialog">
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Class Name</Label>
              <Input
                data-ocid="class.name.input"
                value={classForm.name}
                onChange={(e) =>
                  setClassForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Class 6"
              />
            </div>
            <div className="space-y-1">
              <Label>Class Teacher</Label>
              <Select
                value={classForm.teacherId}
                onValueChange={(v) =>
                  setClassForm((p) => ({ ...p, teacherId: v }))
                }
              >
                <SelectTrigger data-ocid="class.teacher.select">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(null)}
              data-ocid="class.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setClasses((p) => [
                  ...p,
                  {
                    id: `c${Date.now()}`,
                    schoolId: currentSchoolId,
                    name: classForm.name,
                    teacherId: classForm.teacherId,
                  },
                ]);
                setShowModal(null);
              }}
              data-ocid="class.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Modal */}
      <Dialog
        open={showModal === "section"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent data-ocid="section.dialog">
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Class</Label>
              <Select
                value={sectionForm.classId}
                onValueChange={(v) =>
                  setSectionForm((p) => ({ ...p, classId: v }))
                }
              >
                <SelectTrigger data-ocid="section.class.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Section Name</Label>
              <Input
                data-ocid="section.name.input"
                value={sectionForm.name}
                onChange={(e) =>
                  setSectionForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. A"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(null)}
              data-ocid="section.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSections((p) => [
                  ...p,
                  {
                    id: `sec${Date.now()}`,
                    schoolId: currentSchoolId,
                    ...sectionForm,
                  },
                ]);
                setShowModal(null);
              }}
              data-ocid="section.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject Modal */}
      <Dialog
        open={showModal === "subject"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent data-ocid="subject.dialog">
          <DialogHeader>
            <DialogTitle>Add Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Class</Label>
              <Select
                value={subjectForm.classId}
                onValueChange={(v) =>
                  setSubjectForm((p) => ({ ...p, classId: v }))
                }
              >
                <SelectTrigger data-ocid="subject.class.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Subject Name</Label>
              <Input
                data-ocid="subject.name.input"
                value={subjectForm.name}
                onChange={(e) =>
                  setSubjectForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Code</Label>
              <Input
                data-ocid="subject.code.input"
                value={subjectForm.code}
                onChange={(e) =>
                  setSubjectForm((p) => ({ ...p, code: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(null)}
              data-ocid="subject.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSubjects((p) => [
                  ...p,
                  {
                    id: `sub${Date.now()}`,
                    schoolId: currentSchoolId,
                    ...subjectForm,
                  },
                ]);
                setShowModal(null);
              }}
              data-ocid="subject.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Material Modal */}
      <Dialog
        open={showModal === "material"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent data-ocid="material.dialog">
          <DialogHeader>
            <DialogTitle>Upload Study Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                data-ocid="material.title.input"
                value={materialForm.title}
                onChange={(e) =>
                  setMaterialForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Class</Label>
              <Select
                value={materialForm.classId}
                onValueChange={(v) =>
                  setMaterialForm((p) => ({ ...p, classId: v }))
                }
              >
                <SelectTrigger data-ocid="material.class.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>File Type</Label>
              <Select
                value={materialForm.fileType}
                onValueChange={(v) =>
                  setMaterialForm((p) => ({ ...p, fileType: v }))
                }
              >
                <SelectTrigger data-ocid="material.filetype.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["pdf", "doc", "mp4", "mp3", "jpg"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                data-ocid="material.description.textarea"
                value={materialForm.description}
                onChange={(e) =>
                  setMaterialForm((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(null)}
              data-ocid="material.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setMaterials((p) => [
                  ...p,
                  {
                    id: `sm${Date.now()}`,
                    schoolId: currentSchoolId,
                    uploadedBy: "admin",
                    uploadedAt: new Date().toISOString().slice(0, 10),
                    ...materialForm,
                  },
                ]);
                setShowModal(null);
              }}
              data-ocid="material.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Modal */}
      <Dialog
        open={showModal === "assignment"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent data-ocid="assignment.dialog">
          <DialogHeader>
            <DialogTitle>Add Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                data-ocid="assignment.title.input"
                value={assignmentForm.title}
                onChange={(e) =>
                  setAssignmentForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Class</Label>
              <Select
                value={assignmentForm.classId}
                onValueChange={(v) =>
                  setAssignmentForm((p) => ({ ...p, classId: v }))
                }
              >
                <SelectTrigger data-ocid="assignment.class.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input
                type="date"
                data-ocid="assignment.duedate.input"
                value={assignmentForm.dueDate}
                onChange={(e) =>
                  setAssignmentForm((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                data-ocid="assignment.description.textarea"
                value={assignmentForm.description}
                onChange={(e) =>
                  setAssignmentForm((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(null)}
              data-ocid="assignment.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAssignments((p) => [
                  ...p,
                  {
                    id: `asgn${Date.now()}`,
                    schoolId: currentSchoolId,
                    createdBy: "admin",
                    createdAt: new Date().toISOString().slice(0, 10),
                    ...assignmentForm,
                  },
                ]);
                setShowModal(null);
              }}
              data-ocid="assignment.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

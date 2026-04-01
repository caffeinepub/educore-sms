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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  BookMarked,
  BookOpen,
  Calendar,
  CheckCircle,
  ClipboardList,
  Edit2,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import Layout from "../../components/Layout";
import { useApp } from "../../contexts/AppContext";
import { staffLeaves } from "../../data/mockData";
import CommunicationView from "../communication/CommunicationView";
import FrontOfficePage from "../frontoffice/FrontOfficePage";

type Section =
  | "dashboard"
  | "myclasses"
  | "attendance"
  | "marks"
  | "materials"
  | "assignments"
  | "notes"
  | "quiz"
  | "communication"
  | "frontoffice"
  | "myhr";

interface Note {
  id: string;
  title: string;
  content: string;
  classTag: string;
  date: string;
}

interface MaterialItem {
  id: string;
  title: string;
  description: string;
  classId: string;
  subject: string;
  fileType: string;
  url: string;
  uploadedAt: string;
}

interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  classId: string;
  subject: string;
  dueDate: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: "A" | "B" | "C" | "D";
}

interface Quiz {
  id: string;
  title: string;
  classId: string;
  subject: string;
  timeLimit: number;
  instructions: string;
  published: boolean;
  questions: QuizQuestion[];
}

const INIT_NOTES: Note[] = [
  {
    id: "n1",
    title: "Photosynthesis Key Points",
    content:
      "Photosynthesis occurs in chloroplasts. The equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Remember the two stages: light reactions and Calvin cycle.",
    classTag: "Class 9A",
    date: "2026-03-20",
  },
  {
    id: "n2",
    title: "Algebra Tips for Students",
    content:
      "Always balance both sides of the equation. Combine like terms before solving. Check answers by substitution. Practice 5 problems daily.",
    classTag: "Class 10B",
    date: "2026-03-18",
  },
  {
    id: "n3",
    title: "Essay Structure Reminder",
    content:
      "Introduction → 3 Body Paragraphs → Conclusion. Each paragraph needs a topic sentence, evidence, and analysis. Minimum 250 words per essay.",
    classTag: "",
    date: "2026-03-15",
  },
];

const INIT_MATERIALS: MaterialItem[] = [
  {
    id: "m1",
    title: "Chapter 3 - Cell Biology",
    description:
      "Detailed notes covering cell structure and organelle functions",
    classId: "c1",
    subject: "Science",
    fileType: "PDF",
    url: "https://example.com/cell-biology.pdf",
    uploadedAt: "2026-03-10",
  },
  {
    id: "m2",
    title: "Algebra Introduction Video",
    description: "Video tutorial on solving linear equations",
    classId: "c2",
    subject: "Mathematics",
    fileType: "Video",
    url: "https://example.com/algebra-intro.mp4",
    uploadedAt: "2026-03-12",
  },
];

const INIT_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: "a1",
    title: "Chapter 3 Summary",
    description: "Write a 300-word summary of Chapter 3 with diagrams",
    classId: "c1",
    subject: "Science",
    dueDate: "2026-03-28",
  },
  {
    id: "a2",
    title: "Algebra Problem Set",
    description: "Complete exercises 1-20 from the textbook page 45",
    classId: "c2",
    subject: "Mathematics",
    dueDate: "2026-03-30",
  },
];

const INIT_QUIZZES: Quiz[] = [
  {
    id: "q1",
    title: "Cell Biology Quiz",
    classId: "c1",
    subject: "Science",
    timeLimit: 15,
    instructions: "Answer all questions. No negative marking.",
    published: true,
    questions: [
      {
        id: "qq1",
        text: "Which organelle is known as the powerhouse of the cell?",
        optionA: "Nucleus",
        optionB: "Mitochondria",
        optionC: "Chloroplast",
        optionD: "Ribosome",
        correct: "B",
      },
      {
        id: "qq2",
        text: "What is the primary function of chloroplasts?",
        optionA: "Protein synthesis",
        optionB: "Cellular respiration",
        optionC: "Photosynthesis",
        optionD: "DNA replication",
        correct: "C",
      },
    ],
  },
  {
    id: "q2",
    title: "Linear Equations Quiz",
    classId: "c2",
    subject: "Mathematics",
    timeLimit: 20,
    instructions: "Show all working steps.",
    published: false,
    questions: [],
  },
];

const MOCK_ATTEMPTS = [
  {
    studentName: "Ananya Sharma",
    rollNo: "2024001",
    score: 90,
    total: 100,
    submittedAt: "2026-03-22 10:14",
  },
  {
    studentName: "Rohan Verma",
    rollNo: "2024002",
    score: 75,
    total: 100,
    submittedAt: "2026-03-22 10:28",
  },
  {
    studentName: "Priya Nair",
    rollNo: "2024003",
    score: 85,
    total: 100,
    submittedAt: "2026-03-22 10:05",
  },
  {
    studentName: "Arjun Mehta",
    rollNo: "2024004",
    score: 60,
    total: 100,
    submittedAt: "2026-03-22 10:32",
  },
];

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
    staffAttendance,
    payrolls,
  } = useApp();
  const [section, setSection] = useState<Section>("dashboard");
  const [attendance, setAttendance] = useState<
    Record<string, "present" | "absent" | "late">
  >({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  // Notes state
  const [notes, setNotes] = useState<Note[]>(INIT_NOTES);
  const [noteDialog, setNoteDialog] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    classTag: "",
  });

  // Materials state
  const [materials, setMaterials] = useState<MaterialItem[]>(INIT_MATERIALS);
  const [matDialog, setMatDialog] = useState(false);
  const [editMat, setEditMat] = useState<MaterialItem | null>(null);
  const [matForm, setMatForm] = useState({
    title: "",
    description: "",
    classId: "",
    subject: "",
    fileType: "PDF",
    url: "",
  });

  // Assignments state
  const [localAssignments, setLocalAssignments] =
    useState<AssignmentItem[]>(INIT_ASSIGNMENTS);
  const [assignDialog, setAssignDialog] = useState(false);
  const [editAssign, setEditAssign] = useState<AssignmentItem | null>(null);
  const [assignForm, setAssignForm] = useState({
    title: "",
    description: "",
    classId: "",
    subject: "",
    dueDate: "",
  });

  // Quiz state
  const [quizzes, setQuizzes] = useState<Quiz[]>(INIT_QUIZZES);
  const [quizDialog, setQuizDialog] = useState(false);
  const [quizStep, setQuizStep] = useState<1 | 2>(1);
  const [quizForm, setQuizForm] = useState({
    title: "",
    classId: "",
    subject: "",
    timeLimit: 15,
    instructions: "",
    published: false,
  });
  const [newQuizId, setNewQuizId] = useState<string | null>(null);
  const [qForm, setQForm] = useState({
    text: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correct: "A" as "A" | "B" | "C" | "D",
  });
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const staffId = userProfile?.staffId ?? "st1";
  const myClasses = classes.filter((c) => c.teacherId === staffId);
  const myClassIds = myClasses.map((c) => c.id);
  const myStudents = students.filter((s) => myClassIds.includes(s.classId));
  const myMaterials = studyMaterials.filter((m) => m.uploadedBy === staffId);
  const myAssignments = assignments.filter((a) => a.createdBy === staffId);
  const myExams = examSchedules.filter((e) => myClassIds.includes(e.classId));

  const myAttendanceRecords = staffAttendance
    .filter((a) => a.staffId === staffId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);
  const myLeaves = staffLeaves.filter((l) => l.staffId === staffId);
  const myPayrolls = payrolls
    .filter((p) => p.staffId === staffId)
    .sort((a, b) => b.year - a.year || b.month - a.month);

  const getClassName = (id: string) =>
    classes.find((c) => c.id === id)?.name ?? id;
  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name ?? id;

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // ─── Notes handlers ───────────────────────────────────────────────────────
  const openAddNote = () => {
    setEditNote(null);
    setNoteForm({ title: "", content: "", classTag: "" });
    setNoteDialog(true);
  };
  const openEditNote = (n: Note) => {
    setEditNote(n);
    setNoteForm({ title: n.title, content: n.content, classTag: n.classTag });
    setNoteDialog(true);
  };
  const saveNote = () => {
    if (!noteForm.title.trim()) return;
    if (editNote) {
      setNotes((prev) =>
        prev.map((n) => (n.id === editNote.id ? { ...n, ...noteForm } : n)),
      );
    } else {
      setNotes((prev) => [
        ...prev,
        {
          id: `n${Date.now()}`,
          ...noteForm,
          date: new Date().toISOString().slice(0, 10),
        },
      ]);
    }
    setNoteDialog(false);
  };
  const deleteNote = (id: string) =>
    setNotes((prev) => prev.filter((n) => n.id !== id));

  // ─── Materials handlers ───────────────────────────────────────────────────
  const openAddMat = () => {
    setEditMat(null);
    setMatForm({
      title: "",
      description: "",
      classId: myClasses[0]?.id ?? "",
      subject: "",
      fileType: "PDF",
      url: "",
    });
    setMatDialog(true);
  };
  const openEditMat = (m: MaterialItem) => {
    setEditMat(m);
    setMatForm({
      title: m.title,
      description: m.description,
      classId: m.classId,
      subject: m.subject,
      fileType: m.fileType,
      url: m.url,
    });
    setMatDialog(true);
  };
  const saveMat = () => {
    if (!matForm.title.trim()) return;
    if (editMat) {
      setMaterials((prev) =>
        prev.map((m) => (m.id === editMat.id ? { ...m, ...matForm } : m)),
      );
    } else {
      setMaterials((prev) => [
        ...prev,
        {
          id: `m${Date.now()}`,
          ...matForm,
          uploadedAt: new Date().toISOString().slice(0, 10),
        },
      ]);
    }
    setMatDialog(false);
  };
  const deleteMat = (id: string) =>
    setMaterials((prev) => prev.filter((m) => m.id !== id));

  // ─── Assignment handlers ──────────────────────────────────────────────────
  const openAddAssign = () => {
    setEditAssign(null);
    setAssignForm({
      title: "",
      description: "",
      classId: myClasses[0]?.id ?? "",
      subject: "",
      dueDate: "",
    });
    setAssignDialog(true);
  };
  const openEditAssign = (a: AssignmentItem) => {
    setEditAssign(a);
    setAssignForm({
      title: a.title,
      description: a.description,
      classId: a.classId,
      subject: a.subject,
      dueDate: a.dueDate,
    });
    setAssignDialog(true);
  };
  const saveAssign = () => {
    if (!assignForm.title.trim()) return;
    if (editAssign) {
      setLocalAssignments((prev) =>
        prev.map((a) => (a.id === editAssign.id ? { ...a, ...assignForm } : a)),
      );
    } else {
      setLocalAssignments((prev) => [
        ...prev,
        { id: `a${Date.now()}`, ...assignForm },
      ]);
    }
    setAssignDialog(false);
  };
  const deleteAssign = (id: string) =>
    setLocalAssignments((prev) => prev.filter((a) => a.id !== id));

  // ─── Quiz handlers ────────────────────────────────────────────────────────
  const openCreateQuiz = () => {
    setQuizForm({
      title: "",
      classId: myClasses[0]?.id ?? "",
      subject: "",
      timeLimit: 15,
      instructions: "",
      published: false,
    });
    setQuizStep(1);
    setNewQuizId(null);
    setQuizDialog(true);
  };
  const saveQuizStep1 = () => {
    if (!quizForm.title.trim()) return;
    const id = `q${Date.now()}`;
    setQuizzes((prev) => [...prev, { id, ...quizForm, questions: [] }]);
    setNewQuizId(id);
    setQuizStep(2);
  };
  const addQuestion = () => {
    if (!qForm.text.trim()) return;
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === newQuizId
          ? {
              ...q,
              questions: [...q.questions, { id: `qq${Date.now()}`, ...qForm }],
            }
          : q,
      ),
    );
    setQForm({
      text: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correct: "A",
    });
  };
  const togglePublish = (id: string) =>
    setQuizzes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, published: !q.published } : q)),
    );
  const deleteQuiz = (id: string) =>
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  const deleteQuestion = (quizId: string, qId: string) =>
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId
          ? { ...q, questions: q.questions.filter((qq) => qq.id !== qId) }
          : q,
      ),
    );

  // ─── Renders ──────────────────────────────────────────────────────────────
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
            value: myAssignments.length + localAssignments.length,
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
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className={`${s.color} mb-2`}>{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setSection("notes")}
        >
          <CardContent className="pt-4 flex items-center gap-3">
            <BookMarked size={24} className="text-indigo-500" />
            <div>
              <div className="font-semibold">Notes</div>
              <div className="text-sm text-muted-foreground">
                {notes.length} notes
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setSection("quiz")}
        >
          <CardContent className="pt-4 flex items-center gap-3">
            <HelpCircle size={24} className="text-rose-500" />
            <div>
              <div className="font-semibold">Quizzes</div>
              <div className="text-sm text-muted-foreground">
                {quizzes.length} quizzes ·{" "}
                {quizzes.filter((q) => q.published).length} published
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setSection("materials")}
        >
          <CardContent className="pt-4 flex items-center gap-3">
            <FileText size={24} className="text-teal-500" />
            <div>
              <div className="font-semibold">Study Materials</div>
              <div className="text-sm text-muted-foreground">
                {materials.length} uploads
              </div>
            </div>
          </CardContent>
        </Card>
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
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myStudents.map((s, i) => (
                <TableRow
                  key={s.id}
                  data-ocid={`teacher.attendance.item.${i + 1}`}
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
                        data-ocid={`teacher.attendance.${st}.radio.${i + 1}`}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Input
                      placeholder="Academic remark…"
                      value={remarks[s.id] ?? ""}
                      onChange={(e) =>
                        setRemarks((p) => ({ ...p, [s.id]: e.target.value }))
                      }
                      className="h-7 text-xs min-w-[140px]"
                      data-ocid={`teacher.attendance.remark.input.${i + 1}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {myStudents.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                    data-ocid="teacher.attendance.empty_state"
                  >
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Button
            className="mt-3"
            onClick={() => alert("Attendance & remarks saved!")}
            data-ocid="teacher.attendance.save_button"
          >
            Save Attendance
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookMarked size={22} />
          Notes
        </h2>
        <Button onClick={openAddNote} data-ocid="notes.open_modal_button">
          <Plus size={16} className="mr-1" />
          Add Note
        </Button>
      </div>
      {notes.length === 0 && (
        <Card>
          <CardContent
            className="pt-6 text-center text-muted-foreground"
            data-ocid="notes.empty_state"
          >
            No notes yet. Create your first note!
          </CardContent>
        </Card>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((n, i) => (
          <Card key={n.id} data-ocid={`notes.item.${i + 1}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{n.title}</CardTitle>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openEditNote(n)}
                    data-ocid={`notes.edit_button.${i + 1}`}
                  >
                    <Edit2 size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => deleteNote(n.id)}
                    data-ocid={`notes.delete_button.${i + 1}`}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {n.classTag && (
                  <Badge variant="secondary" className="text-xs">
                    {n.classTag}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">{n.date}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-4">
                {n.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Note Dialog */}
      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
        <DialogContent data-ocid="notes.dialog">
          <DialogHeader>
            <DialogTitle>{editNote ? "Edit Note" : "Add Note"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={noteForm.title}
                onChange={(e) =>
                  setNoteForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Note title"
                data-ocid="notes.input"
              />
            </div>
            <div>
              <Label>Class Tag (optional)</Label>
              <Input
                value={noteForm.classTag}
                onChange={(e) =>
                  setNoteForm((p) => ({ ...p, classTag: e.target.value }))
                }
                placeholder="e.g. Class 9A"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={noteForm.content}
                onChange={(e) =>
                  setNoteForm((p) => ({ ...p, content: e.target.value }))
                }
                placeholder="Write your note…"
                rows={5}
                data-ocid="notes.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNoteDialog(false)}
              data-ocid="notes.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={saveNote} data-ocid="notes.save_button">
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderMaterials = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Study Materials</h2>
        <Button onClick={openAddMat} data-ocid="materials.open_modal_button">
          <Plus size={16} className="mr-1" />
          Upload Material
        </Button>
      </div>
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          {materials.length === 0 && myMaterials.length === 0 ? (
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
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((m, i) => (
                  <TableRow
                    key={m.id}
                    data-ocid={`teacher.materials.item.${i + 1}`}
                  >
                    <TableCell className="font-medium">{m.title}</TableCell>
                    <TableCell>{getClassName(m.classId)}</TableCell>
                    <TableCell>{m.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.fileType}</Badge>
                    </TableCell>
                    <TableCell>{m.uploadedAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditMat(m)}
                          data-ocid={`materials.edit_button.${i + 1}`}
                        >
                          <Edit2 size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteMat(m.id)}
                          data-ocid={`materials.delete_button.${i + 1}`}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {myMaterials.map((m, i) => (
                  <TableRow
                    key={m.id}
                    data-ocid={`teacher.materials.item.${materials.length + i + 1}`}
                  >
                    <TableCell className="font-medium">{m.title}</TableCell>
                    <TableCell>{getClassName(m.classId)}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {m.fileType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{m.uploadedAt}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        Legacy
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Material Dialog */}
      <Dialog open={matDialog} onOpenChange={setMatDialog}>
        <DialogContent data-ocid="materials.dialog">
          <DialogHeader>
            <DialogTitle>
              {editMat ? "Edit Material" : "Upload Material"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={matForm.title}
                onChange={(e) =>
                  setMatForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Material title"
                data-ocid="materials.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={matForm.description}
                onChange={(e) =>
                  setMatForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Brief description"
                rows={2}
                data-ocid="materials.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Class</Label>
                <Select
                  value={matForm.classId}
                  onValueChange={(v) =>
                    setMatForm((p) => ({ ...p, classId: v }))
                  }
                >
                  <SelectTrigger data-ocid="materials.select">
                    <SelectValue placeholder="Select class" />
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
              <div>
                <Label>Subject</Label>
                <Input
                  value={matForm.subject}
                  onChange={(e) =>
                    setMatForm((p) => ({ ...p, subject: e.target.value }))
                  }
                  placeholder="Subject"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>File Type</Label>
                <Select
                  value={matForm.fileType}
                  onValueChange={(v) =>
                    setMatForm((p) => ({ ...p, fileType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["PDF", "Video", "Image", "Doc"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL / Link</Label>
                <Input
                  value={matForm.url}
                  onChange={(e) =>
                    setMatForm((p) => ({ ...p, url: e.target.value }))
                  }
                  placeholder="https://…"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMatDialog(false)}
              data-ocid="materials.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={saveMat} data-ocid="materials.save_button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Assignments</h2>
        <Button
          onClick={openAddAssign}
          data-ocid="assignments.open_modal_button"
        >
          <Plus size={16} className="mr-1" />
          Create Assignment
        </Button>
      </div>
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table data-ocid="teacher.assignments.table">
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
              {localAssignments.map((a, i) => (
                <TableRow
                  key={a.id}
                  data-ocid={`teacher.assignments.item.${i + 1}`}
                >
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>{getClassName(a.classId)}</TableCell>
                  <TableCell>{a.subject}</TableCell>
                  <TableCell>{a.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditAssign(a)}
                        data-ocid={`assignments.edit_button.${i + 1}`}
                      >
                        <Edit2 size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteAssign(a.id)}
                        data-ocid={`assignments.delete_button.${i + 1}`}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {myAssignments.map((a, i) => (
                <TableRow
                  key={a.id}
                  data-ocid={`teacher.assignments.item.${localAssignments.length + i + 1}`}
                >
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>{getClassName(a.classId)}</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>{a.dueDate}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      Legacy
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {localAssignments.length === 0 && myAssignments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                    data-ocid="assignments.empty_state"
                  >
                    No assignments created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent data-ocid="assignments.dialog">
          <DialogHeader>
            <DialogTitle>
              {editAssign ? "Edit Assignment" : "Create Assignment"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={assignForm.title}
                onChange={(e) =>
                  setAssignForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Assignment title"
                data-ocid="assignments.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={assignForm.description}
                onChange={(e) =>
                  setAssignForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Assignment details"
                rows={3}
                data-ocid="assignments.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Class</Label>
                <Select
                  value={assignForm.classId}
                  onValueChange={(v) =>
                    setAssignForm((p) => ({ ...p, classId: v }))
                  }
                >
                  <SelectTrigger data-ocid="assignments.select">
                    <SelectValue placeholder="Select class" />
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
              <div>
                <Label>Subject</Label>
                <Input
                  value={assignForm.subject}
                  onChange={(e) =>
                    setAssignForm((p) => ({ ...p, subject: e.target.value }))
                  }
                  placeholder="Subject"
                />
              </div>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={assignForm.dueDate}
                onChange={(e) =>
                  setAssignForm((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialog(false)}
              data-ocid="assignments.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={saveAssign} data-ocid="assignments.save_button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderQuizDetail = (quiz: Quiz) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedQuiz(null)}
        >
          ← Back
        </Button>
        <div>
          <h2 className="text-xl font-bold">{quiz.title}</h2>
          <p className="text-sm text-muted-foreground">
            {getClassName(quiz.classId)} · {quiz.subject} · {quiz.timeLimit} min
          </p>
        </div>
        <Badge
          variant={quiz.published ? "default" : "secondary"}
          className="ml-auto"
        >
          {quiz.published ? "Published" : "Draft"}
        </Badge>
      </div>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Questions ({quiz.questions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quiz.questions.length === 0 && (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="quiz.questions.empty_state"
            >
              No questions added yet.
            </p>
          )}
          {quiz.questions.map((q, i) => (
            <div
              key={q.id}
              className="p-3 rounded-lg border bg-muted/30"
              data-ocid={`quiz.question.item.${i + 1}`}
            >
              <div className="flex justify-between">
                <p className="font-medium text-sm">
                  {i + 1}. {q.text}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => deleteQuestion(quiz.id, q.id)}
                  data-ocid={`quiz.question.delete_button.${i + 1}`}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {(["A", "B", "C", "D"] as const).map((opt) => (
                  <div
                    key={opt}
                    className={`text-xs p-1.5 rounded flex items-center gap-1 ${q.correct === opt ? "bg-green-100 text-green-700 font-semibold" : "text-muted-foreground"}`}
                  >
                    {q.correct === opt && <CheckCircle size={10} />}
                    {opt}. {q[`option${opt}` as keyof QuizQuestion] as string}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add question inline */}
          <div className="mt-4 p-3 rounded-lg border border-dashed space-y-2">
            <p className="text-sm font-medium">Add Question</p>
            <Textarea
              value={qForm.text}
              onChange={(e) =>
                setQForm((p) => ({ ...p, text: e.target.value }))
              }
              placeholder="Question text"
              rows={2}
              data-ocid="quiz.question.textarea"
            />
            <div className="grid grid-cols-2 gap-2">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <Input
                  key={opt}
                  value={qForm[`option${opt}` as keyof typeof qForm] as string}
                  onChange={(e) =>
                    setQForm((p) => ({
                      ...p,
                      [`option${opt}`]: e.target.value,
                    }))
                  }
                  placeholder={`Option ${opt}`}
                  className="text-sm"
                  data-ocid={"quiz.question.option.input"}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Correct Answer:</Label>
              <Select
                value={qForm.correct}
                onValueChange={(v) =>
                  setQForm((p) => ({
                    ...p,
                    correct: v as "A" | "B" | "C" | "D",
                  }))
                }
              >
                <SelectTrigger
                  className="w-20"
                  data-ocid="quiz.question.correct.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["A", "B", "C", "D"] as const).map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedQuiz((prev) => {
                    if (!prev) return null;
                    const updated = {
                      ...prev,
                      questions: [
                        ...prev.questions,
                        { id: `qq${Date.now()}`, ...qForm },
                      ],
                    };
                    setQuizzes((qs) =>
                      qs.map((q) => (q.id === updated.id ? updated : q)),
                    );
                    return updated;
                  });
                  setQForm({
                    text: "",
                    optionA: "",
                    optionB: "",
                    optionC: "",
                    optionD: "",
                    correct: "A",
                  });
                }}
                data-ocid="quiz.question.submit_button"
              >
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table data-ocid="quiz.attempts.table">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quiz.published ? (
                MOCK_ATTEMPTS.map((a, i) => (
                  <TableRow
                    key={a.rollNo}
                    data-ocid={`quiz.attempts.item.${i + 1}`}
                  >
                    <TableCell>{a.studentName}</TableCell>
                    <TableCell>{a.rollNo}</TableCell>
                    <TableCell>
                      {a.score}/{a.total}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          a.score >= 80
                            ? "text-green-600 border-green-400"
                            : a.score >= 60
                              ? "text-amber-600 border-amber-400"
                              : "text-red-600 border-red-400"
                        }
                      >
                        {a.score}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.submittedAt}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                    data-ocid="quiz.attempts.empty_state"
                  >
                    Publish the quiz to see student attempts.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuiz = () => {
    if (selectedQuiz) {
      const live =
        quizzes.find((q) => q.id === selectedQuiz.id) ?? selectedQuiz;
      return renderQuizDetail(live);
    }
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle size={22} />
            Online Quizzes
          </h2>
          <Button onClick={openCreateQuiz} data-ocid="quiz.open_modal_button">
            <Plus size={16} className="mr-1" />
            Create Quiz
          </Button>
        </div>
        {quizzes.length === 0 && (
          <Card>
            <CardContent
              className="pt-6 text-center text-muted-foreground"
              data-ocid="quiz.empty_state"
            >
              No quizzes yet. Create your first quiz!
            </CardContent>
          </Card>
        )}
        <div className="space-y-3">
          {quizzes.map((q, i) => (
            <Card key={q.id} data-ocid={`quiz.item.${i + 1}`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      className="text-left font-semibold hover:underline"
                      onClick={() => setSelectedQuiz(q)}
                    >
                      {q.title}
                    </button>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {getClassName(q.classId)} · {q.subject} · {q.timeLimit}{" "}
                      min · {q.questions.length} questions
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={q.published ? "default" : "secondary"}>
                      {q.published ? "Published" : "Draft"}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={q.published}
                        onCheckedChange={() => togglePublish(q.id)}
                        data-ocid={`quiz.toggle.${i + 1}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {q.published ? "Unpublish" : "Publish"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteQuiz(q.id)}
                      data-ocid={`quiz.delete_button.${i + 1}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Quiz Dialog - Multi Step */}
        <Dialog open={quizDialog} onOpenChange={setQuizDialog}>
          <DialogContent className="max-w-lg" data-ocid="quiz.dialog">
            <DialogHeader>
              <DialogTitle>
                {quizStep === 1
                  ? "Create Quiz — Step 1: Quiz Info"
                  : "Step 2: Add Questions"}
              </DialogTitle>
            </DialogHeader>
            {quizStep === 1 ? (
              <div className="space-y-3">
                <div>
                  <Label>Quiz Title</Label>
                  <Input
                    value={quizForm.title}
                    onChange={(e) =>
                      setQuizForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g. Chapter 3 Biology Quiz"
                    data-ocid="quiz.title.input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Class</Label>
                    <Select
                      value={quizForm.classId}
                      onValueChange={(v) =>
                        setQuizForm((p) => ({ ...p, classId: v }))
                      }
                    >
                      <SelectTrigger data-ocid="quiz.class.select">
                        <SelectValue placeholder="Select" />
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
                  <div>
                    <Label>Subject</Label>
                    <Input
                      value={quizForm.subject}
                      onChange={(e) =>
                        setQuizForm((p) => ({ ...p, subject: e.target.value }))
                      }
                      placeholder="Subject"
                    />
                  </div>
                </div>
                <div>
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    value={quizForm.timeLimit}
                    onChange={(e) =>
                      setQuizForm((p) => ({
                        ...p,
                        timeLimit: Number(e.target.value),
                      }))
                    }
                    min={1}
                    max={180}
                  />
                </div>
                <div>
                  <Label>Instructions</Label>
                  <Textarea
                    value={quizForm.instructions}
                    onChange={(e) =>
                      setQuizForm((p) => ({
                        ...p,
                        instructions: e.target.value,
                      }))
                    }
                    placeholder="Instructions for students"
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={quizForm.published}
                    onCheckedChange={(v) =>
                      setQuizForm((p) => ({ ...p, published: v }))
                    }
                    data-ocid="quiz.publish.switch"
                  />
                  <Label>Publish immediately</Label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Quiz created! Add questions below (you can add more later from
                  the quiz detail view).
                </p>
                <Textarea
                  value={qForm.text}
                  onChange={(e) =>
                    setQForm((p) => ({ ...p, text: e.target.value }))
                  }
                  placeholder="Question text"
                  rows={2}
                  data-ocid="quiz.question.textarea"
                />
                <div className="grid grid-cols-2 gap-2">
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <Input
                      key={opt}
                      value={
                        qForm[`option${opt}` as keyof typeof qForm] as string
                      }
                      onChange={(e) =>
                        setQForm((p) => ({
                          ...p,
                          [`option${opt}`]: e.target.value,
                        }))
                      }
                      placeholder={`Option ${opt}`}
                      className="text-sm"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label>Correct:</Label>
                  <Select
                    value={qForm.correct}
                    onValueChange={(v) =>
                      setQForm((p) => ({
                        ...p,
                        correct: v as "A" | "B" | "C" | "D",
                      }))
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["A", "B", "C", "D"] as const).map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={addQuestion}
                    data-ocid="quiz.add_question.button"
                  >
                    <Plus size={13} className="mr-1" />
                    Add
                  </Button>
                </div>
                {newQuizId && (
                  <p className="text-xs text-muted-foreground">
                    {quizzes.find((q) => q.id === newQuizId)?.questions
                      .length ?? 0}{" "}
                    question(s) added so far.
                  </p>
                )}
              </div>
            )}
            <DialogFooter>
              {quizStep === 1 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setQuizDialog(false)}
                    data-ocid="quiz.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button onClick={saveQuizStep1} data-ocid="quiz.next_button">
                    Next: Add Questions →
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setQuizDialog(false)}
                  data-ocid="quiz.confirm_button"
                >
                  Done
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderMyHR = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <UserCheck size={22} /> My HR
      </h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Attendance (Recent)</CardTitle>
        </CardHeader>
        <CardContent>
          {myAttendanceRecords.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="myhr.attendance.empty_state"
            >
              No attendance records found.
            </p>
          ) : (
            <Table data-ocid="myhr.attendance.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Photo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myAttendanceRecords.map((a, i) => (
                  <TableRow
                    key={a.id}
                    data-ocid={`myhr.attendance.item.${i + 1}`}
                  >
                    <TableCell>{a.date}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {a.time ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          a.status === "present"
                            ? "border-green-400 text-green-600"
                            : a.status === "late"
                              ? "border-amber-400 text-amber-600"
                              : "border-red-400 text-red-600"
                        }
                      >
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {a.method ?? "manual"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {a.photoDataUrl ? (
                        <img
                          src={a.photoDataUrl}
                          alt=""
                          className="w-10 h-10 rounded object-cover border"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {myLeaves.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="myhr.leave.empty_state"
            >
              No leave applications.
            </p>
          ) : (
            <Table data-ocid="myhr.leave.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myLeaves.map((l, i) => (
                  <TableRow key={l.id} data-ocid={`myhr.leave.item.${i + 1}`}>
                    <TableCell className="capitalize">{l.leaveType}</TableCell>
                    <TableCell>{l.fromDate}</TableCell>
                    <TableCell>{l.toDate}</TableCell>
                    <TableCell>{l.days}</TableCell>
                    <TableCell className="max-w-[120px] truncate">
                      {l.reason}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          l.status === "approved"
                            ? "border-green-400 text-green-600"
                            : l.status === "rejected"
                              ? "border-red-400 text-red-600"
                              : "border-amber-400 text-amber-600"
                        }
                      >
                        {l.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payslip Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {myPayrolls.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="myhr.payroll.empty_state"
            >
              No payroll records found.
            </p>
          ) : (
            <div className="space-y-3">
              {myPayrolls.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  data-ocid={`myhr.payroll.item.${i + 1}`}
                >
                  <div>
                    <p className="font-semibold">
                      {MONTHS[p.month - 1]} {p.year}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Present: {p.presentDays ?? "—"} days · Absent:{" "}
                      {p.absentDays ?? "—"} days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ₹{p.netSalary.toLocaleString()}
                    </p>
                    <Badge
                      variant={p.status === "paid" ? "default" : "secondary"}
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
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
      {section === "assignments" && renderAssignments()}
      {section === "notes" && renderNotes()}
      {section === "quiz" && renderQuiz()}
      {section === "communication" && (
        <CommunicationView
          classId={myClasses[0]?.id ?? "c1"}
          senderName={userProfile?.name ?? "Teacher"}
          senderRole="teacher"
        />
      )}
      {section === "frontoffice" && <FrontOfficePage />}
      {section === "myhr" && renderMyHR()}
    </Layout>
  );
}

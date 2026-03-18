import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Eye,
  Grid3X3,
  Pencil,
  Plus,
  QrCode,
  StopCircle,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Wifi,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../contexts/AppContext";
import { useQRScanner } from "../../qr-code/useQRScanner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExpandedStudent {
  id: string;
  schoolId: string;
  isActive: boolean;
  // Academic Info
  rollNo: string;
  admissionNo: string;
  studyingYear: string;
  session: string;
  jcecebRegNo: string;
  jcecebRollNo: string;
  cmlRank: string;
  course: string;
  semYear: string;
  dateOfAdmission: string;
  universityBoardRollNo: string;
  registrationNo: string;
  // Personal Info
  name: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: string;
  category: string;
  maritalStatus: string;
  uidNo: string;
  ph: boolean;
  email: string;
  mobileCall: string;
  mobileWhatsapp: string;
  // Address
  vill: string;
  po: string;
  ps: string;
  dist: string;
  state: string;
  pinCode: string;
  // Subjects
  majorSubject: string;
  minorSubject: string;
  // Photo
  photoUrl: string;
  // Matriculation
  matricPassedYear: string;
  matricSubject: string;
  matricSchool: string;
  matricPercentage: string;
  matricTotalMarks: string;
  matricMarksObtained: string;
  // Intermediate
  interPassedYear: string;
  interSubject: string;
  interCollege: string;
  interPercentage: string;
  interTotalMarks: string;
  interMarksObtained: string;
  // Graduation
  gradPassedYear: string;
  gradSubject: string;
  gradCollege: string;
  gradPercentage: string;
  gradTotalMarks: string;
  gradMarksObtained: string;
  // PG
  pgPassedYear: string;
  pgSubject: string;
  pgCollegeDept: string;
  pgPercentage: string;
  pgTotalMarks: string;
  pgMarksObtained: string;
  // Other
  otherQualification: string;
  rfidCardId: string;
  groupId: string;
}

interface StudentGroup {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
}

interface AttendanceRecord {
  studentId: string;
  date: string;
  status: "present" | "absent" | "late" | "half-day";
  subject?: string;
  method?: "manual" | "qr" | "rfid";
  timestamp?: string;
}

interface SessionAttendanceEntry {
  studentId: string;
  studentName: string;
  rollNo: string;
  status: "present" | "absent" | "late" | "half-day";
  method: "manual" | "qr" | "rfid";
  timestamp: string;
}

type SectionKey =
  | "category"
  | "add-student"
  | "student-list"
  | "attendance"
  | "attendance-report"
  | "subject-attendance"
  | "student-group"
  | "student-promote"
  | "disable-student";

// ─── Constants ───────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
];

const SESSIONS = ["2023-25", "2024-26", "2025-27", "2026-28", "2027-29"];
const COURSES = ["B.Ed", "D.El.Ed"];
const SEM_YEARS = ["1st Year", "2nd Year"];
const STUDYING_YEARS = ["1st Year", "2nd Year"];
const GENDERS = ["Male", "Female", "Other"];
const DEFAULT_CATEGORIES = ["SC", "ST", "OBC", "GEN"];
const MARITAL_STATUSES = ["Single", "Married"];
const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Science",
  "History",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Sanskrit",
  "Economics",
  "Political Science",
];

const EMPTY_STUDENT: Omit<ExpandedStudent, "id" | "schoolId" | "isActive"> = {
  rollNo: "",
  admissionNo: "",
  studyingYear: "1st Year",
  session: "2024-26",
  jcecebRegNo: "",
  jcecebRollNo: "",
  cmlRank: "",
  course: "B.Ed",
  semYear: "1st Year",
  dateOfAdmission: "",
  universityBoardRollNo: "",
  registrationNo: "",
  name: "",
  fatherName: "",
  motherName: "",
  dateOfBirth: "",
  gender: "Male",
  category: "GEN",
  maritalStatus: "Single",
  uidNo: "",
  ph: false,
  email: "",
  mobileCall: "",
  mobileWhatsapp: "",
  vill: "",
  po: "",
  ps: "",
  dist: "",
  state: "Jharkhand",
  pinCode: "",
  majorSubject: "",
  minorSubject: "",
  photoUrl: "",
  matricPassedYear: "",
  matricSubject: "",
  matricSchool: "",
  matricPercentage: "",
  matricTotalMarks: "",
  matricMarksObtained: "",
  interPassedYear: "",
  interSubject: "",
  interCollege: "",
  interPercentage: "",
  interTotalMarks: "",
  interMarksObtained: "",
  gradPassedYear: "",
  gradSubject: "",
  gradCollege: "",
  gradPercentage: "",
  gradTotalMarks: "",
  gradMarksObtained: "",
  pgPassedYear: "",
  pgSubject: "",
  pgCollegeDept: "",
  pgPercentage: "",
  pgTotalMarks: "",
  pgMarksObtained: "",
  otherQualification: "",
  rfidCardId: "",
  groupId: "",
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_STUDENTS: ExpandedStudent[] = [
  {
    id: "stu001",
    schoolId: "school1",
    isActive: true,
    rollNo: "001",
    admissionNo: "ADM2024001",
    studyingYear: "1st Year",
    session: "2024-26",
    jcecebRegNo: "JEC2024001",
    jcecebRollNo: "R2024001",
    cmlRank: "128",
    course: "B.Ed",
    semYear: "1st Year",
    dateOfAdmission: "2024-07-15",
    universityBoardRollNo: "UNI2024001",
    registrationNo: "REG2024001",
    name: "Ramesh Kumar Singh",
    fatherName: "Rajesh Singh",
    motherName: "Sunita Singh",
    dateOfBirth: "2000-05-15",
    gender: "Male",
    category: "GEN",
    maritalStatus: "Single",
    uidNo: "1234-5678-9012",
    ph: false,
    email: "ramesh@email.com",
    mobileCall: "9876543210",
    mobileWhatsapp: "9876543210",
    vill: "Kanke",
    po: "Kanke",
    ps: "Kanke",
    dist: "Ranchi",
    state: "Jharkhand",
    pinCode: "834001",
    majorSubject: "Mathematics",
    minorSubject: "Science",
    photoUrl: "",
    matricPassedYear: "2018",
    matricSubject: "Science",
    matricSchool: "DAV Public School",
    matricPercentage: "78",
    matricTotalMarks: "500",
    matricMarksObtained: "390",
    interPassedYear: "2020",
    interSubject: "Science",
    interCollege: "St. Xavier's College",
    interPercentage: "72",
    interTotalMarks: "500",
    interMarksObtained: "360",
    gradPassedYear: "2023",
    gradSubject: "Mathematics",
    gradCollege: "Ranchi University",
    gradPercentage: "68",
    gradTotalMarks: "1800",
    gradMarksObtained: "1224",
    pgPassedYear: "",
    pgSubject: "",
    pgCollegeDept: "",
    pgPercentage: "",
    pgTotalMarks: "",
    pgMarksObtained: "",
    otherQualification: "",
    rfidCardId: "",
    groupId: "",
  },
  {
    id: "stu002",
    schoolId: "school1",
    isActive: true,
    rollNo: "002",
    admissionNo: "ADM2024002",
    studyingYear: "1st Year",
    session: "2024-26",
    jcecebRegNo: "JEC2024002",
    jcecebRollNo: "R2024002",
    cmlRank: "245",
    course: "D.El.Ed",
    semYear: "1st Year",
    dateOfAdmission: "2024-07-16",
    universityBoardRollNo: "UNI2024002",
    registrationNo: "REG2024002",
    name: "Priya Kumari",
    fatherName: "Suresh Prasad",
    motherName: "Anita Devi",
    dateOfBirth: "2001-08-22",
    gender: "Female",
    category: "OBC",
    maritalStatus: "Single",
    uidNo: "2345-6789-0123",
    ph: false,
    email: "priya@email.com",
    mobileCall: "9765432109",
    mobileWhatsapp: "9765432109",
    vill: "Hirapur",
    po: "Hirapur",
    ps: "Dhanbad",
    dist: "Dhanbad",
    state: "Jharkhand",
    pinCode: "826001",
    majorSubject: "Hindi",
    minorSubject: "Social Science",
    photoUrl: "",
    matricPassedYear: "2019",
    matricSubject: "Hindi",
    matricSchool: "Kendriya Vidyalaya Dhanbad",
    matricPercentage: "82",
    matricTotalMarks: "500",
    matricMarksObtained: "410",
    interPassedYear: "2021",
    interSubject: "Arts",
    interCollege: "Women's College Dhanbad",
    interPercentage: "75",
    interTotalMarks: "500",
    interMarksObtained: "375",
    gradPassedYear: "2024",
    gradSubject: "Hindi",
    gradCollege: "Vinoba Bhave University",
    gradPercentage: "71",
    gradTotalMarks: "1800",
    gradMarksObtained: "1278",
    pgPassedYear: "",
    pgSubject: "",
    pgCollegeDept: "",
    pgPercentage: "",
    pgTotalMarks: "",
    pgMarksObtained: "",
    otherQualification: "",
    rfidCardId: "",
    groupId: "",
  },
  {
    id: "stu003",
    schoolId: "school1",
    isActive: true,
    rollNo: "003",
    admissionNo: "ADM2023001",
    studyingYear: "2nd Year",
    session: "2023-25",
    jcecebRegNo: "JEC2023456",
    jcecebRollNo: "R2023456",
    cmlRank: "245",
    course: "B.Ed",
    semYear: "2nd Year",
    dateOfAdmission: "2023-07-10",
    universityBoardRollNo: "UNI2023001",
    registrationNo: "REG2023001",
    name: "Amit Kumar",
    fatherName: "Mohan Kumar",
    motherName: "Geeta Devi",
    dateOfBirth: "1999-03-10",
    gender: "Male",
    category: "SC",
    maritalStatus: "Single",
    uidNo: "3456-7890-1234",
    ph: false,
    email: "amit@email.com",
    mobileCall: "9654321098",
    mobileWhatsapp: "9654321098",
    vill: "Chas",
    po: "Chas",
    ps: "Bokaro",
    dist: "Bokaro",
    state: "Jharkhand",
    pinCode: "827001",
    majorSubject: "English",
    minorSubject: "History",
    photoUrl: "",
    matricPassedYear: "2017",
    matricSubject: "Science",
    matricSchool: "Bokaro Steel City School",
    matricPercentage: "74",
    matricTotalMarks: "500",
    matricMarksObtained: "370",
    interPassedYear: "2019",
    interSubject: "Commerce",
    interCollege: "Bokaro College",
    interPercentage: "69",
    interTotalMarks: "500",
    interMarksObtained: "345",
    gradPassedYear: "2022",
    gradSubject: "English",
    gradCollege: "Bokaro University",
    gradPercentage: "65",
    gradTotalMarks: "1800",
    gradMarksObtained: "1170",
    pgPassedYear: "2024",
    pgSubject: "English Literature",
    pgCollegeDept: "English Dept, Jharkhand Univ.",
    pgPercentage: "70",
    pgTotalMarks: "1000",
    pgMarksObtained: "700",
    otherQualification: "CTET Qualified (2023)",
    rfidCardId: "",
    groupId: "",
  },
  {
    id: "stu004",
    schoolId: "school1",
    isActive: false,
    rollNo: "004",
    admissionNo: "ADM2024003",
    studyingYear: "1st Year",
    session: "2024-26",
    jcecebRegNo: "",
    jcecebRollNo: "",
    cmlRank: "",
    course: "D.El.Ed",
    semYear: "1st Year",
    dateOfAdmission: "2024-07-18",
    universityBoardRollNo: "UNI2024003",
    registrationNo: "REG2024003",
    name: "Sunita Mahto",
    fatherName: "Birsa Mahto",
    motherName: "Kamla Mahto",
    dateOfBirth: "2002-11-05",
    gender: "Female",
    category: "ST",
    maritalStatus: "Single",
    uidNo: "4567-8901-2345",
    ph: false,
    email: "sunita@email.com",
    mobileCall: "9543210987",
    mobileWhatsapp: "",
    vill: "Torpa",
    po: "Torpa",
    ps: "Torpa",
    dist: "Khunti",
    state: "Jharkhand",
    pinCode: "835210",
    majorSubject: "Social Science",
    minorSubject: "Hindi",
    photoUrl: "",
    matricPassedYear: "2020",
    matricSubject: "Arts",
    matricSchool: "Torpa High School",
    matricPercentage: "65",
    matricTotalMarks: "500",
    matricMarksObtained: "325",
    interPassedYear: "2022",
    interSubject: "Arts",
    interCollege: "Khunti College",
    interPercentage: "60",
    interTotalMarks: "500",
    interMarksObtained: "300",
    gradPassedYear: "2024",
    gradSubject: "Social Science",
    gradCollege: "Kolhan University",
    gradPercentage: "58",
    gradTotalMarks: "1800",
    gradMarksObtained: "1044",
    pgPassedYear: "",
    pgSubject: "",
    pgCollegeDept: "",
    pgPercentage: "",
    pgTotalMarks: "",
    pgMarksObtained: "",
    otherQualification: "",
    rfidCardId: "",
    groupId: "",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
}: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5 pb-3 border-b border-border">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

function FormSection({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 w-1 rounded-full bg-primary" />
        <h4 className="font-semibold text-sm uppercase tracking-wider text-primary">
          {title}
        </h4>
      </div>
      <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
        {children}
      </div>
    </div>
  );
}

function FieldGrid({
  cols = 3,
  children,
}: { cols?: 2 | 3; children: React.ReactNode }) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : ""} gap-3`}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  span,
}: { label: string; children: React.ReactNode; span?: "full" | 2 }) {
  return (
    <div
      className={`space-y-1.5 ${
        span === "full"
          ? "sm:col-span-2 lg:col-span-3"
          : span === 2
            ? "sm:col-span-2"
            : ""
      }`}
    >
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Attendance Section Component ────────────────────────────────────────────

interface AttendanceSectionProps {
  attDate: string;
  setAttDate: (v: string) => void;
  attCourse: string;
  setAttCourse: (v: string) => void;
  attSemYear: string;
  setAttSemYear: (v: string) => void;
  attStudents: ExpandedStudent[];
  dailyAtt: Record<string, "present" | "absent" | "late" | "half-day">;
  setDailyAtt: React.Dispatch<
    React.SetStateAction<
      Record<string, "present" | "absent" | "late" | "half-day">
    >
  >;
  sessionEntries: SessionAttendanceEntry[];
  attMode: "manual" | "qr" | "rfid";
  setAttMode: (v: "manual" | "qr" | "rfid") => void;
  rfidInput: string;
  setRfidInput: (v: string) => void;
  rfidInputRef: React.RefObject<HTMLInputElement | null>;
  handleRFIDInput: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  processQRScan: (data: string) => void;
  saveSessionAttendance: () => void;
  attSaved: boolean;
}

function AttendanceSection({
  attDate,
  setAttDate,
  attCourse,
  setAttCourse,
  attSemYear,
  setAttSemYear,
  attStudents,
  dailyAtt,
  setDailyAtt,
  sessionEntries,
  attMode,
  setAttMode,
  rfidInput,
  setRfidInput,
  rfidInputRef,
  handleRFIDInput,
  processQRScan,
  saveSessionAttendance,
  attSaved,
}: AttendanceSectionProps) {
  const qrScanner = useQRScanner({
    facingMode: "environment",
    scanInterval: 200,
    maxResults: 20,
  });

  useEffect(() => {
    if (qrScanner.qrResults.length > 0) {
      const latest = qrScanner.qrResults[0];
      processQRScan(latest.data);
    }
  }, [qrScanner.qrResults, processQRScan]);

  useEffect(() => {
    if (attMode === "rfid" && rfidInputRef.current) {
      rfidInputRef.current.focus();
    }
  }, [attMode, rfidInputRef]);

  // Stop scanning when leaving QR mode
  useEffect(() => {
    if (attMode !== "qr" && qrScanner.isScanning) {
      qrScanner.stopScanning();
    }
  }, [attMode, qrScanner.isScanning, qrScanner.stopScanning]);

  const statusColors: Record<string, string> = {
    present:
      "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400",
    absent: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400",
    late: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400",
    "half-day":
      "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400",
  };

  const methodBadge: Record<string, string> = {
    manual: "bg-slate-100 text-slate-700",
    qr: "bg-violet-100 text-violet-700",
    rfid: "bg-cyan-100 text-cyan-700",
  };

  const presentCount = attStudents.filter(
    (s) => (dailyAtt[s.id] ?? "absent") === "present",
  ).length;
  const absentCount = attStudents.filter(
    (s) => (dailyAtt[s.id] ?? "absent") === "absent",
  ).length;
  const lateCount = attStudents.filter(
    (s) => (dailyAtt[s.id] ?? "absent") === "late",
  ).length;
  const _halfDayCount = attStudents.filter(
    (s) => (dailyAtt[s.id] ?? "absent") === "half-day",
  ).length;

  return (
    <div>
      <SectionHeader
        title="Student Attendance"
        subtitle="Mark attendance via Manual entry, QR Code scan, or RFID card"
      />

      {/* Session Setup */}
      <div className="flex flex-wrap gap-3 mb-5 p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Date
          </Label>
          <input
            type="date"
            value={attDate}
            onChange={(e) => setAttDate(e.target.value)}
            className="flex h-9 w-40 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            data-ocid="attendance.input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Course
          </Label>
          <Select value={attCourse} onValueChange={setAttCourse}>
            <SelectTrigger className="w-32" data-ocid="attendance.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {COURSES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Sem/Year
          </Label>
          <Select value={attSemYear} onValueChange={setAttSemYear}>
            <SelectTrigger
              className="w-32"
              data-ocid="attendance.secondary_button"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {SEM_YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-5" data-ocid="attendance.tab">
        {(["manual", "qr", "rfid"] as const).map((mode) => (
          <button
            type="button"
            key={mode}
            onClick={() => setAttMode(mode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              attMode === mode
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            }`}
            data-ocid={`attendance.${mode}_button`}
          >
            {mode === "manual" && <CalendarCheck size={15} />}
            {mode === "qr" && <QrCode size={15} />}
            {mode === "rfid" && <CreditCard size={15} />}
            {mode === "manual" ? "Manual" : mode === "qr" ? "QR Scan" : "RFID"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: Input Panel */}
        <div className="xl:col-span-2 space-y-4">
          {/* ── Manual Mode ── */}
          {attMode === "manual" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarCheck size={16} className="text-primary" /> Manual
                    Attendance
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newAtt: Record<
                          string,
                          "present" | "absent" | "late" | "half-day"
                        > = {};
                        for (const s of attStudents) {
                          newAtt[s.id] = "present";
                        }
                        setDailyAtt((p) => ({ ...p, ...newAtt }));
                      }}
                      data-ocid="attendance.primary_button"
                    >
                      <CheckCircle2 size={13} className="mr-1" /> Mark All
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDailyAtt({})}
                      data-ocid="attendance.cancel_button"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">Photo</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead className="text-center">Present</TableHead>
                        <TableHead className="text-center">Absent</TableHead>
                        <TableHead className="text-center">Late</TableHead>
                        <TableHead className="text-center">Half-Day</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attStudents.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-muted-foreground"
                            data-ocid="attendance.empty_state"
                          >
                            No students match the selected filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        attStudents.map((s, i) => (
                          <TableRow
                            key={s.id}
                            data-ocid={`attendance.item.${i + 1}`}
                          >
                            <TableCell>
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={s.photoUrl} />
                                <AvatarFallback className="text-xs">
                                  {s.name[0]}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {s.rollNo}
                            </TableCell>
                            <TableCell className="font-medium">
                              {s.name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {s.course}
                            </TableCell>
                            {(
                              ["present", "absent", "late", "half-day"] as const
                            ).map((status) => (
                              <TableCell key={status} className="text-center">
                                <input
                                  type="radio"
                                  name={`att_${s.id}`}
                                  checked={
                                    (dailyAtt[s.id] ?? "absent") === status
                                  }
                                  onChange={() =>
                                    setDailyAtt((p) => ({
                                      ...p,
                                      [s.id]: status,
                                    }))
                                  }
                                  className="w-4 h-4 accent-primary"
                                  data-ocid={`attendance.radio.${i + 1}`}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── QR Scan Mode ── */}
          {attMode === "qr" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <QrCode size={16} className="text-primary" /> QR Code
                  Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!qrScanner.isSupported ? (
                  <div
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="attendance.error_state"
                  >
                    <Wifi size={32} className="mx-auto mb-2 opacity-40" />
                    <p>Camera not supported in this browser.</p>
                    <p className="text-xs mt-1">
                      Use Chrome on desktop/Android for best results.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video max-h-64">
                      <video
                        ref={qrScanner.videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                        autoPlay
                      />
                      <canvas ref={qrScanner.canvasRef} className="hidden" />
                      {!qrScanner.isActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2">
                          <Camera size={36} className="opacity-60" />
                          <p className="text-sm opacity-70">
                            Camera not started
                          </p>
                        </div>
                      )}
                      {qrScanner.isScanning && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary rounded-lg opacity-80" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 border-t-2 border-primary animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!qrScanner.isScanning ? (
                        <Button
                          onClick={() => qrScanner.startScanning()}
                          disabled={
                            !qrScanner.canStartScanning || qrScanner.isLoading
                          }
                          data-ocid="attendance.primary_button"
                        >
                          <Camera size={14} className="mr-1.5" />
                          {qrScanner.isLoading
                            ? "Starting..."
                            : "Start Scanning"}
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() => qrScanner.stopScanning()}
                          data-ocid="attendance.cancel_button"
                        >
                          <StopCircle size={14} className="mr-1.5" /> Stop
                          Scanning
                        </Button>
                      )}
                      {/Mobi|Android/i.test(navigator.userAgent) && (
                        <Button
                          variant="outline"
                          onClick={() => qrScanner.switchCamera()}
                          data-ocid="attendance.toggle"
                        >
                          Switch Camera
                        </Button>
                      )}
                    </div>
                    {qrScanner.error && (
                      <p
                        className="text-sm text-destructive"
                        data-ocid="attendance.error_state"
                      >
                        {typeof qrScanner.error === "string"
                          ? qrScanner.error
                          : qrScanner.error
                            ? String(qrScanner.error)
                            : null}
                      </p>
                    )}
                    <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                      <p className="font-medium mb-1">How it works:</p>
                      <p>1. Select date, course and sem/year above.</p>
                      <p>2. Click Start Scanning.</p>
                      <p>3. Show student&apos;s QR code to the camera.</p>
                      <p>4. Student is automatically marked Present.</p>
                      <p className="mt-1">
                        QR format: STUDENT:&lt;AdmissionNo&gt;
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── RFID Mode ── */}
          {attMode === "rfid" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" /> RFID
                  Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Scan RFID Card / Enter Card ID
                  </Label>
                  <div className="relative">
                    <CreditCard
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      ref={rfidInputRef}
                      value={rfidInput}
                      onChange={(e) => setRfidInput(e.target.value)}
                      onKeyDown={handleRFIDInput}
                      placeholder="Scan or type card ID, then press Enter..."
                      className="pl-9 text-lg tracking-widest font-mono"
                      autoFocus
                      data-ocid="attendance.input"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    RFID USB reader acts as keyboard — card ID is typed
                    automatically. Press Enter or swipe card to mark attendance.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Setup Instructions:</p>
                  <p>• Connect RFID USB reader to the computer.</p>
                  <p>• Keep cursor in the input field above (auto-focused).</p>
                  <p>
                    • Swipe student card — ID is entered and student is marked
                    Present.
                  </p>
                  <p>• For manual testing: type the card ID and press Enter.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex gap-3 items-center">
            <Button
              onClick={saveSessionAttendance}
              data-ocid="attendance.submit_button"
            >
              Save Attendance
            </Button>
            {attSaved && (
              <span
                className="text-sm text-emerald-600 font-medium"
                data-ocid="attendance.success_state"
              >
                ✓ Attendance saved!
              </span>
            )}
          </div>
        </div>

        {/* Right: Live Session Log */}
        <div className="space-y-3">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-500/10 border border-emerald-200 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-emerald-700">
                {presentCount}
              </p>
              <p className="text-xs text-emerald-600">Present</p>
            </div>
            <div className="bg-red-500/10 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-red-700">{absentCount}</p>
              <p className="text-xs text-red-600">Absent</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-200 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-amber-700">{lateCount}</p>
              <p className="text-xs text-amber-600">Late</p>
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-slate-700">
                {attStudents.length}
              </p>
              <p className="text-xs text-slate-600">Total</p>
            </div>
          </div>

          {/* Session Log */}
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <CalendarDays size={14} /> Session Log
                <Badge variant="secondary" className="ml-auto text-xs">
                  {sessionEntries.length} marked
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {sessionEntries.length === 0 ? (
                  <p
                    className="text-xs text-muted-foreground text-center py-6"
                    data-ocid="attendance.empty_state"
                  >
                    No students marked yet
                  </p>
                ) : (
                  sessionEntries.map((entry, i) => (
                    <div
                      key={entry.studentId}
                      className="px-3 py-2"
                      data-ocid={`attendance.log.${i + 1}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">
                            {entry.studentName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {entry.rollNo}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full border capitalize ${statusColors[entry.status]}`}
                          >
                            {entry.status}
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full uppercase font-medium ${methodBadge[entry.method]}`}
                          >
                            {entry.method}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudentInfoModule() {
  const { currentSchoolId } = useApp();

  // ── State ──
  const [activeSection, setActiveSection] =
    useState<SectionKey>("student-list");
  const [students, setStudents] = useState<ExpandedStudent[]>(
    SEED_STUDENTS.map((s) => ({ ...s, schoolId: currentSchoolId })),
  );
  const [categories, setCategories] = useState<string[]>([
    ...DEFAULT_CATEGORIES,
  ]);
  const [groups, setGroups] = useState<StudentGroup[]>([
    {
      id: "g1",
      name: "Morning Batch",
      description: "9 AM - 12 PM",
      memberIds: ["stu001", "stu002"],
    },
    {
      id: "g2",
      name: "Afternoon Batch",
      description: "1 PM - 4 PM",
      memberIds: ["stu003"],
    },
  ]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  // Add Student form state
  const [studentForm, setStudentForm] =
    useState<Omit<ExpandedStudent, "id" | "schoolId" | "isActive">>(
      EMPTY_STUDENT,
    );
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // List filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSession, setFilterSession] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // View modal
  const [viewingStudent, setViewingStudent] = useState<ExpandedStudent | null>(
    null,
  );

  // Attendance
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attCourse, setAttCourse] = useState("all");
  const [attSemYear, setAttSemYear] = useState("all");
  const [dailyAtt, setDailyAtt] = useState<
    Record<string, "present" | "absent" | "late" | "half-day">
  >({});
  const [attSaved, setAttSaved] = useState(false);
  const [attMode, setAttMode] = useState<"manual" | "qr" | "rfid">("manual");
  const [sessionEntries, setSessionEntries] = useState<
    SessionAttendanceEntry[]
  >([]);
  const [rfidInput, setRfidInput] = useState("");
  const [qrStudentQRModal, setQrStudentQRModal] = useState<{
    admissionNo: string;
    name: string;
  } | null>(null);
  const rfidInputRef = useRef<HTMLInputElement>(null);
  const processedQRRef = useRef<Set<string>>(new Set());

  // Attendance report filters
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [reportCourse, setReportCourse] = useState("all");

  // Subject attendance
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Promote
  const [selectedPromote, setSelectedPromote] = useState<Set<string>>(
    new Set(),
  );
  const [targetSession, setTargetSession] = useState("2025-27");
  const [targetYear, setTargetYear] = useState("2nd Year");
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);

  // Category
  const [newCatName, setNewCatName] = useState("");

  // Group
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: "", description: "" });
  const [viewingGroup, setViewingGroup] = useState<StudentGroup | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Derived ──
  const filteredStudents = students.filter((s) => {
    if (
      filterStatus !== "all" &&
      (filterStatus === "active" ? !s.isActive : s.isActive)
    )
      return false;
    if (filterSession !== "all" && s.session !== filterSession) return false;
    if (filterCourse !== "all" && s.course !== filterCourse) return false;
    if (filterCategory !== "all" && s.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !s.name.toLowerCase().includes(q) &&
        !s.rollNo.toLowerCase().includes(q) &&
        !s.admissionNo.toLowerCase().includes(q) &&
        !s.registrationNo.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const attStudents = students.filter((s) => {
    if (!s.isActive) return false;
    if (attCourse !== "all" && s.course !== attCourse) return false;
    if (attSemYear !== "all" && s.semYear !== attSemYear) return false;
    return true;
  });

  // ── Handlers ──
  const sf = (field: keyof typeof studentForm, val: string | boolean) =>
    setStudentForm((p) => ({ ...p, [field]: val }));

  const openAddStudent = () => {
    setEditingStudentId(null);
    setStudentForm({ ...EMPTY_STUDENT });
    setActiveSection("add-student");
  };

  const openEditStudent = (s: ExpandedStudent) => {
    setEditingStudentId(s.id);
    setStudentForm({
      rollNo: s.rollNo,
      admissionNo: s.admissionNo,
      studyingYear: s.studyingYear,
      session: s.session,
      jcecebRegNo: s.jcecebRegNo,
      jcecebRollNo: s.jcecebRollNo,
      cmlRank: s.cmlRank,
      course: s.course,
      semYear: s.semYear,
      dateOfAdmission: s.dateOfAdmission,
      universityBoardRollNo: s.universityBoardRollNo,
      registrationNo: s.registrationNo,
      name: s.name,
      fatherName: s.fatherName,
      motherName: s.motherName,
      dateOfBirth: s.dateOfBirth,
      gender: s.gender,
      category: s.category,
      maritalStatus: s.maritalStatus,
      uidNo: s.uidNo,
      ph: s.ph,
      email: s.email,
      mobileCall: s.mobileCall,
      mobileWhatsapp: s.mobileWhatsapp,
      vill: s.vill,
      po: s.po,
      ps: s.ps,
      dist: s.dist,
      state: s.state,
      pinCode: s.pinCode,
      majorSubject: s.majorSubject,
      minorSubject: s.minorSubject,
      photoUrl: s.photoUrl,
      matricPassedYear: s.matricPassedYear,
      matricSubject: s.matricSubject,
      matricSchool: s.matricSchool,
      matricPercentage: s.matricPercentage,
      matricTotalMarks: s.matricTotalMarks,
      matricMarksObtained: s.matricMarksObtained,
      interPassedYear: s.interPassedYear,
      interSubject: s.interSubject,
      interCollege: s.interCollege,
      interPercentage: s.interPercentage,
      interTotalMarks: s.interTotalMarks,
      interMarksObtained: s.interMarksObtained,
      gradPassedYear: s.gradPassedYear,
      gradSubject: s.gradSubject,
      gradCollege: s.gradCollege,
      gradPercentage: s.gradPercentage,
      gradTotalMarks: s.gradTotalMarks,
      gradMarksObtained: s.gradMarksObtained,
      pgPassedYear: s.pgPassedYear,
      pgSubject: s.pgSubject,
      pgCollegeDept: s.pgCollegeDept,
      pgPercentage: s.pgPercentage,
      pgTotalMarks: s.pgTotalMarks,
      pgMarksObtained: s.pgMarksObtained,
      otherQualification: s.otherQualification,
      rfidCardId: s.rfidCardId,
      groupId: s.groupId,
    });
    setActiveSection("add-student");
  };

  const saveStudent = () => {
    if (!studentForm.name.trim()) return;
    if (editingStudentId) {
      setStudents((p) =>
        p.map((s) =>
          s.id === editingStudentId ? { ...s, ...studentForm } : s,
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
    setEditingStudentId(null);
    setStudentForm({ ...EMPTY_STUDENT });
    setActiveSection("student-list");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => sf("photoUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const _saveAttendance = () => {
    const newRecords = attStudents.map((s) => ({
      studentId: s.id,
      date: attDate,
      status: dailyAtt[s.id] ?? "present",
    }));
    setAttendanceRecords((p) => [
      ...p.filter(
        (r) =>
          !(
            r.date === attDate &&
            newRecords.some((n) => n.studentId === r.studentId)
          ),
      ),
      ...newRecords,
    ]);
    setAttSaved(true);
    setTimeout(() => setAttSaved(false), 2000);
  };

  const getAttSummary = (studentId: string) => {
    const records = attendanceRecords.filter((r) => r.studentId === studentId);
    const total = records.length || 20;
    const present =
      records.filter((r) => r.status === "present" || r.status === "half-day")
        .length || Math.floor(Math.random() * 5) + 15;
    const absent = total - present;
    const pct = Math.round((present / total) * 100);
    return { total, present, absent, pct };
  };

  const promoteSelected = () => {
    setStudents((p) =>
      p.map((s) =>
        selectedPromote.has(s.id)
          ? {
              ...s,
              session: targetSession,
              studyingYear: targetYear,
              semYear: targetYear,
            }
          : s,
      ),
    );
    setSelectedPromote(new Set());
    setShowPromoteConfirm(false);
  };

  const addGroup = () => {
    if (!groupForm.name.trim()) return;
    setGroups((p) => [
      ...p,
      { id: `g${Date.now()}`, ...groupForm, memberIds: [] },
    ]);
    setGroupForm({ name: "", description: "" });
    setShowAddGroup(false);
  };

  // ── Attendance Handlers ──
  const _markStudentPresent = (
    studentId: string,
    method: "manual" | "qr" | "rfid",
  ) => {
    const student = attStudents.find((s) => s.id === studentId);
    if (!student) return;
    const ts = new Date().toISOString();
    setSessionEntries((prev) => {
      const existing = prev.find((e) => e.studentId === studentId);
      if (existing) {
        return prev.map((e) =>
          e.studentId === studentId
            ? { ...e, status: "present", method, timestamp: ts }
            : e,
        );
      }
      return [
        ...prev,
        {
          studentId,
          studentName: student.name,
          rollNo: student.rollNo,
          status: "present",
          method,
          timestamp: ts,
        },
      ];
    });
    setDailyAtt((p) => ({ ...p, [studentId]: "present" }));
  };

  const processQRScan = useCallback(
    (data: string) => {
      if (processedQRRef.current.has(data)) return;
      processedQRRef.current.add(data);
      setTimeout(() => processedQRRef.current.delete(data), 3000);

      let admissionNo = data;
      if (data.startsWith("STUDENT:")) {
        admissionNo = data.replace("STUDENT:", "");
      }
      const student = attStudents.find(
        (s) => s.admissionNo === admissionNo || s.rollNo === admissionNo,
      );
      if (student) {
        const ts = new Date().toISOString();
        setSessionEntries((prev) => {
          const existing = prev.find((e) => e.studentId === student.id);
          if (existing)
            return prev.map((e) =>
              e.studentId === student.id
                ? {
                    ...e,
                    status: "present",
                    method: "qr" as const,
                    timestamp: ts,
                  }
                : e,
            );
          return [
            ...prev,
            {
              studentId: student.id,
              studentName: student.name,
              rollNo: student.rollNo,
              status: "present" as const,
              method: "qr" as const,
              timestamp: ts,
            },
          ];
        });
        setDailyAtt((p) => ({ ...p, [student.id]: "present" }));
        toast.success(`${student.name} marked Present via QR`);
      } else {
        toast.error(`No student found for QR: ${admissionNo}`);
      }
    },
    [attStudents],
  );

  const handleRFIDInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const cardId = rfidInput.trim();
      if (!cardId) return;
      const student = attStudents.find(
        (s) => s.rfidCardId === cardId || s.admissionNo === cardId,
      );
      if (student) {
        const ts = new Date().toISOString();
        setSessionEntries((prev) => {
          const existing = prev.find((e) => e.studentId === student.id);
          if (existing)
            return prev.map((e) =>
              e.studentId === student.id
                ? {
                    ...e,
                    status: "present",
                    method: "rfid" as const,
                    timestamp: ts,
                  }
                : e,
            );
          return [
            ...prev,
            {
              studentId: student.id,
              studentName: student.name,
              rollNo: student.rollNo,
              status: "present" as const,
              method: "rfid" as const,
              timestamp: ts,
            },
          ];
        });
        setDailyAtt((p) => ({ ...p, [student.id]: "present" }));
        toast.success(`${student.name} — Present (RFID)`);
      } else {
        toast.error(`No student found for card ID: ${cardId}`);
      }
      setRfidInput("");
      rfidInputRef.current?.focus();
    }
  };

  const saveSessionAttendance = () => {
    const ts = new Date().toISOString();
    const newRecords: AttendanceRecord[] = attStudents.map((s) => ({
      studentId: s.id,
      date: attDate,
      status: dailyAtt[s.id] ?? "absent",
      method:
        sessionEntries.find((e) => e.studentId === s.id)?.method ?? "manual",
      timestamp:
        sessionEntries.find((e) => e.studentId === s.id)?.timestamp ?? ts,
    }));
    setAttendanceRecords((p) => [
      ...p.filter(
        (r) =>
          !(
            r.date === attDate &&
            newRecords.some((n) => n.studentId === r.studentId)
          ),
      ),
      ...newRecords,
    ]);
    setAttSaved(true);
    setTimeout(() => setAttSaved(false), 2500);
  };

  // ── Sidebar nav items ──
  const navItems: {
    key: SectionKey;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      key: "category",
      label: "Student Category",
      icon: <Tag size={16} />,
      count: categories.length,
    },
    {
      key: "add-student",
      label: editingStudentId ? "Edit Student" : "Add Student",
      icon: <UserPlus size={16} />,
    },
    {
      key: "student-list",
      label: "Student List",
      icon: <Users size={16} />,
      count: students.length,
    },
    {
      key: "attendance",
      label: "Student Attendance",
      icon: <CalendarCheck size={16} />,
    },
    {
      key: "attendance-report",
      label: "Attendance Report",
      icon: <TrendingUp size={16} />,
    },
    {
      key: "subject-attendance",
      label: "Subject Wise Attendance",
      icon: <BookOpen size={16} />,
    },
    {
      key: "student-group",
      label: "Student Group",
      icon: <Grid3X3 size={16} />,
      count: groups.length,
    },
    {
      key: "student-promote",
      label: "Student Promote",
      icon: <CalendarDays size={16} />,
    },
    {
      key: "disable-student",
      label: "Disable Student",
      icon: <UserMinus size={16} />,
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-0 h-full min-h-screen" data-ocid="student.page">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-sidebar border-r border-sidebar-border">
        <div className="px-4 py-4 border-b border-sidebar-border">
          <h2 className="text-sm font-bold text-sidebar-foreground uppercase tracking-wider">
            Student Info
          </h2>
        </div>
        <nav className="py-2" data-ocid="student.tab">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              data-ocid={`student.${item.key}.link`}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                activeSection === item.key
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </span>
              <span className="flex items-center gap-1">
                {item.count !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeSection === item.key
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {activeSection === item.key && <ChevronRight size={14} />}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-background">
        {/* ── 1. Student Category ── */}
        {activeSection === "category" && (
          <div>
            <SectionHeader
              title="Student Category"
              subtitle="Manage student categories for classification"
            />
            <div className="flex gap-3 mb-5">
              <Input
                placeholder="New category name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="max-w-xs"
                data-ocid="category.input"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCatName.trim()) {
                    setCategories((p) => [...p, newCatName.trim()]);
                    setNewCatName("");
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (newCatName.trim()) {
                    setCategories((p) => [...p, newCatName.trim()]);
                    setNewCatName("");
                  }
                }}
                data-ocid="category.primary_button"
              >
                <Plus size={15} className="mr-1" /> Add Category
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table data-ocid="category.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead className="w-24">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat, i) => (
                      <TableRow key={cat} data-ocid={`category.item.${i + 1}`}>
                        <TableCell className="text-muted-foreground text-sm">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">{cat}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {students.filter((s) => s.category === cat).length}
                        </TableCell>
                        <TableCell>
                          {!DEFAULT_CATEGORIES.includes(cat) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive h-7 w-7 p-0"
                              onClick={() =>
                                setCategories((p) => p.filter((c) => c !== cat))
                              }
                              data-ocid={`category.delete_button.${i + 1}`}
                            >
                              <Trash2 size={13} />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── 2. Add / Edit Student ── */}
        {activeSection === "add-student" && (
          <div>
            <SectionHeader
              title={editingStudentId ? "Edit Student" : "Add New Student"}
              subtitle="Fill in all details carefully. Fields marked * are important."
            />
            <div className="max-w-5xl space-y-2">
              {/* Academic Info */}
              <FormSection title="Academic Information">
                <FieldGrid cols={3}>
                  <Field label="Roll No">
                    <Input
                      value={studentForm.rollNo}
                      onChange={(e) => sf("rollNo", e.target.value)}
                      data-ocid="student.roll_no.input"
                    />
                  </Field>
                  <Field label="Admission No">
                    <Input
                      value={studentForm.admissionNo}
                      onChange={(e) => sf("admissionNo", e.target.value)}
                      data-ocid="student.admission_no.input"
                    />
                  </Field>
                  <Field label="Registration No">
                    <Input
                      value={studentForm.registrationNo}
                      onChange={(e) => sf("registrationNo", e.target.value)}
                      data-ocid="student.registration_no.input"
                    />
                  </Field>
                  <Field label="Studying Year">
                    <Select
                      value={studentForm.studyingYear}
                      onValueChange={(v) => sf("studyingYear", v)}
                    >
                      <SelectTrigger data-ocid="student.studying_year.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDYING_YEARS.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Session">
                    <Select
                      value={studentForm.session}
                      onValueChange={(v) => sf("session", v)}
                    >
                      <SelectTrigger data-ocid="student.session.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Course">
                    <Select
                      value={studentForm.course}
                      onValueChange={(v) => sf("course", v)}
                    >
                      <SelectTrigger data-ocid="student.course.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COURSES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Sem / Year">
                    <Select
                      value={studentForm.semYear}
                      onValueChange={(v) => sf("semYear", v)}
                    >
                      <SelectTrigger data-ocid="student.sem_year.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEM_YEARS.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Date of Admission">
                    <Input
                      type="date"
                      value={studentForm.dateOfAdmission}
                      onChange={(e) => sf("dateOfAdmission", e.target.value)}
                      data-ocid="student.date_of_admission.input"
                    />
                  </Field>
                  <Field label="JCECEB Reg. No.">
                    <Input
                      value={studentForm.jcecebRegNo}
                      onChange={(e) => sf("jcecebRegNo", e.target.value)}
                      data-ocid="student.jceceb_reg.input"
                    />
                  </Field>
                  <Field label="JCECEB Roll No.">
                    <Input
                      value={studentForm.jcecebRollNo}
                      onChange={(e) => sf("jcecebRollNo", e.target.value)}
                      data-ocid="student.jceceb_roll.input"
                    />
                  </Field>
                  <Field label="CML Rank">
                    <Input
                      value={studentForm.cmlRank}
                      onChange={(e) => sf("cmlRank", e.target.value)}
                      data-ocid="student.cml_rank.input"
                    />
                  </Field>
                  <Field label="University/Board Roll No.">
                    <Input
                      value={studentForm.universityBoardRollNo}
                      onChange={(e) =>
                        sf("universityBoardRollNo", e.target.value)
                      }
                      data-ocid="student.univ_roll.input"
                    />
                  </Field>
                  <Field label="RFID Card ID">
                    <Input
                      value={studentForm.rfidCardId}
                      onChange={(e) => sf("rfidCardId", e.target.value)}
                      placeholder="RFID card number"
                      data-ocid="student.rfid.input"
                    />
                  </Field>
                </FieldGrid>
              </FormSection>

              {/* Personal Info */}
              <FormSection title="Personal Information">
                <FieldGrid cols={3}>
                  <Field label="Full Name *">
                    <Input
                      value={studentForm.name}
                      onChange={(e) => sf("name", e.target.value)}
                      placeholder="Student's full name"
                      data-ocid="student.name.input"
                    />
                  </Field>
                  <Field label="Father's Name">
                    <Input
                      value={studentForm.fatherName}
                      onChange={(e) => sf("fatherName", e.target.value)}
                      data-ocid="student.father_name.input"
                    />
                  </Field>
                  <Field label="Mother's Name">
                    <Input
                      value={studentForm.motherName}
                      onChange={(e) => sf("motherName", e.target.value)}
                      data-ocid="student.mother_name.input"
                    />
                  </Field>
                  <Field label="Date of Birth">
                    <Input
                      type="date"
                      value={studentForm.dateOfBirth}
                      onChange={(e) => sf("dateOfBirth", e.target.value)}
                      data-ocid="student.dob.input"
                    />
                  </Field>
                  <Field label="Gender">
                    <Select
                      value={studentForm.gender}
                      onValueChange={(v) => sf("gender", v)}
                    >
                      <SelectTrigger data-ocid="student.gender.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Category">
                    <Select
                      value={studentForm.category}
                      onValueChange={(v) => sf("category", v)}
                    >
                      <SelectTrigger data-ocid="student.category.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Marital Status">
                    <Select
                      value={studentForm.maritalStatus}
                      onValueChange={(v) => sf("maritalStatus", v)}
                    >
                      <SelectTrigger data-ocid="student.marital.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MARITAL_STATUSES.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="UID No (Aadhaar)">
                    <Input
                      value={studentForm.uidNo}
                      onChange={(e) => sf("uidNo", e.target.value)}
                      placeholder="XXXX-XXXX-XXXX"
                      data-ocid="student.uid.input"
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => sf("email", e.target.value)}
                      data-ocid="student.email.input"
                    />
                  </Field>
                  <Field label="Mobile (Calling)">
                    <Input
                      value={studentForm.mobileCall}
                      onChange={(e) => sf("mobileCall", e.target.value)}
                      data-ocid="student.mobile_call.input"
                    />
                  </Field>
                  <Field label="Mobile (WhatsApp)">
                    <Input
                      value={studentForm.mobileWhatsapp}
                      onChange={(e) => sf("mobileWhatsapp", e.target.value)}
                      data-ocid="student.mobile_wa.input"
                    />
                  </Field>
                  <Field label="Physically Handicapped (PH)">
                    <div className="flex items-center gap-2 h-9">
                      <Checkbox
                        checked={studentForm.ph}
                        onCheckedChange={(v) => sf("ph", !!v)}
                        data-ocid="student.ph.checkbox"
                      />
                      <span className="text-sm">Yes, PH</span>
                    </div>
                  </Field>
                </FieldGrid>
              </FormSection>

              {/* Address */}
              <FormSection title="Address Details">
                <FieldGrid cols={3}>
                  <Field label="Village (Vill)">
                    <Input
                      value={studentForm.vill}
                      onChange={(e) => sf("vill", e.target.value)}
                      data-ocid="student.vill.input"
                    />
                  </Field>
                  <Field label="PO">
                    <Input
                      value={studentForm.po}
                      onChange={(e) => sf("po", e.target.value)}
                      data-ocid="student.po.input"
                    />
                  </Field>
                  <Field label="PS">
                    <Input
                      value={studentForm.ps}
                      onChange={(e) => sf("ps", e.target.value)}
                      data-ocid="student.ps.input"
                    />
                  </Field>
                  <Field label="District">
                    <Input
                      value={studentForm.dist}
                      onChange={(e) => sf("dist", e.target.value)}
                      data-ocid="student.dist.input"
                    />
                  </Field>
                  <Field label="State">
                    <Select
                      value={studentForm.state}
                      onValueChange={(v) => sf("state", v)}
                    >
                      <SelectTrigger data-ocid="student.state.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {INDIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Pin Code">
                    <Input
                      value={studentForm.pinCode}
                      onChange={(e) => sf("pinCode", e.target.value)}
                      placeholder="6-digit PIN"
                      data-ocid="student.pincode.input"
                    />
                  </Field>
                </FieldGrid>
              </FormSection>

              {/* Subjects */}
              <FormSection title="Subject Details">
                <FieldGrid cols={2}>
                  <Field label="Major Subject">
                    <Select
                      value={studentForm.majorSubject}
                      onValueChange={(v) => sf("majorSubject", v)}
                    >
                      <SelectTrigger data-ocid="student.major_subject.select">
                        <SelectValue placeholder="Select major subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Minor Subject">
                    <Select
                      value={studentForm.minorSubject}
                      onValueChange={(v) => sf("minorSubject", v)}
                    >
                      <SelectTrigger data-ocid="student.minor_subject.select">
                        <SelectValue placeholder="Select minor subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGrid>
              </FormSection>

              {/* Photo */}
              <FormSection title="Student Photo">
                <div className="flex items-center gap-5">
                  <div className="w-24 h-28 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50 overflow-hidden">
                    {studentForm.photoUrl ? (
                      <img
                        src={studentForm.photoUrl}
                        alt="Student"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground text-center p-2">
                        No Photo
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => photoInputRef.current?.click()}
                      data-ocid="student.upload_button"
                    >
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Accepted: JPG, PNG. Max 2MB.
                      <br />
                      Passport size (3.5cm × 4.5cm)
                    </p>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Qualifications */}
              <FormSection title="Previous Qualifications">
                <div className="space-y-4">
                  {/* Matriculation */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                      Matriculation (10th)
                    </p>
                    <FieldGrid cols={3}>
                      <Field label="Passed Year">
                        <Input
                          value={studentForm.matricPassedYear}
                          onChange={(e) =>
                            sf("matricPassedYear", e.target.value)
                          }
                          placeholder="e.g. 2018"
                          data-ocid="student.matric_year.input"
                        />
                      </Field>
                      <Field label="Subject">
                        <Input
                          value={studentForm.matricSubject}
                          onChange={(e) => sf("matricSubject", e.target.value)}
                          data-ocid="student.matric_subject.input"
                        />
                      </Field>
                      <Field label="School Name">
                        <Input
                          value={studentForm.matricSchool}
                          onChange={(e) => sf("matricSchool", e.target.value)}
                          data-ocid="student.matric_school.input"
                        />
                      </Field>
                      <Field label="Percentage">
                        <Input
                          value={studentForm.matricPercentage}
                          onChange={(e) =>
                            sf("matricPercentage", e.target.value)
                          }
                          placeholder="%"
                          data-ocid="student.matric_pct.input"
                        />
                      </Field>
                      <Field label="Total Marks">
                        <Input
                          value={studentForm.matricTotalMarks}
                          onChange={(e) =>
                            sf("matricTotalMarks", e.target.value)
                          }
                          data-ocid="student.matric_total.input"
                        />
                      </Field>
                      <Field label="Marks Obtained">
                        <Input
                          value={studentForm.matricMarksObtained}
                          onChange={(e) =>
                            sf("matricMarksObtained", e.target.value)
                          }
                          data-ocid="student.matric_obtained.input"
                        />
                      </Field>
                    </FieldGrid>
                  </div>
                  {/* Intermediate */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                      Intermediate / +2 (12th)
                    </p>
                    <FieldGrid cols={3}>
                      <Field label="Passed Year">
                        <Input
                          value={studentForm.interPassedYear}
                          onChange={(e) =>
                            sf("interPassedYear", e.target.value)
                          }
                          data-ocid="student.inter_year.input"
                        />
                      </Field>
                      <Field label="Subject">
                        <Input
                          value={studentForm.interSubject}
                          onChange={(e) => sf("interSubject", e.target.value)}
                          data-ocid="student.inter_subject.input"
                        />
                      </Field>
                      <Field label="College / +2">
                        <Input
                          value={studentForm.interCollege}
                          onChange={(e) => sf("interCollege", e.target.value)}
                          data-ocid="student.inter_college.input"
                        />
                      </Field>
                      <Field label="Percentage">
                        <Input
                          value={studentForm.interPercentage}
                          onChange={(e) =>
                            sf("interPercentage", e.target.value)
                          }
                          data-ocid="student.inter_pct.input"
                        />
                      </Field>
                      <Field label="Total Marks">
                        <Input
                          value={studentForm.interTotalMarks}
                          onChange={(e) =>
                            sf("interTotalMarks", e.target.value)
                          }
                          data-ocid="student.inter_total.input"
                        />
                      </Field>
                      <Field label="Marks Obtained">
                        <Input
                          value={studentForm.interMarksObtained}
                          onChange={(e) =>
                            sf("interMarksObtained", e.target.value)
                          }
                          data-ocid="student.inter_obtained.input"
                        />
                      </Field>
                    </FieldGrid>
                  </div>
                  {/* Graduation */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                      Graduation (UG)
                    </p>
                    <FieldGrid cols={3}>
                      <Field label="Passed Year">
                        <Input
                          value={studentForm.gradPassedYear}
                          onChange={(e) => sf("gradPassedYear", e.target.value)}
                          data-ocid="student.grad_year.input"
                        />
                      </Field>
                      <Field label="Subject">
                        <Input
                          value={studentForm.gradSubject}
                          onChange={(e) => sf("gradSubject", e.target.value)}
                          data-ocid="student.grad_subject.input"
                        />
                      </Field>
                      <Field label="College">
                        <Input
                          value={studentForm.gradCollege}
                          onChange={(e) => sf("gradCollege", e.target.value)}
                          data-ocid="student.grad_college.input"
                        />
                      </Field>
                      <Field label="Percentage">
                        <Input
                          value={studentForm.gradPercentage}
                          onChange={(e) => sf("gradPercentage", e.target.value)}
                          data-ocid="student.grad_pct.input"
                        />
                      </Field>
                      <Field label="Total Marks">
                        <Input
                          value={studentForm.gradTotalMarks}
                          onChange={(e) => sf("gradTotalMarks", e.target.value)}
                          data-ocid="student.grad_total.input"
                        />
                      </Field>
                      <Field label="Marks Obtained">
                        <Input
                          value={studentForm.gradMarksObtained}
                          onChange={(e) =>
                            sf("gradMarksObtained", e.target.value)
                          }
                          data-ocid="student.grad_obtained.input"
                        />
                      </Field>
                    </FieldGrid>
                  </div>
                  {/* PG */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                      Post Graduation (PG)
                    </p>
                    <FieldGrid cols={3}>
                      <Field label="Passed Year">
                        <Input
                          value={studentForm.pgPassedYear}
                          onChange={(e) => sf("pgPassedYear", e.target.value)}
                          data-ocid="student.pg_year.input"
                        />
                      </Field>
                      <Field label="Subject">
                        <Input
                          value={studentForm.pgSubject}
                          onChange={(e) => sf("pgSubject", e.target.value)}
                          data-ocid="student.pg_subject.input"
                        />
                      </Field>
                      <Field label="College / Dept.">
                        <Input
                          value={studentForm.pgCollegeDept}
                          onChange={(e) => sf("pgCollegeDept", e.target.value)}
                          data-ocid="student.pg_college.input"
                        />
                      </Field>
                      <Field label="Percentage">
                        <Input
                          value={studentForm.pgPercentage}
                          onChange={(e) => sf("pgPercentage", e.target.value)}
                          data-ocid="student.pg_pct.input"
                        />
                      </Field>
                      <Field label="Total Marks">
                        <Input
                          value={studentForm.pgTotalMarks}
                          onChange={(e) => sf("pgTotalMarks", e.target.value)}
                          data-ocid="student.pg_total.input"
                        />
                      </Field>
                      <Field label="Marks Obtained">
                        <Input
                          value={studentForm.pgMarksObtained}
                          onChange={(e) =>
                            sf("pgMarksObtained", e.target.value)
                          }
                          data-ocid="student.pg_obtained.input"
                        />
                      </Field>
                    </FieldGrid>
                  </div>
                  {/* Other */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                      Any Other Qualification
                    </p>
                    <Textarea
                      value={studentForm.otherQualification}
                      onChange={(e) => sf("otherQualification", e.target.value)}
                      placeholder="e.g. CTET Qualified (2023), B.Ed Diploma..."
                      rows={3}
                      data-ocid="student.other_qual.textarea"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Actions */}
              <div className="flex gap-3 pt-2 pb-8">
                <Button onClick={saveStudent} data-ocid="student.submit_button">
                  {editingStudentId ? "Update Student" : "Save Student"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingStudentId(null);
                    setActiveSection("student-list");
                  }}
                  data-ocid="student.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. Student List ── */}
        {activeSection === "student-list" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <SectionHeader
                title="Student List"
                subtitle={`${filteredStudents.length} students found`}
              />
              <Button
                onClick={openAddStudent}
                data-ocid="students.primary_button"
                className="-mt-3"
              >
                <UserPlus size={15} className="mr-1.5" /> Add Student
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Input
                placeholder="Search by name, roll, admission no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
                data-ocid="students.search_input"
              />
              <Select value={filterSession} onValueChange={setFilterSession}>
                <SelectTrigger
                  className="w-32"
                  data-ocid="students.session.select"
                >
                  <SelectValue placeholder="Session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  {SESSIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger
                  className="w-28"
                  data-ocid="students.course.select"
                >
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {COURSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger
                  className="w-28"
                  data-ocid="students.category.select"
                >
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger
                  className="w-28"
                  data-ocid="students.status.select"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table data-ocid="students.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Photo</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Father's Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead>Sem/Year</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={11}
                            className="text-center py-10 text-muted-foreground"
                            data-ocid="students.empty_state"
                          >
                            No students found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudents.map((s, i) => (
                          <TableRow
                            key={s.id}
                            data-ocid={`students.item.${i + 1}`}
                            className={!s.isActive ? "opacity-50" : ""}
                          >
                            <TableCell>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={s.photoUrl} />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {s.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-mono text-sm font-medium">
                              {s.rollNo}
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">
                              {s.name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {s.fatherName}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {s.course}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {s.session}
                            </TableCell>
                            <TableCell className="text-sm">
                              {s.semYear}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {s.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm font-mono">
                              {s.mobileCall}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={s.isActive ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {s.isActive ? "Active" : "Disabled"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => setViewingStudent(s)}
                                  data-ocid={`students.edit_button.${i + 1}`}
                                >
                                  <Eye size={13} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-primary"
                                  onClick={() =>
                                    setQrStudentQRModal({
                                      admissionNo: s.admissionNo,
                                      name: s.name,
                                    })
                                  }
                                  title="Show QR Code"
                                  data-ocid={`students.secondary_button.${i + 1}`}
                                >
                                  <QrCode size={13} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => openEditStudent(s)}
                                  data-ocid={`students.edit_button.${i + 1}`}
                                >
                                  <Pencil size={13} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    setStudents((p) =>
                                      p.filter((x) => x.id !== s.id),
                                    )
                                  }
                                  data-ocid={`students.delete_button.${i + 1}`}
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </div>
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
        )}

        {/* ── 4. Student Attendance ── */}
        {activeSection === "attendance" && (
          <AttendanceSection
            attDate={attDate}
            setAttDate={setAttDate}
            attCourse={attCourse}
            setAttCourse={setAttCourse}
            attSemYear={attSemYear}
            setAttSemYear={setAttSemYear}
            attStudents={attStudents}
            dailyAtt={dailyAtt}
            setDailyAtt={setDailyAtt}
            sessionEntries={sessionEntries}
            attMode={attMode}
            setAttMode={setAttMode}
            rfidInput={rfidInput}
            setRfidInput={setRfidInput}
            rfidInputRef={rfidInputRef}
            handleRFIDInput={handleRFIDInput}
            processQRScan={processQRScan}
            saveSessionAttendance={saveSessionAttendance}
            attSaved={attSaved}
          />
        )}

        {/* ── 5. Attendance Report ── */}
        {activeSection === "attendance-report" && (
          <div>
            <SectionHeader
              title="Attendance Report"
              subtitle="Summary of student attendance with percentages"
            />
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  From Date
                </Label>
                <Input
                  type="date"
                  value={reportFrom}
                  onChange={(e) => setReportFrom(e.target.value)}
                  className="w-36"
                  data-ocid="report.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  To Date
                </Label>
                <Input
                  type="date"
                  value={reportTo}
                  onChange={(e) => setReportTo(e.target.value)}
                  className="w-36"
                  data-ocid="report.secondary_button"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Course
                </Label>
                <Select value={reportCourse} onValueChange={setReportCourse}>
                  <SelectTrigger className="w-32" data-ocid="report.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {COURSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  data-ocid="report.primary_button"
                >
                  Print / Export
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table data-ocid="report.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Total Days</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students
                      .filter(
                        (s) =>
                          s.isActive &&
                          (reportCourse === "all" || s.course === reportCourse),
                      )
                      .map((s, i) => {
                        const { total, present, absent, pct } = getAttSummary(
                          s.id,
                        );
                        const late = Math.floor(Math.random() * 2);
                        const color =
                          pct >= 75
                            ? "text-green-600"
                            : pct >= 60
                              ? "text-yellow-600"
                              : "text-red-600";
                        return (
                          <TableRow
                            key={s.id}
                            data-ocid={`report.item.${i + 1}`}
                          >
                            <TableCell className="font-mono text-sm">
                              {s.rollNo}
                            </TableCell>
                            <TableCell className="font-medium">
                              {s.name}
                            </TableCell>
                            <TableCell>{s.course}</TableCell>
                            <TableCell>{total}</TableCell>
                            <TableCell className="text-green-600">
                              {present}
                            </TableCell>
                            <TableCell className="text-red-600">
                              {absent}
                            </TableCell>
                            <TableCell className="text-yellow-600">
                              {late}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={pct} className="w-16 h-1.5" />
                                <span
                                  className={`text-sm font-semibold ${color}`}
                                >
                                  {pct}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── 6. Subject Wise Attendance ── */}
        {activeSection === "subject-attendance" && (
          <div>
            <SectionHeader
              title="Subject Wise Attendance"
              subtitle="Attendance breakdown per subject"
            />
            <div className="flex gap-3 mb-5">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Subject
                </Label>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-44" data-ocid="subjectatt.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="major">Major Subjects</SelectItem>
                    <SelectItem value="minor">Minor Subjects</SelectItem>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table data-ocid="subjectatt.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students
                      .filter((s) => s.isActive)
                      .flatMap((s, i) => {
                        const rows: React.ReactElement[] = [];
                        if (
                          subjectFilter === "all" ||
                          subjectFilter === "major" ||
                          subjectFilter === s.majorSubject
                        ) {
                          const pct = 70 + Math.floor(Math.random() * 25);
                          rows.push(
                            <TableRow
                              key={`${s.id}-major`}
                              data-ocid={`subjectatt.item.${i * 2 + 1}`}
                            >
                              <TableCell className="font-mono text-sm">
                                {s.rollNo}
                              </TableCell>
                              <TableCell className="font-medium">
                                {s.name}
                              </TableCell>
                              <TableCell>{s.majorSubject || "—"}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  Major
                                </Badge>
                              </TableCell>
                              <TableCell>{Math.floor(pct * 0.2)}</TableCell>
                              <TableCell>20</TableCell>
                              <TableCell>
                                <span
                                  className={`font-semibold text-sm ${
                                    pct >= 75
                                      ? "text-green-600"
                                      : pct >= 60
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                >
                                  {pct}%
                                </span>
                              </TableCell>
                            </TableRow>,
                          );
                        }
                        if (
                          subjectFilter === "all" ||
                          subjectFilter === "minor" ||
                          subjectFilter === s.minorSubject
                        ) {
                          const pct2 = 65 + Math.floor(Math.random() * 30);
                          rows.push(
                            <TableRow
                              key={`${s.id}-minor`}
                              data-ocid={`subjectatt.item.${i * 2 + 2}`}
                            >
                              <TableCell className="font-mono text-sm">
                                {s.rollNo}
                              </TableCell>
                              <TableCell className="font-medium">
                                {s.name}
                              </TableCell>
                              <TableCell>{s.minorSubject || "—"}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  Minor
                                </Badge>
                              </TableCell>
                              <TableCell>{Math.floor(pct2 * 0.2)}</TableCell>
                              <TableCell>20</TableCell>
                              <TableCell>
                                <span
                                  className={`font-semibold text-sm ${
                                    pct2 >= 75
                                      ? "text-green-600"
                                      : pct2 >= 60
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                >
                                  {pct2}%
                                </span>
                              </TableCell>
                            </TableRow>,
                          );
                        }
                        return rows;
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── 7. Student Group ── */}
        {activeSection === "student-group" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <SectionHeader
                title="Student Group"
                subtitle="Organize students into groups or batches"
              />
              <Button
                onClick={() => setShowAddGroup(true)}
                data-ocid="group.primary_button"
                className="-mt-3"
              >
                <Plus size={15} className="mr-1.5" /> Add Group
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((g, i) => (
                <Card
                  key={g.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  data-ocid={`group.item.${i + 1}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{g.name}</span>
                      <Badge variant="secondary">
                        {g.memberIds.length} members
                      </Badge>
                    </CardTitle>
                    {g.description && (
                      <p className="text-sm text-muted-foreground">
                        {g.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex -space-x-2 mb-3">
                      {g.memberIds.slice(0, 4).map((mid) => {
                        const st = students.find((s) => s.id === mid);
                        return st ? (
                          <Avatar
                            key={mid}
                            className="h-7 w-7 border-2 border-background"
                          >
                            <AvatarImage src={st.photoUrl} />
                            <AvatarFallback className="text-xs">
                              {st.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ) : null;
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => setViewingGroup(g)}
                        data-ocid={`group.edit_button.${i + 1}`}
                      >
                        Manage Members
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive h-8 w-8 p-0"
                        onClick={() =>
                          setGroups((p) => p.filter((x) => x.id !== g.id))
                        }
                        data-ocid={`group.delete_button.${i + 1}`}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {groups.length === 0 && (
                <div
                  className="col-span-3 text-center py-12 text-muted-foreground"
                  data-ocid="group.empty_state"
                >
                  No groups yet. Create one to organize students.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 8. Student Promote ── */}
        {activeSection === "student-promote" && (
          <div>
            <SectionHeader
              title="Student Promote"
              subtitle="Bulk promote students to the next academic year or session"
            />
            <Card className="mb-5">
              <CardHeader>
                <CardTitle className="text-sm">Promotion Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Target Session
                    </Label>
                    <Select
                      value={targetSession}
                      onValueChange={setTargetSession}
                    >
                      <SelectTrigger
                        className="w-36"
                        data-ocid="promote.select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Target Studying Year
                    </Label>
                    <Select value={targetYear} onValueChange={setTargetYear}>
                      <SelectTrigger
                        className="w-32"
                        data-ocid="promote.secondary_button"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDYING_YEARS.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => setShowPromoteConfirm(true)}
                    disabled={selectedPromote.size === 0}
                    data-ocid="promote.primary_button"
                  >
                    Promote{" "}
                    {selectedPromote.size > 0
                      ? `(${selectedPromote.size})`
                      : "Selected"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedPromote.size ===
                            students.filter((s) => s.isActive).length
                          }
                          onCheckedChange={(v) =>
                            setSelectedPromote(
                              v
                                ? new Set(
                                    students
                                      .filter((s) => s.isActive)
                                      .map((s) => s.id),
                                  )
                                : new Set(),
                            )
                          }
                          data-ocid="promote.checkbox"
                        />
                      </TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Current Session</TableHead>
                      <TableHead>Current Year</TableHead>
                      <TableHead>Course</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students
                      .filter((s) => s.isActive)
                      .map((s, i) => (
                        <TableRow
                          key={s.id}
                          data-ocid={`promote.item.${i + 1}`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedPromote.has(s.id)}
                              onCheckedChange={(v) =>
                                setSelectedPromote((p) => {
                                  const n = new Set(p);
                                  if (v) n.add(s.id);
                                  else n.delete(s.id);
                                  return n;
                                })
                              }
                              data-ocid={`promote.checkbox.${i + 1}`}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {s.rollNo}
                          </TableCell>
                          <TableCell className="font-medium">
                            {s.name}
                          </TableCell>
                          <TableCell>{s.session}</TableCell>
                          <TableCell>{s.studyingYear}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {s.course}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── 9. Disable Student ── */}
        {activeSection === "disable-student" && (
          <div>
            <SectionHeader
              title="Disable Student"
              subtitle="Enable or disable student accounts"
            />
            <Card>
              <CardContent className="p-0">
                <Table data-ocid="disable.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s, i) => (
                      <TableRow
                        key={s.id}
                        data-ocid={`disable.item.${i + 1}`}
                        className={!s.isActive ? "bg-muted/30" : ""}
                      >
                        <TableCell
                          className={`font-mono text-sm ${!s.isActive ? "text-muted-foreground" : ""}`}
                        >
                          {s.rollNo}
                        </TableCell>
                        <TableCell
                          className={`font-medium ${!s.isActive ? "text-muted-foreground line-through" : ""}`}
                        >
                          {s.name}
                        </TableCell>
                        <TableCell
                          className={!s.isActive ? "text-muted-foreground" : ""}
                        >
                          {s.course}
                        </TableCell>
                        <TableCell
                          className={!s.isActive ? "text-muted-foreground" : ""}
                        >
                          {s.session}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={s.isActive ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {s.isActive ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={s.isActive ? "destructive" : "outline"}
                            onClick={() =>
                              setStudents((p) =>
                                p.map((x) =>
                                  x.id === s.id
                                    ? { ...x, isActive: !x.isActive }
                                    : x,
                                ),
                              )
                            }
                            data-ocid={`disable.toggle.${i + 1}`}
                            className="text-xs h-7"
                          >
                            {s.isActive ? (
                              <>
                                <UserMinus size={12} className="mr-1" /> Disable
                              </>
                            ) : (
                              <>
                                <UserCheck size={12} className="mr-1" /> Enable
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* ── View Student Modal ── */}
      <Dialog
        open={!!viewingStudent}
        onOpenChange={(o) => !o && setViewingStudent(null)}
      >
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          data-ocid="student.modal"
        >
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={viewingStudent.photoUrl} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {viewingStudent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{viewingStudent.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {viewingStudent.course} • {viewingStudent.session} •{" "}
                    {viewingStudent.semYear}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">
                      Roll: {viewingStudent.rollNo}
                    </Badge>
                    <Badge variant="secondary">{viewingStudent.category}</Badge>
                    <Badge
                      variant={
                        viewingStudent.isActive ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {viewingStudent.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>
              {/* Details Grid */}
              {(
                [
                  [
                    "Academic",
                    [
                      ["Admission No", viewingStudent.admissionNo],
                      ["Registration No", viewingStudent.registrationNo],
                      ["JCECEB Reg No", viewingStudent.jcecebRegNo],
                      ["JCECEB Roll No", viewingStudent.jcecebRollNo],
                      ["CML Rank", viewingStudent.cmlRank],
                      ["Univ. Roll No", viewingStudent.universityBoardRollNo],
                      ["Date of Admission", viewingStudent.dateOfAdmission],
                      ["Studying Year", viewingStudent.studyingYear],
                    ],
                  ],
                  [
                    "Personal",
                    [
                      ["Father's Name", viewingStudent.fatherName],
                      ["Mother's Name", viewingStudent.motherName],
                      ["Date of Birth", viewingStudent.dateOfBirth],
                      ["Gender", viewingStudent.gender],
                      ["Marital Status", viewingStudent.maritalStatus],
                      ["UID No", viewingStudent.uidNo],
                      ["PH", viewingStudent.ph ? "Yes" : "No"],
                      ["Email", viewingStudent.email],
                      ["Mobile (Call)", viewingStudent.mobileCall],
                      ["Mobile (WA)", viewingStudent.mobileWhatsapp],
                    ],
                  ],
                  [
                    "Address",
                    [
                      ["Village", viewingStudent.vill],
                      ["PO", viewingStudent.po],
                      ["PS", viewingStudent.ps],
                      ["District", viewingStudent.dist],
                      ["State", viewingStudent.state],
                      ["Pin Code", viewingStudent.pinCode],
                    ],
                  ],
                  [
                    "Subjects",
                    [
                      ["Major Subject", viewingStudent.majorSubject],
                      ["Minor Subject", viewingStudent.minorSubject],
                    ],
                  ],
                ] as [string, [string, string][]][]
              ).map(([section, fields]) => (
                <div key={section}>
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-primary mb-2">
                    {section}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {fields
                      .filter(([, v]) => v)
                      .map(([label, value]) => (
                        <div key={label} className="flex gap-2 text-sm">
                          <span className="text-muted-foreground min-w-[120px]">
                            {label}:
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
              {/* Qualifications */}
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wider text-primary mb-2">
                  Qualifications
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-2 border">Level</th>
                        <th className="text-left p-2 border">Year</th>
                        <th className="text-left p-2 border">Subject</th>
                        <th className="text-left p-2 border">Institution</th>
                        <th className="text-left p-2 border">Total</th>
                        <th className="text-left p-2 border">Obtained</th>
                        <th className="text-left p-2 border">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        [
                          "Matriculation",
                          viewingStudent.matricPassedYear,
                          viewingStudent.matricSubject,
                          viewingStudent.matricSchool,
                          viewingStudent.matricTotalMarks,
                          viewingStudent.matricMarksObtained,
                          viewingStudent.matricPercentage,
                        ],
                        [
                          "Intermediate",
                          viewingStudent.interPassedYear,
                          viewingStudent.interSubject,
                          viewingStudent.interCollege,
                          viewingStudent.interTotalMarks,
                          viewingStudent.interMarksObtained,
                          viewingStudent.interPercentage,
                        ],
                        [
                          "Graduation",
                          viewingStudent.gradPassedYear,
                          viewingStudent.gradSubject,
                          viewingStudent.gradCollege,
                          viewingStudent.gradTotalMarks,
                          viewingStudent.gradMarksObtained,
                          viewingStudent.gradPercentage,
                        ],
                        [
                          "PG",
                          viewingStudent.pgPassedYear,
                          viewingStudent.pgSubject,
                          viewingStudent.pgCollegeDept,
                          viewingStudent.pgTotalMarks,
                          viewingStudent.pgMarksObtained,
                          viewingStudent.pgPercentage,
                        ],
                      ]
                        .filter(([, year]) => year)
                        .map(
                          ([
                            level,
                            year,
                            subject,
                            institution,
                            total,
                            obtained,
                            pct,
                          ]) => (
                            <tr key={level as string} className="border-b">
                              <td className="p-2 border font-medium">
                                {level}
                              </td>
                              <td className="p-2 border">{year}</td>
                              <td className="p-2 border">{subject}</td>
                              <td className="p-2 border">{institution}</td>
                              <td className="p-2 border">{total}</td>
                              <td className="p-2 border">{obtained}</td>
                              <td className="p-2 border font-semibold">
                                {pct}%
                              </td>
                            </tr>
                          ),
                        )}
                    </tbody>
                  </table>
                </div>
                {viewingStudent.otherQualification && (
                  <p className="mt-2 text-sm">
                    <span className="text-muted-foreground">Other:</span>{" "}
                    {viewingStudent.otherQualification}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingStudent(null)}
              data-ocid="student.close_button"
            >
              Close
            </Button>
            {viewingStudent && (
              <Button
                onClick={() => {
                  openEditStudent(viewingStudent);
                  setViewingStudent(null);
                }}
                data-ocid="student.edit_button"
              >
                <Pencil size={14} className="mr-1" /> Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Student QR Code Dialog ── */}
      <Dialog
        open={!!qrStudentQRModal}
        onOpenChange={() => setQrStudentQRModal(null)}
      >
        <DialogContent data-ocid="student.qr.dialog" className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Student QR Code</DialogTitle>
          </DialogHeader>
          {qrStudentQRModal && (
            <div className="flex flex-col items-center gap-3 py-2">
              <p className="text-sm text-muted-foreground text-center">
                {qrStudentQRModal.name}
              </p>
              <div className="border-4 border-primary/20 rounded-lg p-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STUDENT:${encodeURIComponent(qrStudentQRModal.admissionNo)}`}
                  alt="Student QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                STUDENT:{qrStudentQRModal.admissionNo}
              </p>
              <p className="text-xs text-center text-muted-foreground">
                Scan this QR code during attendance
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQrStudentQRModal(null)}
              data-ocid="student.qr.close_button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Promote Confirm Dialog ── */}
      <Dialog open={showPromoteConfirm} onOpenChange={setShowPromoteConfirm}>
        <DialogContent data-ocid="promote.dialog">
          <DialogHeader>
            <DialogTitle>Confirm Promotion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You are about to promote <strong>{selectedPromote.size}</strong>{" "}
            students to session <strong>{targetSession}</strong>, studying year{" "}
            <strong>{targetYear}</strong>. This action cannot be undone easily.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPromoteConfirm(false)}
              data-ocid="promote.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={promoteSelected}
              data-ocid="promote.confirm_button"
            >
              Confirm Promote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Group Dialog ── */}
      <Dialog open={showAddGroup} onOpenChange={setShowAddGroup}>
        <DialogContent data-ocid="group.dialog">
          <DialogHeader>
            <DialogTitle>Create Student Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Group Name</Label>
              <Input
                value={groupForm.name}
                onChange={(e) =>
                  setGroupForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Morning Batch"
                data-ocid="group.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={groupForm.description}
                onChange={(e) =>
                  setGroupForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Optional description"
                data-ocid="group.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddGroup(false)}
              data-ocid="group.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={addGroup} data-ocid="group.submit_button">
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Manage Group Members Dialog ── */}
      <Dialog
        open={!!viewingGroup}
        onOpenChange={(o) => !o && setViewingGroup(null)}
      >
        <DialogContent className="max-w-xl" data-ocid="group.modal">
          <DialogHeader>
            <DialogTitle>Manage Members — {viewingGroup?.name}</DialogTitle>
          </DialogHeader>
          {viewingGroup && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students
                .filter((s) => s.isActive)
                .map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-1.5 border-b last:border-0"
                    data-ocid={`group.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={s.photoUrl} />
                        <AvatarFallback className="text-xs">
                          {s.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Roll: {s.rollNo} • {s.course}
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={viewingGroup.memberIds.includes(s.id)}
                      onCheckedChange={(v) => {
                        setGroups((p) =>
                          p.map((g) =>
                            g.id === viewingGroup.id
                              ? {
                                  ...g,
                                  memberIds: v
                                    ? [...g.memberIds, s.id]
                                    : g.memberIds.filter((id) => id !== s.id),
                                }
                              : g,
                          ),
                        );
                        setViewingGroup((prev) =>
                          prev
                            ? {
                                ...prev,
                                memberIds: v
                                  ? [...prev.memberIds, s.id]
                                  : prev.memberIds.filter((id) => id !== s.id),
                              }
                            : null,
                        );
                      }}
                      data-ocid={`group.checkbox.${i + 1}`}
                    />
                  </div>
                ))}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setViewingGroup(null)}
              data-ocid="group.close_button"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

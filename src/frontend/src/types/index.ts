export type AppRole =
  | "superadmin"
  | "admin"
  | "teacher"
  | "accountant"
  | "librarian"
  | "student"
  | "parent";

export interface UserProfile {
  name: string;
  role: AppRole;
  schoolId?: string;
  staffId?: string;
  studentId?: string;
  childrenIds?: string[];
}

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  role: AppRole;
  name: string;
  schoolId: string;
  linkedId?: string;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  studentCount: number;
  staffCount: number;
}

export interface StudentCategory {
  id: string;
  schoolId: string;
  name: string;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  teacherId?: string;
}

export interface Section {
  id: string;
  schoolId: string;
  classId: string;
  name: string;
}

export interface Subject {
  id: string;
  schoolId: string;
  classId: string;
  name: string;
  code: string;
}

export interface Student {
  id: string;
  schoolId: string;
  name: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  classId: string;
  sectionId: string;
  rollNumber: string;
  admissionDate: string;
  categoryId: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  date: string;
  status: "present" | "absent" | "late";
  classId: string;
}

export interface StudyMaterial {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  title: string;
  description: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Assignment {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
  createdBy: string;
  createdAt: string;
}

export interface ClassRoutine {
  id: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
}

export interface FeeType {
  id: string;
  schoolId: string;
  name: string;
  description: string;
}

export interface FeeGroup {
  id: string;
  schoolId: string;
  name: string;
}

export interface FeeMaster {
  id: string;
  schoolId: string;
  classId: string;
  feeGroupId: string;
  feeTypeId: string;
  amount: number;
  sessionId: string;
  dueDate: string;
}

export interface FeePayment {
  id: string;
  schoolId: string;
  studentId: string;
  feeMasterId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string;
  receiptNumber: string;
  collectedBy: string;
}

export interface FeeDiscount {
  id: string;
  schoolId: string;
  studentId: string;
  feeTypeId: string;
  discountAmount: number;
  reason: string;
}

export interface ExamType {
  id: string;
  schoolId: string;
  name: string;
}

export interface ExamSchedule {
  id: string;
  schoolId: string;
  examTypeId: string;
  classId: string;
  subjectId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
}

export interface ExamMark {
  id: string;
  schoolId: string;
  studentId: string;
  examScheduleId: string;
  marksObtained: number;
  remarks: string;
}

export interface MarksGrade {
  id: string;
  schoolId: string;
  minPercentage: number;
  maxPercentage: number;
  grade: string;
  remarks: string;
}

export interface Staff {
  id: string;
  schoolId: string;
  name: string;
  role: string;
  staffType: "teaching" | "non-teaching";
  designation: string;
  qualification: string;
  qrCode: string;
  department: string;
  phone: string;
  email: string;
  address: string;
  joinDate: string;
  salary: number;
  isActive: boolean;
}

export interface StaffAttendance {
  id: string;
  schoolId: string;
  staffId: string;
  date: string;
  time?: string;
  status: "present" | "absent" | "late";
  photoDataUrl?: string;
  method?: "qr" | "manual";
}

export interface StaffLeave {
  id: string;
  schoolId: string;
  staffId: string;
  leaveType: "sick" | "casual" | "earned" | "other";
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
}

export interface Payroll {
  id: string;
  schoolId: string;
  staffId: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: "pending" | "paid";
  presentDays?: number;
  absentDays?: number;
}

export interface Notice {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  postedBy: string;
  postedAt: string;
  priority: "normal" | "urgent";
}

export interface ClassMessage {
  id: string;
  schoolId: string;
  classId: string;
  sectionId?: string;
  senderName: string;
  senderRole: string;
  content: string;
  sentAt: string;
  parentMessageId?: string;
}

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type SessionID = bigint;
export type FeeAssignmentID = bigint;
export type FeeHead = {
    __kind__: "Library";
    Library: null;
} | {
    __kind__: "Admission";
    Admission: null;
} | {
    __kind__: "Exam";
    Exam: null;
} | {
    __kind__: "Tuition";
    Tuition: null;
} | {
    __kind__: "Other";
    Other: string;
} | {
    __kind__: "Hostel";
    Hostel: null;
};
export type FeeID = bigint;
export type ClassID = bigint;
export type PaymentID = bigint;
export interface FeePayment {
    id: PaymentID;
    feeAssignmentId: FeeAssignmentID;
    studentId: StudentID;
    receiptNum: string;
    recordedBy: Principal;
    amountPaid: number;
    schoolId: SchoolID;
    paymentDate: bigint;
    paymentMode: PaymentMode;
}
export interface FeeMaster {
    id: FeeID;
    feeHead: FeeHead;
    dueDate: bigint;
    classId: ClassID;
    schoolId: SchoolID;
    sessionId: SessionID;
    amount: number;
}
export type StaffID = bigint;
export interface School {
    id: SchoolID;
    name: string;
    isActive: boolean;
    email: string;
    address: string;
    phone: string;
}
export type StudentID = bigint;
export interface FeeLedgerEntry {
    payments: Array<FeePayment>;
    outstanding: number;
    totalPaid: number;
    feeAssignment: FeeAssignment;
    feeMaster: FeeMaster;
}
export interface FeeAssignment {
    id: FeeAssignmentID;
    studentId: StudentID;
    assignedAt: bigint;
    assignedBy: Principal;
    schoolId: SchoolID;
    feeId: FeeID;
}
export type SchoolID = bigint;
export interface FinancialSummary {
    defaultersCount: bigint;
    totalCollected: number;
    totalPending: number;
}
export interface UserProfile {
    studentId?: StudentID;
    staffId?: StaffID;
    name: string;
    role: UserRole;
    schoolId?: SchoolID;
    childrenIds: Array<StudentID>;
}
export enum PaymentMode {
    Cash = "Cash",
    Online = "Online",
    BankTransfer = "BankTransfer",
    Cheque = "Cheque"
}
export enum UserRole {
    accountant = "accountant",
    librarian = "librarian",
    admin = "admin",
    teacher = "teacher",
    student = "student",
    superadmin = "superadmin",
    parent = "parent"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSchool(name: string, address: string, phone: string, email: string): Promise<SchoolID>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignFeeToStudent(studentId: StudentID, feeId: FeeID): Promise<FeeAssignmentID>;
    createFeeMaster(schoolId: SchoolID, classId: ClassID, sessionId: SessionID, feeHead: FeeHead, amount: number, dueDate: bigint): Promise<FeeID>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getFeeDefaulters(schoolId: SchoolID, classId: ClassID | null, sessionId: SessionID | null): Promise<Array<StudentID>>;
    getFeeMasters(schoolId: SchoolID): Promise<Array<FeeMaster>>;
    getFinancialSummary(schoolId: SchoolID, startDate: bigint | null, endDate: bigint | null): Promise<FinancialSummary>;
    getRemoteSchools(): Promise<Array<School>>;
    getStudentFeeLedger(studentId: StudentID): Promise<Array<FeeLedgerEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordPayment(studentId: StudentID, feeAssignmentId: FeeAssignmentID, amountPaid: number, paymentMode: PaymentMode): Promise<PaymentID>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchSchools(searchTerm: string): Promise<Array<School>>;
    updateFeeMaster(feeId: FeeID, amount: number, dueDate: bigint): Promise<void>;
    updateSchool(id: SchoolID, name: string, address: string, phone: string, email: string): Promise<void>;
}

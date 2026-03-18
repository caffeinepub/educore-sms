import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type StaffID = bigint;
export type StudentID = bigint;
export type SchoolID = bigint;
export interface UserProfile {
    studentId?: StudentID;
    staffId?: StaffID;
    name: string;
    role: AppRole;
    schoolId?: SchoolID;
    childrenIds: Array<StudentID>;
}
export enum AppRole {
    accountant = "accountant",
    librarian = "librarian",
    admin = "admin",
    teacher = "teacher",
    student = "student",
    superadmin = "superadmin",
    parent = "parent"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}

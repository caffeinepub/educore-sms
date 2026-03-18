import type React from "react";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as mockData from "../data/mockData";
import { seedUserAccounts } from "../data/seedAccounts";
import type {
  AppRole,
  ClassMessage,
  Notice,
  UserAccount,
  UserProfile,
} from "../types";

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile | null) => void;
  currentSchoolId: string;
  setCurrentSchoolId: (id: string) => void;
  isLoading: boolean;
  // auth
  userAccounts: UserAccount[];
  setUserAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  currentAccountId: string | null;
  mustChangePassword: boolean;
  setMustChangePassword: (v: boolean) => void;
  login: (
    email: string,
    password: string,
  ) => { success: boolean; error?: string };
  changePassword: (accountId: string, newPassword: string) => void;
  forceResetPassword: (accountId: string) => void;
  // mock data stores
  schools: typeof mockData.schools;
  studentCategories: typeof mockData.studentCategories;
  classes: typeof mockData.classes;
  sections: typeof mockData.sections;
  subjects: typeof mockData.subjects;
  students: typeof mockData.students;
  attendanceRecords: typeof mockData.attendanceRecords;
  studyMaterials: typeof mockData.studyMaterials;
  assignments: typeof mockData.assignments;
  classRoutines: typeof mockData.classRoutines;
  feeTypes: typeof mockData.feeTypes;
  feeGroups: typeof mockData.feeGroups;
  feeMasters: typeof mockData.feeMasters;
  feePayments: typeof mockData.feePayments;
  feeDiscounts: typeof mockData.feeDiscounts;
  examTypes: typeof mockData.examTypes;
  examSchedules: typeof mockData.examSchedules;
  examMarks: typeof mockData.examMarks;
  marksGrades: typeof mockData.marksGrades;
  staff: typeof mockData.staff;
  staffAttendance: typeof mockData.staffAttendance;
  staffLeaves: typeof mockData.staffLeaves;
  payrolls: typeof mockData.payrolls;
  // communication
  noticesList: Notice[];
  setNoticesList: (n: Notice[]) => void;
  classMessagesList: ClassMessage[];
  setClassMessagesList: (m: ClassMessage[]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [currentSchoolId, setCurrentSchoolId] = useState("s1");
  const [isLoading, setIsLoading] = useState(true);
  const [noticesList, setNoticesList] = useState<Notice[]>(mockData.notices);
  const [classMessagesList, setClassMessagesList] = useState<ClassMessage[]>(
    mockData.classMessages,
  );
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    try {
      const stored = localStorage.getItem("educore_accounts");
      if (stored) return JSON.parse(stored) as UserAccount[];
    } catch {}
    return seedUserAccounts;
  });

  // Persist accounts
  useEffect(() => {
    localStorage.setItem("educore_accounts", JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    const stored = localStorage.getItem("educore_profile");
    const storedAccountId = localStorage.getItem("educore_account_id");
    if (stored) {
      try {
        setUserProfileState(JSON.parse(stored));
        if (storedAccountId) setCurrentAccountId(storedAccountId);
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const setUserProfile = (p: UserProfile | null) => {
    setUserProfileState(p);
    if (p) {
      localStorage.setItem("educore_profile", JSON.stringify(p));
      if (p.schoolId) setCurrentSchoolId(p.schoolId);
    } else {
      localStorage.removeItem("educore_profile");
      localStorage.removeItem("educore_account_id");
      setCurrentAccountId(null);
      setMustChangePassword(false);
    }
  };

  const login = (
    email: string,
    password: string,
  ): { success: boolean; error?: string } => {
    const account = userAccounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase(),
    );
    if (!account) return { success: false, error: "Invalid email or password" };
    if (account.password !== password)
      return { success: false, error: "Invalid email or password" };
    if (!account.isActive)
      return { success: false, error: "Account is disabled" };

    setCurrentAccountId(account.id);
    localStorage.setItem("educore_account_id", account.id);

    // Update last login
    setUserAccounts((prev) =>
      prev.map((a) =>
        a.id === account.id ? { ...a, lastLogin: new Date().toISOString() } : a,
      ),
    );

    setMustChangePassword(account.mustChangePassword);

    const profile: UserProfile = {
      name: account.name,
      role: account.role,
      schoolId: account.schoolId === "system" ? undefined : account.schoolId,
      staffId:
        account.role !== "student" &&
        account.role !== "admin" &&
        account.role !== "superadmin"
          ? account.linkedId
          : undefined,
      studentId: account.role === "student" ? account.linkedId : undefined,
      childrenIds: account.role === "parent" ? [] : undefined,
    };
    setUserProfileState(profile);
    localStorage.setItem("educore_profile", JSON.stringify(profile));
    if (profile.schoolId) setCurrentSchoolId(profile.schoolId);

    return { success: true };
  };

  const changePassword = (accountId: string, newPassword: string) => {
    setUserAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? { ...a, password: newPassword, mustChangePassword: false }
          : a,
      ),
    );
    if (accountId === currentAccountId) {
      setMustChangePassword(false);
    }
  };

  const forceResetPassword = (accountId: string) => {
    setUserAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? { ...a, password: "Welcome@123", mustChangePassword: true }
          : a,
      ),
    );
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        currentSchoolId,
        setCurrentSchoolId,
        isLoading,
        userAccounts,
        setUserAccounts,
        currentAccountId,
        mustChangePassword,
        setMustChangePassword,
        login,
        changePassword,
        forceResetPassword,
        ...mockData,
        noticesList,
        setNoticesList,
        classMessagesList,
        setClassMessagesList,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useRole(): AppRole | null {
  const { userProfile } = useApp();
  return userProfile?.role ?? null;
}

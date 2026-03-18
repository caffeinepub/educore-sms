import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import * as mockData from "../data/mockData";
import type { AppRole, ClassMessage, Notice, UserProfile } from "../types";

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile | null) => void;
  currentSchoolId: string;
  setCurrentSchoolId: (id: string) => void;
  isLoading: boolean;
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

  useEffect(() => {
    const stored = localStorage.getItem("educore_profile");
    if (stored) {
      try {
        setUserProfileState(JSON.parse(stored));
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
    }
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        currentSchoolId,
        setCurrentSchoolId,
        isLoading,
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

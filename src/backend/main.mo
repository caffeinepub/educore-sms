import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Option "mo:core/Option";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import ExternalBlob "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Mixins
  include MixinStorage();

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Custom Role System for School Management
  type AppRole = {
    #superadmin;
    #admin;
    #teacher;
    #librarian;
    #accountant;
    #student;
    #parent;
  };

  type UserProfile = {
    name : Text;
    role : AppRole;
    schoolId : ?SchoolID;
    staffId : ?StaffID;
    studentId : ?StudentID;
    childrenIds : [StudentID]; // For parents
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Types
  type SchoolID = Nat;
  type SchoolYear = Nat;
  type StudentID = Nat;
  type StaffID = Nat;
  type ClassID = Nat;
  type SectionID = Nat;
  type SubjectID = Nat;
  type SessionID = Nat;
  type AssignmentID = Nat;
  type RoutineID = Nat;
  type FeeID = Nat;
  type ExamScheduleID = Nat;
  type GradeID = Nat;
  type DiscountID = Nat;
  type TransactionID = Nat;

  // Core Entities
  type Address = {
    street : Text;
    city : Text;
    state : Text;
    country : Text;
    zip : Text;
  };

  type School = {
    id : SchoolID;
    name : Text;
    address : Text;
    phone : Text;
    email : Text;
    isActive : Bool;
  };

  type AcademicSession = {
    id : SessionID;
    schoolId : SchoolID;
    name : Text;
    start : Int;
    end : Int;
    isCurrent : Bool;
  };

  type Person = {
    name : Text;
    dob : ?Int;
    gender : ?Text;
    phone : Text;
    email : Text;
    address : Address;
  };

  type Student = {
    id : StudentID;
    schoolId : SchoolID;
    sessionId : SessionID;
    categoryId : ?Text;
    rollNum : Nat;
    admissionDate : Int;
    active : Bool;
    guardianName : Text;
    guardianPhone : Text;
    Person : Person;
  };

  type Staff = {
    id : StaffID;
    schoolId : SchoolID;
    role : Text;
    department : Text;
    joinDate : Int;
    salary : Float;
    active : Bool;
    accreditation : [Time.Time];
    Person : Person;
  };

  type Class = {
    id : ClassID;
    schoolId : SchoolID;
    subjectId : SubjectID;
    teacher : Staff;
    name : Text;
  };

  type Section = {
    id : SectionID;
    schoolId : SchoolID;
    classId : ClassID;
    name : Text;
  };

  type StudyMaterial = {
    id : Nat;
    schoolId : SchoolID;
    classId : ClassID;
    subjectId : SubjectID;
    title : Text;
    desc : Text;
    file : ExternalBlob.ExternalBlob;
    uploadedBy : Principal;
    uploadedAt : Int;
    fileType : Text;
  };

  type Assignment = {
    id : AssignmentID;
    schoolId : SchoolID;
    classId : ClassID;
    subjectId : SubjectID;
    title : Text;
    desc : Text;
    dueDate : Int;
    file : ExternalBlob.ExternalBlob;
    createdBy : Principal;
    createdAt : Int;
  };

  type Routine = {
    id : RoutineID;
    schoolId : SchoolID;
    classId : ClassID;
    sectionId : ?SectionID;
    day : DayOfWeek;
    startTime : Int;
    endTime : Int;
    subjectId : SubjectID;
    teacherId : StaffID;
  };

  type FeeMaster = {
    id : FeeID;
    schoolId : SchoolID;
    classId : ClassID;
    feeGroup : Text;
    feeType : Text;
    amount : Float;
    session : Text;
    dueDate : Int;
  };

  type FeePayment = {
    id : Text;
    schoolId : SchoolID;
    studentId : StudentID;
    feeId : FeeID;
    amountPaid : Float;
    paymentDate : Int;
    method : Text;
    receiptNum : Text;
  };

  type ExamSchedule = {
    id : ExamScheduleID;
    schoolId : SchoolID;
    examId : Text;
    classId : ClassID;
    subjectId : SubjectID;
    date : Int;
    start : Int;
    end : Int;
    total : Float;
    passing : Float;
  };

  type Grade = {
    id : GradeID;
    schoolId : SchoolID;
    minPercent : Float;
    maxPercent : Float;
    grade : Text;
  };

  type Discount = {
    id : DiscountID;
    schoolId : SchoolID;
    studentId : StudentID;
    feeType : Text;
    amount : Float;
    reason : Text;
  };

  type Transaction = {
    id : TransactionID;
    schoolId : SchoolID;
    amount : Float;
    transType : Text;
    desc : Text;
    date : Int;
  };

  type Gender = {
    #male;
    #female;
    #other;
  };

  type DayOfWeek = {
    #monday;
    #tuesday;
    #wednesday;
    #thursday;
    #friday;
    #saturday;
    #sunday;
  };

  type AttendanceStatus = {
    #present;
    #absent;
    #late;
  };

  type PayrollStatus = {
    #pending;
    #completed;
  };

  module School {
    public func compare(s1 : School, s2 : School) : Order.Order {
      if (s1.id < s2.id) { #less } else if (s1.id > s2.id) {
        #greater;
      } else {
        Text.compare(s1.name, s2.name);
      };
    };
  };

  let schools = Map.empty<SchoolID, School>();
  let students = Map.empty<StudentID, Student>();
  let staff = Map.empty<StaffID, Staff>();

  // Helper Functions
  func require(bool : Bool, why : Text) {
    if (not bool) {
      Runtime.trap(why);
    };
  };

  func requireAuth(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
  };

  func getUserProfile(caller : Principal) : ?UserProfile {
    userProfiles.get(caller);
  };

  func requireUserProfile(caller : Principal) : UserProfile {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: User profile not found") };
      case (?profile) { profile };
    };
  };

  func isSuperAdmin(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#superadmin) { true };
          case (_) { false };
        };
      };
    };
  };

  func isSchoolAdmin(caller : Principal, schoolId : SchoolID) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#superadmin) { true };
          case (#admin) {
            switch (profile.schoolId) {
              case (null) { false };
              case (?sid) { sid == schoolId };
            };
          };
          case (_) { false };
        };
      };
    };
  };

  func canAccessSchool(caller : Principal, schoolId : SchoolID) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#superadmin) { true };
          case (_) {
            switch (profile.schoolId) {
              case (null) { false };
              case (?sid) { sid == schoolId };
            };
          };
        };
      };
    };
  };

  func isTeacher(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#teacher) { true };
          case (_) { false };
        };
      };
    };
  };

  func isStudent(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#student) { true };
          case (_) { false };
        };
      };
    };
  };

  func isParent(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#parent) { true };
          case (_) { false };
        };
      };
    };
  };

  func canAccessStudent(caller : Principal, studentId : StudentID) : Bool {
    let profile = requireUserProfile(caller);
    switch (profile.role) {
      case (#superadmin) { true };
      case (#admin) {
        switch (students.get(studentId)) {
          case (null) { false };
          case (?student) { canAccessSchool(caller, student.schoolId) };
        };
      };
      case (#student) {
        switch (profile.studentId) {
          case (null) { false };
          case (?sid) { sid == studentId };
        };
      };
      case (#parent) {
        profile.childrenIds.find(func(id : StudentID) : Bool { id == studentId }) != null;
      };
      case (#teacher or #librarian or #accountant) {
        switch (students.get(studentId)) {
          case (null) { false };
          case (?student) { canAccessSchool(caller, student.schoolId) };
        };
      };
    };
  };

  func getSchoolById(id : SchoolID) : School {
    switch (schools.get(id)) {
      case (null) { Runtime.trap("School does not exist") };
      case (?school) { school };
    };
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireAuth(caller);
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireAuth(caller);
    // Validate role assignment
    switch (profile.role) {
      case (#superadmin) {
        // Only existing superadmins can create new superadmins
        if (not isSuperAdmin(caller)) {
          Runtime.trap("Unauthorized: Only superadmins can assign superadmin role");
        };
      };
      case (#admin) {
        // Only superadmins can create admins
        if (not isSuperAdmin(caller)) {
          Runtime.trap("Unauthorized: Only superadmins can assign admin role");
        };
      };
      case (_) {
        // Other roles can be assigned by school admins
        switch (profile.schoolId) {
          case (null) {
            if (not isSuperAdmin(caller)) {
              Runtime.trap("Unauthorized: School ID required for non-superadmin roles");
            };
          };
          case (?schoolId) {
            if (not isSchoolAdmin(caller, schoolId)) {
              Runtime.trap("Unauthorized: Only school admins can assign roles in their school");
            };
          };
        };
      };
    };
    userProfiles.add(caller, profile);
  };

  // Additional business logic and CRUD operations would go here.
};

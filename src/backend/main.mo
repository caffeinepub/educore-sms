import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
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

  // User Profile System (with additional parent refrences etc. as required by frontend)
  // See further below for additional school managment specific roles connected to each new user
  type UserRole = {
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
    role : UserRole;
    schoolId : ?SchoolID;
    staffId : ?StaffID;
    studentId : ?StudentID;
    childrenIds : [StudentID];
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Types
  type SchoolID = Nat;
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
  type PaymentID = Nat;
  type FeeAssignmentID = Nat;
  type DepartmentID = Nat;
  type ProgramID = Nat;
  type CourseEnrollmentID = Nat;
  type ExamID = Nat;
  type ExamResultID = Nat;
  type AdmissionApplicantID = Nat;

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

  type FeeHead = {
    #Tuition;
    #Admission;
    #Exam;
    #Library;
    #Hostel;
    #Other : Text;
  };

  type FeeMaster = {
    id : FeeID;
    schoolId : SchoolID;
    classId : ClassID;
    sessionId : SessionID;
    feeHead : FeeHead;
    amount : Float;
    dueDate : Int;
  };

  type FeeAssignment = {
    id : FeeAssignmentID;
    schoolId : SchoolID;
    studentId : StudentID;
    feeId : FeeID;
    assignedAt : Int;
    assignedBy : Principal;
  };

  type PaymentMode = {
    #Cash;
    #Cheque;
    #Online;
    #BankTransfer;
  };

  type FeePayment = {
    id : PaymentID;
    schoolId : SchoolID;
    studentId : StudentID;
    feeAssignmentId : FeeAssignmentID;
    amountPaid : Float;
    paymentDate : Int;
    paymentMode : PaymentMode;
    receiptNum : Text;
    recordedBy : Principal;
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

  type Department = {
    id : DepartmentID;
    schoolId : SchoolID;
    name : Text;
    code : Text;
    description : Text;
    hodStaffId : ?StaffID;
  };

  type Program = {
    id : ProgramID;
    schoolId : SchoolID;
    departmentId : DepartmentID;
    name : Text;
    code : Text;
    duration : Nat;
    totalSeats : Nat;
  };

  type Subject = {
    id : SubjectID;
    schoolId : SchoolID;
    programId : ProgramID;
    semesterOrYear : Text;
    name : Text;
    code : Text;
    credits : Nat;
  };

  type CourseEnrollment = {
    id : CourseEnrollmentID;
    studentId : StudentID;
    programId : ProgramID;
    semesterOrYear : Text;
    enrolledAt : Int;
  };

  type ExamType = {
    #internal;
    #university;
  };

  type Exam = {
    id : ExamID;
    schoolId : SchoolID;
    title : Text;
    examType : ExamType;
    programId : ProgramID;
    semesterOrYear : Text;
    subjectId : SubjectID;
    examDate : Int;
    startTime : Int;
    endTime : Int;
    totalMarks : Float;
    passingMarks : Float;
    isPublished : Bool;
  };

  type ExamResult = {
    id : ExamResultID;
    examId : ExamID;
    studentId : StudentID;
    marksObtained : Float;
    grade : Text;
    remarks : Text;
    recordedBy : Principal;
    recordedAt : Int;
  };

  type AdmissionStatus = {
    #pending;
    #confirmed;
    #rejected;
  };

  type AdmissionApplicant = {
    id : AdmissionApplicantID;
    schoolId : SchoolID;
    programId : ProgramID;
    jcecebRegNo : Text;
    jcecebRollNo : Text;
    cmlRank : Nat;
    name : Text;
    fatherName : Text;
    category : Text;
    gender : Text;
    dob : Int;
    phone : Text;
    email : Text;
    address : Text;
    admissionStatus : AdmissionStatus;
    confirmedStudentId : ?StudentID;
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

  type FeeLedgerEntry = {
    feeAssignment : FeeAssignment;
    feeMaster : FeeMaster;
    payments : [FeePayment];
    totalPaid : Float;
    outstanding : Float;
  };

  type FinancialSummary = {
    totalCollected : Float;
    totalPending : Float;
    defaultersCount : Nat;
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
  let feeMasters = Map.empty<FeeID, FeeMaster>();
  let feeAssignments = Map.empty<FeeAssignmentID, FeeAssignment>();
  let feePayments = Map.empty<PaymentID, FeePayment>();
  let departments = Map.empty<DepartmentID, Department>();
  let programs = Map.empty<ProgramID, Program>();
  let subjects = Map.empty<SubjectID, Subject>();
  let courseEnrollments = Map.empty<CourseEnrollmentID, CourseEnrollment>();
  let exams = Map.empty<ExamID, Exam>();
  let examResults = Map.empty<ExamResultID, ExamResult>();
  let admissionApplicants = Map.empty<AdmissionApplicantID, AdmissionApplicant>();

  var nextFeeId : FeeID = 0;
  var nextFeeAssignmentId : FeeAssignmentID = 0;
  var nextPaymentId : PaymentID = 0;
  var nextReceiptNum : Nat = 1000;
  var nextDepartmentId : DepartmentID = 0;
  var nextProgramId : ProgramID = 0;
  var nextSubjectId : SubjectID = 0;
  var nextEnrollmentId : CourseEnrollmentID = 0;
  var nextExamId : ExamID = 0;
  var nextExamResultId : ExamResultID = 0;
  var nextApplicantId : AdmissionApplicantID = 0;
  var nextStudentId : StudentID = 0;

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

  func isAccountant(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#accountant) { true };
          case (_) { false };
        };
      };
    };
  };

  func canManageFees(caller : Principal, schoolId : SchoolID) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#superadmin) { true };
          case (#admin or #accountant) {
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

  func compareSchoolsByName(s1 : School, s2 : School) : Order.Order {
    if (s1.name < s2.name) { #less } else if (s1.name > s2.name) {
      #greater;
    } else {
      Nat.compare(s1.id, s2.id);
    };
  };

  func generateReceiptNumber() : Text {
    let num = nextReceiptNum;
    nextReceiptNum += 1;
    "RCP-" # num.toText();
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    requireAuth(caller);
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
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

  // School Managment
  public shared ({ caller }) func addSchool(name : Text, address : Text, phone : Text, email : Text) : async SchoolID {
    require(isSuperAdmin(caller), "Unauthorized: Only superadmins can create school");
    let newId = schools.size();

    schools.add(
      newId,
      {
        id = newId;
        name;
        address;
        phone;
        email;
        isActive = true;
      },
    );
    newId;
  };

  public shared ({ caller }) func updateSchool(id : SchoolID, name : Text, address : Text, phone : Text, email : Text) : async () {
    require(isSuperAdmin(caller), "Unauthorized: Only superadmins can update School");
    let school = getSchoolById(id);

    schools.add(
      id,
      {
        school with
        name;
        address;
        phone;
        email;
      },
    );
  };

  public query ({ caller }) func getRemoteSchools() : async [School] {
    requireAuth(caller);
    schools.values().toArray();
  };

  public query ({ caller }) func searchSchools(searchTerm : Text) : async [School] {
    requireAuth(caller);
    let list = List.empty<School>();
    for (school in schools.values()) {
      if (school.name.contains(#text searchTerm) or school.address.contains(#text searchTerm) or school.phone.contains(#text searchTerm) or school.email.contains(#text searchTerm)) {
        list.add(school);
      };
    };
    list.toArray();
  };

  // Finance Module - Fee Structure Management
  public shared ({ caller }) func createFeeMaster(
    schoolId : SchoolID,
    classId : ClassID,
    sessionId : SessionID,
    feeHead : FeeHead,
    amount : Float,
    dueDate : Int,
  ) : async FeeID {
    requireAuth(caller);
    if (not canManageFees(caller, schoolId)) {
      Runtime.trap("Unauthorized: Only accountants and admins can create fee structures");
    };

    let feeId = nextFeeId;
    nextFeeId += 1;

    let fee : FeeMaster = {
      id = feeId;
      schoolId;
      classId;
      sessionId;
      feeHead;
      amount;
      dueDate;
    };

    feeMasters.add(feeId, fee);
    feeId;
  };

  public shared ({ caller }) func updateFeeMaster(
    feeId : FeeID,
    amount : Float,
    dueDate : Int,
  ) : async () {
    requireAuth(caller);

    let fee = switch (feeMasters.get(feeId)) {
      case (null) { Runtime.trap("Fee structure not found") };
      case (?f) { f };
    };

    if (not canManageFees(caller, fee.schoolId)) {
      Runtime.trap("Unauthorized: Only accountants and admins can update fee structures");
    };

    feeMasters.add(
      feeId,
      {
        fee with
        amount;
        dueDate;
      },
    );
  };

  public query ({ caller }) func getFeeMasters(schoolId : SchoolID) : async [FeeMaster] {
    requireAuth(caller);
    if (not canAccessSchool(caller, schoolId)) {
      Runtime.trap("Unauthorized: Cannot access this school's fee structures");
    };

    let list = List.empty<FeeMaster>();
    for (fee in feeMasters.values()) {
      if (fee.schoolId == schoolId) {
        list.add(fee);
      };
    };
    list.toArray();
  };

  // Finance Module - Student Fee Assignment
  public shared ({ caller }) func assignFeeToStudent(
    studentId : StudentID,
    feeId : FeeID,
  ) : async FeeAssignmentID {
    requireAuth(caller);

    let student = switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?s) { s };
    };

    let fee = switch (feeMasters.get(feeId)) {
      case (null) { Runtime.trap("Fee structure not found") };
      case (?f) { f };
    };

    if (not canManageFees(caller, student.schoolId)) {
      Runtime.trap("Unauthorized: Only accountants and admins can assign fees");
    };

    if (student.schoolId != fee.schoolId) {
      Runtime.trap("Student and fee must belong to the same school");
    };

    let assignmentId = nextFeeAssignmentId;
    nextFeeAssignmentId += 1;

    let assignment : FeeAssignment = {
      id = assignmentId;
      schoolId = student.schoolId;
      studentId;
      feeId;
      assignedAt = Time.now();
      assignedBy = caller;
    };

    feeAssignments.add(assignmentId, assignment);
    assignmentId;
  };

  // Finance Module - Payment Collection
  public shared ({ caller }) func recordPayment(
    studentId : StudentID,
    feeAssignmentId : FeeAssignmentID,
    amountPaid : Float,
    paymentMode : PaymentMode,
  ) : async PaymentID {
    requireAuth(caller);

    let student = switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?s) { s };
    };

    let assignment = switch (feeAssignments.get(feeAssignmentId)) {
      case (null) { Runtime.trap("Fee assignment not found") };
      case (?a) { a };
    };

    if (not canManageFees(caller, student.schoolId)) {
      Runtime.trap("Unauthorized: Only accountants and admins can record payments");
    };

    if (assignment.studentId != studentId) {
      Runtime.trap("Fee assignment does not belong to this student");
    };

    if (amountPaid <= 0.0) {
      Runtime.trap("Payment amount must be positive");
    };

    let paymentId = nextPaymentId;
    nextPaymentId += 1;

    let payment : FeePayment = {
      id = paymentId;
      schoolId = student.schoolId;
      studentId;
      feeAssignmentId;
      amountPaid;
      paymentDate = Time.now();
      paymentMode;
      receiptNum = generateReceiptNumber();
      recordedBy = caller;
    };

    feePayments.add(paymentId, payment);
    paymentId;
  };

  // Finance Module - Fee Ledger (Students/Parents can view their own)
  public query ({ caller }) func getStudentFeeLedger(studentId : StudentID) : async [FeeLedgerEntry] {
    requireAuth(caller);

    // Authorization: accountant/admin can view any student, students/parents can view their own
    let profile = requireUserProfile(caller);
    let canView = switch (profile.role) {
      case (#superadmin or #admin or #accountant) {
        let student = switch (students.get(studentId)) {
          case (null) { Runtime.trap("Student not found") };
          case (?s) { s };
        };
        canAccessSchool(caller, student.schoolId);
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
      case (_) { false };
    };

    if (not canView) {
      Runtime.trap("Unauthorized: Cannot view this student's fee ledger");
    };

    let ledger = List.empty<FeeLedgerEntry>();

    for (assignment in feeAssignments.values()) {
      if (assignment.studentId == studentId) {
        let fee = switch (feeMasters.get(assignment.feeId)) {
          case (null) { continue };
          case (?f) { f };
        };

        let payments = List.empty<FeePayment>();
        var totalPaid : Float = 0.0;

        for (payment in feePayments.values()) {
          if (payment.feeAssignmentId == assignment.id) {
            payments.add(payment);
            totalPaid += payment.amountPaid;
          };
        };

        let outstanding = fee.amount - totalPaid;

        ledger.add({
          feeAssignment = assignment;
          feeMaster = fee;
          payments = payments.toArray();
          totalPaid;
          outstanding;
        });
      };
    };

    ledger.toArray();
  };

  // Finance Module - Fee Defaulters
  public query ({ caller }) func getFeeDefaulters(
    schoolId : SchoolID,
    classId : ?ClassID,
    sessionId : ?SessionID,
  ) : async [StudentID] {
    requireAuth(caller);

    if (not canManageFees(caller, schoolId)) {
      Runtime.trap("Unauthorized: Only accountants and admins can view defaulters");
    };

    let now = Time.now();
    let defaulters = List.empty<StudentID>();

    for (assignment in feeAssignments.values()) {
      if (assignment.schoolId != schoolId) {
        continue;
      };

      let fee = switch (feeMasters.get(assignment.feeId)) {
        case (null) { continue };
        case (?f) { f };
      };

      // Filter by class if specified
      switch (classId) {
        case (?cid) {
          if (fee.classId != cid) { continue };
        };
        case (null) {};
      };

      // Filter by session if specified
      switch (sessionId) {
        case (?sid) {
          if (fee.sessionId != sid) { continue };
        };
        case (null) {};
      };

      // Check if overdue
      if (fee.dueDate >= now) {
        continue;
      };

      // Calculate total paid
      var totalPaid : Float = 0.0;
      for (payment in feePayments.values()) {
        if (payment.feeAssignmentId == assignment.id) {
          totalPaid += payment.amountPaid;
        };
      };

      // If outstanding balance exists, add to defaulters
      if (totalPaid < fee.amount) {
        defaulters.add(assignment.studentId);
      };
    };

    defaulters.toArray();
  };

  // Finance Module - Financial Reports
  public query ({ caller }) func getFinancialSummary(
    schoolId : SchoolID,
    startDate : ?Int,
    endDate : ?Int,
  ) : async FinancialSummary {
    requireAuth(caller);

    if (not canManageFees(caller, schoolId)) {
      Runtime.trap("Unauthorized: Only accountants and admins can view financial reports");
    };

    var totalCollected : Float = 0.0;
    var totalPending : Float = 0.0;
    var defaultersCount : Nat = 0;
    let now = Time.now();

    let processedStudents = Map.empty<StudentID, Bool>();

    for (assignment in feeAssignments.values()) {
      if (assignment.schoolId != schoolId) {
        continue;
      };

      let fee = switch (feeMasters.get(assignment.feeId)) {
        case (null) { continue };
        case (?f) { f };
      };

      // Calculate total paid for this assignment
      var totalPaid : Float = 0.0;
      for (payment in feePayments.values()) {
        if (payment.feeAssignmentId == assignment.id) {
          // Filter by date range if specified
          var includePayment = true;
          switch (startDate) {
            case (?start) {
              if (payment.paymentDate < start) {
                includePayment := false;
              };
            };
            case (null) {};
          };
          switch (endDate) {
            case (?end) {
              if (payment.paymentDate > end) {
                includePayment := false;
              };
            };
            case (null) {};
          };

          if (includePayment) {
            totalPaid += payment.amountPaid;
          };
        };
      };

      totalCollected += totalPaid;
      let outstanding = fee.amount - totalPaid;
      totalPending += outstanding;

      // Count defaulters (overdue with outstanding balance)
      if (fee.dueDate < now and outstanding > 0.0) {
        switch (processedStudents.get(assignment.studentId)) {
          case (null) {
            defaultersCount += 1;
            processedStudents.add(assignment.studentId, true);
          };
          case (?_) {};
        };
      };
    };

    {
      totalCollected;
      totalPending;
      defaultersCount;
    };
  };
};

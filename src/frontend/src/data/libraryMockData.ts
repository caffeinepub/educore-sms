export interface Book {
  id: string;
  accessionNumber: string;
  title: string;
  authors: string[];
  isbn: string;
  category: string;
  publisher: string;
  edition: string;
  price: number;
  quantity: number;
  availableCopies: number;
  issuedCopies: number;
  reservedCopies: number;
  damagedCopies: number;
  missingCopies: number;
  shelfLocation: string;
  language: string;
  coverImage: string;
  qrData: string;
}

export interface IssueRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: "issued" | "returned" | "overdue";
  fineAmount: number;
}

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  reservedAt: string;
  status: "pending" | "ready" | "cancelled";
}

export interface LibraryFine {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  type: "overdue" | "damage" | "lost";
  amount: number;
  paid: boolean;
  date: string;
}

export interface LibrarySettings {
  issueLimit: number;
  finePerDay: number;
  loanDurationDays: number;
  schoolName: string;
}

export interface LibraryNotification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const CATEGORIES = [
  "Fiction",
  "Science",
  "Mathematics",
  "History",
  "Computer Science",
  "Literature",
  "Reference",
  "Magazine",
];

export const books: Book[] = [
  {
    id: "b1",
    accessionNumber: "ACC-0001",
    title: "The Great Gatsby",
    authors: ["F. Scott Fitzgerald"],
    isbn: "978-0-7432-7356-5",
    category: "Fiction",
    publisher: "Scribner",
    edition: "1st",
    price: 299,
    quantity: 4,
    availableCopies: 3,
    issuedCopies: 1,
    reservedCopies: 0,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "A-01",
    language: "English",
    coverImage: "https://picsum.photos/seed/b1/200/280",
    qrData: "ACC-0001",
  },
  {
    id: "b2",
    accessionNumber: "ACC-0002",
    title: "Introduction to Algorithms",
    authors: ["Thomas H. Cormen", "Charles E. Leiserson"],
    isbn: "978-0-262-03384-8",
    category: "Computer Science",
    publisher: "MIT Press",
    edition: "4th",
    price: 1299,
    quantity: 3,
    availableCopies: 1,
    issuedCopies: 2,
    reservedCopies: 1,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "C-04",
    language: "English",
    coverImage: "https://picsum.photos/seed/b2/200/280",
    qrData: "ACC-0002",
  },
  {
    id: "b3",
    accessionNumber: "ACC-0003",
    title: "Calculus: Early Transcendentals",
    authors: ["James Stewart"],
    isbn: "978-1-285-74155-0",
    category: "Mathematics",
    publisher: "Cengage",
    edition: "8th",
    price: 899,
    quantity: 5,
    availableCopies: 4,
    issuedCopies: 1,
    reservedCopies: 0,
    damagedCopies: 1,
    missingCopies: 0,
    shelfLocation: "M-02",
    language: "English",
    coverImage: "https://picsum.photos/seed/b3/200/280",
    qrData: "ACC-0003",
  },
  {
    id: "b4",
    accessionNumber: "ACC-0004",
    title: "Sapiens: A Brief History of Humankind",
    authors: ["Yuval Noah Harari"],
    isbn: "978-0-06-231609-7",
    category: "History",
    publisher: "Harper",
    edition: "1st",
    price: 499,
    quantity: 3,
    availableCopies: 2,
    issuedCopies: 1,
    reservedCopies: 0,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "H-03",
    language: "English",
    coverImage: "https://picsum.photos/seed/b4/200/280",
    qrData: "ACC-0004",
  },
  {
    id: "b5",
    accessionNumber: "ACC-0005",
    title: "Pride and Prejudice",
    authors: ["Jane Austen"],
    isbn: "978-0-14-143951-8",
    category: "Literature",
    publisher: "Penguin Classics",
    edition: "2nd",
    price: 199,
    quantity: 6,
    availableCopies: 5,
    issuedCopies: 1,
    reservedCopies: 0,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "L-01",
    language: "English",
    coverImage: "https://picsum.photos/seed/b5/200/280",
    qrData: "ACC-0005",
  },
  {
    id: "b6",
    accessionNumber: "ACC-0006",
    title: "A Brief History of Time",
    authors: ["Stephen Hawking"],
    isbn: "978-0-553-38016-3",
    category: "Science",
    publisher: "Bantam Books",
    edition: "Updated",
    price: 399,
    quantity: 4,
    availableCopies: 3,
    issuedCopies: 1,
    reservedCopies: 0,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "S-02",
    language: "English",
    coverImage: "https://picsum.photos/seed/b6/200/280",
    qrData: "ACC-0006",
  },
  {
    id: "b7",
    accessionNumber: "ACC-0007",
    title: "Oxford Dictionary of English",
    authors: ["Oxford University Press"],
    isbn: "978-0-19-861422-9",
    category: "Reference",
    publisher: "Oxford University Press",
    edition: "3rd",
    price: 1499,
    quantity: 2,
    availableCopies: 2,
    issuedCopies: 0,
    reservedCopies: 0,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "R-01",
    language: "English",
    coverImage: "https://picsum.photos/seed/b7/200/280",
    qrData: "ACC-0007",
  },
  {
    id: "b8",
    accessionNumber: "ACC-0008",
    title: "National Geographic Kids",
    authors: ["National Geographic"],
    isbn: "978-1-4263-3000-1",
    category: "Magazine",
    publisher: "National Geographic",
    edition: "Vol 12",
    price: 99,
    quantity: 10,
    availableCopies: 8,
    issuedCopies: 2,
    reservedCopies: 0,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "MG-01",
    language: "English",
    coverImage: "https://picsum.photos/seed/b8/200/280",
    qrData: "ACC-0008",
  },
  {
    id: "b9",
    accessionNumber: "ACC-0009",
    title: "To Kill a Mockingbird",
    authors: ["Harper Lee"],
    isbn: "978-0-06-112008-4",
    category: "Fiction",
    publisher: "HarperCollins",
    edition: "Perennial Modern Classics",
    price: 349,
    quantity: 5,
    availableCopies: 3,
    issuedCopies: 2,
    reservedCopies: 1,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "A-03",
    language: "English",
    coverImage: "https://picsum.photos/seed/b9/200/280",
    qrData: "ACC-0009",
  },
  {
    id: "b10",
    accessionNumber: "ACC-0010",
    title: "Physics: Principles and Problems",
    authors: ["Paul W. Zitzewitz"],
    isbn: "978-0-07-845813-0",
    category: "Science",
    publisher: "McGraw-Hill",
    edition: "Student Edition",
    price: 799,
    quantity: 6,
    availableCopies: 4,
    issuedCopies: 2,
    reservedCopies: 0,
    damagedCopies: 1,
    missingCopies: 1,
    shelfLocation: "S-04",
    language: "English",
    coverImage: "https://picsum.photos/seed/b10/200/280",
    qrData: "ACC-0010",
  },
  {
    id: "b11",
    accessionNumber: "ACC-0011",
    title: "The Alchemist",
    authors: ["Paulo Coelho"],
    isbn: "978-0-06-231500-7",
    category: "Fiction",
    publisher: "HarperOne",
    edition: "25th Anniversary",
    price: 299,
    quantity: 5,
    availableCopies: 4,
    issuedCopies: 1,
    reservedCopies: 0,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "A-05",
    language: "English",
    coverImage: "https://picsum.photos/seed/b11/200/280",
    qrData: "ACC-0011",
  },
  {
    id: "b12",
    accessionNumber: "ACC-0012",
    title: "Discrete Mathematics",
    authors: ["Kenneth H. Rosen"],
    isbn: "978-0-07-338309-5",
    category: "Mathematics",
    publisher: "McGraw-Hill",
    edition: "7th",
    price: 999,
    quantity: 4,
    availableCopies: 3,
    issuedCopies: 1,
    reservedCopies: 0,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "M-05",
    language: "English",
    coverImage: "https://picsum.photos/seed/b12/200/280",
    qrData: "ACC-0012",
  },
  {
    id: "b13",
    accessionNumber: "ACC-0013",
    title: "Indian History - Ancient",
    authors: ["R.C. Majumdar"],
    isbn: "978-81-7748-091-8",
    category: "History",
    publisher: "Bharatiya Vidya Bhavan",
    edition: "3rd",
    price: 450,
    quantity: 3,
    availableCopies: 2,
    issuedCopies: 1,
    reservedCopies: 0,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "H-01",
    language: "English",
    coverImage: "https://picsum.photos/seed/b13/200/280",
    qrData: "ACC-0013",
  },
  {
    id: "b14",
    accessionNumber: "ACC-0014",
    title: "Wings of Fire",
    authors: ["A.P.J. Abdul Kalam"],
    isbn: "978-81-7371-146-6",
    category: "Literature",
    publisher: "Universities Press",
    edition: "1st",
    price: 250,
    quantity: 7,
    availableCopies: 5,
    issuedCopies: 2,
    reservedCopies: 1,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "L-03",
    language: "English",
    coverImage: "https://picsum.photos/seed/b14/200/280",
    qrData: "ACC-0014",
  },
  {
    id: "b15",
    accessionNumber: "ACC-0015",
    title: "Clean Code",
    authors: ["Robert C. Martin"],
    isbn: "978-0-13-235088-4",
    category: "Computer Science",
    publisher: "Prentice Hall",
    edition: "1st",
    price: 1099,
    quantity: 3,
    availableCopies: 2,
    issuedCopies: 1,
    reservedCopies: 0,
    damagedCopies: 0,
    missingCopies: 0,
    shelfLocation: "C-07",
    language: "English",
    coverImage: "https://picsum.photos/seed/b15/200/280",
    qrData: "ACC-0015",
  },
];

export const issueRecords: IssueRecord[] = [
  {
    id: "ir1",
    bookId: "b1",
    bookTitle: "The Great Gatsby",
    studentId: "stu1",
    studentName: "Alice Johnson",
    issueDate: "2026-03-01",
    dueDate: "2026-03-15",
    returnDate: null,
    status: "overdue",
    fineAmount: 4,
  },
  {
    id: "ir2",
    bookId: "b2",
    bookTitle: "Introduction to Algorithms",
    studentId: "stu2",
    studentName: "Brian Martinez",
    issueDate: "2026-03-05",
    dueDate: "2026-03-19",
    returnDate: null,
    status: "issued",
    fineAmount: 0,
  },
  {
    id: "ir3",
    bookId: "b3",
    bookTitle: "Calculus: Early Transcendentals",
    studentId: "stu3",
    studentName: "Clara Smith",
    issueDate: "2026-02-20",
    dueDate: "2026-03-06",
    returnDate: null,
    status: "overdue",
    fineAmount: 22,
  },
  {
    id: "ir4",
    bookId: "b9",
    bookTitle: "To Kill a Mockingbird",
    studentId: "stu1",
    studentName: "Alice Johnson",
    issueDate: "2026-03-10",
    dueDate: "2026-03-24",
    returnDate: null,
    status: "issued",
    fineAmount: 0,
  },
  {
    id: "ir5",
    bookId: "b6",
    bookTitle: "A Brief History of Time",
    studentId: "stu4",
    studentName: "David Lee",
    issueDate: "2026-02-10",
    dueDate: "2026-02-24",
    returnDate: "2026-03-01",
    status: "returned",
    fineAmount: 14,
  },
  {
    id: "ir6",
    bookId: "b5",
    bookTitle: "Pride and Prejudice",
    studentId: "stu2",
    studentName: "Brian Martinez",
    issueDate: "2026-02-15",
    dueDate: "2026-03-01",
    returnDate: "2026-03-02",
    status: "returned",
    fineAmount: 2,
  },
  {
    id: "ir7",
    bookId: "b14",
    bookTitle: "Wings of Fire",
    studentId: "stu5",
    studentName: "Eva Patel",
    issueDate: "2026-03-08",
    dueDate: "2026-03-22",
    returnDate: null,
    status: "issued",
    fineAmount: 0,
  },
  {
    id: "ir8",
    bookId: "b10",
    bookTitle: "Physics: Principles and Problems",
    studentId: "stu3",
    studentName: "Clara Smith",
    issueDate: "2026-03-12",
    dueDate: "2026-03-26",
    returnDate: null,
    status: "issued",
    fineAmount: 0,
  },
  {
    id: "ir9",
    bookId: "b15",
    bookTitle: "Clean Code",
    studentId: "stu4",
    studentName: "David Lee",
    issueDate: "2026-03-13",
    dueDate: "2026-03-27",
    returnDate: null,
    status: "issued",
    fineAmount: 0,
  },
  {
    id: "ir10",
    bookId: "b11",
    bookTitle: "The Alchemist",
    studentId: "stu5",
    studentName: "Eva Patel",
    issueDate: "2026-02-01",
    dueDate: "2026-02-15",
    returnDate: "2026-02-14",
    status: "returned",
    fineAmount: 0,
  },
  {
    id: "ir11",
    bookId: "b4",
    bookTitle: "Sapiens",
    studentId: "stu6",
    studentName: "Frank Nguyen",
    issueDate: "2026-03-14",
    dueDate: "2026-03-28",
    returnDate: null,
    status: "issued",
    fineAmount: 0,
  },
  {
    id: "ir12",
    bookId: "b2",
    bookTitle: "Introduction to Algorithms",
    studentId: "stu6",
    studentName: "Frank Nguyen",
    issueDate: "2026-03-05",
    dueDate: "2026-03-19",
    returnDate: null,
    status: "issued",
    fineAmount: 0,
  },
];

export const reservations: Reservation[] = [
  {
    id: "res1",
    bookId: "b2",
    bookTitle: "Introduction to Algorithms",
    studentId: "stu1",
    studentName: "Alice Johnson",
    reservedAt: "2026-03-10",
    status: "pending",
  },
  {
    id: "res2",
    bookId: "b9",
    bookTitle: "To Kill a Mockingbird",
    studentId: "stu5",
    studentName: "Eva Patel",
    reservedAt: "2026-03-12",
    status: "ready",
  },
  {
    id: "res3",
    bookId: "b14",
    bookTitle: "Wings of Fire",
    studentId: "stu3",
    studentName: "Clara Smith",
    reservedAt: "2026-03-11",
    status: "pending",
  },
  {
    id: "res4",
    bookId: "b3",
    bookTitle: "Calculus: Early Transcendentals",
    studentId: "stu4",
    studentName: "David Lee",
    reservedAt: "2026-03-09",
    status: "cancelled",
  },
  {
    id: "res5",
    bookId: "b1",
    bookTitle: "The Great Gatsby",
    studentId: "stu6",
    studentName: "Frank Nguyen",
    reservedAt: "2026-03-15",
    status: "pending",
  },
];

export const libraryFines: LibraryFine[] = [
  {
    id: "f1",
    studentId: "stu1",
    studentName: "Alice Johnson",
    bookId: "b1",
    bookTitle: "The Great Gatsby",
    type: "overdue",
    amount: 4,
    paid: false,
    date: "2026-03-17",
  },
  {
    id: "f2",
    studentId: "stu3",
    studentName: "Clara Smith",
    bookId: "b3",
    bookTitle: "Calculus: Early Transcendentals",
    type: "overdue",
    amount: 22,
    paid: false,
    date: "2026-03-17",
  },
  {
    id: "f3",
    studentId: "stu4",
    studentName: "David Lee",
    bookId: "b6",
    bookTitle: "A Brief History of Time",
    type: "overdue",
    amount: 14,
    paid: true,
    date: "2026-03-01",
  },
  {
    id: "f4",
    studentId: "stu2",
    studentName: "Brian Martinez",
    bookId: "b5",
    bookTitle: "Pride and Prejudice",
    type: "overdue",
    amount: 2,
    paid: true,
    date: "2026-03-02",
  },
  {
    id: "f5",
    studentId: "stu3",
    studentName: "Clara Smith",
    bookId: "b10",
    bookTitle: "Physics: Principles and Problems",
    type: "damage",
    amount: 150,
    paid: false,
    date: "2026-03-10",
  },
  {
    id: "f6",
    studentId: "stu5",
    studentName: "Eva Patel",
    bookId: "b7",
    bookTitle: "Oxford Dictionary",
    type: "lost",
    amount: 1499,
    paid: false,
    date: "2026-02-28",
  },
];

export const librarySettings: LibrarySettings = {
  issueLimit: 2,
  finePerDay: 2,
  loanDurationDays: 14,
  schoolName: "Springfield Academy",
};

export const libraryNotifications: LibraryNotification[] = [
  {
    id: "n1",
    userId: "stu1",
    message:
      "Your reservation for 'Introduction to Algorithms' is ready for pickup!",
    read: false,
    createdAt: "2026-03-17T09:00:00Z",
  },
  {
    id: "n2",
    userId: "stu1",
    message: "'The Great Gatsby' is overdue. Fine accruing at ₹2/day.",
    read: false,
    createdAt: "2026-03-16T08:00:00Z",
  },
  {
    id: "n3",
    userId: "stu3",
    message: "'Calculus' is overdue. Please return immediately.",
    read: true,
    createdAt: "2026-03-10T08:00:00Z",
  },
  {
    id: "n4",
    userId: "stu5",
    message:
      "Your reservation for 'To Kill a Mockingbird' is ready for pickup!",
    read: false,
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "n5",
    userId: "stu2",
    message: "'Introduction to Algorithms' is due in 2 days.",
    read: false,
    createdAt: "2026-03-17T07:00:00Z",
  },
];

export const mockStaff = [
  {
    id: "staff1",
    name: "Mr. James Wilson",
    role: "Teacher",
    employeeId: "EMP-001",
    photo: "https://picsum.photos/seed/staff1/100/100",
  },
  {
    id: "staff2",
    name: "Ms. Sarah Thompson",
    role: "Librarian",
    employeeId: "EMP-002",
    photo: "https://picsum.photos/seed/staff2/100/100",
  },
  {
    id: "staff3",
    name: "Mr. Robert Clark",
    role: "Teacher",
    employeeId: "EMP-003",
    photo: "https://picsum.photos/seed/staff3/100/100",
  },
];

export function getNextAccessionNumber(existingBooks: Book[]): string {
  const nums = existingBooks.map((b) =>
    Number.parseInt(b.accessionNumber.replace("ACC-", ""), 10),
  );
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `ACC-${String(max + 1).padStart(4, "0")}`;
}

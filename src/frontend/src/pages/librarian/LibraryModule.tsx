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
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BookOpen,
  Camera,
  CheckCircle,
  Download,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  ScanLine,
  Search,
  Settings,
  TrendingUp,
  XCircle,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  type Book,
  CATEGORIES,
  type IssueRecord,
  type LibraryFine,
  type Reservation,
  getNextAccessionNumber,
  books as initialBooks,
  libraryFines as initialFines,
  issueRecords as initialIssues,
  reservations as initialReservations,
  librarySettings as initialSettings,
  libraryNotifications,
  mockStaff,
} from "../../data/libraryMockData";
import { students } from "../../data/mockData";
import { useQRScanner } from "../../qr-code/useQRScanner";

const QR_FILLED = new Set([
  0, 1, 2, 3, 4, 5, 6, 7, 14, 21, 28, 35, 42, 43, 44, 45, 46, 47, 48, 8, 15, 10,
  11, 12, 17, 24, 31, 38, 40, 33, 26, 22, 30, 37,
]);
const QR_CELLS: string[] = Array.from({ length: 49 }, (_, n) => `cell-${n}`);

function QRBox({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 border-2 border-dashed border-border rounded-lg bg-muted/30">
      <div className="grid grid-cols-7 gap-0.5">
        {QR_CELLS.map((cellKey) => {
          const idx = Number.parseInt(cellKey.replace("cell-", ""), 10);
          return (
            <div
              key={cellKey}
              className={`w-3 h-3 rounded-sm ${QR_FILLED.has(idx) ? "bg-foreground" : "bg-background"}`}
            />
          );
        })}
      </div>
      <span className="text-xs font-mono font-bold tracking-widest">
        {value}
      </span>
    </div>
  );
}

function BookStatusBadge({
  available,
  issued,
  reserved,
}: { available: number; issued: number; reserved: number }) {
  if (available > 0)
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        Available ({available})
      </Badge>
    );
  if (reserved > 0)
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        Reserved
      </Badge>
    );
  if (issued > 0)
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">Issued</Badge>
    );
  return <Badge variant="secondary">Out of Stock</Badge>;
}

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(","),
    ...data.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Linear barcode SVG component
function LinearBarcode({ value }: { value: string }) {
  const bars: { x: number; width: number; isBlack: boolean }[] = [];
  let x = 0;
  const barUnit = 2;
  // Start bar
  for (const black of [1, 0, 1]) {
    bars.push({ x, width: barUnit, isBlack: black === 1 });
    x += barUnit;
  }
  x += barUnit; // gap
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const thick = (code % 3) + 1;
    const thin = 1;
    bars.push({ x, width: thick * barUnit, isBlack: true });
    x += thick * barUnit;
    bars.push({ x, width: thin * barUnit, isBlack: false });
    x += thin * barUnit;
    bars.push({ x, width: thin * barUnit, isBlack: true });
    x += thin * barUnit;
    bars.push({ x, width: thin * barUnit, isBlack: false });
    x += thin * barUnit;
  }
  // Stop bar
  for (const black of [1, 0, 1, 0, 1]) {
    bars.push({ x, width: barUnit, isBlack: black === 1 });
    x += barUnit;
  }
  const totalWidth = x;
  return (
    <div className="flex flex-col items-center">
      <svg
        width={totalWidth}
        height={60}
        style={{ maxWidth: "100%" }}
        role="img"
        aria-label={`Barcode for ${value}`}
      >
        {bars.map((bar) =>
          bar.isBlack ? (
            <rect
              key={`bar-${bar.x}`}
              x={bar.x}
              y={0}
              width={bar.width}
              height={50}
              fill="black"
            />
          ) : null,
        )}
      </svg>
      <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>
        {value}
      </span>
    </div>
  );
}

// Barcode Scanner Dialog
function BarcodeScannerDialog({
  books,
  issues,
  onIssue,
  onReturn,
}: {
  books: Book[];
  issues: IssueRecord[];
  onIssue: (bookId: string, studentId: string, dueDate: string) => void;
  onReturn: (issueId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [scannedBook, setScannedBook] = useState<Book | null>(null);
  const [scanStudentId, setScanStudentId] = useState("");
  const [scanDueDate, setScanDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });

  const {
    qrResults,
    isScanning,
    isLoading,
    error,
    isSupported,
    canStartScanning,
    startScanning,
    stopScanning,
    clearResults,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 200,
    maxResults: 3,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: scanner functions are stable refs
  useEffect(() => {
    if (open) {
      startScanning();
    } else {
      stopScanning();
      setScannedBook(null);
      setScanStudentId("");
      clearResults();
    }
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scan once, stable refs
  useEffect(() => {
    if (qrResults.length > 0) {
      const data = qrResults[0].data;
      const found = books.find(
        (b) => b.accessionNumber === data || b.qrData === data || b.id === data,
      );
      if (found && !scannedBook) {
        setScannedBook(found);
        stopScanning();
      }
    }
  }, [qrResults]);

  const activeIssue = scannedBook
    ? issues.find((i) => i.bookId === scannedBook.id && i.returnDate === null)
    : null;

  function handleIssue() {
    if (!scannedBook || !scanStudentId) return;
    onIssue(scannedBook.id, scanStudentId, scanDueDate);
    setOpen(false);
  }

  function handleReturn() {
    if (!activeIssue) return;
    onReturn(activeIssue.id);
    setOpen(false);
  }

  function resetScan() {
    setScannedBook(null);
    setScanStudentId("");
    clearResults();
    startScanning();
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        data-ocid="library.scanner.open_modal_button"
      >
        <Camera size={16} className="mr-2" />
        Scan Barcode
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" data-ocid="library.scanner.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine size={18} /> Barcode Scanner — Issue / Return
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isSupported === false ? (
              <p className="text-destructive text-sm">
                Camera not supported on this device.
              </p>
            ) : null}
            {error ? (
              <p
                className="text-destructive text-sm"
                data-ocid="library.scanner.error_state"
              >
                {error.message}
              </p>
            ) : null}
            {!scannedBook ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isScanning
                    ? "Scanning… point camera at a barcode/QR code"
                    : isLoading
                      ? "Starting camera…"
                      : "Camera ready"}
                </p>
                <div className="relative rounded-lg overflow-hidden border border-border bg-black aspect-video">
                  <video
                    ref={videoRef}
                    style={{ width: "100%", height: "auto" }}
                    playsInline
                    muted
                  />
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-primary rounded-lg opacity-60" />
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} style={{ display: "none" }} />
                {!isScanning && canStartScanning && (
                  <Button
                    size="sm"
                    onClick={startScanning}
                    data-ocid="library.scanner.button"
                  >
                    Start Scanning
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Card>
                  <CardContent className="pt-4 space-y-1">
                    <p className="font-semibold">{scannedBook.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {Array.isArray(scannedBook.authors)
                        ? scannedBook.authors.join(", ")
                        : scannedBook.authors}
                    </p>
                    <p className="text-xs font-mono">
                      {scannedBook.accessionNumber}
                    </p>
                    {activeIssue ? (
                      <Badge className="bg-red-100 text-red-800">
                        Issued to: {activeIssue.studentName}
                      </Badge>
                    ) : scannedBook.availableCopies > 0 ? (
                      <Badge className="bg-green-100 text-green-800">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Out of Stock</Badge>
                    )}
                  </CardContent>
                </Card>
                {activeIssue ? (
                  <div className="space-y-2">
                    <p className="text-sm">
                      Due: <strong>{activeIssue.dueDate}</strong>
                    </p>
                    <Button
                      onClick={handleReturn}
                      data-ocid="library.scanner.confirm_button"
                    >
                      <RefreshCw size={14} className="mr-1" /> Return Book
                    </Button>
                  </div>
                ) : scannedBook.availableCopies > 0 ? (
                  <div className="space-y-2">
                    <div>
                      <Label>Select Student</Label>
                      <Select
                        value={scanStudentId}
                        onValueChange={setScanStudentId}
                      >
                        <SelectTrigger data-ocid="library.scanner.select">
                          <SelectValue placeholder="Choose student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} ({s.rollNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={scanDueDate}
                        onChange={(e) => setScanDueDate(e.target.value)}
                        data-ocid="library.scanner.input"
                      />
                    </div>
                    <Button
                      onClick={handleIssue}
                      disabled={!scanStudentId}
                      data-ocid="library.scanner.confirm_button"
                    >
                      <BookOpen size={14} className="mr-1" /> Issue Book
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No copies available to issue.
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetScan}
                  data-ocid="library.scanner.secondary_button"
                >
                  Scan Another
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="library.scanner.cancel_button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function LibraryModule() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [issues, setIssues] = useState<IssueRecord[]>(initialIssues);
  const [reservations, setReservations] =
    useState<Reservation[]>(initialReservations);
  const [fines, setFines] = useState<LibraryFine[]>(initialFines);
  const [settings, setSettings] = useState(initialSettings);
  const [notifications] = useState(libraryNotifications);

  // Catalog state
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showAddBook, setShowAddBook] = useState(false);
  const [qrBook, setQrBook] = useState<Book | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [newBook, setNewBook] = useState<Partial<Book>>({
    title: "",
    authors: [],
    isbn: "",
    category: "Fiction",
    publisher: "",
    edition: "",
    price: 0,
    quantity: 1,
    shelfLocation: "",
    language: "English",
  });

  // Issue state
  const [issueStudentId, setIssueStudentId] = useState("");
  const [issueBookId, setIssueBookId] = useState("");
  const [issueDueDate, setIssueDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + settings.loanDurationDays);
    return d.toISOString().split("T")[0];
  });
  const [damageDialog, setDamageDialog] = useState<{
    issue: IssueRecord | null;
    type: "damage" | "lost";
  }>({ issue: null, type: "damage" });
  const [damageFine, setDamageFine] = useState("");

  // Bulk print state
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(
    new Set(),
  );

  // Fine dialog
  const [addFineDialog, setAddFineDialog] = useState(false);
  const [newFine, setNewFine] = useState({
    studentId: "",
    bookId: "",
    type: "damage" as "damage" | "lost",
    amount: "",
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState(settings);

  // ID Card state
  const [idCardPerson, setIdCardPerson] = useState("");

  const filteredBooks = books.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.authors.join(",").toLowerCase().includes(q) ||
      b.isbn.includes(q);
    const matchCat = catFilter === "all" || b.category === catFilter;
    return matchSearch && matchCat;
  });

  function handleAddBook() {
    const id = `b${Date.now()}`;
    const accessionNumber = getNextAccessionNumber(books);
    const book: Book = {
      id,
      accessionNumber,
      title: newBook.title ?? "",
      authors:
        typeof newBook.authors === "string"
          ? [newBook.authors as string]
          : (newBook.authors ?? []),
      isbn: newBook.isbn ?? "",
      category: newBook.category ?? "Fiction",
      publisher: newBook.publisher ?? "",
      edition: newBook.edition ?? "",
      price: Number(newBook.price) || 0,
      quantity: Number(newBook.quantity) || 1,
      availableCopies: Number(newBook.quantity) || 1,
      issuedCopies: 0,
      reservedCopies: 0,
      damagedCopies: 0,
      missingCopies: 0,
      shelfLocation: newBook.shelfLocation ?? "",
      language: newBook.language ?? "English",
      coverImage: `https://picsum.photos/seed/${id}/200/280`,
      qrData: accessionNumber,
    };
    setBooks((prev) => [...prev, book]);
    setShowAddBook(false);
    setNewBook({
      title: "",
      authors: [],
      isbn: "",
      category: "Fiction",
      publisher: "",
      edition: "",
      price: 0,
      quantity: 1,
      shelfLocation: "",
      language: "English",
    });
  }

  function handleDeleteBook(id: string) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  function handleIssueBook() {
    if (!issueStudentId || !issueBookId) return;
    const student = students.find((s) => s.id === issueStudentId);
    const book = books.find((b) => b.id === issueBookId);
    if (!student || !book) return;
    const activeIssues = issues.filter(
      (i) => i.studentId === issueStudentId && i.returnDate === null,
    ).length;
    if (activeIssues >= settings.issueLimit) {
      alert(
        `Issue limit of ${settings.issueLimit} books reached for this student.`,
      );
      return;
    }
    const newIssue: IssueRecord = {
      id: `ir${Date.now()}`,
      bookId: issueBookId,
      bookTitle: book.title,
      studentId: issueStudentId,
      studentName: student.name,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: issueDueDate,
      returnDate: null,
      status: "issued",
      fineAmount: 0,
    };
    setIssues((prev) => [...prev, newIssue]);
    setBooks((prev) =>
      prev.map((b) =>
        b.id === issueBookId
          ? {
              ...b,
              availableCopies: b.availableCopies - 1,
              issuedCopies: b.issuedCopies + 1,
            }
          : b,
      ),
    );
    setIssueStudentId("");
    setIssueBookId("");
  }

  function handleReturn(issueId: string) {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;
    const today = new Date();
    const due = new Date(issue.dueDate);
    const overdueDays = Math.max(
      0,
      Math.floor((today.getTime() - due.getTime()) / 86400000),
    );
    const fine = overdueDays * settings.finePerDay;
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              returnDate: today.toISOString().split("T")[0],
              status: "returned",
              fineAmount: fine,
            }
          : i,
      ),
    );
    setBooks((prev) =>
      prev.map((b) =>
        b.id === issue.bookId
          ? {
              ...b,
              availableCopies: b.availableCopies + 1,
              issuedCopies: b.issuedCopies - 1,
            }
          : b,
      ),
    );
    if (fine > 0) {
      const newFineRecord: LibraryFine = {
        id: `f${Date.now()}`,
        studentId: issue.studentId,
        studentName: issue.studentName,
        bookId: issue.bookId,
        bookTitle: issue.bookTitle,
        type: "overdue",
        amount: fine,
        paid: false,
        date: today.toISOString().split("T")[0],
      };
      setFines((prev) => [...prev, newFineRecord]);
    }
  }

  function handleMarkDamageLost() {
    if (!damageDialog.issue) return;
    const issue = damageDialog.issue;
    const fineAmount = Number(damageFine) || 0;
    const newFineRecord: LibraryFine = {
      id: `f${Date.now()}`,
      studentId: issue.studentId,
      studentName: issue.studentName,
      bookId: issue.bookId,
      bookTitle: issue.bookTitle,
      type: damageDialog.type,
      amount: fineAmount,
      paid: false,
      date: new Date().toISOString().split("T")[0],
    };
    setFines((prev) => [...prev, newFineRecord]);
    handleReturn(issue.id);
    if (damageDialog.type === "damage") {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === issue.bookId
            ? { ...b, damagedCopies: b.damagedCopies + 1 }
            : b,
        ),
      );
    } else {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === issue.bookId
            ? { ...b, missingCopies: b.missingCopies + 1 }
            : b,
        ),
      );
    }
    setDamageDialog({ issue: null, type: "damage" });
    setDamageFine("");
  }

  function handleReservationAction(resId: string, action: "ready" | "cancel") {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === resId
          ? { ...r, status: action === "ready" ? "ready" : "cancelled" }
          : r,
      ),
    );
  }

  function handleMarkFinePaid(fineId: string) {
    setFines((prev) =>
      prev.map((f) => (f.id === fineId ? { ...f, paid: true } : f)),
    );
  }

  function handleAddFine() {
    const student = students.find((s) => s.id === newFine.studentId);
    const book = books.find((b) => b.id === newFine.bookId);
    if (!student || !book) return;
    const fineRecord: LibraryFine = {
      id: `f${Date.now()}`,
      studentId: newFine.studentId,
      studentName: student.name,
      bookId: newFine.bookId,
      bookTitle: book.title,
      type: newFine.type,
      amount: Number(newFine.amount) || 0,
      paid: false,
      date: new Date().toISOString().split("T")[0],
    };
    setFines((prev) => [...prev, fineRecord]);
    setAddFineDialog(false);
    setNewFine({ studentId: "", bookId: "", type: "damage", amount: "" });
  }

  const activeIssues = issues.filter((i) => i.returnDate === null);
  const returnedIssues = issues.filter((i) => i.returnDate !== null);
  const _overdueCount = activeIssues.filter(
    (i) => new Date(i.dueDate) < new Date(),
  ).length;
  const totalFinesCollected = fines
    .filter((f) => f.paid)
    .reduce((a, f) => a + f.amount, 0);
  const totalBooksCount = books.reduce((a, b) => a + b.quantity, 0);
  const totalAvailable = books.reduce((a, b) => a + b.availableCopies, 0);
  const totalIssued = books.reduce((a, b) => a + b.issuedCopies, 0);
  const totalDamaged = books.reduce((a, b) => a + b.damagedCopies, 0);
  const totalMissing = books.reduce((a, b) => a + b.missingCopies, 0);

  // Top books by issue count
  const bookIssueCounts = books
    .map((b) => ({
      title: b.title,
      count: issues.filter((i) => i.bookId === b.id).length,
    }))
    .sort((a, c) => c.count - a.count)
    .slice(0, 8);

  // Student usage
  const studentUsage = students
    .map((s) => ({
      name: s.name,
      count: issues.filter((i) => i.studentId === s.id).length,
    }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  // ID card person
  const allPersons = [
    ...students.map((s) => ({
      id: s.id,
      name: s.name,
      role: "Student",
      empId: s.rollNumber,
      photo: `https://picsum.photos/seed/${s.id}/100/100`,
    })),
    ...mockStaff.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      empId: s.employeeId,
      photo: s.photo,
    })),
  ];
  const selectedPerson = allPersons.find((p) => p.id === idCardPerson);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Library Management</h2>
          <p className="text-muted-foreground text-sm">
            Manage books, issues, fines, and more
          </p>
        </div>
        {unreadNotifications > 0 && (
          <Badge className="bg-red-500 text-white">
            {unreadNotifications} new alerts
          </Badge>
        )}
      </div>

      <Tabs defaultValue="catalog">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="catalog" data-ocid="library.catalog.tab">
            Catalog
          </TabsTrigger>
          <TabsTrigger value="issue" data-ocid="library.issue.tab">
            Issue/Return
          </TabsTrigger>
          <TabsTrigger
            value="reservations"
            data-ocid="library.reservations.tab"
          >
            Reservations
          </TabsTrigger>
          <TabsTrigger value="fines" data-ocid="library.fines.tab">
            Fines
          </TabsTrigger>
          <TabsTrigger value="reports" data-ocid="library.reports.tab">
            Reports
          </TabsTrigger>
          <TabsTrigger value="inventory" data-ocid="library.inventory.tab">
            Inventory
          </TabsTrigger>
          <TabsTrigger value="idcards" data-ocid="library.idcards.tab">
            ID Cards
          </TabsTrigger>
          <TabsTrigger value="settings" data-ocid="library.settings.tab">
            Settings
          </TabsTrigger>
          <TabsTrigger value="bulkprint" data-ocid="library.bulkprint.tab">
            <Printer size={14} className="mr-1" /> Bulk Print
          </TabsTrigger>
        </TabsList>

        {/* CATALOG */}
        <TabsContent value="catalog" className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-9"
                placeholder="Search title, author, ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="library.catalog.search_input"
              />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger
                className="w-[160px]"
                data-ocid="library.catalog.select"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showAddBook} onOpenChange={setShowAddBook}>
              <DialogTrigger asChild>
                <Button data-ocid="library.catalog.open_modal_button">
                  <Plus size={16} className="mr-1" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Book</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>Title</Label>
                    <Input
                      value={newBook.title}
                      onChange={(e) =>
                        setNewBook((p) => ({ ...p, title: e.target.value }))
                      }
                      data-ocid="library.book.title_input"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Author(s) (comma separated)</Label>
                    <Input
                      value={
                        Array.isArray(newBook.authors)
                          ? newBook.authors.join(", ")
                          : ""
                      }
                      onChange={(e) =>
                        setNewBook((p) => ({
                          ...p,
                          authors: e.target.value
                            .split(",")
                            .map((a) => a.trim()),
                        }))
                      }
                      data-ocid="library.book.authors_input"
                    />
                  </div>
                  <div>
                    <Label>ISBN</Label>
                    <Input
                      value={newBook.isbn}
                      onChange={(e) =>
                        setNewBook((p) => ({ ...p, isbn: e.target.value }))
                      }
                      data-ocid="library.book.isbn_input"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newBook.category}
                      onValueChange={(v) =>
                        setNewBook((p) => ({ ...p, category: v }))
                      }
                    >
                      <SelectTrigger data-ocid="library.book.category_select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Publisher</Label>
                    <Input
                      value={newBook.publisher}
                      onChange={(e) =>
                        setNewBook((p) => ({ ...p, publisher: e.target.value }))
                      }
                      data-ocid="library.book.publisher_input"
                    />
                  </div>
                  <div>
                    <Label>Edition</Label>
                    <Input
                      value={newBook.edition}
                      onChange={(e) =>
                        setNewBook((p) => ({ ...p, edition: e.target.value }))
                      }
                      data-ocid="library.book.edition_input"
                    />
                  </div>
                  <div>
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      value={newBook.price}
                      onChange={(e) =>
                        setNewBook((p) => ({
                          ...p,
                          price: Number(e.target.value),
                        }))
                      }
                      data-ocid="library.book.price_input"
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={newBook.quantity}
                      onChange={(e) =>
                        setNewBook((p) => ({
                          ...p,
                          quantity: Number(e.target.value),
                        }))
                      }
                      data-ocid="library.book.quantity_input"
                    />
                  </div>
                  <div>
                    <Label>Shelf/Rack Location</Label>
                    <Input
                      value={newBook.shelfLocation}
                      onChange={(e) =>
                        setNewBook((p) => ({
                          ...p,
                          shelfLocation: e.target.value,
                        }))
                      }
                      data-ocid="library.book.shelf_input"
                    />
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Input
                      value={newBook.language}
                      onChange={(e) =>
                        setNewBook((p) => ({ ...p, language: e.target.value }))
                      }
                      data-ocid="library.book.language_input"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddBook(false)}
                    data-ocid="library.book.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddBook}
                    data-ocid="library.book.submit_button"
                  >
                    Add Book
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cover</TableHead>
                  <TableHead>Accession</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author(s)</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Shelf</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="library.catalog.empty_state"
                    >
                      No books found
                    </TableCell>
                  </TableRow>
                )}
                {filteredBooks.map((book, idx) => (
                  <TableRow
                    key={book.id}
                    data-ocid={`library.catalog.item.${idx + 1}`}
                  >
                    <TableCell>
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-10 h-14 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {book.accessionNumber}
                    </TableCell>
                    <TableCell className="font-medium max-w-[160px] truncate">
                      {book.title}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                      {book.authors.join(", ")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{book.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {book.shelfLocation}
                    </TableCell>
                    <TableCell>
                      <BookStatusBadge
                        available={book.availableCopies}
                        issued={book.issuedCopies}
                        reserved={book.reservedCopies}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setQrBook(book)}
                          data-ocid={`library.catalog.qr_button.${idx + 1}`}
                        >
                          <QrCode size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditBook(book)}
                          data-ocid={`library.catalog.edit_button.${idx + 1}`}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteBook(book.id)}
                          data-ocid={`library.catalog.delete_button.${idx + 1}`}
                        >
                          Del
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ISSUE/RETURN */}
        <TabsContent value="issue" className="space-y-4">
          <Tabs defaultValue="issue-book">
            <TabsList>
              <TabsTrigger
                value="issue-book"
                data-ocid="library.issue.issue_tab"
              >
                Issue Book
              </TabsTrigger>
              <TabsTrigger
                value="return-book"
                data-ocid="library.issue.return_tab"
              >
                Return Book
              </TabsTrigger>
            </TabsList>
            <TabsContent value="issue-book">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Issue Book to Student</CardTitle>
                    <BarcodeScannerDialog
                      books={books}
                      issues={issues}
                      onIssue={(bookId, studentId, dueDate) => {
                        const student = students.find(
                          (s) => s.id === studentId,
                        );
                        const book = books.find((b) => b.id === bookId);
                        if (!student || !book) return;
                        const newIssueRec: IssueRecord = {
                          id: `issue-${Date.now()}`,
                          bookId,
                          bookTitle: book.title,
                          studentId: studentId,
                          studentName: student.name,
                          issueDate: new Date().toISOString().split("T")[0],
                          dueDate,
                          returnDate: null,
                          status: "issued",
                          fineAmount: 0,
                        };
                        setIssues((prev) => [newIssueRec, ...prev]);
                        setBooks((prev) =>
                          prev.map((b) =>
                            b.id === bookId
                              ? {
                                  ...b,
                                  availableCopies: b.availableCopies - 1,
                                  issuedCopies: (b.issuedCopies || 0) + 1,
                                }
                              : b,
                          ),
                        );
                      }}
                      onReturn={(issueId) => {
                        handleReturn(issueId);
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Select Student</Label>
                      <Select
                        value={issueStudentId}
                        onValueChange={setIssueStudentId}
                      >
                        <SelectTrigger data-ocid="library.issue.student_select">
                          <SelectValue placeholder="Choose student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} ({s.rollNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Select Book</Label>
                      <Select
                        value={issueBookId}
                        onValueChange={setIssueBookId}
                      >
                        <SelectTrigger data-ocid="library.issue.book_select">
                          <SelectValue placeholder="Choose book" />
                        </SelectTrigger>
                        <SelectContent>
                          {books
                            .filter((b) => b.availableCopies > 0)
                            .map((b) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.title} ({b.availableCopies} avail)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={issueDueDate}
                        onChange={(e) => setIssueDueDate(e.target.value)}
                        data-ocid="library.issue.due_date_input"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleIssueBook}
                    disabled={!issueStudentId || !issueBookId}
                    data-ocid="library.issue.submit_button"
                  >
                    <BookOpen size={16} className="mr-1" /> Issue Book
                  </Button>
                  {issueStudentId && (
                    <p className="text-sm text-muted-foreground">
                      Active issues:{" "}
                      {
                        issues.filter(
                          (i) =>
                            i.studentId === issueStudentId &&
                            i.returnDate === null,
                        ).length
                      }{" "}
                      / {settings.issueLimit}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="return-book">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeIssues.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                          data-ocid="library.return.empty_state"
                        >
                          No active issues
                        </TableCell>
                      </TableRow>
                    )}
                    {activeIssues.map((issue, idx) => {
                      const isOverdue = new Date(issue.dueDate) < new Date();
                      return (
                        <TableRow
                          key={issue.id}
                          data-ocid={`library.return.item.${idx + 1}`}
                        >
                          <TableCell>{issue.studentName}</TableCell>
                          <TableCell className="max-w-[120px] truncate">
                            {issue.bookTitle}
                          </TableCell>
                          <TableCell className="text-sm">
                            {issue.issueDate}
                          </TableCell>
                          <TableCell
                            className={
                              isOverdue ? "text-red-600 font-semibold" : ""
                            }
                          >
                            {issue.dueDate}
                          </TableCell>
                          <TableCell>
                            {isOverdue ? (
                              <Badge className="bg-red-100 text-red-800">
                                Overdue
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">
                                Issued
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              <Button
                                size="sm"
                                onClick={() => handleReturn(issue.id)}
                                data-ocid={`library.return.button.${idx + 1}`}
                              >
                                <RefreshCw size={14} className="mr-1" />
                                Return
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setDamageDialog({ issue, type: "damage" })
                                }
                                data-ocid={`library.damage.button.${idx + 1}`}
                              >
                                <AlertTriangle size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setDamageDialog({ issue, type: "lost" })
                                }
                                data-ocid={`library.lost.button.${idx + 1}`}
                              >
                                <XCircle size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* RESERVATIONS */}
        <TabsContent value="reservations">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead>Reserved At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="library.reservations.empty_state"
                    >
                      No reservations
                    </TableCell>
                  </TableRow>
                )}
                {reservations.map((res, idx) => (
                  <TableRow
                    key={res.id}
                    data-ocid={`library.reservations.item.${idx + 1}`}
                  >
                    <TableCell>{res.studentName}</TableCell>
                    <TableCell>{res.bookTitle}</TableCell>
                    <TableCell className="text-sm">{res.reservedAt}</TableCell>
                    <TableCell>
                      {res.status === "pending" && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      )}
                      {res.status === "ready" && (
                        <Badge className="bg-green-100 text-green-800">
                          Ready
                        </Badge>
                      )}
                      {res.status === "cancelled" && (
                        <Badge variant="secondary">Cancelled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {res.status === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleReservationAction(res.id, "ready")
                            }
                            data-ocid={`library.reservations.ready_button.${idx + 1}`}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Ready
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleReservationAction(res.id, "cancel")
                            }
                            data-ocid={`library.reservations.cancel_button.${idx + 1}`}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* FINES */}
        <TabsContent value="fines" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={addFineDialog} onOpenChange={setAddFineDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  data-ocid="library.fines.open_modal_button"
                >
                  <Plus size={16} className="mr-1" />
                  Add Fine
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Manual Fine</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Student</Label>
                    <Select
                      value={newFine.studentId}
                      onValueChange={(v) =>
                        setNewFine((p) => ({ ...p, studentId: v }))
                      }
                    >
                      <SelectTrigger data-ocid="library.fine.student_select">
                        <SelectValue placeholder="Choose student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Book</Label>
                    <Select
                      value={newFine.bookId}
                      onValueChange={(v) =>
                        setNewFine((p) => ({ ...p, bookId: v }))
                      }
                    >
                      <SelectTrigger data-ocid="library.fine.book_select">
                        <SelectValue placeholder="Choose book" />
                      </SelectTrigger>
                      <SelectContent>
                        {books.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newFine.type}
                      onValueChange={(v: "damage" | "lost") =>
                        setNewFine((p) => ({ ...p, type: v }))
                      }
                    >
                      <SelectTrigger data-ocid="library.fine.type_select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="damage">Damage</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      value={newFine.amount}
                      onChange={(e) =>
                        setNewFine((p) => ({ ...p, amount: e.target.value }))
                      }
                      data-ocid="library.fine.amount_input"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAddFineDialog(false)}
                    data-ocid="library.fine.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddFine}
                    data-ocid="library.fine.submit_button"
                  >
                    Add Fine
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fines.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="library.fines.empty_state"
                    >
                      No fines
                    </TableCell>
                  </TableRow>
                )}
                {fines.map((fine, idx) => (
                  <TableRow
                    key={fine.id}
                    data-ocid={`library.fines.item.${idx + 1}`}
                  >
                    <TableCell>{fine.studentName}</TableCell>
                    <TableCell className="max-w-[120px] truncate">
                      {fine.bookTitle}
                    </TableCell>
                    <TableCell>
                      {fine.type === "overdue" && (
                        <Badge className="bg-orange-100 text-orange-800">
                          Overdue
                        </Badge>
                      )}
                      {fine.type === "damage" && (
                        <Badge className="bg-red-100 text-red-800">
                          Damage
                        </Badge>
                      )}
                      {fine.type === "lost" && (
                        <Badge className="bg-gray-100 text-gray-800">
                          Lost
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{fine.amount}
                    </TableCell>
                    <TableCell className="text-sm">{fine.date}</TableCell>
                    <TableCell>
                      {fine.paid ? (
                        <Badge className="bg-green-100 text-green-800">
                          Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          Unpaid
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!fine.paid && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkFinePaid(fine.id)}
                          data-ocid={`library.fines.paid_button.${idx + 1}`}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports">
          <Tabs defaultValue="active">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger
                value="active"
                data-ocid="library.reports.active_tab"
              >
                Issued Books
              </TabsTrigger>
              <TabsTrigger
                value="history"
                data-ocid="library.reports.history_tab"
              >
                Return History
              </TabsTrigger>
              <TabsTrigger value="fines" data-ocid="library.reports.fines_tab">
                Fine Collection
              </TabsTrigger>
              <TabsTrigger value="top" data-ocid="library.reports.top_tab">
                Top Books
              </TabsTrigger>
              <TabsTrigger value="usage" data-ocid="library.reports.usage_tab">
                Student Usage
              </TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-2">
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportCSV(
                      activeIssues as unknown as Record<string, unknown>[],
                      "issued-books.csv",
                    )
                  }
                  data-ocid="library.reports.active.download_button"
                >
                  <Download size={14} className="mr-1" />
                  Export CSV
                </Button>
              </div>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeIssues.map((i, idx) => (
                      <TableRow
                        key={i.id}
                        data-ocid={`library.reports.active.item.${idx + 1}`}
                      >
                        <TableCell>{i.studentName}</TableCell>
                        <TableCell>{i.bookTitle}</TableCell>
                        <TableCell>{i.issueDate}</TableCell>
                        <TableCell>{i.dueDate}</TableCell>
                        <TableCell>
                          {new Date(i.dueDate) < new Date() ? (
                            <Badge className="bg-red-100 text-red-800">
                              Overdue
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="history" className="space-y-2">
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportCSV(
                      returnedIssues as unknown as Record<string, unknown>[],
                      "return-history.csv",
                    )
                  }
                  data-ocid="library.reports.history.download_button"
                >
                  <Download size={14} className="mr-1" />
                  Export CSV
                </Button>
              </div>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Returned</TableHead>
                      <TableHead>Fine</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnedIssues.map((i, idx) => (
                      <TableRow
                        key={i.id}
                        data-ocid={`library.reports.history.item.${idx + 1}`}
                      >
                        <TableCell>{i.studentName}</TableCell>
                        <TableCell>{i.bookTitle}</TableCell>
                        <TableCell>{i.issueDate}</TableCell>
                        <TableCell>{i.returnDate}</TableCell>
                        <TableCell>
                          {i.fineAmount > 0 ? `₹${i.fineAmount}` : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="fines" className="space-y-2">
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportCSV(
                      fines as unknown as Record<string, unknown>[],
                      "fines.csv",
                    )
                  }
                  data-ocid="library.reports.fines.download_button"
                >
                  <Download size={14} className="mr-1" />
                  Export CSV
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{totalFinesCollected}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Collected
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-red-600">
                      ₹
                      {fines
                        .filter((f) => !f.paid)
                        .reduce((a, f) => a + f.amount, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">
                      ₹{fines.reduce((a, f) => a + f.amount, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="top" className="space-y-2">
              <div className="space-y-2">
                {bookIssueCounts.map((b, idx) => (
                  <div
                    key={b.title}
                    className="flex items-center gap-3"
                    data-ocid={`library.reports.top.item.${idx + 1}`}
                  >
                    <span className="w-6 text-sm font-bold text-muted-foreground">
                      {idx + 1}.
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium truncate">
                          {b.title}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {b.count}x
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(b.count / (bookIssueCounts[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="usage">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Books Issued</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentUsage.map((s, idx) => (
                      <TableRow
                        key={s.name}
                        data-ocid={`library.reports.usage.item.${idx + 1}`}
                      >
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* INVENTORY */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              {
                label: "Total Books",
                value: totalBooksCount,
                color: "text-blue-600",
              },
              {
                label: "Available",
                value: totalAvailable,
                color: "text-green-600",
              },
              { label: "Issued", value: totalIssued, color: "text-orange-600" },
              { label: "Damaged", value: totalDamaged, color: "text-red-600" },
              { label: "Missing", value: totalMissing, color: "text-gray-600" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-4">
                  <div className={`text-2xl font-bold ${s.color}`}>
                    {s.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Damaged</TableHead>
                  <TableHead>Missing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((b, idx) => (
                  <TableRow
                    key={b.id}
                    data-ocid={`library.inventory.item.${idx + 1}`}
                  >
                    <TableCell className="font-mono text-xs">
                      {b.accessionNumber}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate font-medium">
                      {b.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{b.category}</Badge>
                    </TableCell>
                    <TableCell>{b.quantity}</TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      {b.availableCopies}
                    </TableCell>
                    <TableCell className="text-orange-600">
                      {b.issuedCopies}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {b.damagedCopies}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {b.missingCopies}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() =>
                exportCSV(
                  books as unknown as Record<string, unknown>[],
                  "inventory.csv",
                )
              }
              data-ocid="library.inventory.download_button"
            >
              <Download size={14} className="mr-1" />
              Export Inventory CSV
            </Button>
          </div>
        </TabsContent>

        {/* ID CARDS */}
        <TabsContent value="idcards" className="space-y-4">
          <div className="max-w-md">
            <Label>Select Person</Label>
            <Select value={idCardPerson} onValueChange={setIdCardPerson}>
              <SelectTrigger data-ocid="library.idcard.person_select">
                <SelectValue placeholder="Choose student or staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" disabled>
                  -- Students --
                </SelectItem>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} (Student)
                  </SelectItem>
                ))}
                <SelectItem value="" disabled>
                  -- Staff --
                </SelectItem>
                {mockStaff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedPerson && (
            <div className="flex flex-col items-center gap-4">
              <div
                id="id-card-print"
                className="w-80 rounded-xl overflow-hidden shadow-lg border border-border bg-white print:shadow-none"
              >
                <div className="bg-primary px-4 py-3">
                  <p className="text-primary-foreground font-bold text-center text-sm tracking-wide">
                    {settings.schoolName}
                  </p>
                  <p className="text-primary-foreground/70 text-center text-xs">
                    Student / Staff Identity Card
                  </p>
                </div>
                <div className="px-4 py-4 flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/20 bg-muted">
                    <img
                      src={selectedPerson.photo}
                      alt={selectedPerson.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-gray-900">
                      {selectedPerson.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedPerson.role}
                    </p>
                  </div>
                  <div className="w-full bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID Number</span>
                      <span className="font-mono font-semibold text-gray-800">
                        {selectedPerson.empId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">School</span>
                      <span className="font-semibold text-gray-800">
                        {settings.schoolName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Valid Until</span>
                      <span className="font-semibold text-gray-800">
                        March 2027
                      </span>
                    </div>
                  </div>
                  <QRBox value={selectedPerson.empId} />
                </div>
                <div className="bg-primary/10 px-4 py-2">
                  <p className="text-xs text-center text-gray-500">
                    If found, please return to {settings.schoolName}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.print()}
                data-ocid="library.idcard.print_button"
              >
                <Printer size={16} className="mr-1" />
                Print ID Card
              </Button>
            </div>
          )}
          {!selectedPerson && (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="library.idcard.empty_state"
            >
              <QrCode size={48} className="mx-auto mb-3 opacity-30" />
              <p>Select a person to preview their ID card</p>
            </div>
          )}
        </TabsContent>

        {/* SETTINGS */}
        <TabsContent value="settings">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>
                <Settings size={18} className="inline mr-2" />
                Library Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Issue Limit (books per student)</Label>
                <Input
                  type="number"
                  value={settingsForm.issueLimit}
                  onChange={(e) =>
                    setSettingsForm((p) => ({
                      ...p,
                      issueLimit: Number(e.target.value),
                    }))
                  }
                  data-ocid="library.settings.issue_limit_input"
                />
              </div>
              <div>
                <Label>Fine Per Day (₹)</Label>
                <Input
                  type="number"
                  value={settingsForm.finePerDay}
                  onChange={(e) =>
                    setSettingsForm((p) => ({
                      ...p,
                      finePerDay: Number(e.target.value),
                    }))
                  }
                  min={1}
                  max={10}
                  data-ocid="library.settings.fine_per_day_input"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Range: ₹1 - ₹10 per day
                </p>
              </div>
              <div>
                <Label>Loan Duration (days)</Label>
                <Input
                  type="number"
                  value={settingsForm.loanDurationDays}
                  onChange={(e) =>
                    setSettingsForm((p) => ({
                      ...p,
                      loanDurationDays: Number(e.target.value),
                    }))
                  }
                  data-ocid="library.settings.loan_days_input"
                />
              </div>
              <div>
                <Label>School Name</Label>
                <Input
                  value={settingsForm.schoolName}
                  onChange={(e) =>
                    setSettingsForm((p) => ({
                      ...p,
                      schoolName: e.target.value,
                    }))
                  }
                  data-ocid="library.settings.school_name_input"
                />
              </div>
              <Button
                onClick={() => setSettings(settingsForm)}
                data-ocid="library.settings.save_button"
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BULK PRINT */}
        <TabsContent value="bulkprint" className="space-y-4">
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #bulk-print-area, #bulk-print-area * { visibility: visible !important; }
              #bulk-print-area { position: absolute; left: 0; top: 0; width: 100%; }
            }
          `}</style>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Printer size={18} /> Bulk Barcode Print
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedBookIds(new Set(books.map((b) => b.id)))
                    }
                    data-ocid="library.bulkprint.toggle"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBookIds(new Set())}
                    data-ocid="library.bulkprint.secondary_button"
                  >
                    Deselect All
                  </Button>
                  <Button
                    size="sm"
                    disabled={selectedBookIds.size === 0}
                    onClick={() => window.print()}
                    data-ocid="library.bulkprint.primary_button"
                  >
                    <Printer size={14} className="mr-1" />
                    Print Barcodes ({selectedBookIds.size})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table data-ocid="library.bulkprint.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            selectedBookIds.size === books.length &&
                            books.length > 0
                          }
                          onCheckedChange={(v) =>
                            v
                              ? setSelectedBookIds(
                                  new Set(books.map((b) => b.id)),
                                )
                              : setSelectedBookIds(new Set())
                          }
                          data-ocid="library.bulkprint.checkbox"
                        />
                      </TableHead>
                      <TableHead>Accession #</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Shelf</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book, idx) => (
                      <TableRow
                        key={book.id}
                        data-ocid={`library.bulkprint.row.${idx + 1}`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedBookIds.has(book.id)}
                            onCheckedChange={(v) => {
                              const next = new Set(selectedBookIds);
                              v ? next.add(book.id) : next.delete(book.id);
                              setSelectedBookIds(next);
                            }}
                            data-ocid={`library.bulkprint.checkbox.${idx + 1}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {book.accessionNumber}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {book.title}
                        </TableCell>
                        <TableCell className="text-sm">
                          {Array.isArray(book.authors)
                            ? book.authors[0]
                            : book.authors}
                        </TableCell>
                        <TableCell className="text-sm">
                          {book.shelfLocation}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Print Preview Area */}
          {selectedBookIds.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Print Preview — {selectedBookIds.size} barcode(s)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  id="bulk-print-area"
                  className="grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4"
                >
                  {books
                    .filter((b) => selectedBookIds.has(b.id))
                    .map((book) => (
                      <div
                        key={book.id}
                        className="border border-border rounded p-2 flex flex-col items-center gap-1 bg-white text-black"
                        style={{ pageBreakInside: "avoid" }}
                      >
                        <LinearBarcode value={book.accessionNumber} />
                        <p
                          className="text-center font-medium text-xs leading-tight"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {book.title}
                        </p>
                        <p className="text-xs text-gray-500 text-center">
                          {book.shelfLocation}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog open={!!qrBook} onOpenChange={() => setQrBook(null)}>
        <DialogContent data-ocid="library.qr.dialog">
          <DialogHeader>
            <DialogTitle>QR Code — {qrBook?.title}</DialogTitle>
          </DialogHeader>
          {qrBook && (
            <div className="flex flex-col items-center gap-4 py-4">
              <QRBox value={qrBook.qrData} />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Accession:{" "}
                  <span className="font-mono font-bold">
                    {qrBook.accessionNumber}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Shelf: {qrBook.shelfLocation}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setQrBook(null)}
              data-ocid="library.qr.close_button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={!!editBook} onOpenChange={() => setEditBook(null)}>
        <DialogContent data-ocid="library.editbook.dialog">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
          </DialogHeader>
          {editBook && (
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input
                  value={editBook.title}
                  onChange={(e) =>
                    setEditBook((p) =>
                      p ? { ...p, title: e.target.value } : p,
                    )
                  }
                  data-ocid="library.editbook.title_input"
                />
              </div>
              <div>
                <Label>Shelf Location</Label>
                <Input
                  value={editBook.shelfLocation}
                  onChange={(e) =>
                    setEditBook((p) =>
                      p ? { ...p, shelfLocation: e.target.value } : p,
                    )
                  }
                  data-ocid="library.editbook.shelf_input"
                />
              </div>
              <div>
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={editBook.price}
                  onChange={(e) =>
                    setEditBook((p) =>
                      p ? { ...p, price: Number(e.target.value) } : p,
                    )
                  }
                  data-ocid="library.editbook.price_input"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditBook(null)}
              data-ocid="library.editbook.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setBooks((prev) =>
                  prev.map((b) =>
                    b.id === editBook?.id ? { ...b, ...editBook } : b,
                  ),
                );
                setEditBook(null);
              }}
              data-ocid="library.editbook.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Damage/Lost Dialog */}
      <Dialog
        open={!!damageDialog.issue}
        onOpenChange={() => setDamageDialog({ issue: null, type: "damage" })}
      >
        <DialogContent data-ocid="library.damage.dialog">
          <DialogHeader>
            <DialogTitle>
              {damageDialog.type === "damage"
                ? "Mark as Damaged"
                : "Mark as Lost"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Book: <strong>{damageDialog.issue?.bookTitle}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Student: <strong>{damageDialog.issue?.studentName}</strong>
            </p>
            <div>
              <Label>Fine Amount (₹)</Label>
              <Input
                type="number"
                value={damageFine}
                onChange={(e) => setDamageFine(e.target.value)}
                placeholder="Enter fine amount"
                data-ocid="library.damage.fine_input"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes about damage or loss..."
                data-ocid="library.damage.notes_textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDamageDialog({ issue: null, type: "damage" })}
              data-ocid="library.damage.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleMarkDamageLost}
              data-ocid="library.damage.confirm_button"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TrendingUp icon usage to avoid unused import */}
      <span className="hidden">
        <TrendingUp size={0} />
      </span>
    </div>
  );
}

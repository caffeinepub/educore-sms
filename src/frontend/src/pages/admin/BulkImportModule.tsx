import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ─── CSV Helpers ─────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((l) => parseCSVLine(l));
  return { headers, rows };
}

function downloadCSV(
  filename: string,
  headers: string[],
  rows: string[][] = [],
) {
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STUDENT_HEADERS = [
  "Roll No",
  "Admission No",
  "Name",
  "Father's Name",
  "Mother's Name",
  "Date of Birth",
  "Gender",
  "Category",
  "Course",
  "Session",
  "Email",
  "Mobile No",
  "Vill",
  "PO",
  "PS",
  "Dist",
  "State",
  "Pin Code",
];

const STUDENT_SAMPLE_ROWS = [
  [
    "2024001",
    "ADM-001",
    "Amit Kumar",
    "Rajesh Kumar",
    "Sunita Kumar",
    "2000-04-15",
    "Male",
    "OBC",
    "B.Ed",
    "2024-26",
    "amit@example.com",
    "9876543210",
    "Ramgarh",
    "Ramgarh",
    "Ramgarh",
    "Ramgarh",
    "Jharkhand",
    "829122",
  ],
];

const STAFF_HEADERS = [
  "Employee ID",
  "Name",
  "Designation",
  "Department",
  "Staff Type",
  "Date of Joining",
  "Salary",
  "Email",
  "Mobile No",
  "Address",
];

const STAFF_SAMPLE_ROWS = [
  [
    "EMP-001",
    "Priya Singh",
    "Teacher",
    "Mathematics",
    "teaching",
    "2023-07-01",
    "45000",
    "priya@school.edu",
    "9876543211",
    "45 Staff Colony",
  ],
];

const BOOK_HEADERS = [
  "Title",
  "Author",
  "ISBN",
  "Publisher",
  "Category",
  "Quantity",
  "Shelf Location",
  "Publication Year",
];

const BOOK_SAMPLE_ROWS = [
  [
    "Introduction to Algorithms",
    "Thomas H. Cormen",
    "978-0-262-03384-8",
    "MIT Press",
    "Computer Science",
    "5",
    "CS-A1",
    "2009",
  ],
];

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStudentRow(
  row: Record<string, string>,
  idx: number,
): string[] {
  const errors: string[] = [];
  if (!row.Name) errors.push(`Row ${idx + 1}: Name is required`);
  if (!row["Roll No"]) errors.push(`Row ${idx + 1}: Roll No is required`);
  if (!row.Course) errors.push(`Row ${idx + 1}: Course is required`);
  if (!row.Session) errors.push(`Row ${idx + 1}: Session is required`);
  if (row.Email && !/^[^@]+@[^@]+\.[^@]+$/.test(row.Email))
    errors.push(`Row ${idx + 1}: Invalid email format`);
  if (row["Date of Birth"] && Number.isNaN(Date.parse(row["Date of Birth"])))
    errors.push(`Row ${idx + 1}: Invalid date of birth`);
  return errors;
}

function validateStaffRow(row: Record<string, string>, idx: number): string[] {
  const errors: string[] = [];
  if (!row.Name) errors.push(`Row ${idx + 1}: Name is required`);
  if (!row["Employee ID"])
    errors.push(`Row ${idx + 1}: Employee ID is required`);
  if (!row.Department) errors.push(`Row ${idx + 1}: Department is required`);
  if (
    row["Staff Type"] &&
    !["teaching", "non-teaching"].includes(row["Staff Type"].toLowerCase())
  )
    errors.push(
      `Row ${idx + 1}: Staff Type must be 'teaching' or 'non-teaching'`,
    );
  if (row.Email && !/^[^@]+@[^@]+\.[^@]+$/.test(row.Email))
    errors.push(`Row ${idx + 1}: Invalid email format`);
  if (row.Salary && Number.isNaN(Number(row.Salary)))
    errors.push(`Row ${idx + 1}: Salary must be a number`);
  return errors;
}

function validateBookRow(row: Record<string, string>, idx: number): string[] {
  const errors: string[] = [];
  if (!row.Title) errors.push(`Row ${idx + 1}: Title is required`);
  if (!row.Author) errors.push(`Row ${idx + 1}: Author is required`);
  if (!row.ISBN) errors.push(`Row ${idx + 1}: ISBN is required`);
  if (row.Quantity && Number.isNaN(Number(row.Quantity)))
    errors.push(`Row ${idx + 1}: Quantity must be a number`);
  if (row["Publication Year"] && Number.isNaN(Number(row["Publication Year"])))
    errors.push(`Row ${idx + 1}: Publication Year must be a number`);
  return errors;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

interface ImportTabProps {
  label: string;
  headers: string[];
  sampleRows: string[][];
  templateFilename: string;
  validate: (row: Record<string, string>, idx: number) => string[];
  onImport: (rows: Record<string, string>[]) => void;
}

// ─── Import Tab Component ─────────────────────────────────────────────────────

function ImportTab({
  label,
  headers,
  sampleRows,
  templateFilename,
  validate,
  onImport,
}: ImportTabProps) {
  const [dragging, setDragging] = useState(false);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, string[]>>({});
  const [allErrors, setAllErrors] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const isCSV = file.name.endsWith(".csv");
    if (!isCSV) {
      toast.error("Please upload a .csv file");
      return;
    }
    setFileName(file.name);

    const applyParsed = (h: string[], r: string[][]) => {
      setParsedHeaders(h);
      setParsedRows(r);
      setResult(null);
      const errMap: Record<number, string[]> = {};
      const allErr: string[] = [];
      r.forEach((row, idx) => {
        const obj: Record<string, string> = {};
        h.forEach((header, hi) => {
          obj[header] = row[hi] ?? "";
        });
        const errs = validate(obj, idx);
        if (errs.length > 0) {
          errMap[idx] = errs;
          allErr.push(...errs);
        }
      });
      setRowErrors(errMap);
      setAllErrors(allErr);
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows: r } = parseCSV(text);
      applyParsed(h, r);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    setProgress(0);

    const validRows: Record<string, string>[] = [];
    const errors: string[] = [];

    for (let idx = 0; idx < parsedRows.length; idx++) {
      const row = parsedRows[idx];
      const obj: Record<string, string> = {};
      parsedHeaders.forEach((h, hi) => {
        obj[h] = row[hi] ?? "";
      });
      const errs = validate(obj, idx);
      if (errs.length === 0) {
        validRows.push(obj);
      } else {
        errors.push(...errs);
      }
      setProgress(Math.round(((idx + 1) / parsedRows.length) * 100));
      // small yield to allow UI update
      await new Promise((res) => setTimeout(res, 0));
    }

    onImport(validRows);

    const result: ImportResult = {
      total: parsedRows.length,
      success: validRows.length,
      failed: parsedRows.length - validRows.length,
      errors,
    };
    setResult(result);
    setImporting(false);

    if (result.failed === 0) {
      toast.success(`${result.success} ${label} imported successfully!`);
    } else {
      toast.error(
        `${result.success} imported, ${result.failed} failed with errors`,
      );
    }
  };

  const reset = () => {
    setParsedHeaders([]);
    setParsedRows([]);
    setRowErrors({});
    setAllErrors([]);
    setResult(null);
    setFileName("");
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const previewRows = parsedRows.slice(0, 5);
  const hasFile = parsedRows.length > 0;

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Import {label}</h3>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file to bulk import {label.toLowerCase()}. Download the
            template to get started.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadCSV(templateFilename, headers, sampleRows)}
          data-ocid={`bulk.${label.toLowerCase().replace(/ /g, "_")}.download_template.button`}
        >
          <Download size={14} className="mr-1.5" />
          Download Template
        </Button>
      </div>

      {/* Drop zone */}
      {!hasFile && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter") fileRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
          data-ocid={`bulk.${label.toLowerCase().replace(/ /g, "_")}.dropzone`}
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload size={24} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">
              Drag &amp; drop your file here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse — .csv
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            data-ocid={`bulk.${label.toLowerCase().replace(/ /g, "_")}.upload_button`}
          />
        </div>
      )}

      {/* File info + reset */}
      {hasFile && !result && (
        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
          <div className="flex items-center gap-2.5">
            <FileText size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {parsedRows.length} rows detected
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={reset}>
            <X size={16} />
          </Button>
        </div>
      )}

      {/* Validation errors banner */}
      {allErrors.length > 0 && !result && (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1"
          data-ocid={`bulk.${label.toLowerCase().replace(/ /g, "_")}.error_state`}
        >
          <div className="flex items-center gap-2 text-destructive font-medium text-sm">
            <AlertCircle size={14} />
            {allErrors.length} validation issue{allErrors.length > 1 ? "s" : ""}{" "}
            found
          </div>
          <ul className="text-xs text-destructive/80 space-y-0.5 max-h-28 overflow-y-auto pl-4">
            {allErrors.map((e) => (
              <li key={e.slice(0, 40)} className="list-disc">
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview table */}
      {hasFile && !result && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            Preview — first {Math.min(5, parsedRows.length)} of{" "}
            {parsedRows.length} rows
          </p>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-8 text-center">#</TableHead>
                  {parsedHeaders.map((h) => (
                    <TableHead key={h} className="text-xs whitespace-nowrap">
                      {h}
                    </TableHead>
                  ))}
                  <TableHead className="w-20">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, idx) => {
                  const hasErr = !!rowErrors[idx];
                  return (
                    <TableRow
                      key={row.slice(0, 3).join("-") || String(idx)}
                      className={hasErr ? "bg-destructive/5" : ""}
                      data-ocid={`bulk.preview.item.${idx + 1}`}
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      {row.map((cell, ci) => (
                        <TableCell
                          key={`${row.slice(0, 2).join("-")}-${ci}`}
                          className="text-xs max-w-[120px] truncate"
                        >
                          {cell || (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        {hasErr ? (
                          <Badge variant="destructive" className="text-[10px]">
                            Error
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-green-500 text-green-600"
                          >
                            OK
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Import button + progress */}
      {hasFile && !result && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleImport}
            disabled={importing}
            data-ocid={`bulk.${label.toLowerCase().replace(/ /g, "_")}.submit_button`}
          >
            {importing ? (
              <>
                <span className="mr-2">Importing...</span>
                <span className="text-xs">{progress}%</span>
              </>
            ) : (
              <>
                <Upload size={14} className="mr-1.5" />
                Import {parsedRows.length} Records
              </>
            )}
          </Button>
          <Button variant="outline" onClick={reset} disabled={importing}>
            Cancel
          </Button>
          {importing && <Progress value={progress} className="flex-1 h-2" />}
        </div>
      )}

      {/* Result summary */}
      {result && (
        <div
          className={`rounded-xl border p-5 space-y-4 ${
            result.failed === 0
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          }`}
          data-ocid={`bulk.${label.toLowerCase().replace(/ /g, "_")}.success_state`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={24}
              className={
                result.failed === 0 ? "text-green-600" : "text-amber-600"
              }
            />
            <div>
              <p className="font-semibold text-foreground">
                Import {result.failed === 0 ? "Complete" : "Partial"}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.success} of {result.total} records imported successfully
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-sm">{result.success} Imported</span>
            </div>
            {result.failed > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-sm">{result.failed} Failed</span>
              </div>
            )}
          </div>
          {result.errors.length > 0 && (
            <ul className="text-xs text-destructive/80 space-y-0.5 max-h-28 overflow-y-auto pl-4">
              {result.errors.map((e) => (
                <li key={e.slice(0, 40)} className="list-disc">
                  {e}
                </li>
              ))}
            </ul>
          )}
          <Button variant="outline" size="sm" onClick={reset}>
            Import Another File
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Summary card config ──────────────────────────────────────────────────────

type TabKey = "students" | "staff" | "books";

const SUMMARY_CARDS: Array<{
  key: TabKey;
  label: string;
  color: string;
  bg: string;
}> = [
  {
    key: "students",
    label: "Students Imported",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "staff",
    label: "Staff Imported",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    key: "books",
    label: "Books Imported",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

interface BulkImportModuleProps {
  defaultTab?: TabKey;
  tabs?: Array<TabKey>;
}

export default function BulkImportModule({
  defaultTab = "students",
  tabs,
}: BulkImportModuleProps) {
  const activeTabs: TabKey[] = tabs ?? ["students", "staff", "books"];
  const effectiveDefault = activeTabs.includes(defaultTab)
    ? defaultTab
    : activeTabs[0];

  // Local import storage (simulates adding to the system)
  const [importedStudents, setImportedStudents] = useState<
    Record<string, string>[]
  >([]);
  const [importedStaff, setImportedStaff] = useState<Record<string, string>[]>(
    [],
  );
  const [importedBooks, setImportedBooks] = useState<Record<string, string>[]>(
    [],
  );

  const counts: Record<TabKey, number> = {
    students: importedStudents.length,
    staff: importedStaff.length,
    books: importedBooks.length,
  };

  return (
    <div className="space-y-5" data-ocid="bulk.page">
      <div>
        <h2 className="text-xl font-bold">Bulk Import</h2>
        <p className="text-sm text-muted-foreground">
          Import multiple records at once using CSV files. Download the template
          for the correct format.
        </p>
      </div>

      {/* Summary cards — only for active tabs */}
      <div className={`grid gap-4 grid-cols-${activeTabs.length}`}>
        {SUMMARY_CARDS.filter((c) => activeTabs.includes(c.key)).map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className={`text-3xl font-bold ${s.color}`}>
                {counts[s.key]}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {s.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue={effectiveDefault} data-ocid="bulk.tab">
        <TabsList>
          {activeTabs.includes("students") && (
            <TabsTrigger value="students" data-ocid="bulk.students.tab">
              Students
            </TabsTrigger>
          )}
          {activeTabs.includes("staff") && (
            <TabsTrigger value="staff" data-ocid="bulk.staff.tab">
              Staff
            </TabsTrigger>
          )}
          {activeTabs.includes("books") && (
            <TabsTrigger value="books" data-ocid="bulk.books.tab">
              Books
            </TabsTrigger>
          )}
        </TabsList>

        {activeTabs.includes("students") && (
          <TabsContent value="students" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload size={16} className="text-primary" />
                  Student Bulk Import
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImportTab
                  label="Students"
                  headers={STUDENT_HEADERS}
                  sampleRows={STUDENT_SAMPLE_ROWS}
                  templateFilename="student_import_template.csv"
                  validate={validateStudentRow}
                  onImport={(rows) =>
                    setImportedStudents((prev) => [...prev, ...rows])
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {activeTabs.includes("staff") && (
          <TabsContent value="staff" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload size={16} className="text-primary" />
                  Staff Bulk Import
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImportTab
                  label="Staff"
                  headers={STAFF_HEADERS}
                  sampleRows={STAFF_SAMPLE_ROWS}
                  templateFilename="staff_import_template.csv"
                  validate={validateStaffRow}
                  onImport={(rows) =>
                    setImportedStaff((prev) => [...prev, ...rows])
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {activeTabs.includes("books") && (
          <TabsContent value="books" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload size={16} className="text-primary" />
                  Books Bulk Import
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImportTab
                  label="Books"
                  headers={BOOK_HEADERS}
                  sampleRows={BOOK_SAMPLE_ROWS}
                  templateFilename="books_import_template.csv"
                  validate={validateBookRow}
                  onImport={(rows) =>
                    setImportedBooks((prev) => [...prev, ...rows])
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

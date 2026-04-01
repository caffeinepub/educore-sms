import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Download,
  Edit2,
  LayoutDashboard,
  Loader2,
  Plus,
  Printer,
  Receipt,
  Search,
  Settings2,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useMemo, useState } from "react";
import Layout from "../../components/Layout";
import { useApp } from "../../contexts/AppContext";
import type { FeePayment } from "../../types";

type Section =
  | "dashboard"
  | "feestructure"
  | "collect"
  | "records"
  | "defaulters"
  | "reports";

const PAYMENT_METHODS = ["Cash", "Online", "Bank Transfer", "Cheque"];
const _FEE_HEADS = [
  "Tuition",
  "Admission",
  "Exam",
  "Library",
  "Hostel",
  "Sports",
  "Lab",
  "Other",
];

function exportCSV(headers: string[], rows: string[][], filename: string) {
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
  ocid,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
  ocid: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card data-ocid={ocid} className="relative overflow-hidden">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {label}
              </p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              {sub && (
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              )}
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace("text-", "bg-").replace("-600", "-100").replace("-700", "-100")}`}
            >
              <span className={color}>{icon}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ReceiptModal({
  receipt,
  onClose,
}: {
  receipt: {
    number: string;
    studentName: string;
    feeHead: string;
    amount: number;
    method: string;
    date: string;
  } | null;
  onClose: () => void;
}) {
  if (!receipt) return null;
  return (
    <Dialog open={!!receipt} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm" data-ocid="receipt.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={20} />
            Payment Receipt
          </DialogTitle>
        </DialogHeader>
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Receipt No.</p>
            <p className="text-lg font-bold font-mono text-primary">
              {receipt.number}
            </p>
          </div>
          <div className="border-t pt-3 space-y-2 text-sm">
            {[
              ["Student", receipt.studentName],
              ["Fee Head", receipt.feeHead],
              ["Amount", `₹${receipt.amount.toLocaleString()}`],
              ["Mode", receipt.method],
              ["Date", receipt.date],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            data-ocid="receipt.print_button"
          >
            <Printer size={14} className="mr-1" /> Print
          </Button>
          <Button size="sm" onClick={onClose} data-ocid="receipt.close_button">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AccountantDashboard() {
  const {
    feePayments: initPayments,
    feeMasters: initMasters,
    feeTypes,
    students,
    classes,
    currentSchoolId,
  } = useApp();

  const [section, setSection] = useState<Section>("dashboard");
  const [payments, setPayments] = useState<FeePayment[]>(
    initPayments.filter((p) => p.schoolId === currentSchoolId),
  );
  const [feeMasters, setFeeMasters] = useState(
    initMasters.filter((f) => f.schoolId === currentSchoolId),
  );

  // Collect Fee
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedMasterId, setSelectedMasterId] = useState("");
  const [collectAmount, setCollectAmount] = useState("");
  const [collectMethod, setCollectMethod] = useState("Cash");
  const [collectNote, setCollectNote] = useState("");
  const [isCollecting, setIsCollecting] = useState(false);
  const [receipt, setReceipt] = useState<{
    number: string;
    studentName: string;
    feeHead: string;
    amount: number;
    method: string;
    date: string;
  } | null>(null);

  // Fee Structure modal
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [editingMaster, setEditingMaster] = useState<string | null>(null);
  const [masterForm, setMasterForm] = useState({
    classId: "",
    feeTypeId: "ft1",
    feeHead: "Tuition",
    amount: "",
    dueDate: "",
    sessionId: "2025-26",
  });

  // Records filters
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");

  // Defaulters filters
  const [filterClass, setFilterClass] = useState("all");
  const [filterSession, setFilterSession] = useState("all");

  // Reports
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");

  const myStudents = students.filter((s) => s.schoolId === currentSchoolId);
  const myClasses = classes.filter((c) => c.schoolId === currentSchoolId);

  const getStudentName = (id: string) =>
    myStudents.find((s) => s.id === id)?.name ?? id;
  const getClassName = (id: string) =>
    myClasses.find((c) => c.id === id)?.name ?? id;
  const getFeeTypeName = (id: string) =>
    feeTypes.find((f) => f.id === id)?.name ?? id;
  const getMasterLabel = (id: string) => {
    const m = feeMasters.find((f) => f.id === id);
    if (!m) return id;
    return `${getFeeTypeName(m.feeTypeId)} — ${getClassName(m.classId)}`;
  };

  const totalCollected = useMemo(
    () => payments.reduce((a, p) => a + p.amountPaid, 0),
    [payments],
  );
  const today = new Date().toISOString().slice(0, 10);
  const todayCollected = useMemo(
    () =>
      payments
        .filter((p) => p.paymentDate === today)
        .reduce((a, p) => a + p.amountPaid, 0),
    [payments, today],
  );

  // Defaulters: students who have a fee master but NO payment recorded
  // biome-ignore lint/correctness/useExhaustiveDependencies: getFeeTypeName is a stable inline fn
  const defaulters = useMemo(() => {
    const res: Array<{
      student: (typeof myStudents)[0];
      master: (typeof feeMasters)[0];
      feeTypeName: string;
    }> = [];
    for (const m of feeMasters) {
      if (filterSession !== "all" && m.sessionId !== filterSession) continue;
      const classStudents = myStudents.filter(
        (s) =>
          s.classId === m.classId &&
          (filterClass === "all" || s.classId === filterClass),
      );
      for (const stu of classStudents) {
        const paid = payments.find(
          (p) => p.studentId === stu.id && p.feeMasterId === m.id,
        );
        if (!paid) {
          res.push({
            student: stu,
            master: m,
            feeTypeName: getFeeTypeName(m.feeTypeId),
          });
        }
      }
    }
    return res;
  }, [feeMasters, myStudents, payments, filterClass, filterSession]);

  const totalPending = useMemo(
    () => defaulters.reduce((a, d) => a + d.master.amount, 0),
    [defaulters],
  );

  // Filtered payments for records
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (filterFrom && p.paymentDate < filterFrom) return false;
      if (filterTo && p.paymentDate > filterTo) return false;
      if (filterMethod !== "all" && p.paymentMethod !== filterMethod)
        return false;
      return true;
    });
  }, [payments, filterFrom, filterTo, filterMethod]);

  // Report filtered
  const reportPayments = useMemo(() => {
    return payments.filter((p) => {
      if (reportFrom && p.paymentDate < reportFrom) return false;
      if (reportTo && p.paymentDate > reportTo) return false;
      return true;
    });
  }, [payments, reportFrom, reportTo]);
  const reportCollected = useMemo(
    () => reportPayments.reduce((a, p) => a + p.amountPaid, 0),
    [reportPayments],
  );

  // Chart data — collection by method
  const chartData = useMemo(() => {
    const byMethod: Record<string, number> = {};
    for (const p of reportPayments) {
      byMethod[p.paymentMethod] =
        (byMethod[p.paymentMethod] ?? 0) + p.amountPaid;
    }
    const total = Object.values(byMethod).reduce((a, v) => a + v, 0) || 1;
    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    return Object.entries(byMethod).map(([method, amount], i) => ({
      method,
      amount,
      pct: Math.round((amount / total) * 100),
      color: COLORS[i % COLORS.length],
    }));
  }, [reportPayments]);

  // Collect fee
  const collectFee = () => {
    if (!selectedStudentId || !collectAmount || Number(collectAmount) <= 0)
      return;
    setIsCollecting(true);
    setTimeout(() => {
      const num = `RCP-${String(payments.length + 1).padStart(4, "0")}`;
      const student = myStudents.find((s) => s.id === selectedStudentId);
      const master = feeMasters.find((m) => m.id === selectedMasterId);
      const newPayment: FeePayment = {
        id: `fp${Date.now()}`,
        schoolId: currentSchoolId,
        studentId: selectedStudentId,
        feeMasterId: selectedMasterId,
        amountPaid: Number(collectAmount),
        paymentDate: today,
        paymentMethod: collectMethod,
        receiptNumber: num,
        collectedBy: "accountant",
      };
      setPayments((p) => [...p, newPayment]);
      setReceipt({
        number: num,
        studentName: student?.name ?? selectedStudentId,
        feeHead: master ? getFeeTypeName(master.feeTypeId) : "General",
        amount: Number(collectAmount),
        method: collectMethod,
        date: today,
      });
      setSelectedStudentId("");
      setSelectedMasterId("");
      setCollectAmount("");
      setCollectNote("");
      setIsCollecting(false);
    }, 600);
  };

  const saveMaster = () => {
    if (!masterForm.amount || !masterForm.dueDate || !masterForm.classId)
      return;
    if (editingMaster) {
      setFeeMasters((p) =>
        p.map((m) =>
          m.id === editingMaster
            ? {
                ...m,
                amount: Number(masterForm.amount),
                dueDate: masterForm.dueDate,
                classId: masterForm.classId,
              }
            : m,
        ),
      );
    } else {
      setFeeMasters((p) => [
        ...p,
        {
          id: `fm${Date.now()}`,
          schoolId: currentSchoolId,
          classId: masterForm.classId,
          feeGroupId: "fg1",
          feeTypeId: masterForm.feeTypeId,
          amount: Number(masterForm.amount),
          sessionId: masterForm.sessionId,
          dueDate: masterForm.dueDate,
        },
      ]);
    }
    setShowFeeModal(false);
    setEditingMaster(null);
  };

  const openEditMaster = (id: string) => {
    const m = feeMasters.find((x) => x.id === id);
    if (!m) return;
    setMasterForm({
      classId: m.classId,
      feeTypeId: m.feeTypeId,
      feeHead: getFeeTypeName(m.feeTypeId),
      amount: String(m.amount),
      dueDate: m.dueDate,
      sessionId: m.sessionId,
    });
    setEditingMaster(id);
    setShowFeeModal(true);
  };

  const filteredStudents =
    searchQuery.length >= 2
      ? myStudents.filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : myStudents.slice(0, 8);

  const selectedStudentMasters = selectedStudentId
    ? feeMasters.filter((m) => {
        const stu = myStudents.find((s) => s.id === selectedStudentId);
        return stu && m.classId === stu.classId;
      })
    : [];

  // ── Render sections ─────────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Accounts Dashboard
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Financial overview for{" "}
          {new Date().toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Collection"
          value={`₹${todayCollected.toLocaleString()}`}
          icon={<DollarSign size={18} />}
          color="text-green-600"
          sub={`${payments.filter((p) => p.paymentDate === today).length} transactions`}
          ocid="accounts.today_collected.card"
        />
        <StatCard
          label="Total Collected"
          value={`₹${totalCollected.toLocaleString()}`}
          icon={<TrendingUp size={18} />}
          color="text-blue-600"
          sub={`${payments.length} total receipts`}
          ocid="accounts.total_collected.card"
        />
        <StatCard
          label="Outstanding Dues"
          value={`₹${totalPending.toLocaleString()}`}
          icon={<AlertTriangle size={18} />}
          color="text-amber-600"
          sub="Across all fee heads"
          ocid="accounts.pending.card"
        />
        <StatCard
          label="Defaulters"
          value={defaulters.length}
          icon={<Users size={18} />}
          color="text-red-600"
          sub="Students with dues"
          ocid="accounts.defaulters.card"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Receipt size={16} /> Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table data-ocid="accounts.recent_payments.table">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Receipt</TableHead>
                  <TableHead className="text-xs">Student</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Mode</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-6 text-sm"
                      data-ocid="accounts.recent_payments.empty_state"
                    >
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  [...payments]
                    .reverse()
                    .slice(0, 6)
                    .map((p, i) => (
                      <TableRow
                        key={p.id}
                        data-ocid={`accounts.recent_payments.item.${i + 1}`}
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            {p.receiptNumber}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {getStudentName(p.studentId)}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-green-600">
                          ₹{p.amountPaid.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs">
                          {p.paymentMethod}
                        </TableCell>
                        <TableCell className="text-xs">
                          {p.paymentDate}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Top
              Defaulters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table data-ocid="accounts.top_defaulters.table">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Student</TableHead>
                  <TableHead className="text-xs">Fee Head</TableHead>
                  <TableHead className="text-xs">Due</TableHead>
                  <TableHead className="text-xs">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defaulters.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-6 text-sm"
                      data-ocid="accounts.top_defaulters.empty_state"
                    >
                      No defaulters found.
                    </TableCell>
                  </TableRow>
                ) : (
                  defaulters.slice(0, 5).map((d, i) => (
                    <TableRow
                      key={`${d.student.id}-${d.master.id}`}
                      data-ocid={`accounts.top_defaulters.item.${i + 1}`}
                    >
                      <TableCell className="text-xs font-medium">
                        {d.student.name}
                      </TableCell>
                      <TableCell className="text-xs">{d.feeTypeName}</TableCell>
                      <TableCell className="text-xs font-semibold text-red-600">
                        ₹{d.master.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs">
                        {d.master.dueDate}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(
          [
            {
              label: "Fee Structure",
              section: "feestructure",
              icon: <Settings2 size={18} />,
            },
            {
              label: "Collect Fee",
              section: "collect",
              icon: <DollarSign size={18} />,
            },
            {
              label: "Fee Records",
              section: "records",
              icon: <ClipboardList size={18} />,
            },
            {
              label: "Defaulters",
              section: "defaulters",
              icon: <AlertTriangle size={18} />,
            },
            {
              label: "Reports",
              section: "reports",
              icon: <BarChart2 size={18} />,
            },
          ] as const
        ).map((q) => (
          <button
            key={q.section}
            type="button"
            data-ocid={`accounts.quick.${q.section}.button`}
            onClick={() => setSection(q.section)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium text-foreground"
          >
            <span className="text-primary">{q.icon}</span>
            {q.label}
            <ArrowUpRight size={14} className="ml-auto text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderFeeStructure = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Fee Structure</h2>
          <p className="text-sm text-muted-foreground">
            Manage fee masters by class and session
          </p>
        </div>
        <Button
          onClick={() => {
            setMasterForm({
              classId: myClasses[0]?.id ?? "",
              feeTypeId: "ft1",
              feeHead: "Tuition",
              amount: "",
              dueDate: "",
              sessionId: "2025-26",
            });
            setEditingMaster(null);
            setShowFeeModal(true);
          }}
          data-ocid="feestructure.add_button"
          size="sm"
        >
          <Plus size={15} className="mr-1" /> Add Fee Master
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table data-ocid="feestructure.table">
            <TableHeader>
              <TableRow>
                <TableHead>Fee Type</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeMasters.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                    data-ocid="feestructure.empty_state"
                  >
                    No fee masters defined. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                feeMasters.map((m, i) => (
                  <TableRow key={m.id} data-ocid={`feestructure.item.${i + 1}`}>
                    <TableCell className="font-medium">
                      {getFeeTypeName(m.feeTypeId)}
                    </TableCell>
                    <TableCell>{getClassName(m.classId)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {m.sessionId}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-700">
                      ₹{m.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{m.dueDate}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => openEditMaster(m.id)}
                        data-ocid={`feestructure.edit_button.${i + 1}`}
                      >
                        <Edit2 size={13} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() =>
                          setFeeMasters((p) => p.filter((x) => x.id !== m.id))
                        }
                        data-ocid={`feestructure.delete_button.${i + 1}`}
                      >
                        <XCircle size={13} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Fee Master Modal */}
      <Dialog
        open={showFeeModal}
        onOpenChange={(o) => {
          if (!o) setShowFeeModal(false);
        }}
      >
        <DialogContent data-ocid="feestructure.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingMaster ? "Edit Fee Master" : "Add Fee Master"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Class</Label>
              <Select
                value={masterForm.classId}
                onValueChange={(v) =>
                  setMasterForm((p) => ({ ...p, classId: v }))
                }
              >
                <SelectTrigger data-ocid="feestructure.class.select">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {myClasses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Fee Type</Label>
              <Select
                value={masterForm.feeTypeId}
                onValueChange={(v) =>
                  setMasterForm((p) => ({ ...p, feeTypeId: v }))
                }
              >
                <SelectTrigger data-ocid="feestructure.feetype.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {feeTypes.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  value={masterForm.amount}
                  onChange={(e) =>
                    setMasterForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  data-ocid="feestructure.amount.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Session</Label>
                <Input
                  placeholder="2025-26"
                  value={masterForm.sessionId}
                  onChange={(e) =>
                    setMasterForm((p) => ({ ...p, sessionId: e.target.value }))
                  }
                  data-ocid="feestructure.session.input"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={masterForm.dueDate}
                onChange={(e) =>
                  setMasterForm((p) => ({ ...p, dueDate: e.target.value }))
                }
                data-ocid="feestructure.duedate.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFeeModal(false);
                setEditingMaster(null);
              }}
              data-ocid="feestructure.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={saveMaster} data-ocid="feestructure.save_button">
              {editingMaster ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderCollect = () => {
    const selectedStudent = myStudents.find((s) => s.id === selectedStudentId);
    const studentPayments = selectedStudent
      ? payments.filter((p) => p.studentId === selectedStudent.id)
      : [];

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Collect Fee</h2>
          <p className="text-sm text-muted-foreground">
            Search a student and record their payment
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Search Student</Label>
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    className="pl-8"
                    placeholder="Name or Roll No."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-ocid="collect.search.input"
                  />
                </div>
                {(searchQuery.length >= 2 || !selectedStudentId) && (
                  <div className="border rounded-lg max-h-36 overflow-y-auto mt-1">
                    {filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between ${
                          selectedStudentId === s.id
                            ? "bg-primary/10 font-semibold"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setSearchQuery(s.name);
                          setSelectedMasterId("");
                        }}
                        data-ocid={"collect.student_result.button"}
                      >
                        <span>{s.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.rollNumber} · {getClassName(s.classId)}
                        </span>
                      </button>
                    ))}
                    {filteredStudents.length === 0 && (
                      <p className="text-xs text-muted-foreground px-3 py-2">
                        No students found.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label>Fee Head</Label>
                <Select
                  value={selectedMasterId}
                  onValueChange={setSelectedMasterId}
                  disabled={!selectedStudentId}
                >
                  <SelectTrigger data-ocid="collect.feehead.select">
                    <SelectValue placeholder="Select fee" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedStudentMasters.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {getFeeTypeName(m.feeTypeId)} — ₹{m.amount} (due{" "}
                        {m.dueDate})
                      </SelectItem>
                    ))}
                    {selectedStudentMasters.length === 0 && (
                      <SelectItem value="general">General Payment</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                    data-ocid="collect.amount.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Payment Mode</Label>
                  <Select
                    value={collectMethod}
                    onValueChange={setCollectMethod}
                  >
                    <SelectTrigger data-ocid="collect.method.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Note (optional)</Label>
                <Input
                  placeholder="e.g. Partial payment, Month of March"
                  value={collectNote}
                  onChange={(e) => setCollectNote(e.target.value)}
                  data-ocid="collect.note.input"
                />
              </div>

              <Button
                onClick={collectFee}
                disabled={!selectedStudentId || !collectAmount || isCollecting}
                className="w-full"
                data-ocid="collect.submit_button"
              >
                {isCollecting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Receipt size={16} className="mr-2" />
                    Collect & Generate Receipt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Right: student ledger */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                {selectedStudent
                  ? `Fee Ledger — ${selectedStudent.name}`
                  : "Fee Ledger"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedStudent ? (
                <div
                  className="text-center text-muted-foreground py-10 text-sm"
                  data-ocid="collect.ledger.empty_state"
                >
                  <LayoutDashboard
                    size={32}
                    className="mx-auto mb-2 opacity-30"
                  />
                  Select a student to view their fee ledger.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Roll No.</span>
                      <span className="font-medium">
                        {selectedStudent.rollNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Class</span>
                      <span className="font-medium">
                        {getClassName(selectedStudent.classId)}
                      </span>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Fee Head</TableHead>
                        <TableHead className="text-xs">Amount</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStudentMasters.map((m, i) => {
                        const paid = studentPayments.find(
                          (p) => p.feeMasterId === m.id,
                        );
                        return (
                          <TableRow
                            key={m.id}
                            data-ocid={`collect.ledger.item.${i + 1}`}
                          >
                            <TableCell className="text-xs">
                              {getFeeTypeName(m.feeTypeId)}
                            </TableCell>
                            <TableCell className="text-xs font-semibold">
                              ₹{m.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {paid ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                  Paid
                                </Badge>
                              ) : (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Due
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {selectedStudentMasters.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-xs text-muted-foreground text-center py-4"
                          >
                            No fee masters for this class.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {studentPayments.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {studentPayments.length} payment(s) recorded · Total ₹
                      {studentPayments
                        .reduce((a, p) => a + p.amountPaid, 0)
                        .toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
      </div>
    );
  };

  const renderRecords = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Fee Records</h2>
          <p className="text-sm text-muted-foreground">
            All payment transactions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            exportCSV(
              ["Receipt", "Student", "Fee Head", "Amount", "Mode", "Date"],
              filteredPayments.map((p) => [
                p.receiptNumber,
                getStudentName(p.studentId),
                getMasterLabel(p.feeMasterId),
                String(p.amountPaid),
                p.paymentMethod,
                p.paymentDate,
              ]),
              "fee-records.csv",
            )
          }
          data-ocid="records.export_button"
        >
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                className="h-8 text-xs w-36"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                data-ocid="records.from.input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                className="h-8 text-xs w-36"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                data-ocid="records.to.input"
              />
            </div>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger
                className="h-8 text-xs w-36"
                data-ocid="records.method.select"
              >
                <SelectValue placeholder="Payment mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(filterFrom || filterTo || filterMethod !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setFilterFrom("");
                  setFilterTo("");
                  setFilterMethod("all");
                }}
              >
                Clear
              </Button>
            )}
          </div>

          <Table data-ocid="records.table">
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Fee Head</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                    data-ocid="records.empty_state"
                  >
                    No records match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((p, i) => (
                  <TableRow key={p.id} data-ocid={`records.item.${i + 1}`}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {p.receiptNumber}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getStudentName(p.studentId)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getMasterLabel(p.feeMasterId)}
                    </TableCell>
                    <TableCell className="font-semibold text-green-700">
                      ₹{p.amountPaid.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {p.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.paymentDate}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filteredPayments.length > 0 && (
            <div className="mt-3 text-sm text-muted-foreground flex justify-between items-center border-t pt-3">
              <span>{filteredPayments.length} transaction(s)</span>
              <span className="font-semibold text-green-700">
                Total: ₹
                {filteredPayments
                  .reduce((a, p) => a + p.amountPaid, 0)
                  .toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderDefaulters = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Fee Defaulters</h2>
          <p className="text-sm text-muted-foreground">
            Students with unpaid fee dues
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            exportCSV(
              [
                "Student",
                "Roll No",
                "Class",
                "Fee Head",
                "Amount Due",
                "Due Date",
              ],
              defaulters.map((d) => [
                d.student.name,
                d.student.rollNumber,
                getClassName(d.student.classId),
                d.feeTypeName,
                String(d.master.amount),
                d.master.dueDate,
              ]),
              "fee-defaulters.csv",
            )
          }
          data-ocid="defaulters.export_button"
        >
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger
                className="h-8 text-xs w-40"
                data-ocid="defaulters.class.select"
              >
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {myClasses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSession} onValueChange={setFilterSession}>
              <SelectTrigger
                className="h-8 text-xs w-36"
                data-ocid="defaulters.session.select"
              >
                <SelectValue placeholder="All Sessions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {[...new Set(feeMasters.map((m) => m.sessionId))].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {defaulters.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-600">
                  {defaulters.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Defaulters
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-amber-600">
                  ₹{totalPending.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Pending</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-blue-600">
                  {[...new Set(defaulters.map((d) => d.student.id))].length}
                </p>
                <p className="text-xs text-muted-foreground">Unique Students</p>
              </div>
            </div>
          )}

          <Table data-ocid="defaulters.table">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Fee Head</TableHead>
                <TableHead>Due Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defaulters.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-10"
                    data-ocid="defaulters.empty_state"
                  >
                    <CheckCircle2
                      size={32}
                      className="mx-auto mb-2 text-green-400"
                    />
                    No defaulters found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                defaulters.map((d, i) => {
                  const isOverdue = d.master.dueDate < today;
                  return (
                    <TableRow
                      key={`${d.student.id}-${d.master.id}`}
                      data-ocid={`defaulters.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        {d.student.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {d.student.rollNumber}
                      </TableCell>
                      <TableCell>{getClassName(d.student.classId)}</TableCell>
                      <TableCell>{d.feeTypeName}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        ₹{d.master.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{d.master.dueDate}</TableCell>
                      <TableCell>
                        {isOverdue ? (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-amber-100 text-amber-700 border-amber-200"
                          >
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Financial Reports</h2>
          <p className="text-sm text-muted-foreground">Summary and analytics</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            exportCSV(
              ["Receipt", "Student", "Fee Head", "Amount", "Mode", "Date"],
              reportPayments.map((p) => [
                p.receiptNumber,
                getStudentName(p.studentId),
                getMasterLabel(p.feeMasterId),
                String(p.amountPaid),
                p.paymentMethod,
                p.paymentDate,
              ]),
              "financial-report.csv",
            )
          }
          data-ocid="reports.export_button"
        >
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      </div>

      {/* Date range */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <Label className="text-xs font-medium">Date Range:</Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="h-8 text-xs w-36"
                value={reportFrom}
                onChange={(e) => setReportFrom(e.target.value)}
                data-ocid="reports.from.input"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                className="h-8 text-xs w-36"
                value={reportTo}
                onChange={(e) => setReportTo(e.target.value)}
                data-ocid="reports.to.input"
              />
            </div>
            {(reportFrom || reportTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setReportFrom("");
                  setReportTo("");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Collected"
          value={`₹${reportCollected.toLocaleString()}`}
          icon={<TrendingUp size={18} />}
          color="text-green-600"
          sub={`${reportPayments.length} transactions`}
          ocid="reports.collected.card"
        />
        <StatCard
          label="Total Pending"
          value={`₹${totalPending.toLocaleString()}`}
          icon={<AlertTriangle size={18} />}
          color="text-amber-600"
          sub={`${defaulters.length} defaulters`}
          ocid="reports.pending.card"
        />
        <StatCard
          label="Fee Masters"
          value={feeMasters.length}
          icon={<Settings2 size={18} />}
          color="text-blue-600"
          sub="Active fee structures"
          ocid="reports.feemasters.card"
        />
        <StatCard
          label="Students"
          value={myStudents.length}
          icon={<Users size={18} />}
          color="text-purple-600"
          sub="Enrolled this session"
          ocid="reports.students.card"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Bar chart: collection by payment method */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Collection by Payment Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data for selected range.
              </p>
            ) : (
              <div className="space-y-3">
                {chartData.map((d) => (
                  <div key={d.method}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{d.method}</span>
                      <span className="text-muted-foreground">
                        ₹{d.amount.toLocaleString()} ({d.pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${d.pct}%`, backgroundColor: d.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Monthly Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Month</TableHead>
                  <TableHead className="text-xs">Transactions</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const byMonth: Record<string, number[]> = {};
                  for (const p of reportPayments) {
                    const month = p.paymentDate.slice(0, 7);
                    if (!byMonth[month]) byMonth[month] = [];
                    byMonth[month].push(p.amountPaid);
                  }
                  const entries = Object.entries(byMonth).sort((a, b) =>
                    b[0].localeCompare(a[0]),
                  );
                  if (entries.length === 0)
                    return (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-6 text-muted-foreground text-sm"
                        >
                          No data.
                        </TableCell>
                      </TableRow>
                    );
                  return entries.map(([month, amounts], i) => (
                    <TableRow
                      key={month}
                      data-ocid={`reports.monthly.item.${i + 1}`}
                    >
                      <TableCell className="text-xs">
                        {new Date(`${month}-01`).toLocaleDateString("en-IN", {
                          month: "long",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-xs">
                        {amounts.length}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-green-700">
                        ₹{amounts.reduce((a, v) => a + v, 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Layout
      activeSection={section}
      onSectionChange={(s) => setSection(s as Section)}
    >
      {section === "dashboard" && renderDashboard()}
      {section === "feestructure" && renderFeeStructure()}
      {section === "collect" && renderCollect()}
      {section === "records" && renderRecords()}
      {section === "defaulters" && renderDefaulters()}
      {section === "reports" && renderReports()}
    </Layout>
  );
}

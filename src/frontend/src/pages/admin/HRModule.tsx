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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  FileText,
  Monitor,
  Pencil,
  Plus,
  Printer,
  QrCode,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { staffLeaves as initLeaves } from "../../data/mockData";
import { useQRScanner } from "../../qr-code/useQRScanner";
import type { Payroll, Staff, StaffAttendance, StaffLeave } from "../../types";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function QRCodeImage({ data, size = 160 }: { data: string; size?: number }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
  return (
    <img
      src={src}
      alt={`QR for ${data}`}
      width={size}
      height={size}
      className="rounded border"
    />
  );
}

export default function HRModule() {
  const {
    staff: initStaff,
    staffAttendance: initAttendance,
    payrolls: initPayrolls,
    currentSchoolId,
  } = useApp();

  const [staff, setStaff] = useState<Staff[]>(
    initStaff.filter((s) => s.schoolId === currentSchoolId),
  );
  const [attendance, setAttendance] = useState<StaffAttendance[]>(
    initAttendance.filter((a) => a.schoolId === currentSchoolId),
  );
  const [leaves, setLeaves] = useState<StaffLeave[]>(
    initLeaves.filter((l) => l.schoolId === currentSchoolId),
  );
  const [payrolls, setPayrolls] = useState<Payroll[]>(
    initPayrolls.filter((p) => p.schoolId === currentSchoolId),
  );

  // UI state
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [qrViewStaff, setQrViewStaff] = useState<Staff | null>(null);
  const [attViewMode, setAttViewMode] = useState<"scan" | "view">("scan");
  const [attViewDate, setAttViewDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [lastScanned, setLastScanned] = useState<{
    staff: Staff;
    time: string;
    photoDataUrl?: string;
  } | null>(null);
  const [recentlySeen, setRecentlySeen] = useState<Set<string>>(new Set());

  // Manual override state
  const [manualStaffId, setManualStaffId] = useState("");
  const [manualStatus, setManualStatus] = useState<
    "present" | "absent" | "late"
  >("present");

  // Leave form
  const [leaveForm, setLeaveForm] = useState({
    staffId: "",
    leaveType: "sick" as StaffLeave["leaveType"],
    fromDate: "",
    toDate: "",
    reason: "",
  });

  // Staff form
  const [staffForm, setStaffForm] = useState({
    name: "",
    role: "teacher",
    staffType: "teaching" as Staff["staffType"],
    designation: "",
    qualification: "",
    department: "",
    phone: "",
    email: "",
    address: "",
    joinDate: "",
    salary: "",
  });

  // QR Scanner
  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error: scanError,
    isLoading: scanLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    videoRef,
    canvasRef,
    clearResults,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 300,
    maxResults: 3,
  });

  // Canvas for photo capture from QR scanner's video
  const photoCaptureCanvasRef = useRef<HTMLCanvasElement>(null);

  const capturePhotoFromVideo = useCallback((): string | undefined => {
    const video = videoRef.current;
    const canvas = photoCaptureCanvasRef.current;
    if (!video || !canvas) return undefined;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  }, [videoRef]);

  // Process QR scan results
  useEffect(() => {
    if (qrResults.length === 0) return;
    const latest = qrResults[0];
    const qrData = latest.data;
    if (recentlySeen.has(qrData)) return;

    const matched = staff.find((s) => s.qrCode === qrData);
    if (!matched) return;

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    const dateStr = now.toISOString().slice(0, 10);
    const photoDataUrl = capturePhotoFromVideo();

    const newRecord: StaffAttendance = {
      id: `sa${Date.now()}`,
      schoolId: currentSchoolId,
      staffId: matched.id,
      date: dateStr,
      time: timeStr,
      status: "present",
      photoDataUrl,
      method: "qr",
    };

    setAttendance((prev) => [
      ...prev.filter((a) => !(a.staffId === matched.id && a.date === dateStr)),
      newRecord,
    ]);

    setLastScanned({ staff: matched, time: timeStr, photoDataUrl });
    setRecentlySeen((prev) => new Set([...prev, qrData]));
    clearResults();

    // Clear cooldown after 5 seconds
    setTimeout(() => {
      setRecentlySeen((prev) => {
        const next = new Set(prev);
        next.delete(qrData);
        return next;
      });
    }, 5000);
  }, [
    qrResults,
    staff,
    recentlySeen,
    capturePhotoFromVideo,
    clearResults,
    currentSchoolId,
  ]);

  // Stop scanning when switching away from scan tab
  const handleAttViewMode = (mode: "scan" | "view") => {
    if (mode === "view" && isActive) stopScanning();
    setAttViewMode(mode);
    setLastScanned(null);
  };

  const getStaffName = (id: string) =>
    staff.find((s) => s.id === id)?.name ?? id;

  const openAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      name: "",
      role: "teacher",
      staffType: "teaching",
      designation: "",
      qualification: "",
      department: "",
      phone: "",
      email: "",
      address: "",
      joinDate: "",
      salary: "",
    });
    setShowModal("staff");
  };

  const openEditStaff = (s: Staff) => {
    setEditingStaff(s);
    setStaffForm({
      name: s.name,
      role: s.role,
      staffType: s.staffType,
      designation: s.designation,
      qualification: s.qualification,
      department: s.department,
      phone: s.phone,
      email: s.email,
      address: s.address,
      joinDate: s.joinDate,
      salary: String(s.salary),
    });
    setShowModal("staff");
  };

  const saveStaff = () => {
    if (editingStaff) {
      setStaff((p) =>
        p.map((s) =>
          s.id === editingStaff.id
            ? { ...s, ...staffForm, salary: Number(staffForm.salary) }
            : s,
        ),
      );
    } else {
      const newId = `st${Date.now()}`;
      setStaff((p) => [
        ...p,
        {
          id: newId,
          schoolId: currentSchoolId,
          isActive: true,
          qrCode: `STAFF_${newId}`,
          ...staffForm,
          salary: Number(staffForm.salary),
        },
      ]);
    }
    setShowModal(null);
  };

  const applyManualAttendance = () => {
    if (!manualStaffId) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toTimeString().slice(0, 8);
    const newRecord: StaffAttendance = {
      id: `sa${Date.now()}`,
      schoolId: currentSchoolId,
      staffId: manualStaffId,
      date: dateStr,
      time: timeStr,
      status: manualStatus,
      method: "manual",
    };
    setAttendance((prev) => [
      ...prev.filter(
        (a) => !(a.staffId === manualStaffId && a.date === dateStr),
      ),
      newRecord,
    ]);
    setManualStaffId("");
  };

  const saveLeave = () => {
    const from = new Date(leaveForm.fromDate);
    const to = new Date(leaveForm.toDate);
    const days = Math.max(
      1,
      Math.round((to.getTime() - from.getTime()) / 86400000) + 1,
    );
    setLeaves((prev) => [
      ...prev,
      {
        id: `sl${Date.now()}`,
        schoolId: currentSchoolId,
        staffId: leaveForm.staffId,
        leaveType: leaveForm.leaveType,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        days,
        reason: leaveForm.reason,
        status: "pending",
        appliedAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    setShowModal(null);
    setLeaveForm({
      staffId: "",
      leaveType: "sick",
      fromDate: "",
      toDate: "",
      reason: "",
    });
  };

  const generatePayroll = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const generated: Payroll[] = staff.map((s) => {
      const monthAttendance = attendance.filter((a) => {
        const d = new Date(a.date);
        return (
          a.staffId === s.id &&
          d.getMonth() + 1 === month &&
          d.getFullYear() === year
        );
      });
      const presentDays = monthAttendance.filter(
        (a) => a.status === "present",
      ).length;
      const absentDays = monthAttendance.filter(
        (a) => a.status === "absent",
      ).length;
      const workingDays = 26;
      const dailyRate = s.salary / workingDays;
      const deductions = Math.round(absentDays * dailyRate);
      const allowances = Math.round(s.salary * 0.1);
      const netSalary = Math.round(s.salary + allowances - deductions);
      return {
        id: `pr${Date.now()}_${s.id}`,
        schoolId: currentSchoolId,
        staffId: s.id,
        month,
        year,
        basicSalary: s.salary,
        allowances,
        deductions,
        netSalary,
        paymentDate: "",
        status: "pending",
        presentDays,
        absentDays,
      };
    });
    setPayrolls(generated);
  };

  const filteredAttendance = attendance.filter((a) => a.date === attViewDate);

  // Reports: monthly summary
  const reportMonth = new Date().getMonth() + 1;
  const reportYear = new Date().getFullYear();
  const reportSummary = staff.map((s) => {
    const monthAtt = attendance.filter((a) => {
      const d = new Date(a.date);
      return (
        a.staffId === s.id &&
        d.getMonth() + 1 === reportMonth &&
        d.getFullYear() === reportYear
      );
    });
    const monthLeave = leaves.filter((l) => {
      return (
        l.staffId === s.id &&
        l.status === "approved" &&
        new Date(l.fromDate).getMonth() + 1 === reportMonth
      );
    });
    return {
      staff: s,
      present: monthAtt.filter((a) => a.status === "present").length,
      absent: monthAtt.filter((a) => a.status === "absent").length,
      late: monthAtt.filter((a) => a.status === "late").length,
      leave: monthLeave.reduce((acc, l) => acc + l.days, 0),
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Human Resource</h2>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users size={14} /> {staff.length} Staff
          </span>
        </div>
      </div>

      <Tabs defaultValue="directory">
        <TabsList className="flex-wrap" data-ocid="hr.tabs">
          <TabsTrigger value="directory" data-ocid="hr.directory.tab">
            Staff Directory
          </TabsTrigger>
          <TabsTrigger value="attendance" data-ocid="hr.attendance.tab">
            QR Attendance
          </TabsTrigger>
          <TabsTrigger value="leave" data-ocid="hr.leave.tab">
            Leave Management
          </TabsTrigger>
          <TabsTrigger value="payroll" data-ocid="hr.payroll.tab">
            Payroll
          </TabsTrigger>
          <TabsTrigger value="reports" data-ocid="hr.reports.tab">
            Reports
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: Staff Directory ─── */}
        <TabsContent value="directory" className="space-y-3">
          <div className="flex justify-end">
            <Button onClick={openAddStaff} data-ocid="staff.add_button">
              <Plus size={16} className="mr-1" /> Add Staff
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <Table data-ocid="staff.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((s, i) => (
                    <TableRow key={s.id} data-ocid={`staff.item.${i + 1}`}>
                      <TableCell className="font-medium">
                        <div>{s.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.qualification}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            s.staffType === "teaching"
                              ? "border-blue-400 text-blue-600"
                              : "border-amber-400 text-amber-600"
                          }
                        >
                          {s.staffType === "teaching"
                            ? "Teaching"
                            : "Non-Teaching"}
                        </Badge>
                      </TableCell>
                      <TableCell>{s.designation}</TableCell>
                      <TableCell>{s.department}</TableCell>
                      <TableCell>{s.phone}</TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? "default" : "secondary"}>
                          {s.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setQrViewStaff(s);
                              setShowModal("qr");
                            }}
                            title="View QR"
                            data-ocid={`staff.qr_button.${i + 1}`}
                          >
                            <QrCode size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditStaff(s)}
                            data-ocid={`staff.edit_button.${i + 1}`}
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() =>
                              setStaff((p) => p.filter((x) => x.id !== s.id))
                            }
                            data-ocid={`staff.delete_button.${i + 1}`}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 2: QR Attendance ─── */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={attViewMode === "scan" ? "default" : "outline"}
              onClick={() => handleAttViewMode("scan")}
              data-ocid="hr.scan_station.toggle"
            >
              <Camera size={15} className="mr-1" /> Scan Station
            </Button>
            <Button
              variant={attViewMode === "view" ? "default" : "outline"}
              onClick={() => handleAttViewMode("view")}
              data-ocid="hr.view_attendance.toggle"
            >
              <Monitor size={15} className="mr-1" /> View Attendance
            </Button>
          </div>

          {attViewMode === "scan" && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Camera / Scanner Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <QrCode size={16} /> QR Scan Station
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isSupported === false && (
                    <div
                      className="flex items-center gap-2 text-destructive text-sm"
                      data-ocid="hr.scan.error_state"
                    >
                      <AlertCircle size={16} /> Camera not supported on this
                      device.
                    </div>
                  )}
                  {scanError && (
                    <div
                      className="flex items-center gap-2 text-destructive text-sm"
                      data-ocid="hr.scan.error_state"
                    >
                      <AlertCircle size={16} /> {scanError.message}
                    </div>
                  )}

                  {/* Video preview */}
                  <div
                    className="relative rounded-lg overflow-hidden bg-black"
                    style={{ minHeight: 240, aspectRatio: "4/3" }}
                  >
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!isActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white gap-2">
                        <QrCode size={40} className="opacity-50" />
                        <span className="text-sm">Camera not active</span>
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 border-4 border-primary/30 m-8 rounded-lg" />
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/40 -translate-x-1/2 animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Hidden canvases */}
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  <canvas
                    ref={photoCaptureCanvasRef}
                    style={{ display: "none" }}
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={startScanning}
                      disabled={!canStartScanning || isScanning}
                      className="flex-1"
                      data-ocid="hr.scan.start_button"
                    >
                      {scanLoading
                        ? "Starting..."
                        : isScanning
                          ? "Scanning..."
                          : "Start Scan"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={stopScanning}
                      disabled={!isActive}
                      data-ocid="hr.scan.stop_button"
                    >
                      Stop
                    </Button>
                  </div>

                  {isScanning && (
                    <p className="text-xs text-muted-foreground text-center animate-pulse">
                      Point camera at staff QR code to mark attendance
                    </p>
                  )}

                  {/* Manual override */}
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Manual Override
                    </p>
                    <div className="flex gap-2">
                      <Select
                        value={manualStaffId}
                        onValueChange={setManualStaffId}
                      >
                        <SelectTrigger
                          className="flex-1"
                          data-ocid="hr.manual.staff.select"
                        >
                          <SelectValue placeholder="Select staff" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={manualStatus}
                        onValueChange={(v) =>
                          setManualStatus(v as typeof manualStatus)
                        }
                      >
                        <SelectTrigger
                          className="w-28"
                          data-ocid="hr.manual.status.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={applyManualAttendance}
                      disabled={!manualStaffId}
                      className="w-full"
                      data-ocid="hr.manual.submit_button"
                    >
                      Apply Manual
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Scan result flash card */}
              <div className="space-y-3">
                <AnimatePresence mode="wait">
                  {lastScanned && (
                    <motion.div
                      key={lastScanned.time}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        className="border-green-400 bg-green-50 dark:bg-green-950/20"
                        data-ocid="hr.scan.success_state"
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle2
                              className="text-green-500 shrink-0 mt-1"
                              size={24}
                            />
                            <div className="flex-1">
                              <p className="font-bold text-green-700 dark:text-green-400">
                                Attendance Marked!
                              </p>
                              <p className="text-sm font-semibold mt-1">
                                {lastScanned.staff.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {lastScanned.staff.designation} ·{" "}
                                {lastScanned.staff.department}
                              </p>
                              <p className="text-xs mt-1 font-mono">
                                {new Date().toLocaleDateString()} at{" "}
                                {lastScanned.time}
                              </p>
                            </div>
                            {lastScanned.photoDataUrl && (
                              <img
                                src={lastScanned.photoDataUrl}
                                alt="Captured"
                                className="w-16 h-16 rounded object-cover border-2 border-green-400"
                              />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Today's attendance summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Today's Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {staff.map((s) => {
                      const today = new Date().toISOString().slice(0, 10);
                      const rec = attendance.find(
                        (a) => a.staffId === s.id && a.date === today,
                      );
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="truncate max-w-[120px]">
                            {s.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {rec?.time && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {rec.time}
                              </span>
                            )}
                            <Badge
                              variant="outline"
                              className={
                                rec?.status === "present"
                                  ? "border-green-400 text-green-600"
                                  : rec?.status === "late"
                                    ? "border-amber-400 text-amber-600"
                                    : rec?.status === "absent"
                                      ? "border-red-400 text-red-600"
                                      : "border-muted text-muted-foreground"
                              }
                            >
                              {rec?.status ?? "—"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {attViewMode === "view" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">
                    Attendance Records
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Date:</Label>
                    <Input
                      type="date"
                      value={attViewDate}
                      onChange={(e) => setAttViewDate(e.target.value)}
                      className="w-40 h-8 text-sm"
                      data-ocid="hr.view.date.input"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table data-ocid="hr.attendance.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Photo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                          data-ocid="hr.attendance.empty_state"
                        >
                          No records for this date.
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredAttendance.map((a, i) => (
                      <TableRow
                        key={a.id}
                        data-ocid={`hr.attendance.item.${i + 1}`}
                      >
                        <TableCell>{getStaffName(a.staffId)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {a.time ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              a.status === "present"
                                ? "border-green-400 text-green-600"
                                : a.status === "late"
                                  ? "border-amber-400 text-amber-600"
                                  : "border-red-400 text-red-600"
                            }
                          >
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {a.method ?? "manual"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {a.photoDataUrl ? (
                            <img
                              src={a.photoDataUrl}
                              alt=""
                              className="w-10 h-10 rounded object-cover border"
                            />
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── TAB 3: Leave Management ─── */}
        <TabsContent value="leave" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={() => setShowModal("leave")}
              data-ocid="leave.apply_button"
            >
              <Plus size={16} className="mr-1" /> Apply Leave
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <Table data-ocid="leave.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                        data-ocid="leave.empty_state"
                      >
                        No leave applications.
                      </TableCell>
                    </TableRow>
                  )}
                  {leaves.map((l, i) => (
                    <TableRow key={l.id} data-ocid={`leave.item.${i + 1}`}>
                      <TableCell>{getStaffName(l.staffId)}</TableCell>
                      <TableCell className="capitalize">
                        {l.leaveType}
                      </TableCell>
                      <TableCell>{l.fromDate}</TableCell>
                      <TableCell>{l.toDate}</TableCell>
                      <TableCell>{l.days}</TableCell>
                      <TableCell className="max-w-[120px] truncate">
                        {l.reason}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            l.status === "approved"
                              ? "border-green-400 text-green-600"
                              : l.status === "rejected"
                                ? "border-red-400 text-red-600"
                                : "border-amber-400 text-amber-600"
                          }
                        >
                          {l.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {l.status === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-400 text-xs h-7 px-2"
                              onClick={() =>
                                setLeaves((prev) =>
                                  prev.map((x) =>
                                    x.id === l.id
                                      ? { ...x, status: "approved" }
                                      : x,
                                  ),
                                )
                              }
                              data-ocid={`leave.approve_button.${i + 1}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-400 text-xs h-7 px-2"
                              onClick={() =>
                                setLeaves((prev) =>
                                  prev.map((x) =>
                                    x.id === l.id
                                      ? { ...x, status: "rejected" }
                                      : x,
                                  ),
                                )
                              }
                              data-ocid={`leave.reject_button.${i + 1}`}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 4: Payroll ─── */}
        <TabsContent value="payroll" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={generatePayroll}
              data-ocid="payroll.generate_button"
            >
              Generate Payroll ({MONTHS[new Date().getMonth()]}{" "}
              {new Date().getFullYear()})
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <Table data-ocid="payroll.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Basic</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                        data-ocid="payroll.empty_state"
                      >
                        No payroll generated yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {payrolls.map((p, i) => (
                    <TableRow key={p.id} data-ocid={`payroll.item.${i + 1}`}>
                      <TableCell className="font-medium">
                        {getStaffName(p.staffId)}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {p.presentDays ?? "—"}
                      </TableCell>
                      <TableCell className="text-red-500">
                        {p.absentDays ?? "—"}
                      </TableCell>
                      <TableCell>₹{p.basicSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">
                        +₹{p.allowances}
                      </TableCell>
                      <TableCell className="text-red-600">
                        -₹{p.deductions}
                      </TableCell>
                      <TableCell className="font-bold">
                        ₹{p.netSalary.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={
                            p.status === "paid" ? "secondary" : "default"
                          }
                          onClick={() =>
                            setPayrolls((prev) =>
                              prev.map((x) =>
                                x.id === p.id
                                  ? {
                                      ...x,
                                      status: "paid",
                                      paymentDate: new Date()
                                        .toISOString()
                                        .slice(0, 10),
                                    }
                                  : x,
                              ),
                            )
                          }
                          data-ocid={`payroll.pay_button.${i + 1}`}
                        >
                          {p.status === "paid" ? "Paid" : "Mark Paid"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 5: Reports ─── */}
        <TabsContent value="reports" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">
              Monthly Summary — {MONTHS[reportMonth - 1]} {reportYear}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              data-ocid="reports.print_button"
            >
              <Printer size={14} className="mr-1" /> Print
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <Table data-ocid="reports.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Leave</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportSummary.map((r, i) => (
                    <TableRow
                      key={r.staff.id}
                      data-ocid={`reports.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        {r.staff.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {r.staff.staffType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {r.present}
                      </TableCell>
                      <TableCell className="text-red-500">{r.absent}</TableCell>
                      <TableCell className="text-amber-500">{r.late}</TableCell>
                      <TableCell className="text-blue-500">{r.leave}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Total Staff",
                value: staff.length,
                icon: <Users size={18} />,
                color: "text-primary",
              },
              {
                label: "Teaching",
                value: staff.filter((s) => s.staffType === "teaching").length,
                icon: <FileText size={18} />,
                color: "text-blue-600",
              },
              {
                label: "Non-Teaching",
                value: staff.filter((s) => s.staffType === "non-teaching")
                  .length,
                icon: <FileText size={18} />,
                color: "text-amber-600",
              },
              {
                label: "On Leave",
                value: leaves.filter(
                  (l) =>
                    l.status === "approved" &&
                    new Date(l.fromDate).getMonth() + 1 === reportMonth,
                ).length,
                icon: <FileText size={18} />,
                color: "text-purple-600",
              },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-4">
                  <div className={`${s.color} mb-1`}>{s.icon}</div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Staff Form Modal ─── */}
      <Dialog
        open={showModal === "staff"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent className="max-w-2xl" data-ocid="staff.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Edit Staff" : "Add Staff"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {(
              [
                ["name", "Full Name", "text"],
                ["designation", "Designation", "text"],
                ["qualification", "Qualification", "text"],
                ["department", "Department", "text"],
                ["phone", "Phone", "text"],
                ["email", "Email", "email"],
                ["joinDate", "Join Date", "date"],
                ["salary", "Salary (₹)", "number"],
              ] as [keyof typeof staffForm, string, string][]
            ).map(([f, label, type]) => (
              <div key={f} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  type={type}
                  data-ocid={`staff.${f}.input`}
                  value={staffForm[f]}
                  onChange={(e) =>
                    setStaffForm((p) => ({ ...p, [f]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label>Staff Type</Label>
              <Select
                value={staffForm.staffType}
                onValueChange={(v) =>
                  setStaffForm((p) => ({
                    ...p,
                    staffType: v as Staff["staffType"],
                  }))
                }
              >
                <SelectTrigger data-ocid="staff.stafftype.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teaching">Teaching</SelectItem>
                  <SelectItem value="non-teaching">Non-Teaching</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select
                value={staffForm.role}
                onValueChange={(v) => setStaffForm((p) => ({ ...p, role: v }))}
              >
                <SelectTrigger data-ocid="staff.role.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "teacher",
                    "admin",
                    "accountant",
                    "librarian",
                    "peon",
                    "clerk",
                    "security",
                    "support",
                  ].map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Address</Label>
              <Input
                data-ocid="staff.address.input"
                value={staffForm.address}
                onChange={(e) =>
                  setStaffForm((p) => ({ ...p, address: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(null)}
              data-ocid="staff.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={saveStaff} data-ocid="staff.save_button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── QR View Modal ─── */}
      <Dialog
        open={showModal === "qr"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent
          className="max-w-xs text-center"
          data-ocid="staff.qr.dialog"
        >
          <DialogHeader>
            <DialogTitle>Staff QR Code</DialogTitle>
          </DialogHeader>
          {qrViewStaff && (
            <div className="flex flex-col items-center gap-3 py-2">
              <QRCodeImage data={qrViewStaff.qrCode} size={180} />
              <div>
                <p className="font-semibold">{qrViewStaff.name}</p>
                <p className="text-sm text-muted-foreground">
                  {qrViewStaff.designation}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {qrViewStaff.qrCode}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="w-full"
              data-ocid="staff.qr.print_button"
            >
              <Printer size={14} className="mr-1" /> Print QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Leave Application Modal ─── */}
      <Dialog
        open={showModal === "leave"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent className="max-w-md" data-ocid="leave.dialog">
          <DialogHeader>
            <DialogTitle>Apply Leave</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Staff Member</Label>
              <Select
                value={leaveForm.staffId}
                onValueChange={(v) =>
                  setLeaveForm((p) => ({ ...p, staffId: v }))
                }
              >
                <SelectTrigger data-ocid="leave.staff.select">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Leave Type</Label>
              <Select
                value={leaveForm.leaveType}
                onValueChange={(v) =>
                  setLeaveForm((p) => ({
                    ...p,
                    leaveType: v as StaffLeave["leaveType"],
                  }))
                }
              >
                <SelectTrigger data-ocid="leave.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="earned">Earned Leave</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>From Date</Label>
                <Input
                  type="date"
                  data-ocid="leave.from.input"
                  value={leaveForm.fromDate}
                  onChange={(e) =>
                    setLeaveForm((p) => ({ ...p, fromDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>To Date</Label>
                <Input
                  type="date"
                  data-ocid="leave.to.input"
                  value={leaveForm.toDate}
                  onChange={(e) =>
                    setLeaveForm((p) => ({ ...p, toDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Reason</Label>
              <Textarea
                data-ocid="leave.reason.textarea"
                value={leaveForm.reason}
                onChange={(e) =>
                  setLeaveForm((p) => ({ ...p, reason: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(null)}
              data-ocid="leave.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveLeave}
              disabled={
                !leaveForm.staffId || !leaveForm.fromDate || !leaveForm.toDate
              }
              data-ocid="leave.submit_button"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { Pencil, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import type { Payroll, Staff } from "../../types";

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
  const [attendance, setAttendance] = useState(
    initAttendance.filter((a) => a.schoolId === currentSchoolId),
  );
  const [payrolls, setPayrolls] = useState<Payroll[]>(
    initPayrolls.filter((p) => p.schoolId === currentSchoolId),
  );

  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attEntries, setAttEntries] = useState<
    Record<string, "present" | "absent" | "late">
  >({});

  const [staffForm, setStaffForm] = useState({
    name: "",
    role: "teacher",
    department: "",
    phone: "",
    email: "",
    address: "",
    joinDate: "",
    salary: "",
  });

  const getStaffName = (id: string) =>
    staff.find((s) => s.id === id)?.name ?? id;

  const openAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      name: "",
      role: "teacher",
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
      setStaff((p) => [
        ...p,
        {
          id: `st${Date.now()}`,
          schoolId: currentSchoolId,
          isActive: true,
          ...staffForm,
          salary: Number(staffForm.salary),
        },
      ]);
    }
    setShowModal(null);
  };

  const saveAttendance = () => {
    const newEntries = Object.entries(attEntries).map(([staffId, status]) => ({
      id: `sa${Date.now()}_${staffId}`,
      schoolId: currentSchoolId,
      staffId,
      date: attDate,
      status,
    }));
    setAttendance((p) => [
      ...p.filter((a) => a.date !== attDate),
      ...newEntries,
    ]);
    alert("Attendance saved!");
  };

  const generatePayroll = () => {
    const month = 3;
    const year = 2026;
    const generated: Payroll[] = staff.map((s) => ({
      id: `pr${Date.now()}_${s.id}`,
      schoolId: currentSchoolId,
      staffId: s.id,
      month,
      year,
      basicSalary: s.salary,
      allowances: Math.round(s.salary * 0.1),
      deductions: Math.round(s.salary * 0.05),
      netSalary: Math.round(s.salary * 1.05),
      paymentDate: `${year}-${String(month).padStart(2, "0")}-31`,
      status: "pending",
    }));
    setPayrolls(generated);
    alert("Payroll generated!");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Human Resource</h2>
      <Tabs defaultValue="directory">
        <TabsList className="flex-wrap" data-ocid="hr.tabs">
          <TabsTrigger value="directory" data-ocid="hr.directory.tab">
            Staff Directory
          </TabsTrigger>
          <TabsTrigger value="attendance" data-ocid="hr.attendance.tab">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="payroll" data-ocid="hr.payroll.tab">
            Payroll
          </TabsTrigger>
        </TabsList>

        {/* Staff Directory */}
        <TabsContent value="directory" className="space-y-3">
          <div className="flex justify-end">
            <Button onClick={openAddStaff} data-ocid="staff.add_button">
              <Plus size={16} className="mr-1" /> Add Staff
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="staff.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((s, i) => (
                    <TableRow key={s.id} data-ocid={`staff.item.${i + 1}`}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {s.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{s.department}</TableCell>
                      <TableCell>{s.phone}</TableCell>
                      <TableCell>${s.salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? "default" : "secondary"}>
                          {s.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-1">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Attendance */}
        <TabsContent value="attendance" className="space-y-3">
          <div className="flex items-center gap-3">
            <Label>Date:</Label>
            <Input
              type="date"
              value={attDate}
              onChange={(e) => setAttDate(e.target.value)}
              className="w-40"
              data-ocid="hr.attendance.date.input"
            />
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((s, i) => {
                    const existing = attendance.find(
                      (a) => a.staffId === s.id && a.date === attDate,
                    );
                    const val = attEntries[s.id] ?? existing?.status;
                    return (
                      <TableRow
                        key={s.id}
                        data-ocid={`hr.attendance.item.${i + 1}`}
                      >
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.department}</TableCell>
                        {(["present", "absent", "late"] as const).map((st) => (
                          <TableCell key={st}>
                            <input
                              type="radio"
                              name={`staffatt_${s.id}`}
                              checked={val === st}
                              onChange={() =>
                                setAttEntries((p) => ({ ...p, [s.id]: st }))
                              }
                              data-ocid={`hr.attendance.${st}.radio.${i + 1}`}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Button
                className="mt-3"
                onClick={saveAttendance}
                data-ocid="hr.attendance.save_button"
              >
                Save Attendance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll */}
        <TabsContent value="payroll" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={generatePayroll}
              data-ocid="payroll.generate_button"
            >
              Generate Payroll (Mar 2026)
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="payroll.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Basic</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map((p, i) => (
                    <TableRow key={p.id} data-ocid={`payroll.item.${i + 1}`}>
                      <TableCell className="font-medium">
                        {getStaffName(p.staffId)}
                      </TableCell>
                      <TableCell>${p.basicSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">
                        +${p.allowances}
                      </TableCell>
                      <TableCell className="text-red-600">
                        -${p.deductions}
                      </TableCell>
                      <TableCell className="font-bold">
                        ${p.netSalary.toLocaleString()}
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
                                x.id === p.id ? { ...x, status: "paid" } : x,
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
      </Tabs>

      {/* Staff Modal */}
      <Dialog
        open={showModal === "staff"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent className="max-w-lg" data-ocid="staff.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Edit Staff" : "Add Staff"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["name", "Full Name", "text"],
                ["department", "Department", "text"],
                ["phone", "Phone", "text"],
                ["email", "Email", "email"],
                ["joinDate", "Join Date", "date"],
                ["salary", "Salary ($)", "number"],
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
    </div>
  );
}

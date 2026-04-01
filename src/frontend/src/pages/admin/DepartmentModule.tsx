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
import { Textarea } from "@/components/ui/textarea";
import { Building2, Edit, Plus, Trash2, Users } from "lucide-react";
import React, { useState } from "react";

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  hodId: string;
  facultyIds: string[];
}

interface StaffMember {
  id: string;
  name: string;
  designation: string;
}

const SAMPLE_STAFF: StaffMember[] = [
  { id: "s1", name: "Dr. Ramesh Kumar Sinha", designation: "Professor" },
  { id: "s2", name: "Dr. Priya Kumari", designation: "Associate Professor" },
  { id: "s3", name: "Mr. Suresh Oraon", designation: "Assistant Professor" },
  { id: "s4", name: "Mrs. Sunita Devi", designation: "Assistant Professor" },
  { id: "s5", name: "Dr. Manoj Tirkey", designation: "Senior Lecturer" },
  { id: "s6", name: "Ms. Pooja Minz", designation: "Lecturer" },
];

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: "d1",
    name: "Education",
    code: "EDU",
    description:
      "Department of Teacher Education covering B.Ed and D.El.Ed programs",
    hodId: "s1",
    facultyIds: ["s1", "s2", "s3"],
  },
  {
    id: "d2",
    name: "Science & Technology",
    code: "SCI",
    description:
      "Department covering Mathematics, Physics, Chemistry, and Biology pedagogy",
    hodId: "s2",
    facultyIds: ["s2", "s4"],
  },
  {
    id: "d3",
    name: "Social Sciences",
    code: "SOC",
    description:
      "Department covering History, Geography, Political Science and Economics education",
    hodId: "s5",
    facultyIds: ["s5", "s6"],
  },
];

const emptyForm = {
  name: "",
  code: "",
  description: "",
  hodId: "",
  facultyIds: [] as string[],
};

export default function DepartmentModule() {
  const [departments, setDepartments] =
    useState<Department[]>(INITIAL_DEPARTMENTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (d: Department) => {
    setEditId(d.id);
    setForm({
      name: d.name,
      code: d.code,
      description: d.description,
      hodId: d.hodId,
      facultyIds: d.facultyIds,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name || !form.code) return;
    if (editId) {
      setDepartments((prev) =>
        prev.map((d) => (d.id === editId ? { ...d, ...form } : d)),
      );
    } else {
      setDepartments((prev) => [...prev, { id: `d${Date.now()}`, ...form }]);
    }
    setDialogOpen(false);
  };

  const remove = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    if (detailId === id) setDetailId(null);
  };

  const toggleFaculty = (id: string) => {
    setForm((prev) => ({
      ...prev,
      facultyIds: prev.facultyIds.includes(id)
        ? prev.facultyIds.filter((f) => f !== id)
        : [...prev.facultyIds, id],
    }));
  };

  const getStaffName = (id: string) =>
    SAMPLE_STAFF.find((s) => s.id === id)?.name ?? id;
  const detailDept = departments.find((d) => d.id === detailId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Departments</h2>
          <p className="text-muted-foreground">
            Manage college departments, HODs and faculty assignments
          </p>
        </div>
        <Button onClick={openAdd} data-ocid="departments.add_button">
          <Plus size={16} className="mr-2" /> Add Department
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="departments.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>HOD</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                        data-ocid="departments.empty_state"
                      >
                        No departments added yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    departments.map((d, i) => (
                      <TableRow
                        key={d.id}
                        data-ocid={`departments.item.${i + 1}`}
                      >
                        <TableCell>
                          <button
                            type="button"
                            className="font-medium text-primary hover:underline"
                            onClick={() =>
                              setDetailId(d.id === detailId ? null : d.id)
                            }
                          >
                            {d.name}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{d.code}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {getStaffName(d.hodId)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users
                              size={14}
                              className="text-muted-foreground"
                            />
                            <span className="text-sm">
                              {d.facultyIds.length}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(d)}
                              data-ocid={`departments.edit_button.${i + 1}`}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => remove(d.id)}
                              data-ocid={`departments.delete_button.${i + 1}`}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {detailDept && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 size={16} /> {detailDept.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                  Description
                </div>
                <p className="text-sm">{detailDept.description}</p>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                  HOD
                </div>
                <p className="text-sm font-medium">
                  {getStaffName(detailDept.hodId)}
                </p>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                  Faculty ({detailDept.facultyIds.length})
                </div>
                <div className="space-y-1.5">
                  {detailDept.facultyIds.map((fid) => {
                    const staff = SAMPLE_STAFF.find((s) => s.id === fid);
                    return (
                      <div
                        key={fid}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm"
                      >
                        <Users size={12} className="text-muted-foreground" />
                        <div>
                          <div className="font-medium">{staff?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {staff?.designation}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="departments.dialog">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Department" : "Add Department"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Department Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Education"
                  data-ocid="departments.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Code *</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. EDU"
                  data-ocid="departments.code.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Brief description..."
                rows={2}
                data-ocid="departments.textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Head of Department (HOD)</Label>
              <Select
                value={form.hodId}
                onValueChange={(v) => setForm((p) => ({ ...p, hodId: v }))}
              >
                <SelectTrigger data-ocid="departments.hod.select">
                  <SelectValue placeholder="Select HOD" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_STAFF.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assign Faculty (select multiple)</Label>
              <div className="border rounded-lg p-3 space-y-1.5 max-h-40 overflow-y-auto">
                {SAMPLE_STAFF.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded px-1 py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={form.facultyIds.includes(s.id)}
                      onChange={() => toggleFaculty(s.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({s.designation})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="departments.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={save} data-ocid="departments.save_button">
              Save Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

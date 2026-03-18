import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import type { Staff } from "../../types";
import LibraryModule from "../librarian/LibraryModule";

export default function AdminLibraryModule() {
  const { staff: allStaff, currentSchoolId } = useApp();

  const [librarians, setLibrarians] = useState<Staff[]>(
    allStaff.filter(
      (s) => s.schoolId === currentSchoolId && s.role === "librarian",
    ),
  );

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Library",
    joinDate: "",
    salary: "",
    address: "",
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      department: "Library",
      joinDate: "",
      salary: "",
      address: "",
    });
    setShowModal(true);
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    setForm({
      name: s.name,
      email: s.email,
      phone: s.phone,
      department: s.department,
      joinDate: s.joinDate,
      salary: String(s.salary),
      address: s.address,
    });
    setShowModal(true);
  };

  const save = () => {
    if (editing) {
      setLibrarians((prev) =>
        prev.map((s) =>
          s.id === editing.id
            ? { ...s, ...form, salary: Number(form.salary) }
            : s,
        ),
      );
    } else {
      setLibrarians((prev) => [
        ...prev,
        {
          id: `lib${Date.now()}`,
          schoolId: currentSchoolId,
          role: "librarian",
          staffType: "non-teaching" as const,
          designation: "Librarian",
          qualification: "",
          qrCode: `STAFF_lib${Date.now()}`,
          isActive: true,
          ...form,
          salary: Number(form.salary),
        },
      ]);
    }
    setShowModal(false);
  };

  const remove = (id: string) =>
    setLibrarians((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Library Management</h2>

      <Tabs defaultValue="library">
        <TabsList data-ocid="admin.library.tabs">
          <TabsTrigger value="library" data-ocid="admin.library.module.tab">
            Library Module
          </TabsTrigger>
          <TabsTrigger
            value="librarians"
            data-ocid="admin.library.librarians.tab"
          >
            Manage Librarians
          </TabsTrigger>
        </TabsList>

        {/* Full Library Module — all features available to admin */}
        <TabsContent value="library">
          <LibraryModule />
        </TabsContent>

        {/* Librarian Management */}
        <TabsContent value="librarians" className="space-y-3">
          <div className="flex justify-end">
            <Button onClick={openAdd} data-ocid="librarian.add_button">
              <Plus size={16} className="mr-1" /> Add Librarian
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="librarian.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {librarians.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        No librarians added yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {librarians.map((s, i) => (
                    <TableRow key={s.id} data-ocid={`librarian.item.${i + 1}`}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.phone}</TableCell>
                      <TableCell>{s.department}</TableCell>
                      <TableCell>{s.joinDate}</TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? "default" : "secondary"}>
                          {s.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(s)}
                          data-ocid={`librarian.edit_button.${i + 1}`}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => remove(s.id)}
                          data-ocid={`librarian.delete_button.${i + 1}`}
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
      </Tabs>

      {/* Add / Edit Librarian Dialog */}
      <Dialog open={showModal} onOpenChange={(o) => !o && setShowModal(false)}>
        <DialogContent className="max-w-lg" data-ocid="librarian.dialog">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Librarian" : "Add Librarian"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["name", "Full Name", "text"],
                ["email", "Email", "email"],
                ["phone", "Phone", "text"],
                ["department", "Department", "text"],
                ["joinDate", "Join Date", "date"],
                ["salary", "Salary (₹)", "number"],
              ] as [keyof typeof form, string, string][]
            ).map(([field, label, type]) => (
              <div key={field} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  type={type}
                  value={form[field]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [field]: e.target.value }))
                  }
                  data-ocid={`librarian.${field}.input`}
                />
              </div>
            ))}
            <div className="col-span-2 space-y-1">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                data-ocid="librarian.address.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="librarian.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={save} data-ocid="librarian.save_button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

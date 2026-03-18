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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  DollarSign,
  Pencil,
  Plus,
  UserCog,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import Layout from "../../components/Layout";
import { useApp } from "../../contexts/AppContext";
import type { School } from "../../types";
import UserAccountsModule from "../admin/UserAccountsModule";

type Section = "dashboard" | "schools" | "settings" | "accounts";

export default function SuperadminDashboard() {
  const { schools: initialSchools } = useApp();
  const [section, setSection] = useState<Section>("dashboard");
  const [schools, setSchools] = useState(initialSchools);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const totalStudents = schools.reduce((a, s) => a + s.studentCount, 0);
  const totalStaff = schools.reduce((a, s) => a + s.staffCount, 0);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", address: "", phone: "", email: "" });
    setShowModal(true);
  };
  const openEdit = (s: School) => {
    setEditing(s);
    setForm({
      name: s.name,
      address: s.address,
      phone: s.phone,
      email: s.email,
    });
    setShowModal(true);
  };
  const handleSave = () => {
    if (editing) {
      setSchools((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, ...form } : s)),
      );
    } else {
      setSchools((prev) => [
        ...prev,
        {
          id: `s${Date.now()}`,
          ...form,
          isActive: true,
          studentCount: 0,
          staffCount: 0,
        },
      ]);
    }
    setShowModal(false);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Superadmin Dashboard</h2>
        <p className="text-muted-foreground">System-wide overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Schools",
            value: schools.length,
            icon: <Building2 size={20} />,
            color: "text-blue-600",
          },
          {
            label: "Total Students",
            value: totalStudents,
            icon: <Users size={20} />,
            color: "text-green-600",
          },
          {
            label: "Total Staff",
            value: totalStaff,
            icon: <UserCog size={20} />,
            color: "text-purple-600",
          },
          {
            label: "Active Schools",
            value: schools.filter((s) => s.isActive).length,
            icon: <DollarSign size={20} />,
            color: "text-amber-600",
          },
        ].map((stat) => (
          <Card key={stat.label} data-ocid={"superadmin.stat.card"}>
            <CardContent className="pt-4">
              <div className={`${stat.color} mb-2`}>{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <Table data-ocid="superadmin.schools.table">
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((s, i) => (
                <TableRow
                  key={s.id}
                  data-ocid={`superadmin.schools.item.${i + 1}`}
                >
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.studentCount}</TableCell>
                  <TableCell>{s.staffCount}</TableCell>
                  <TableCell>
                    <Badge variant={s.isActive ? "default" : "secondary"}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderSchools = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schools</h2>
        <Button onClick={openAdd} data-ocid="schools.add_button">
          <Plus size={16} className="mr-1" /> Add School
        </Button>
      </div>
      <Card>
        <CardContent className="pt-4">
          <Table data-ocid="schools.table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((s, i) => (
                <TableRow key={s.id} data-ocid={`schools.item.${i + 1}`}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.address}
                  </TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell>{s.studentCount}</TableCell>
                  <TableCell>
                    <Switch
                      checked={s.isActive}
                      onCheckedChange={(v) =>
                        setSchools((prev) =>
                          prev.map((x) =>
                            x.id === s.id ? { ...x, isActive: v } : x,
                          ),
                        )
                      }
                      data-ocid={`schools.status.switch.${i + 1}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(s)}
                      data-ocid={`schools.edit_button.${i + 1}`}
                    >
                      <Pencil size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <Layout
        activeSection={section}
        onSectionChange={(s) => setSection(s as Section)}
        schoolName="All Schools"
      >
        {section === "dashboard" && renderDashboard()}
        {section === "schools" && renderSchools()}
        {section === "accounts" && <UserAccountsModule />}
        {section === "settings" && (
          <div className="text-muted-foreground">
            System Settings coming soon.
          </div>
        )}
      </Layout>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent data-ocid="school.dialog">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit School" : "Add School"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(["name", "address", "phone", "email"] as const).map((f) => (
              <div key={f} className="space-y-1">
                <Label className="capitalize">{f}</Label>
                <Input
                  data-ocid={`school.${f}.input`}
                  value={form[f]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="school.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} data-ocid="school.save_button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

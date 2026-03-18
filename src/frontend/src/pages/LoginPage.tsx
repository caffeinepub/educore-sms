import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useApp } from "../contexts/AppContext";
import type { AppRole } from "../types";

const roles: { value: AppRole; label: string; desc: string }[] = [
  { value: "superadmin", label: "Super Admin", desc: "Manage all schools" },
  { value: "admin", label: "Admin", desc: "School administrator" },
  { value: "teacher", label: "Teacher", desc: "Manage classes & marks" },
  { value: "accountant", label: "Accountant", desc: "Manage fees & accounts" },
  { value: "librarian", label: "Librarian", desc: "Manage library" },
  { value: "student", label: "Student", desc: "View personal records" },
  { value: "parent", label: "Parent", desc: "View child's records" },
];

export default function LoginPage() {
  const { setUserProfile } = useApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState<AppRole | "">("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setUserProfile({
      name: name.trim(),
      role: role as AppRole,
      schoolId: "s1",
      staffId: role === "teacher" ? "st1" : undefined,
      studentId: role === "student" ? "stu1" : undefined,
      childrenIds: role === "parent" ? ["stu1", "stu2"] : [],
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/30 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Branding */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
              <GraduationCap size={30} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                EduCore SMS
              </h1>
              <p className="text-muted-foreground">School Management System</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              "Multi-school management with isolated data",
              "Role-based dashboards for every stakeholder",
              "5 core modules: Students, Academics, Fees, Exams & HR",
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{f}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: "3", l: "Schools" },
              { n: "420+", l: "Students" },
              { n: "7", l: "Roles" },
            ].map((s) => (
              <div
                key={s.l}
                className="bg-card rounded-xl p-3 border border-border text-center"
              >
                <div className="text-2xl font-bold text-primary">{s.n}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-border">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 md:hidden mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap size={18} className="text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">EduCore SMS</span>
            </div>
            <CardTitle className="text-xl">Demo Login</CardTitle>
            <CardDescription>
              Select a role to explore the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  data-ocid="login.name.input"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as AppRole)}
                >
                  <SelectTrigger data-ocid="login.role.select">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        <div>
                          <div className="font-medium">{r.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.desc}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!name.trim() || !role || loading}
                data-ocid="login.submit_button"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

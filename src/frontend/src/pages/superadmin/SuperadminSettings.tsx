import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "educore_system_settings";

const SESSION_OPTIONS = ["2023-25", "2024-26", "2025-27", "2026-28", "2027-29"];

const THEME_PRESETS = [
  { name: "Blue", primary: "0.45 0.18 260", hex: "#3b5bdb" },
  { name: "Purple", primary: "0.5 0.2 300", hex: "#7c3aed" },
  { name: "Green", primary: "0.5 0.18 145", hex: "#16a34a" },
  { name: "Amber", primary: "0.65 0.18 70", hex: "#d97706" },
  { name: "Rose", primary: "0.55 0.22 15", hex: "#e11d48" },
];

interface ModuleConfig {
  key: string;
  label: string;
  description: string;
  planned?: boolean;
}

const MODULES: ModuleConfig[] = [
  {
    key: "communication",
    label: "Communication",
    description: "School-wide notices, class/section two-way messaging.",
  },
  {
    key: "library",
    label: "Library",
    description: "Book catalog, issue/return, fines, QR barcodes, and reports.",
  },
  {
    key: "student",
    label: "Student Info",
    description: "Student profiles, attendance, fees, exams, and ID cards.",
  },
  {
    key: "frontoffice",
    label: "Front Office",
    description: "Visitor log, phone call log, complaints, and enquiries.",
  },
  {
    key: "hr",
    label: "HR / Staff",
    description: "Staff management, QR attendance, leave, and payroll.",
  },
  {
    key: "examination",
    label: "Examination",
    description:
      "Exam scheduling, marks entry, grade sheets, and report cards.",
  },
  {
    key: "fees",
    label: "Fees Collection",
    description: "Fee structures, collection tracking, receipts, and dues.",
  },
  {
    key: "transport",
    label: "Transport",
    description: "Routes, vehicles, student assignment, and driver info.",
    planned: true,
  },
  {
    key: "hostel",
    label: "Hostel",
    description: "Room allocation, hostel fees, and resident management.",
    planned: true,
  },
];

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSection(key: string, value: unknown) {
  try {
    const existing = loadSettings();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...existing, [key]: value }),
    );
  } catch {
    /* ignore */
  }
}

export default function SuperadminSettings() {
  const saved = loadSettings();

  // General
  const [general, setGeneral] = useState({
    systemName: saved.general?.systemName ?? "EduCore SMS",
    tagline: saved.general?.tagline ?? "",
    address: saved.general?.address ?? "",
    phone: saved.general?.phone ?? "",
    email: saved.general?.email ?? "",
    website: saved.general?.website ?? "",
  });

  // Academic
  const [currentSession, setCurrentSession] = useState<string>(
    saved.academic?.currentSession ?? "2026-28",
  );
  const [sessions, setSessions] = useState<string[]>(
    saved.academic?.sessions ?? [...SESSION_OPTIONS],
  );
  const [newSession, setNewSession] = useState("");
  const [courses, setCourses] = useState<string[]>(
    saved.academic?.courses ?? ["B.Ed", "D.El.Ed"],
  );
  const [newCourse, setNewCourse] = useState("");

  // Modules
  const defaultModules = Object.fromEntries(
    MODULES.map((m) => [m.key, !m.planned]),
  );
  const [moduleEnabled, setModuleEnabled] = useState<Record<string, boolean>>(
    saved.modules ?? defaultModules,
  );

  // Security
  const [security, setSecurity] = useState({
    defaultPassword: saved.security?.defaultPassword ?? "Welcome@123",
    minLength: saved.security?.minLength ?? 8,
    forceChange: saved.security?.forceChange ?? true,
    maxAttempts: saved.security?.maxAttempts ?? 5,
  });

  // Appearance
  const [appearance, setAppearance] = useState({
    logoUrl: saved.appearance?.logoUrl ?? "",
    theme: saved.appearance?.theme ?? "Blue",
  });

  const handleSaveGeneral = () => {
    saveSection("general", general);
    toast.success("General settings saved.");
  };

  const handleSaveAcademic = () => {
    saveSection("academic", { currentSession, sessions, courses });
    toast.success("Academic settings saved.");
  };

  const handleSaveModules = () => {
    saveSection("modules", moduleEnabled);
    toast.success("Module settings saved.");
  };

  const handleSaveSecurity = () => {
    saveSection("security", security);
    toast.success("Security settings saved.");
  };

  const handleSaveAppearance = () => {
    saveSection("appearance", appearance);
    // Apply theme token
    const preset = THEME_PRESETS.find((t) => t.name === appearance.theme);
    if (preset) {
      document.documentElement.style.setProperty("--primary", preset.primary);
      document.documentElement.style.setProperty("--ring", preset.primary);
    }
    toast.success("Appearance settings saved.");
  };

  const addSession = () => {
    const v = newSession.trim();
    if (v && !sessions.includes(v)) {
      setSessions((p) => [...p, v]);
      setNewSession("");
    }
  };

  const addCourse = () => {
    const v = newCourse.trim();
    if (v && !courses.includes(v)) {
      setCourses((p) => [...p, v]);
      setNewCourse("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground text-sm">
          Configure system-wide settings for EduCore SMS.
        </p>
      </div>

      <Tabs defaultValue="general" data-ocid="settings.tab">
        <TabsList className="flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="general" data-ocid="settings.general.tab">
            General
          </TabsTrigger>
          <TabsTrigger value="academic" data-ocid="settings.academic.tab">
            Academic
          </TabsTrigger>
          <TabsTrigger value="modules" data-ocid="settings.modules.tab">
            Modules
          </TabsTrigger>
          <TabsTrigger value="security" data-ocid="settings.security.tab">
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" data-ocid="settings.appearance.tab">
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Institution Information</CardTitle>
              <CardDescription>
                Basic details about your institution shown across the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    data-ocid="settings.system_name.input"
                    value={general.systemName}
                    onChange={(e) =>
                      setGeneral((p) => ({ ...p, systemName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tagline">Institution Tagline</Label>
                  <Input
                    id="tagline"
                    data-ocid="settings.tagline.input"
                    placeholder="Excellence in Education"
                    value={general.tagline}
                    onChange={(e) =>
                      setGeneral((p) => ({ ...p, tagline: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  data-ocid="settings.address.textarea"
                  rows={3}
                  placeholder="Full institution address"
                  value={general.address}
                  onChange={(e) =>
                    setGeneral((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    data-ocid="settings.phone.input"
                    placeholder="+91 XXXXXXXXXX"
                    value={general.phone}
                    onChange={(e) =>
                      setGeneral((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    data-ocid="settings.email.input"
                    type="email"
                    placeholder="admin@institution.edu"
                    value={general.email}
                    onChange={(e) =>
                      setGeneral((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    data-ocid="settings.website.input"
                    placeholder="https://institution.edu"
                    value={general.website}
                    onChange={(e) =>
                      setGeneral((p) => ({ ...p, website: e.target.value }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button
              onClick={handleSaveGeneral}
              data-ocid="settings.general.save_button"
            >
              Save General Settings
            </Button>
          </div>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Academic Session</CardTitle>
              <CardDescription>
                Sets the default session for new students and reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <Label>Active Session / Academic Year</Label>
                <Select
                  value={currentSession}
                  onValueChange={setCurrentSession}
                >
                  <SelectTrigger
                    className="mt-1.5"
                    data-ocid="settings.current_session.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Sessions</CardTitle>
              <CardDescription>
                Add or remove academic session options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. 2028-30"
                  value={newSession}
                  data-ocid="settings.new_session.input"
                  onChange={(e) => setNewSession(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSession()}
                />
                <Button
                  variant="outline"
                  onClick={addSession}
                  data-ocid="settings.add_session.button"
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="space-y-2">
                {sessions.map((s, i) => (
                  <div
                    key={s}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    data-ocid={`settings.session.item.${i + 1}`}
                  >
                    <span className="text-sm font-medium">{s}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive h-7 w-7 p-0"
                      data-ocid={`settings.session.delete_button.${i + 1}`}
                      onClick={() =>
                        setSessions((p) => p.filter((x) => x !== s))
                      }
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Courses</CardTitle>
              <CardDescription>
                Courses available for student enrollment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. M.Ed"
                  value={newCourse}
                  data-ocid="settings.new_course.input"
                  onChange={(e) => setNewCourse(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCourse()}
                />
                <Button
                  variant="outline"
                  onClick={addCourse}
                  data-ocid="settings.add_course.button"
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="space-y-2">
                {courses.map((c, i) => (
                  <div
                    key={c}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    data-ocid={`settings.course.item.${i + 1}`}
                  >
                    <span className="text-sm font-medium">{c}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive h-7 w-7 p-0"
                      data-ocid={`settings.course.delete_button.${i + 1}`}
                      onClick={() =>
                        setCourses((p) => p.filter((x) => x !== c))
                      }
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveAcademic}
              data-ocid="settings.academic.save_button"
            >
              Save Academic Settings
            </Button>
          </div>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Management</CardTitle>
              <CardDescription>
                Enable or disable modules system-wide. Disabled modules are
                hidden from all users.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {MODULES.map((mod, i) => (
                <div
                  key={mod.key}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  data-ocid={`settings.module.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm">{mod.label}</span>
                      {mod.planned && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          data-ocid={`settings.module.planned.${i + 1}`}
                        >
                          Planned
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {mod.description}
                    </p>
                  </div>
                  <Switch
                    checked={moduleEnabled[mod.key] ?? false}
                    onCheckedChange={(v) =>
                      setModuleEnabled((p) => ({ ...p, [mod.key]: v }))
                    }
                    disabled={mod.planned}
                    data-ocid={`settings.module.switch.${i + 1}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button
              onClick={handleSaveModules}
              data-ocid="settings.modules.save_button"
            >
              Save Module Settings
            </Button>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>
                Controls default credentials and login behaviour for all users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="defaultPassword">Default Password</Label>
                  <Input
                    id="defaultPassword"
                    data-ocid="settings.default_password.input"
                    value={security.defaultPassword}
                    onChange={(e) =>
                      setSecurity((p) => ({
                        ...p,
                        defaultPassword: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Assigned when Admin creates any new user account.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="minLength">Minimum Password Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    data-ocid="settings.min_password_length.input"
                    min={4}
                    max={32}
                    value={security.minLength}
                    onChange={(e) =>
                      setSecurity((p) => ({
                        ...p,
                        minLength: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    Force Password Change on First Login
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Users must update their password when logging in for the
                    first time.
                  </p>
                </div>
                <Switch
                  checked={security.forceChange}
                  onCheckedChange={(v) =>
                    setSecurity((p) => ({ ...p, forceChange: v }))
                  }
                  data-ocid="settings.force_password_change.switch"
                />
              </div>

              <div className="space-y-1.5 max-w-xs">
                <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  data-ocid="settings.max_login_attempts.input"
                  min={0}
                  max={20}
                  value={security.maxAttempts}
                  onChange={(e) =>
                    setSecurity((p) => ({
                      ...p,
                      maxAttempts: Number(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Number of failed attempts before lockout. Set to 0 for
                  unlimited.
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSecurity}
              data-ocid="settings.security.save_button"
            >
              Save Security Settings
            </Button>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Institution Logo</CardTitle>
              <CardDescription>
                Paste a URL to display your institution logo in headers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  data-ocid="settings.logo_url.input"
                  placeholder="https://institution.edu/logo.png"
                  value={appearance.logoUrl}
                  onChange={(e) =>
                    setAppearance((p) => ({ ...p, logoUrl: e.target.value }))
                  }
                />
              </div>
              {appearance.logoUrl && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Preview</p>
                  <img
                    src={appearance.logoUrl}
                    alt="Institution logo preview"
                    className="h-16 w-auto rounded-md border border-border object-contain"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Primary Theme Color</CardTitle>
              <CardDescription>
                Choose a brand color applied across the interface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    data-ocid={`settings.theme.${preset.name.toLowerCase()}.toggle`}
                    onClick={() =>
                      setAppearance((p) => ({ ...p, theme: preset.name }))
                    }
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className="h-10 w-10 rounded-full border-2 transition-all duration-150 flex items-center justify-center"
                      style={{
                        backgroundColor: preset.hex,
                        borderColor:
                          appearance.theme === preset.name
                            ? preset.hex
                            : "transparent",
                        boxShadow:
                          appearance.theme === preset.name
                            ? `0 0 0 3px ${preset.hex}40`
                            : "none",
                      }}
                    >
                      {appearance.theme === preset.name && (
                        <Check size={16} className="text-white" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveAppearance}
              data-ocid="settings.appearance.save_button"
            >
              Save Appearance
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

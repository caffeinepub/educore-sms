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
import { CheckCircle, ExternalLink, Plus, Upload, XCircle } from "lucide-react";
import React, { useRef, useState } from "react";

interface Applicant {
  id: string;
  jcecebRegNo: string;
  cmlRank: number;
  name: string;
  fatherName: string;
  category: string;
  programApplied: string;
  status: "Pending" | "Confirmed" | "Rejected";
  studentId?: string;
}

const PROGRAMS = ["B.Ed", "D.El.Ed", "M.Ed"];
const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];

const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: "a1",
    jcecebRegNo: "JCECEB2024001",
    cmlRank: 45,
    name: "Anjali Kumari",
    fatherName: "Rajesh Kumar",
    category: "OBC",
    programApplied: "B.Ed",
    status: "Confirmed",
    studentId: "STU2024001",
  },
  {
    id: "a2",
    jcecebRegNo: "JCECEB2024002",
    cmlRank: 78,
    name: "Ravi Shankar Prasad",
    fatherName: "Mohan Prasad",
    category: "General",
    programApplied: "B.Ed",
    status: "Confirmed",
    studentId: "STU2024002",
  },
  {
    id: "a3",
    jcecebRegNo: "JCECEB2024003",
    cmlRank: 112,
    name: "Meena Devi",
    fatherName: "Shyam Lal",
    category: "SC",
    programApplied: "D.El.Ed",
    status: "Confirmed",
    studentId: "STU2024003",
  },
  {
    id: "a4",
    jcecebRegNo: "JCECEB2024004",
    cmlRank: 150,
    name: "Sunil Oraon",
    fatherName: "Birsa Oraon",
    category: "ST",
    programApplied: "B.Ed",
    status: "Pending",
  },
  {
    id: "a5",
    jcecebRegNo: "JCECEB2024005",
    cmlRank: 210,
    name: "Priya Minz",
    fatherName: "David Minz",
    category: "ST",
    programApplied: "D.El.Ed",
    status: "Pending",
  },
  {
    id: "a6",
    jcecebRegNo: "JCECEB2024006",
    cmlRank: 320,
    name: "Deepak Kumar",
    fatherName: "Binod Kumar",
    category: "General",
    programApplied: "B.Ed",
    status: "Rejected",
  },
];

const SEAT_DATA: { program: string; totalSeats: number }[] = [
  { program: "B.Ed", totalSeats: 100 },
  { program: "D.El.Ed", totalSeats: 50 },
  { program: "M.Ed", totalSeats: 30 },
];

const emptyForm = {
  jcecebRegNo: "",
  cmlRank: 0,
  name: "",
  fatherName: "",
  category: "General",
  programApplied: "B.Ed",
};

export default function AdmissionsModule() {
  const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_APPLICANTS);
  const [addDialog, setAddDialog] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);

  const confirm = (id: string) => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "Confirmed", studentId: `STU${Date.now()}` }
          : a,
      ),
    );
  };

  const reject = (id: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Rejected" } : a)),
    );
  };

  const saveApplicant = () => {
    if (!form.name || !form.jcecebRegNo) return;
    setApplicants((prev) => [
      ...prev,
      { id: `a${Date.now()}`, ...form, status: "Pending" },
    ]);
    setAddDialog(false);
    setForm(emptyForm);
  };

  const pendingApplicants = applicants.filter((a) => a.status === "Pending");
  const confirmedApplicants = applicants.filter(
    (a) => a.status === "Confirmed",
  );

  const seatAvailability = SEAT_DATA.map((s) => {
    const confirmed = applicants.filter(
      (a) => a.programApplied === s.program && a.status === "Confirmed",
    ).length;
    return {
      ...s,
      confirmed,
      remaining: Math.max(0, s.totalSeats - confirmed),
    };
  });

  const statusVariant = (status: string) => {
    if (status === "Confirmed") return "default" as const;
    if (status === "Rejected") return "destructive" as const;
    return "secondary" as const;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admissions</h2>
        <p className="text-muted-foreground">
          Manage merit list, confirm admissions, and track seat availability
        </p>
      </div>

      <Tabs defaultValue="merit">
        <TabsList data-ocid="admissions.tab">
          <TabsTrigger value="merit" data-ocid="admissions.merit.tab">
            Merit List
          </TabsTrigger>
          <TabsTrigger value="confirmed" data-ocid="admissions.confirmed.tab">
            Confirm Admissions
          </TabsTrigger>
          <TabsTrigger value="seats" data-ocid="admissions.seats.tab">
            Seat Availability
          </TabsTrigger>
        </TabsList>

        {/* MERIT LIST TAB */}
        <TabsContent value="merit" className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setForm(emptyForm);
                setAddDialog(true);
              }}
              data-ocid="admissions.merit.add_button"
            >
              <Plus size={16} className="mr-2" /> Add Applicant
            </Button>
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              data-ocid="admissions.merit.upload_button"
            >
              <Upload size={16} className="mr-2" /> Bulk Import CSV
            </Button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" />
            <div className="ml-auto text-sm text-muted-foreground">
              {applicants.length} applicants · {pendingApplicants.length}{" "}
              pending
            </div>
          </div>
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <Table data-ocid="admissions.merit.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>JCECEB Reg No</TableHead>
                    <TableHead>CML Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Father's Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                        data-ocid="admissions.merit.empty_state"
                      >
                        No applicants added yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    applicants.map((a, i) => (
                      <TableRow
                        key={a.id}
                        data-ocid={`admissions.merit.item.${i + 1}`}
                      >
                        <TableCell className="text-sm font-mono">
                          {a.jcecebRegNo}
                        </TableCell>
                        <TableCell className="font-bold">{a.cmlRank}</TableCell>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell className="text-sm">
                          {a.fatherName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{a.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{a.programApplied}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(a.status)}>
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {a.status === "Pending" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => confirm(a.id)}
                                className="bg-green-600 hover:bg-green-700"
                                data-ocid={`admissions.merit.confirm_button.${i + 1}`}
                              >
                                <CheckCircle size={13} className="mr-1" />{" "}
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => reject(a.id)}
                                data-ocid={`admissions.merit.delete_button.${i + 1}`}
                              >
                                <XCircle size={13} />
                              </Button>
                            </div>
                          )}
                          {a.status !== "Pending" && (
                            <span className="text-xs text-muted-foreground">
                              {a.status}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONFIRMED TAB */}
        <TabsContent value="confirmed" className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {confirmedApplicants.length} confirmed admissions · Student records
            auto-created on confirmation
          </div>
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <Table data-ocid="admissions.confirmed.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>JCECEB Reg No</TableHead>
                    <TableHead>CML Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Student ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {confirmedApplicants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                        data-ocid="admissions.confirmed.empty_state"
                      >
                        No confirmed admissions yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    confirmedApplicants.map((a, i) => (
                      <TableRow
                        key={a.id}
                        data-ocid={`admissions.confirmed.item.${i + 1}`}
                      >
                        <TableCell className="text-sm font-mono">
                          {a.jcecebRegNo}
                        </TableCell>
                        <TableCell className="font-bold">{a.cmlRank}</TableCell>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{a.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{a.programApplied}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge className="font-mono text-xs">
                              {a.studentId}
                            </Badge>
                            <ExternalLink
                              size={13}
                              className="text-muted-foreground"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEAT AVAILABILITY TAB */}
        <TabsContent value="seats" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {seatAvailability.map((s, i) => (
              <Card
                key={s.program}
                data-ocid={`admissions.seats.item.${i + 1}`}
              >
                <CardHeader>
                  <CardTitle className="text-base">{s.program}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Seats</span>
                      <span className="font-bold">{s.totalSeats}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confirmed</span>
                      <span className="font-bold text-green-600">
                        {s.confirmed}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span
                        className={`font-bold ${s.remaining === 0 ? "text-red-600" : "text-blue-600"}`}
                      >
                        {s.remaining}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (s.confirmed / s.totalSeats) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {Math.round((s.confirmed / s.totalSeats) * 100)}% filled
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="admissions.seats.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Total Seats</TableHead>
                    <TableHead>Confirmed</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Fill Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seatAvailability.map((s, i) => (
                    <TableRow
                      key={s.program}
                      data-ocid={`admissions.seats.row.${i + 1}`}
                    >
                      <TableCell className="font-medium">{s.program}</TableCell>
                      <TableCell>{s.totalSeats}</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-semibold">
                          {s.confirmed}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            s.remaining === 0
                              ? "text-red-600 font-semibold"
                              : "text-blue-600 font-semibold"
                          }
                        >
                          {s.remaining}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            s.remaining === 0 ? "destructive" : "secondary"
                          }
                        >
                          {Math.round((s.confirmed / s.totalSeats) * 100)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Applicant Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-lg" data-ocid="admissions.merit.dialog">
          <DialogHeader>
            <DialogTitle>Add Applicant from Merit List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>JCECEB Reg No *</Label>
                <Input
                  value={form.jcecebRegNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, jcecebRegNo: e.target.value }))
                  }
                  placeholder="JCECEB2024XXX"
                  data-ocid="admissions.merit.regno.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>CML Rank</Label>
                <Input
                  type="number"
                  value={form.cmlRank || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cmlRank: Number(e.target.value) }))
                  }
                  placeholder="e.g. 150"
                  data-ocid="admissions.merit.rank.input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Applicant Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Full name"
                  data-ocid="admissions.merit.name.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Father's Name</Label>
                <Input
                  value={form.fatherName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fatherName: e.target.value }))
                  }
                  placeholder="Father's full name"
                  data-ocid="admissions.merit.fathername.input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger data-ocid="admissions.merit.category.select">
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
              <div className="space-y-1.5">
                <Label>Program Applied</Label>
                <Select
                  value={form.programApplied}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, programApplied: v }))
                  }
                >
                  <SelectTrigger data-ocid="admissions.merit.program.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialog(false)}
              data-ocid="admissions.merit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveApplicant}
              data-ocid="admissions.merit.submit_button"
            >
              Add to Merit List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

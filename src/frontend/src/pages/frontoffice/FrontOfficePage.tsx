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
  Building2,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../contexts/AppContext";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  personToMeet: string;
  checkIn: string;
  checkOut: string;
  status: "In" | "Out";
  date: string;
}

interface PhoneCall {
  id: string;
  callerName: string;
  phone: string;
  type: "Incoming" | "Outgoing";
  department: string;
  subject: string;
  dateTime: string;
  notes: string;
  addedBy: string;
}

interface Complaint {
  id: string;
  complainantName: string;
  phone: string;
  type: "Academic" | "Administrative" | "Facility" | "Staff" | "Other";
  description: string;
  date: string;
  status: "Pending" | "In-Progress" | "Resolved";
  resolutionNotes: string;
  submittedBy: string; // user name or role
}

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  course: "B.Ed" | "D.El.Ed" | "Other";
  source: "Walk-in" | "Phone" | "Website" | "Reference";
  date: string;
  status: "New" | "Followed-Up" | "Converted" | "Not Interested";
  notes: string;
  submittedBy: string;
}

interface FrontOfficeData {
  visitors: Visitor[];
  calls: PhoneCall[];
  complaints: Complaint[];
  enquiries: Enquiry[];
}

const STORAGE_KEY = "frontoffice_data";

const DEFAULT_DATA: FrontOfficeData = {
  visitors: [
    {
      id: "v1",
      name: "Ramesh Kumar",
      phone: "9876543210",
      purpose: "Admission Enquiry",
      personToMeet: "Principal",
      checkIn: "10:00 AM",
      checkOut: "11:00 AM",
      status: "Out",
      date: "2026-03-18",
    },
    {
      id: "v2",
      name: "Sunita Devi",
      phone: "9012345678",
      purpose: "Parent Meeting",
      personToMeet: "Class Teacher",
      checkIn: "02:00 PM",
      checkOut: "",
      status: "In",
      date: "2026-03-18",
    },
    {
      id: "v3",
      name: "Ajay Singh",
      phone: "8765432109",
      purpose: "Document Collection",
      personToMeet: "Admin Office",
      checkIn: "09:30 AM",
      checkOut: "09:50 AM",
      status: "Out",
      date: "2026-03-17",
    },
  ],
  calls: [
    {
      id: "c1",
      callerName: "Priya Sharma",
      phone: "9988776655",
      type: "Incoming",
      department: "Admission",
      subject: "Fee Structure Query",
      dateTime: "2026-03-18T10:30",
      notes: "Asked about B.Ed fee structure and scholarship.",
      addedBy: "Admin",
    },
    {
      id: "c2",
      callerName: "District Education Office",
      phone: "0651-2345678",
      type: "Outgoing",
      department: "Administration",
      subject: "Inspection Schedule",
      dateTime: "2026-03-17T14:00",
      notes: "Confirmed inspection date for March 25.",
      addedBy: "Admin",
    },
  ],
  complaints: [
    {
      id: "comp1",
      complainantName: "Arjun Mehta",
      phone: "9876500000",
      type: "Facility",
      description:
        "Drinking water cooler in Block B is not working since last week.",
      date: "2026-03-16",
      status: "In-Progress",
      resolutionNotes: "Plumber assigned, repair expected by March 20.",
      submittedBy: "student",
    },
    {
      id: "comp2",
      complainantName: "Meena Gupta",
      phone: "9123456789",
      type: "Academic",
      description:
        "Practical sessions for B.Ed batch have not started yet despite the semester being 2 months in.",
      date: "2026-03-15",
      status: "Pending",
      resolutionNotes: "",
      submittedBy: "parent",
    },
  ],
  enquiries: [
    {
      id: "enq1",
      name: "Rahul Verma",
      phone: "9871234560",
      email: "rahul.verma@gmail.com",
      course: "B.Ed",
      source: "Walk-in",
      date: "2026-03-18",
      status: "New",
      notes:
        "Interested in 2026-28 session. Asked for JCECEB eligibility details.",
      submittedBy: "Admin",
    },
    {
      id: "enq2",
      name: "Kavita Rani",
      phone: "9654321087",
      email: "kavita.r@outlook.com",
      course: "D.El.Ed",
      source: "Phone",
      date: "2026-03-17",
      status: "Followed-Up",
      notes: "Sent fee details via WhatsApp. Will visit on Saturday.",
      submittedBy: "Admin",
    },
  ],
};

function loadData(): FrontOfficeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FrontOfficeData;
  } catch {}
  return DEFAULT_DATA;
}

function saveData(data: FrontOfficeData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Status Badges ───────────────────────────────────────────────────────────
function VisitorStatusBadge({ status }: { status: Visitor["status"] }) {
  return (
    <Badge
      className={
        status === "In"
          ? "bg-green-100 text-green-800 border-green-200"
          : "bg-gray-100 text-gray-700 border-gray-200"
      }
      variant="outline"
    >
      {status}
    </Badge>
  );
}

function ComplaintStatusBadge({ status }: { status: Complaint["status"] }) {
  const map: Record<Complaint["status"], string> = {
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    "In-Progress": "bg-blue-100 text-blue-800 border-blue-200",
    Resolved: "bg-green-100 text-green-800 border-green-200",
  };
  return (
    <Badge className={map[status]} variant="outline">
      {status}
    </Badge>
  );
}

function EnquiryStatusBadge({ status }: { status: Enquiry["status"] }) {
  const map: Record<Enquiry["status"], string> = {
    New: "bg-blue-100 text-blue-800 border-blue-200",
    "Followed-Up": "bg-amber-100 text-amber-800 border-amber-200",
    Converted: "bg-green-100 text-green-800 border-green-200",
    "Not Interested": "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <Badge className={map[status]} variant="outline">
      {status}
    </Badge>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FrontOfficePage() {
  const { userProfile } = useApp();
  const role = userProfile?.role ?? "student";
  const isAdmin = role === "admin" || role === "superadmin";
  const isTeacher = role === "teacher";
  const isStudentOrParent = role === "student" || role === "parent";

  const [data, setData] = useState<FrontOfficeData>(loadData);

  const updateData = (next: FrontOfficeData) => {
    setData(next);
    saveData(next);
  };

  // ── Visitors ──────────────────────────────────────────────────────────────
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorDialog, setVisitorDialog] = useState(false);
  const [editVisitor, setEditVisitor] = useState<Visitor | null>(null);
  const [vForm, setVForm] = useState<Partial<Visitor>>({});

  const filteredVisitors = data.visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.purpose.toLowerCase().includes(visitorSearch.toLowerCase()),
  );

  const openVisitorDialog = (v?: Visitor) => {
    setEditVisitor(v ?? null);
    setVForm(
      v ?? {
        status: "In",
        date: new Date().toISOString().split("T")[0],
        checkIn: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    );
    setVisitorDialog(true);
  };

  const saveVisitor = () => {
    if (!vForm.name || !vForm.phone || !vForm.purpose || !vForm.personToMeet) {
      toast.error("Please fill all required fields.");
      return;
    }
    const entry = { ...vForm, id: editVisitor?.id ?? genId() } as Visitor;
    const visitors = editVisitor
      ? data.visitors.map((v) => (v.id === editVisitor.id ? entry : v))
      : [entry, ...data.visitors];
    updateData({ ...data, visitors });
    setVisitorDialog(false);
    toast.success(editVisitor ? "Visitor updated." : "Visitor logged.");
  };

  const deleteVisitor = (id: string) => {
    updateData({ ...data, visitors: data.visitors.filter((v) => v.id !== id) });
    toast.success("Record deleted.");
  };

  // ── Phone Calls ──────────────────────────────────────────────────────────
  const [callFilter, setCallFilter] = useState<"All" | "Incoming" | "Outgoing">(
    "All",
  );
  const [callDialog, setCallDialog] = useState(false);
  const [cForm, setCForm] = useState<Partial<PhoneCall>>({});

  const filteredCalls = data.calls.filter(
    (c) => callFilter === "All" || c.type === callFilter,
  );

  const openCallDialog = () => {
    setCForm({
      type: "Incoming",
      dateTime: new Date().toISOString().slice(0, 16),
      addedBy: userProfile?.name ?? role,
    });
    setCallDialog(true);
  };

  const saveCall = () => {
    if (!cForm.callerName || !cForm.phone || !cForm.subject) {
      toast.error("Please fill all required fields.");
      return;
    }
    const entry = { ...cForm, id: genId() } as PhoneCall;
    updateData({ ...data, calls: [entry, ...data.calls] });
    setCallDialog(false);
    toast.success("Call logged.");
  };

  const deleteCall = (id: string) => {
    updateData({ ...data, calls: data.calls.filter((c) => c.id !== id) });
    toast.success("Record deleted.");
  };

  // ── Complaints ───────────────────────────────────────────────────────────
  const [complaintDialog, setComplaintDialog] = useState(false);
  const [resolveDialog, setResolveDialog] = useState<Complaint | null>(null);
  const [compForm, setCompForm] = useState<Partial<Complaint>>({});
  const [resolveNote, setResolveNote] = useState("");
  const [resolveStatus, setResolveStatus] =
    useState<Complaint["status"]>("Pending");

  const myComplaints = isStudentOrParent
    ? data.complaints.filter((c) => c.submittedBy === role)
    : data.complaints;

  const openComplaintDialog = () => {
    setCompForm({
      type: "Academic",
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      submittedBy: isStudentOrParent ? role : (userProfile?.name ?? role),
    });
    setComplaintDialog(true);
  };

  const saveComplaint = () => {
    if (!compForm.complainantName || !compForm.description) {
      toast.error("Please fill required fields.");
      return;
    }
    const entry = {
      ...compForm,
      id: genId(),
      resolutionNotes: "",
    } as Complaint;
    updateData({ ...data, complaints: [entry, ...data.complaints] });
    setComplaintDialog(false);
    toast.success("Complaint submitted.");
  };

  const openResolveDialog = (c: Complaint) => {
    setResolveDialog(c);
    setResolveNote(c.resolutionNotes);
    setResolveStatus(c.status);
  };

  const saveResolve = () => {
    if (!resolveDialog) return;
    const updated = data.complaints.map((c) =>
      c.id === resolveDialog.id
        ? { ...c, status: resolveStatus, resolutionNotes: resolveNote }
        : c,
    );
    updateData({ ...data, complaints: updated });
    setResolveDialog(null);
    toast.success("Complaint updated.");
  };

  const deleteComplaint = (id: string) => {
    updateData({
      ...data,
      complaints: data.complaints.filter((c) => c.id !== id),
    });
    toast.success("Complaint deleted.");
  };

  // ── Enquiries ────────────────────────────────────────────────────────────
  const [enquiryDialog, setEnquiryDialog] = useState(false);
  const [editEnquiry, setEditEnquiry] = useState<Enquiry | null>(null);
  const [enqForm, setEnqForm] = useState<Partial<Enquiry>>({});
  const [enqSearch, setEnqSearch] = useState("");

  const myEnquiries = isStudentOrParent
    ? data.enquiries.filter((e) => e.submittedBy === role)
    : data.enquiries.filter(
        (e) =>
          e.name.toLowerCase().includes(enqSearch.toLowerCase()) ||
          e.phone.includes(enqSearch),
      );

  const openEnquiryDialog = (e?: Enquiry) => {
    setEditEnquiry(e ?? null);
    setEnqForm(
      e ?? {
        course: "B.Ed",
        source: "Walk-in",
        date: new Date().toISOString().split("T")[0],
        status: "New",
        submittedBy: isStudentOrParent ? role : (userProfile?.name ?? role),
      },
    );
    setEnquiryDialog(true);
  };

  const saveEnquiry = () => {
    if (!enqForm.name || !enqForm.phone) {
      toast.error("Name and phone are required.");
      return;
    }
    const entry = { ...enqForm, id: editEnquiry?.id ?? genId() } as Enquiry;
    const enquiries = editEnquiry
      ? data.enquiries.map((e) => (e.id === editEnquiry.id ? entry : e))
      : [entry, ...data.enquiries];
    updateData({ ...data, enquiries });
    setEnquiryDialog(false);
    toast.success(editEnquiry ? "Enquiry updated." : "Enquiry submitted.");
  };

  const deleteEnquiry = (id: string) => {
    updateData({
      ...data,
      enquiries: data.enquiries.filter((e) => e.id !== id),
    });
    toast.success("Enquiry deleted.");
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  const defaultTab = isStudentOrParent ? "complaints" : "enquiries";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Building2 size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Front Office</h2>
          <p className="text-muted-foreground text-sm">
            {isStudentOrParent
              ? "Submit and track complaints & enquiries"
              : "Manage visitors, calls, complaints, and enquiries"}
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList
          className="w-full justify-start overflow-x-auto"
          data-ocid="frontoffice.tab"
        >
          {!isStudentOrParent && (
            <TabsTrigger
              value="enquiries"
              data-ocid="frontoffice.enquiries.tab"
            >
              Enquiries
            </TabsTrigger>
          )}
          {!isStudentOrParent && (
            <>
              <TabsTrigger
                value="visitors"
                data-ocid="frontoffice.visitors.tab"
              >
                Visitors
              </TabsTrigger>
              <TabsTrigger value="calls" data-ocid="frontoffice.calls.tab">
                Phone Calls
              </TabsTrigger>
            </>
          )}
          <TabsTrigger
            value="complaints"
            data-ocid="frontoffice.complaints.tab"
          >
            Complaints
          </TabsTrigger>
          {isStudentOrParent && (
            <TabsTrigger
              value="enquiries"
              data-ocid="frontoffice.enquiries.tab"
            >
              Enquiries
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── Visitors Tab ── */}
        {!isStudentOrParent && (
          <TabsContent value="visitors" className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  className="pl-9"
                  placeholder="Search visitors..."
                  value={visitorSearch}
                  onChange={(e) => setVisitorSearch(e.target.value)}
                  data-ocid="frontoffice.visitors.search_input"
                />
              </div>
              {isAdmin && (
                <Button
                  onClick={() => openVisitorDialog()}
                  data-ocid="frontoffice.visitors.primary_button"
                >
                  <Plus size={16} className="mr-1" /> Log Visitor
                </Button>
              )}
            </div>

            <Card>
              <CardContent className="pt-4 overflow-x-auto">
                <Table data-ocid="frontoffice.visitors.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>To Meet</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      {isAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitors.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center text-muted-foreground"
                          data-ocid="frontoffice.visitors.empty_state"
                        >
                          No visitor records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVisitors.map((v, i) => (
                        <TableRow
                          key={v.id}
                          data-ocid={`frontoffice.visitors.item.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            {v.name}
                          </TableCell>
                          <TableCell>{v.phone}</TableCell>
                          <TableCell>{v.purpose}</TableCell>
                          <TableCell>{v.personToMeet}</TableCell>
                          <TableCell>{v.checkIn}</TableCell>
                          <TableCell>{v.checkOut || "—"}</TableCell>
                          <TableCell>
                            <VisitorStatusBadge status={v.status} />
                          </TableCell>
                          <TableCell>{v.date}</TableCell>
                          {isAdmin && (
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openVisitorDialog(v)}
                                  data-ocid={`frontoffice.visitors.edit_button.${i + 1}`}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteVisitor(v.id)}
                                  data-ocid={`frontoffice.visitors.delete_button.${i + 1}`}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ── Phone Calls Tab ── */}
        {!isStudentOrParent && (
          <TabsContent value="calls" className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
              <div className="flex gap-2">
                {(["All", "Incoming", "Outgoing"] as const).map((f) => (
                  <Button
                    key={f}
                    variant={callFilter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCallFilter(f)}
                    data-ocid={`frontoffice.calls.filter.${f.toLowerCase()}.toggle`}
                  >
                    {f}
                  </Button>
                ))}
              </div>
              {(isAdmin || isTeacher) && (
                <Button
                  onClick={openCallDialog}
                  data-ocid="frontoffice.calls.primary_button"
                >
                  <Plus size={16} className="mr-1" /> Log Call
                </Button>
              )}
            </div>

            <Card>
              <CardContent className="pt-4 overflow-x-auto">
                <Table data-ocid="frontoffice.calls.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Caller</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Notes</TableHead>
                      {isAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCalls.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-muted-foreground"
                          data-ocid="frontoffice.calls.empty_state"
                        >
                          No call records.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCalls.map((c, i) => (
                        <TableRow
                          key={c.id}
                          data-ocid={`frontoffice.calls.item.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            {c.callerName}
                          </TableCell>
                          <TableCell>{c.phone}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                c.type === "Incoming"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-orange-50 text-orange-700 border-orange-200"
                              }
                            >
                              {c.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{c.department}</TableCell>
                          <TableCell>{c.subject}</TableCell>
                          <TableCell>{c.dateTime?.replace("T", " ")}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {c.notes}
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteCall(c.id)}
                                data-ocid={`frontoffice.calls.delete_button.${i + 1}`}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ── Complaints Tab ── */}
        <TabsContent value="complaints" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Complaints</h3>
              <p className="text-sm text-muted-foreground">
                {isStudentOrParent
                  ? "Submit a new complaint and track your submissions."
                  : "Manage all submitted complaints."}
              </p>
            </div>
            <Button
              onClick={openComplaintDialog}
              data-ocid="frontoffice.complaints.primary_button"
            >
              <Plus size={16} className="mr-1" /> New Complaint
            </Button>
          </div>

          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <Table data-ocid="frontoffice.complaints.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead>Resolution</TableHead>}
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                        data-ocid="frontoffice.complaints.empty_state"
                      >
                        No complaints found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    myComplaints.map((c, i) => (
                      <TableRow
                        key={c.id}
                        data-ocid={`frontoffice.complaints.item.${i + 1}`}
                      >
                        <TableCell className="font-medium">
                          {c.complainantName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{c.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <span className="text-sm line-clamp-2">
                            {c.description}
                          </span>
                        </TableCell>
                        <TableCell>{c.date}</TableCell>
                        <TableCell>
                          <ComplaintStatusBadge status={c.status} />
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="max-w-[180px]">
                            <span className="text-sm text-muted-foreground">
                              {c.resolutionNotes || "—"}
                            </span>
                          </TableCell>
                        )}
                        {isAdmin && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openResolveDialog(c)}
                                data-ocid={`frontoffice.complaints.edit_button.${i + 1}`}
                              >
                                <UserCheck size={14} className="mr-1" /> Update
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteComplaint(c.id)}
                                data-ocid={`frontoffice.complaints.delete_button.${i + 1}`}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Enquiries Tab ── */}
        <TabsContent value="enquiries" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            <div>
              <h3 className="font-semibold text-lg">Admission Enquiries</h3>
              <p className="text-sm text-muted-foreground">
                {isStudentOrParent
                  ? "Submit a new enquiry."
                  : "Track and manage all admission enquiries."}
              </p>
            </div>
            <div className="flex gap-2">
              {!isStudentOrParent && (
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    className="pl-9 w-52"
                    placeholder="Search enquiries..."
                    value={enqSearch}
                    onChange={(e) => setEnqSearch(e.target.value)}
                    data-ocid="frontoffice.enquiries.search_input"
                  />
                </div>
              )}
              <Button
                onClick={() => openEnquiryDialog()}
                data-ocid="frontoffice.enquiries.primary_button"
              >
                <Plus size={16} className="mr-1" /> New Enquiry
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <Table data-ocid="frontoffice.enquiries.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    {!isStudentOrParent && <TableHead>Email</TableHead>}
                    <TableHead>Course</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myEnquiries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                        data-ocid="frontoffice.enquiries.empty_state"
                      >
                        No enquiries found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    myEnquiries.map((e, i) => (
                      <TableRow
                        key={e.id}
                        data-ocid={`frontoffice.enquiries.item.${i + 1}`}
                      >
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell>{e.phone}</TableCell>
                        {!isStudentOrParent && <TableCell>{e.email}</TableCell>}
                        <TableCell>{e.course}</TableCell>
                        <TableCell>{e.source}</TableCell>
                        <TableCell>{e.date}</TableCell>
                        <TableCell>
                          <EnquiryStatusBadge status={e.status} />
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEnquiryDialog(e)}
                                data-ocid={`frontoffice.enquiries.edit_button.${i + 1}`}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteEnquiry(e.id)}
                                data-ocid={`frontoffice.enquiries.delete_button.${i + 1}`}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Visitor Dialog ── */}
      <Dialog open={visitorDialog} onOpenChange={setVisitorDialog}>
        <DialogContent
          className="max-w-lg"
          data-ocid="frontoffice.visitors.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editVisitor ? "Edit Visitor" : "Log Visitor"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                value={vForm.name ?? ""}
                onChange={(e) =>
                  setVForm((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="frontoffice.visitors.name.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone *</Label>
              <Input
                value={vForm.phone ?? ""}
                onChange={(e) =>
                  setVForm((p) => ({ ...p, phone: e.target.value }))
                }
                data-ocid="frontoffice.visitors.phone.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Purpose *</Label>
              <Input
                value={vForm.purpose ?? ""}
                onChange={(e) =>
                  setVForm((p) => ({ ...p, purpose: e.target.value }))
                }
                data-ocid="frontoffice.visitors.purpose.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Person to Meet *</Label>
              <Input
                value={vForm.personToMeet ?? ""}
                onChange={(e) =>
                  setVForm((p) => ({ ...p, personToMeet: e.target.value }))
                }
                data-ocid="frontoffice.visitors.persontomeet.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Check In</Label>
              <Input
                value={vForm.checkIn ?? ""}
                onChange={(e) =>
                  setVForm((p) => ({ ...p, checkIn: e.target.value }))
                }
                data-ocid="frontoffice.visitors.checkin.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Check Out</Label>
              <Input
                value={vForm.checkOut ?? ""}
                onChange={(e) =>
                  setVForm((p) => ({ ...p, checkOut: e.target.value }))
                }
                data-ocid="frontoffice.visitors.checkout.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={vForm.status ?? "In"}
                onValueChange={(v) =>
                  setVForm((p) => ({ ...p, status: v as Visitor["status"] }))
                }
              >
                <SelectTrigger data-ocid="frontoffice.visitors.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In">In</SelectItem>
                  <SelectItem value="Out">Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input
                type="date"
                value={vForm.date ?? ""}
                onChange={(e) =>
                  setVForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="frontoffice.visitors.date.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVisitorDialog(false)}
              data-ocid="frontoffice.visitors.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveVisitor}
              data-ocid="frontoffice.visitors.submit_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Call Dialog ── */}
      <Dialog open={callDialog} onOpenChange={setCallDialog}>
        <DialogContent
          className="max-w-lg"
          data-ocid="frontoffice.calls.dialog"
        >
          <DialogHeader>
            <DialogTitle>Log Phone Call</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>Caller Name *</Label>
              <Input
                value={cForm.callerName ?? ""}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, callerName: e.target.value }))
                }
                data-ocid="frontoffice.calls.caller.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone *</Label>
              <Input
                value={cForm.phone ?? ""}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, phone: e.target.value }))
                }
                data-ocid="frontoffice.calls.phone.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select
                value={cForm.type ?? "Incoming"}
                onValueChange={(v) =>
                  setCForm((p) => ({ ...p, type: v as PhoneCall["type"] }))
                }
              >
                <SelectTrigger data-ocid="frontoffice.calls.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Incoming">Incoming</SelectItem>
                  <SelectItem value="Outgoing">Outgoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Department</Label>
              <Input
                value={cForm.department ?? ""}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, department: e.target.value }))
                }
                data-ocid="frontoffice.calls.department.input"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Subject *</Label>
              <Input
                value={cForm.subject ?? ""}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, subject: e.target.value }))
                }
                data-ocid="frontoffice.calls.subject.input"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={cForm.dateTime ?? ""}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, dateTime: e.target.value }))
                }
                data-ocid="frontoffice.calls.datetime.input"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={cForm.notes ?? ""}
                onChange={(e) =>
                  setCForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={3}
                data-ocid="frontoffice.calls.notes.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCallDialog(false)}
              data-ocid="frontoffice.calls.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveCall}
              data-ocid="frontoffice.calls.submit_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Complaint Dialog ── */}
      <Dialog open={complaintDialog} onOpenChange={setComplaintDialog}>
        <DialogContent
          className="max-w-lg"
          data-ocid="frontoffice.complaints.dialog"
        >
          <DialogHeader>
            <DialogTitle>Submit Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Your Name *</Label>
                <Input
                  value={compForm.complainantName ?? ""}
                  onChange={(e) =>
                    setCompForm((p) => ({
                      ...p,
                      complainantName: e.target.value,
                    }))
                  }
                  data-ocid="frontoffice.complaints.name.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input
                  value={compForm.phone ?? ""}
                  onChange={(e) =>
                    setCompForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  data-ocid="frontoffice.complaints.phone.input"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Complaint Type</Label>
              <Select
                value={compForm.type ?? "Academic"}
                onValueChange={(v) =>
                  setCompForm((p) => ({ ...p, type: v as Complaint["type"] }))
                }
              >
                <SelectTrigger data-ocid="frontoffice.complaints.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "Academic",
                      "Administrative",
                      "Facility",
                      "Staff",
                      "Other",
                    ] as const
                  ).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Description *</Label>
              <Textarea
                value={compForm.description ?? ""}
                onChange={(e) =>
                  setCompForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={4}
                placeholder="Describe the issue in detail..."
                data-ocid="frontoffice.complaints.description.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setComplaintDialog(false)}
              data-ocid="frontoffice.complaints.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveComplaint}
              data-ocid="frontoffice.complaints.submit_button"
            >
              Submit Complaint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Resolve Complaint Dialog ── */}
      <Dialog
        open={!!resolveDialog}
        onOpenChange={() => setResolveDialog(null)}
      >
        <DialogContent data-ocid="frontoffice.complaints.resolve.dialog">
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={resolveStatus}
                onValueChange={(v) =>
                  setResolveStatus(v as Complaint["status"])
                }
              >
                <SelectTrigger data-ocid="frontoffice.complaints.resolve.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In-Progress">In-Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Resolution Notes</Label>
              <Textarea
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                rows={3}
                data-ocid="frontoffice.complaints.resolve.notes.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResolveDialog(null)}
              data-ocid="frontoffice.complaints.resolve.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveResolve}
              data-ocid="frontoffice.complaints.resolve.confirm_button"
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Enquiry Dialog ── */}
      <Dialog open={enquiryDialog} onOpenChange={setEnquiryDialog}>
        <DialogContent
          className="max-w-lg"
          data-ocid="frontoffice.enquiries.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editEnquiry ? "Edit Enquiry" : "New Admission Enquiry"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                value={enqForm.name ?? ""}
                onChange={(e) =>
                  setEnqForm((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="frontoffice.enquiries.name.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone *</Label>
              <Input
                value={enqForm.phone ?? ""}
                onChange={(e) =>
                  setEnqForm((p) => ({ ...p, phone: e.target.value }))
                }
                data-ocid="frontoffice.enquiries.phone.input"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={enqForm.email ?? ""}
                onChange={(e) =>
                  setEnqForm((p) => ({ ...p, email: e.target.value }))
                }
                data-ocid="frontoffice.enquiries.email.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Course Interested</Label>
              <Select
                value={enqForm.course ?? "B.Ed"}
                onValueChange={(v) =>
                  setEnqForm((p) => ({ ...p, course: v as Enquiry["course"] }))
                }
              >
                <SelectTrigger data-ocid="frontoffice.enquiries.course.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B.Ed">B.Ed</SelectItem>
                  <SelectItem value="D.El.Ed">D.El.Ed</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Source</Label>
              <Select
                value={enqForm.source ?? "Walk-in"}
                onValueChange={(v) =>
                  setEnqForm((p) => ({ ...p, source: v as Enquiry["source"] }))
                }
              >
                <SelectTrigger data-ocid="frontoffice.enquiries.source.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Walk-in", "Phone", "Website", "Reference"] as const).map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <div className="space-y-1">
                <Label>Status</Label>
                <Select
                  value={enqForm.status ?? "New"}
                  onValueChange={(v) =>
                    setEnqForm((p) => ({
                      ...p,
                      status: v as Enquiry["status"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="frontoffice.enquiries.status.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        "New",
                        "Followed-Up",
                        "Converted",
                        "Not Interested",
                      ] as const
                    ).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label>Date</Label>
              <Input
                type="date"
                value={enqForm.date ?? ""}
                onChange={(e) =>
                  setEnqForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="frontoffice.enquiries.date.input"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={enqForm.notes ?? ""}
                onChange={(e) =>
                  setEnqForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={3}
                data-ocid="frontoffice.enquiries.notes.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEnquiryDialog(false)}
              data-ocid="frontoffice.enquiries.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveEnquiry}
              data-ocid="frontoffice.enquiries.submit_button"
            >
              {editEnquiry ? "Save Changes" : "Submit Enquiry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

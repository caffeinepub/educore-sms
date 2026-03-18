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
import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import type { FeePayment, FeeType } from "../../types";

export default function FeesModule() {
  const {
    feeTypes: initFeeTypes,
    feeGroups: initFeeGroups,
    feeMasters: initMasters,
    feePayments: initPayments,
    students,
    classes,
    currentSchoolId,
  } = useApp();

  const [feeTypes, setFeeTypes] = useState<FeeType[]>(
    initFeeTypes.filter((f) => f.schoolId === currentSchoolId),
  );
  const [feeGroups, setFeeGroups] = useState(
    initFeeGroups.filter((f) => f.schoolId === currentSchoolId),
  );
  const [feeMasters, setFeeMasters] = useState(
    initMasters.filter((f) => f.schoolId === currentSchoolId),
  );
  const [payments, setPayments] = useState<FeePayment[]>(
    initPayments.filter((f) => f.schoolId === currentSchoolId),
  );

  const [showModal, setShowModal] = useState<string | null>(null);
  const [feeTypeForm, setFeeTypeForm] = useState({ name: "", description: "" });
  const [feeGroupForm, setFeeGroupForm] = useState({ name: "" });
  const [masterForm, setMasterForm] = useState({
    classId: "c1",
    feeGroupId: "fg1",
    feeTypeId: "ft1",
    amount: "",
    dueDate: "",
  });
  const [collectForm, setCollectForm] = useState({
    studentId: "",
    feeMasterId: "",
    amountPaid: "",
    paymentMethod: "Cash",
  });

  const myClasses = classes.filter((c) => c.schoolId === currentSchoolId);
  const myStudents = students.filter((s) => s.schoolId === currentSchoolId);

  const getStudentName = (id: string) =>
    myStudents.find((s) => s.id === id)?.name ?? id;
  const getClassName = (id: string) =>
    myClasses.find((c) => c.id === id)?.name ?? id;
  const getFeeTypeName = (id: string) =>
    feeTypes.find((f) => f.id === id)?.name ?? id;

  const collectFee = () => {
    if (!collectForm.studentId || !collectForm.amountPaid) return;
    const receipt = `RCP-${String(payments.length + 1).padStart(3, "0")}`;
    setPayments((p) => [
      ...p,
      {
        id: `fp${Date.now()}`,
        schoolId: currentSchoolId,
        studentId: collectForm.studentId,
        feeMasterId: collectForm.feeMasterId,
        amountPaid: Number(collectForm.amountPaid),
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentMethod: collectForm.paymentMethod,
        receiptNumber: receipt,
        collectedBy: "accountant",
      },
    ]);
    setShowModal(null);
    setCollectForm({
      studentId: "",
      feeMasterId: "",
      amountPaid: "",
      paymentMethod: "Cash",
    });
  };

  const totalCollected = payments.reduce((a, p) => a + p.amountPaid, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Fees Collection</h2>
      <Tabs defaultValue="feetype">
        <TabsList className="flex-wrap" data-ocid="fees.tabs">
          <TabsTrigger value="feetype" data-ocid="fees.feetype.tab">
            Fee Types
          </TabsTrigger>
          <TabsTrigger value="feegroup" data-ocid="fees.feegroup.tab">
            Fee Groups
          </TabsTrigger>
          <TabsTrigger value="master" data-ocid="fees.master.tab">
            Fee Master
          </TabsTrigger>
          <TabsTrigger value="collect" data-ocid="fees.collect.tab">
            Collect Fees
          </TabsTrigger>
          <TabsTrigger value="payments" data-ocid="fees.payments.tab">
            Payments
          </TabsTrigger>
          <TabsTrigger value="report" data-ocid="fees.report.tab">
            Report
          </TabsTrigger>
        </TabsList>

        {/* Fee Types */}
        <TabsContent value="feetype" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setFeeTypeForm({ name: "", description: "" });
                setShowModal("feetype");
              }}
              data-ocid="feetype.add_button"
            >
              <Plus size={16} className="mr-1" /> Add Fee Type
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="feetype.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeTypes.map((f, i) => (
                    <TableRow key={f.id} data-ocid={`feetype.item.${i + 1}`}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {f.description}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setFeeTypes((p) => p.filter((x) => x.id !== f.id))
                          }
                          data-ocid={`feetype.delete_button.${i + 1}`}
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

        {/* Fee Groups */}
        <TabsContent value="feegroup" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setFeeGroupForm({ name: "" });
                setShowModal("feegroup");
              }}
              data-ocid="feegroup.add_button"
            >
              <Plus size={16} className="mr-1" /> Add Fee Group
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="feegroup.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeGroups.map((f, i) => (
                    <TableRow key={f.id} data-ocid={`feegroup.item.${i + 1}`}>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setFeeGroups((p) => p.filter((x) => x.id !== f.id))
                          }
                          data-ocid={`feegroup.delete_button.${i + 1}`}
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

        {/* Fee Master */}
        <TabsContent value="master" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setMasterForm({
                  classId: "c1",
                  feeGroupId: "fg1",
                  feeTypeId: "ft1",
                  amount: "",
                  dueDate: "",
                });
                setShowModal("master");
              }}
              data-ocid="master.add_button"
            >
              <Plus size={16} className="mr-1" /> Add Fee Master
            </Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="master.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeMasters.map((m, i) => (
                    <TableRow key={m.id} data-ocid={`master.item.${i + 1}`}>
                      <TableCell>{getClassName(m.classId)}</TableCell>
                      <TableCell>{getFeeTypeName(m.feeTypeId)}</TableCell>
                      <TableCell className="font-medium">${m.amount}</TableCell>
                      <TableCell>{m.dueDate}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setFeeMasters((p) => p.filter((x) => x.id !== m.id))
                          }
                          data-ocid={`master.delete_button.${i + 1}`}
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

        {/* Collect Fees */}
        <TabsContent value="collect" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Collect Fee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Student</Label>
                  <Select
                    value={collectForm.studentId}
                    onValueChange={(v) =>
                      setCollectForm((p) => ({ ...p, studentId: v }))
                    }
                  >
                    <SelectTrigger data-ocid="collect.student.select">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {myStudents.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Fee Master</Label>
                  <Select
                    value={collectForm.feeMasterId}
                    onValueChange={(v) =>
                      setCollectForm((p) => ({ ...p, feeMasterId: v }))
                    }
                  >
                    <SelectTrigger data-ocid="collect.feemaster.select">
                      <SelectValue placeholder="Select fee" />
                    </SelectTrigger>
                    <SelectContent>
                      {feeMasters.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {getFeeTypeName(m.feeTypeId)} - ${m.amount}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    data-ocid="collect.amount.input"
                    value={collectForm.amountPaid}
                    onChange={(e) =>
                      setCollectForm((p) => ({
                        ...p,
                        amountPaid: e.target.value,
                      }))
                    }
                    placeholder="Amount"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Payment Method</Label>
                  <Select
                    value={collectForm.paymentMethod}
                    onValueChange={(v) =>
                      setCollectForm((p) => ({ ...p, paymentMethod: v }))
                    }
                  >
                    <SelectTrigger data-ocid="collect.method.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Cash", "Online", "Cheque", "Card"].map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={collectFee} data-ocid="collect.submit_button">
                Collect & Generate Receipt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="payments.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p, i) => (
                    <TableRow key={p.id} data-ocid={`payments.item.${i + 1}`}>
                      <TableCell>
                        <Badge variant="outline">{p.receiptNumber}</Badge>
                      </TableCell>
                      <TableCell>{getStudentName(p.studentId)}</TableCell>
                      <TableCell className="font-medium">
                        ${p.amountPaid}
                      </TableCell>
                      <TableCell>{p.paymentMethod}</TableCell>
                      <TableCell>{p.paymentDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report */}
        <TabsContent value="report">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-primary">
                  ${totalCollected.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Collected
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{payments.length}</div>
                <div className="text-sm text-muted-foreground">
                  Transactions
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow data-ocid="report.item.1">
                    <TableCell>March 2026</TableCell>
                    <TableCell>{payments.length}</TableCell>
                    <TableCell className="font-medium">
                      ${totalCollected}
                    </TableCell>
                  </TableRow>
                  <TableRow data-ocid="report.item.2">
                    <TableCell>February 2026</TableCell>
                    <TableCell>12</TableCell>
                    <TableCell className="font-medium">$6,800</TableCell>
                  </TableRow>
                  <TableRow data-ocid="report.item.3">
                    <TableCell>January 2026</TableCell>
                    <TableCell>15</TableCell>
                    <TableCell className="font-medium">$8,250</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fee Type Modal */}
      <Dialog
        open={showModal === "feetype"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent data-ocid="feetype.dialog">
          <DialogHeader>
            <DialogTitle>Add Fee Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                data-ocid="feetype.name.input"
                value={feeTypeForm.name}
                onChange={(e) =>
                  setFeeTypeForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                data-ocid="feetype.desc.input"
                value={feeTypeForm.description}
                onChange={(e) =>
                  setFeeTypeForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(null)}
              data-ocid="feetype.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setFeeTypes((p) => [
                  ...p,
                  {
                    id: `ft${Date.now()}`,
                    schoolId: currentSchoolId,
                    ...feeTypeForm,
                  },
                ]);
                setShowModal(null);
              }}
              data-ocid="feetype.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee Group Modal */}
      <Dialog
        open={showModal === "feegroup"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent data-ocid="feegroup.dialog">
          <DialogHeader>
            <DialogTitle>Add Fee Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              data-ocid="feegroup.name.input"
              value={feeGroupForm.name}
              onChange={(e) => setFeeGroupForm({ name: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(null)}
              data-ocid="feegroup.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setFeeGroups((p) => [
                  ...p,
                  {
                    id: `fg${Date.now()}`,
                    schoolId: currentSchoolId,
                    name: feeGroupForm.name,
                  },
                ]);
                setShowModal(null);
              }}
              data-ocid="feegroup.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee Master Modal */}
      <Dialog
        open={showModal === "master"}
        onOpenChange={(o) => !o && setShowModal(null)}
      >
        <DialogContent data-ocid="master.dialog">
          <DialogHeader>
            <DialogTitle>Add Fee Master</DialogTitle>
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
                <SelectTrigger data-ocid="master.class.select">
                  <SelectValue />
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
                <SelectTrigger data-ocid="master.feetype.select">
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
            <div className="space-y-1">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                data-ocid="master.amount.input"
                value={masterForm.amount}
                onChange={(e) =>
                  setMasterForm((p) => ({ ...p, amount: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input
                type="date"
                data-ocid="master.duedate.input"
                value={masterForm.dueDate}
                onChange={(e) =>
                  setMasterForm((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(null)}
              data-ocid="master.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setFeeMasters((p) => [
                  ...p,
                  {
                    id: `fm${Date.now()}`,
                    schoolId: currentSchoolId,
                    sessionId: "2026",
                    ...masterForm,
                    amount: Number(masterForm.amount),
                  },
                ]);
                setShowModal(null);
              }}
              data-ocid="master.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

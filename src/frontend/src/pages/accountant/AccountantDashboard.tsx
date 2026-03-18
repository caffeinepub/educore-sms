import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AlertCircle, DollarSign, TrendingUp, Users } from "lucide-react";
import React, { useState } from "react";
import Layout from "../../components/Layout";
import { useApp } from "../../contexts/AppContext";
import type { FeePayment } from "../../types";

type Section = "dashboard" | "collect" | "payments" | "dues" | "reports";

export default function AccountantDashboard() {
  const {
    feePayments: initPayments,
    feeMasters,
    feeTypes,
    students,
    currentSchoolId,
  } = useApp();
  const [section, setSection] = useState<Section>("dashboard");
  const [payments, setPayments] = useState<FeePayment[]>(
    initPayments.filter((p) => p.schoolId === currentSchoolId),
  );
  const [collectForm, setCollectForm] = useState({
    studentId: "",
    feeMasterId: "",
    amountPaid: "",
    paymentMethod: "Cash",
  });

  const myStudents = students.filter((s) => s.schoolId === currentSchoolId);
  const myMasters = feeMasters.filter((f) => f.schoolId === currentSchoolId);
  const totalCollected = payments.reduce((a, p) => a + p.amountPaid, 0);
  const todayCollected = payments
    .filter((p) => p.paymentDate === new Date().toISOString().slice(0, 10))
    .reduce((a, p) => a + p.amountPaid, 0);
  const getStudentName = (id: string) =>
    myStudents.find((s) => s.id === id)?.name ?? id;
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
    setCollectForm({
      studentId: "",
      feeMasterId: "",
      amountPaid: "",
      paymentMethod: "Cash",
    });
    alert(`Receipt generated: ${receipt}`);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Accountant Dashboard</h2>
        <p className="text-muted-foreground">Fee & Finance Overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Collection",
            value: `$${todayCollected}`,
            icon: <DollarSign size={20} />,
            color: "text-green-600",
          },
          {
            label: "Monthly Collection",
            value: `$${totalCollected}`,
            icon: <TrendingUp size={20} />,
            color: "text-blue-600",
          },
          {
            label: "Total Students",
            value: myStudents.length,
            icon: <Users size={20} />,
            color: "text-purple-600",
          },
          {
            label: "Transactions",
            value: payments.length,
            icon: <AlertCircle size={20} />,
            color: "text-amber-600",
          },
        ].map((s) => (
          <Card key={s.label} data-ocid={`accountant.stat.card.${s.label}`}>
            <CardContent className="pt-4">
              <div className={`${s.color} mb-2`}>{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table data-ocid="accountant.recentpayments.table">
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
              {payments
                .slice(-5)
                .reverse()
                .map((p, i) => (
                  <TableRow
                    key={p.id}
                    data-ocid={`accountant.recentpayments.item.${i + 1}`}
                  >
                    <TableCell>
                      <Badge variant="outline">{p.receiptNumber}</Badge>
                    </TableCell>
                    <TableCell>{getStudentName(p.studentId)}</TableCell>
                    <TableCell className="font-medium text-green-600">
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
    </div>
  );

  const renderCollect = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Collect Fees</h2>
      <Card className="max-w-lg">
        <CardContent className="pt-4 space-y-3">
          <div className="space-y-1">
            <Label>Student</Label>
            <Select
              value={collectForm.studentId}
              onValueChange={(v) =>
                setCollectForm((p) => ({ ...p, studentId: v }))
              }
            >
              <SelectTrigger data-ocid="acc.collect.student.select">
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
            <Label>Fee</Label>
            <Select
              value={collectForm.feeMasterId}
              onValueChange={(v) =>
                setCollectForm((p) => ({ ...p, feeMasterId: v }))
              }
            >
              <SelectTrigger data-ocid="acc.collect.fee.select">
                <SelectValue placeholder="Select fee" />
              </SelectTrigger>
              <SelectContent>
                {myMasters.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {getFeeTypeName(m.feeTypeId)} - ${m.amount}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Amount ($)</Label>
            <Input
              type="number"
              data-ocid="acc.collect.amount.input"
              value={collectForm.amountPaid}
              onChange={(e) =>
                setCollectForm((p) => ({ ...p, amountPaid: e.target.value }))
              }
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
              <SelectTrigger data-ocid="acc.collect.method.select">
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
          <Button
            onClick={collectFee}
            data-ocid="acc.collect.submit_button"
            className="w-full"
          >
            Collect & Generate Receipt
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout
      activeSection={section}
      onSectionChange={(s) => setSection(s as Section)}
    >
      {section === "dashboard" && renderDashboard()}
      {section === "collect" && renderCollect()}
      {section === "payments" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Payment History</h2>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="acc.payments.table">
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
                    <TableRow
                      key={p.id}
                      data-ocid={`acc.payments.item.${i + 1}`}
                    >
                      <TableCell>
                        <Badge variant="outline">{p.receiptNumber}</Badge>
                      </TableCell>
                      <TableCell>{getStudentName(p.studentId)}</TableCell>
                      <TableCell>${p.amountPaid}</TableCell>
                      <TableCell>{p.paymentMethod}</TableCell>
                      <TableCell>{p.paymentDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      {section === "dues" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Fee Dues</h2>
          <Card>
            <CardContent className="pt-4">
              <Table data-ocid="acc.dues.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Due Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myStudents
                    .filter((s) => !payments.find((p) => p.studentId === s.id))
                    .map((s) => (
                      <TableRow key={s.id} data-ocid={`acc.dues.item.${s.id}`}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell className="font-bold text-red-600">
                          $500
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">Due</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      {section === "reports" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Collection Report</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">
                  ${totalCollected}
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
        </div>
      )}
    </Layout>
  );
}

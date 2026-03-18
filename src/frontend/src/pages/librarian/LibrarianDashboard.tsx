import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  BookOpen,
  DollarSign,
  Library,
  RefreshCw,
} from "lucide-react";
import React, { useState } from "react";
import Layout from "../../components/Layout";
import {
  books,
  issueRecords,
  libraryFines,
  librarySettings,
} from "../../data/libraryMockData";
import LibraryModule from "./LibraryModule";

type Section =
  | "dashboard"
  | "catalog"
  | "issue"
  | "fines"
  | "reports"
  | "inventory"
  | "idcards"
  | "settings";

export default function LibrarianDashboard() {
  const [section, setSection] = useState<Section>("dashboard");

  const activeIssues = issueRecords.filter((i) => i.returnDate === null);
  const overdueCount = activeIssues.filter(
    (i) => new Date(i.dueDate) < new Date(),
  ).length;
  const totalFines = libraryFines
    .filter((f) => !f.paid)
    .reduce((a, f) => a + f.amount, 0);
  const totalBooks = books.reduce((a, b) => a + b.quantity, 0);

  const stats = [
    {
      label: "Total Books",
      value: totalBooks,
      icon: <BookOpen size={20} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Books Issued",
      value: activeIssues.length,
      icon: <Library size={20} />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Overdue",
      value: overdueCount,
      icon: <AlertTriangle size={20} />,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Pending Fines (₹)",
      value: totalFines,
      icon: <DollarSign size={20} />,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <Layout
      activeSection={section}
      onSectionChange={(s) => setSection(s as Section)}
    >
      {section === "dashboard" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Librarian Dashboard</h2>
            <p className="text-muted-foreground text-sm">
              {librarySettings.schoolName} — Library Management
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-4">
                  <div
                    className={`inline-flex p-2 rounded-lg ${s.bg} ${s.color} mb-2`}
                  >
                    {s.icon}
                  </div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Manage Catalog", section: "catalog" as Section },
              { label: "Issue / Return", section: "issue" as Section },
              { label: "View Reports", section: "reports" as Section },
              { label: "Inventory", section: "inventory" as Section },
            ].map((btn) => (
              <Button
                key={btn.section}
                variant="outline"
                className="h-16"
                onClick={() => setSection(btn.section)}
                data-ocid={`librarian.${btn.section}.button`}
              >
                {btn.label}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issueRecords.slice(0, 6).map((issue, idx) => {
                      const isOverdue =
                        !issue.returnDate &&
                        new Date(issue.dueDate) < new Date();
                      return (
                        <TableRow
                          key={issue.id}
                          data-ocid={`librarian.recent.item.${idx + 1}`}
                        >
                          <TableCell>{issue.studentName}</TableCell>
                          <TableCell className="max-w-[140px] truncate">
                            {issue.bookTitle}
                          </TableCell>
                          <TableCell>{issue.dueDate}</TableCell>
                          <TableCell>
                            {issue.returnDate ? (
                              <Badge className="bg-green-100 text-green-800">
                                Returned
                              </Badge>
                            ) : isOverdue ? (
                              <Badge className="bg-red-100 text-red-800">
                                Overdue
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800">
                                Issued
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <Button
                variant="link"
                className="mt-2 p-0"
                onClick={() => setSection("issue")}
                data-ocid="librarian.view_all.button"
              >
                <RefreshCw size={14} className="mr-1" />
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {section !== "dashboard" && <LibraryModule />}
    </Layout>
  );
}

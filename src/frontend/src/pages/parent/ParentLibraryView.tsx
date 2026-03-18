import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen } from "lucide-react";
import React from "react";
import { useApp } from "../../contexts/AppContext";
import {
  issueRecords,
  libraryFines,
  reservations,
} from "../../data/libraryMockData";
import { students } from "../../data/mockData";

export default function ParentLibraryView() {
  const { userProfile } = useApp();
  // Find child: parent is linked to first student for demo
  const childId = userProfile?.studentId ?? "stu1";
  const child = students.find((s) => s.id === childId);

  const childIssues = issueRecords.filter(
    (i) => i.studentId === childId && i.returnDate === null,
  );
  const childFines = libraryFines.filter((f) => f.studentId === childId);
  const childReservations = reservations.filter((r) => r.studentId === childId);

  const unpaidFines = childFines.filter((f) => !f.paid);
  const totalUnpaid = unpaidFines.reduce((a, f) => a + f.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen size={20} className="text-primary" />
        <div>
          <h3 className="font-semibold">Library Activity</h3>
          <p className="text-sm text-muted-foreground">
            Viewing for: {child?.name ?? "Your Child"}
          </p>
        </div>
        {totalUnpaid > 0 && (
          <Badge className="ml-auto bg-red-100 text-red-800">
            ₹{totalUnpaid} outstanding fines
          </Badge>
        )}
      </div>

      {/* Child's Issued Books */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Currently Issued Books</CardTitle>
        </CardHeader>
        <CardContent>
          {childIssues.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="parent.library.issued.empty_state"
            >
              No books currently issued.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childIssues.map((issue, idx) => {
                    const isOverdue = new Date(issue.dueDate) < new Date();
                    return (
                      <TableRow
                        key={issue.id}
                        data-ocid={`parent.library.issued.item.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {issue.bookTitle}
                        </TableCell>
                        <TableCell className="text-sm">
                          {issue.issueDate}
                        </TableCell>
                        <TableCell
                          className={
                            isOverdue ? "text-red-600 font-semibold" : ""
                          }
                        >
                          {issue.dueDate}
                        </TableCell>
                        <TableCell>
                          {isOverdue ? (
                            <Badge className="bg-red-100 text-red-800">
                              Overdue
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Child's Fines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Library Fines</CardTitle>
        </CardHeader>
        <CardContent>
          {childFines.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="parent.library.fines.empty_state"
            >
              No fines on record.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childFines.map((fine, idx) => (
                    <TableRow
                      key={fine.id}
                      data-ocid={`parent.library.fines.item.${idx + 1}`}
                    >
                      <TableCell>{fine.bookTitle}</TableCell>
                      <TableCell className="capitalize">{fine.type}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{fine.amount}
                      </TableCell>
                      <TableCell className="text-sm">{fine.date}</TableCell>
                      <TableCell>
                        {fine.paid ? (
                          <Badge className="bg-green-100 text-green-800">
                            Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            Unpaid
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Child's Reservations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Book Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {childReservations.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="parent.library.reservations.empty_state"
            >
              No reservations.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childReservations.map((res, idx) => (
                    <TableRow
                      key={res.id}
                      data-ocid={`parent.library.reservations.item.${idx + 1}`}
                    >
                      <TableCell>{res.bookTitle}</TableCell>
                      <TableCell className="text-sm">
                        {res.reservedAt}
                      </TableCell>
                      <TableCell>
                        {res.status === "pending" && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        )}
                        {res.status === "ready" && (
                          <Badge className="bg-green-100 text-green-800">
                            Ready
                          </Badge>
                        )}
                        {res.status === "cancelled" && (
                          <Badge variant="secondary">Cancelled</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

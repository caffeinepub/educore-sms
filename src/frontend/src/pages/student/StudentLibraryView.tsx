import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Bell, BookOpen, Search } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import {
  CATEGORIES,
  type Reservation,
  books,
  reservations as initialReservations,
  issueRecords,
  libraryFines,
  libraryNotifications,
} from "../../data/libraryMockData";

export default function StudentLibraryView() {
  const { userProfile } = useApp();
  const studentId = userProfile?.studentId ?? "stu1";

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [reservations, setReservations] =
    useState<Reservation[]>(initialReservations);
  const [reserveConfirm, setReserveConfirm] = useState<string | null>(null);

  const myIssues = issueRecords.filter(
    (i) => i.studentId === studentId && i.returnDate === null,
  );
  const myFines = libraryFines.filter((f) => f.studentId === studentId);
  const myReservations = reservations.filter((r) => r.studentId === studentId);
  const myNotifications = libraryNotifications.filter(
    (n) => n.userId === studentId,
  );
  const unread = myNotifications.filter((n) => !n.read).length;

  const filteredBooks = books.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.authors.join(",").toLowerCase().includes(q) ||
      b.isbn.includes(q) ||
      b.category.toLowerCase().includes(q);
    const matchCat = catFilter === "all" || b.category === catFilter;
    return matchSearch && matchCat;
  });

  function handleReserve(bookId: string) {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    const already = reservations.find(
      (r) =>
        r.bookId === bookId &&
        r.studentId === studentId &&
        r.status !== "cancelled",
    );
    if (already) return;
    const newRes: Reservation = {
      id: `res${Date.now()}`,
      bookId,
      bookTitle: book.title,
      studentId,
      studentName: "My Account",
      reservedAt: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    setReservations((prev) => [...prev, newRes]);
    setReserveConfirm(null);
  }

  return (
    <div className="space-y-6">
      {/* Notification Bell */}
      {unread > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Bell size={18} className="text-blue-600" />
          <span className="text-sm text-blue-800 font-medium">
            {unread} unread library notification{unread > 1 ? "s" : ""}
          </span>
          <div className="ml-2 space-y-1">
            {myNotifications
              .filter((n) => !n.read)
              .map((n) => (
                <p key={n.id} className="text-xs text-blue-700">
                  {n.message}
                </p>
              ))}
          </div>
        </div>
      )}

      {/* Search and Browse */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen size={18} />
            Browse Library Catalog
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-9"
                placeholder="Search title, author, ISBN, subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="student.library.search_input"
              />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger
                className="w-[160px]"
                data-ocid="student.library.category_select"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBooks.length === 0 && (
              <div
                className="col-span-full text-center py-8 text-muted-foreground"
                data-ocid="student.library.catalog.empty_state"
              >
                No books found matching your search.
              </div>
            )}
            {filteredBooks.map((book, idx) => {
              const isReserved = reservations.some(
                (r) =>
                  r.bookId === book.id &&
                  r.studentId === studentId &&
                  r.status !== "cancelled",
              );
              const isConfirming = reserveConfirm === book.id;
              return (
                <div
                  key={book.id}
                  className="border rounded-lg overflow-hidden flex flex-col"
                  data-ocid={`student.library.book.item.${idx + 1}`}
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3 flex flex-col gap-1 flex-1">
                    <p className="font-medium text-sm line-clamp-2">
                      {book.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {book.authors.join(", ")}
                    </p>
                    <Badge variant="outline" className="w-fit text-xs">
                      {book.category}
                    </Badge>
                    <div className="mt-auto pt-2">
                      {book.availableCopies > 0 ? (
                        <Badge className="bg-green-100 text-green-800">
                          Available ({book.availableCopies})
                        </Badge>
                      ) : book.reservedCopies > 0 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Reserved
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          Issued
                        </Badge>
                      )}
                    </div>
                    {book.availableCopies > 0 &&
                      !isReserved &&
                      (isConfirming ? (
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleReserve(book.id)}
                            data-ocid={`student.library.reserve.confirm_button.${idx + 1}`}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReserveConfirm(null)}
                            data-ocid={`student.library.reserve.cancel_button.${idx + 1}`}
                          >
                            No
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() => setReserveConfirm(book.id)}
                          data-ocid={`student.library.reserve.button.${idx + 1}`}
                        >
                          Reserve
                        </Button>
                      ))}
                    {isReserved && (
                      <Badge className="mt-2 bg-blue-100 text-blue-800 w-fit">
                        Reserved by you
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* My Issued Books */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Issued Books</CardTitle>
        </CardHeader>
        <CardContent>
          {myIssues.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="student.library.issued.empty_state"
            >
              No books currently issued to you.
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
                  {myIssues.map((issue, idx) => {
                    const isOverdue = new Date(issue.dueDate) < new Date();
                    return (
                      <TableRow
                        key={issue.id}
                        data-ocid={`student.library.issued.item.${idx + 1}`}
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

      {/* My Fines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Fines</CardTitle>
        </CardHeader>
        <CardContent>
          {myFines.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="student.library.fines.empty_state"
            >
              No fines on your account.
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
                  {myFines.map((fine, idx) => (
                    <TableRow
                      key={fine.id}
                      data-ocid={`student.library.fines.item.${idx + 1}`}
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

      {/* My Reservations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {myReservations.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="student.library.reservations.empty_state"
            >
              No active reservations.
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
                  {myReservations.map((res, idx) => (
                    <TableRow
                      key={res.id}
                      data-ocid={`student.library.reservations.item.${idx + 1}`}
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
                            Ready for Pickup
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

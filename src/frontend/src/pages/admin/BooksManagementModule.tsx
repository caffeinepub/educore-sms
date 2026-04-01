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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BookMarked,
  Download,
  Edit2,
  Package,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  subject: string;
  publisher: string;
  edition: string;
  yearPublished: string;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  damagedCopies: number;
  lostCopies: number;
  shelfLocation: string;
  description: string;
  addedAt: number;
}

const DEFAULT_CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Mathematics",
  "History",
  "Geography",
  "Literature",
  "Reference",
  "Periodicals",
  "Other",
];

const SEED_BOOKS: Book[] = [
  {
    id: "b1",
    title: "Concepts of Physics Vol. 1",
    author: "H.C. Verma",
    isbn: "978-8177091878",
    category: "Science",
    subject: "Physics",
    publisher: "Bharati Bhawan",
    edition: "1st",
    yearPublished: "1992",
    totalCopies: 20,
    availableCopies: 14,
    issuedCopies: 5,
    damagedCopies: 1,
    lostCopies: 0,
    shelfLocation: "A-01",
    description: "Comprehensive physics textbook for undergraduate students.",
    addedAt: Date.now() - 86400000 * 60,
  },
  {
    id: "b2",
    title: "Higher Algebra",
    author: "Hall & Knight",
    isbn: "978-8193595169",
    category: "Mathematics",
    subject: "Algebra",
    publisher: "Arihant",
    edition: "3rd",
    yearPublished: "2005",
    totalCopies: 15,
    availableCopies: 12,
    issuedCopies: 3,
    damagedCopies: 0,
    lostCopies: 0,
    shelfLocation: "B-03",
    description: "Classic algebra reference for competitive examinations.",
    addedAt: Date.now() - 86400000 * 45,
  },
  {
    id: "b3",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "978-0553380163",
    category: "Non-Fiction",
    subject: "Cosmology",
    publisher: "Bantam Books",
    edition: "Updated",
    yearPublished: "1998",
    totalCopies: 8,
    availableCopies: 5,
    issuedCopies: 2,
    damagedCopies: 1,
    lostCopies: 0,
    shelfLocation: "C-07",
    description: "Popular science book on cosmology and the nature of time.",
    addedAt: Date.now() - 86400000 * 30,
  },
  {
    id: "b4",
    title: "Wings of Fire",
    author: "A.P.J. Abdul Kalam",
    isbn: "978-8173711466",
    category: "Non-Fiction",
    subject: "Autobiography",
    publisher: "Universities Press",
    edition: "1st",
    yearPublished: "1999",
    totalCopies: 12,
    availableCopies: 10,
    issuedCopies: 2,
    damagedCopies: 0,
    lostCopies: 0,
    shelfLocation: "C-01",
    description:
      "Autobiography of India's most beloved scientist and president.",
    addedAt: Date.now() - 86400000 * 20,
  },
  {
    id: "b5",
    title: "India: A History",
    author: "John Keay",
    isbn: "978-0802137975",
    category: "History",
    subject: "Indian History",
    publisher: "Grove Press",
    edition: "2nd",
    yearPublished: "2001",
    totalCopies: 6,
    availableCopies: 4,
    issuedCopies: 2,
    damagedCopies: 0,
    lostCopies: 0,
    shelfLocation: "D-02",
    description:
      "A comprehensive narrative history of India from ancient times.",
    addedAt: Date.now() - 86400000 * 15,
  },
  {
    id: "b6",
    title: "Oxford Atlas of the World",
    author: "Oxford Press",
    isbn: "978-0199962679",
    category: "Geography",
    subject: "World Geography",
    publisher: "Oxford University Press",
    edition: "26th",
    yearPublished: "2019",
    totalCopies: 4,
    availableCopies: 2,
    issuedCopies: 1,
    damagedCopies: 1,
    lostCopies: 0,
    shelfLocation: "E-01",
    description: "Authoritative reference atlas with detailed world maps.",
    addedAt: Date.now() - 86400000 * 10,
  },
  {
    id: "b7",
    title: "The Guide",
    author: "R.K. Narayan",
    isbn: "978-0143031611",
    category: "Fiction",
    subject: "Indian Literature",
    publisher: "Penguin Classics",
    edition: "Reprint",
    yearPublished: "2006",
    totalCopies: 10,
    availableCopies: 7,
    issuedCopies: 3,
    damagedCopies: 0,
    lostCopies: 0,
    shelfLocation: "F-04",
    description:
      "Booker Prize winning novel set in the fictional town of Malgudi.",
    addedAt: Date.now() - 86400000 * 7,
  },
  {
    id: "b8",
    title: "Wren & Martin: English Grammar",
    author: "P.C. Wren & H. Martin",
    isbn: "978-8121900027",
    category: "Reference",
    subject: "English Grammar",
    publisher: "S. Chand",
    edition: "Revised",
    yearPublished: "2015",
    totalCopies: 18,
    availableCopies: 13,
    issuedCopies: 4,
    damagedCopies: 0,
    lostCopies: 1,
    shelfLocation: "G-02",
    description:
      "Standard grammar and composition reference for English language.",
    addedAt: Date.now() - 86400000 * 3,
  },
];

const EMPTY_FORM: Omit<Book, "id" | "addedAt"> = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  subject: "",
  publisher: "",
  edition: "",
  yearPublished: "",
  totalCopies: 1,
  availableCopies: 1,
  issuedCopies: 0,
  damagedCopies: 0,
  lostCopies: 0,
  shelfLocation: "",
  description: "",
};

export default function BooksManagementModule() {
  const [books, setBooks] = useState<Book[]>(() => {
    const stored = localStorage.getItem("booksManagement");
    return stored ? JSON.parse(stored) : SEED_BOOKS;
  });
  const [categories, setCategories] = useState<string[]>(() => {
    const stored = localStorage.getItem("booksCategories");
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  });
  const [activeTab, setActiveTab] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<Omit<Book, "id" | "addedAt">>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [editCatIdx, setEditCatIdx] = useState<number | null>(null);
  const [editCatValue, setEditCatValue] = useState("");

  useEffect(() => {
    localStorage.setItem("booksManagement", JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem("booksCategories", JSON.stringify(categories));
  }, [categories]);

  const filteredBooks = books.filter((b) => {
    const matchCat = filterCategory === "all" || b.category === filterCategory;
    const q = searchQuery.toLowerCase();
    const matchQ =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.includes(q);
    return matchCat && matchQ;
  });

  const damagedOrLostBooks = books.filter(
    (b) => b.damagedCopies > 0 || b.lostCopies > 0,
  );

  function handleEdit(book: Book) {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      subject: book.subject,
      publisher: book.publisher,
      edition: book.edition,
      yearPublished: book.yearPublished,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      issuedCopies: book.issuedCopies,
      damagedCopies: book.damagedCopies,
      lostCopies: book.lostCopies,
      shelfLocation: book.shelfLocation,
      description: book.description,
    });
    setActiveTab("add");
  }

  function handleDelete(id: string) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  function handleSave() {
    if (!form.title || !form.author || !form.isbn) return;
    if (editingId) {
      setBooks((prev) =>
        prev.map((b) => (b.id === editingId ? { ...b, ...form } : b)),
      );
    } else {
      const newBook: Book = {
        ...form,
        id: `b${Date.now()}`,
        addedAt: Date.now(),
      };
      setBooks((prev) => [...prev, newBook]);
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    setActiveTab("all");
  }

  function handleCancelEdit() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setActiveTab("all");
  }

  function handleAddCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories((prev) => [...prev, trimmed]);
    setNewCategory("");
  }

  function handleDeleteCategory(cat: string) {
    setCategories((prev) => prev.filter((c) => c !== cat));
  }

  function handleRenameCategory(idx: number) {
    const trimmed = editCatValue.trim();
    if (!trimmed) return;
    setCategories((prev) => prev.map((c, i) => (i === idx ? trimmed : c)));
    setEditCatIdx(null);
    setEditCatValue("");
  }

  function handleWriteOff(id: string) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              damagedCopies: 0,
              lostCopies: 0,
              totalCopies: b.totalCopies - b.damagedCopies - b.lostCopies,
            }
          : b,
      ),
    );
  }

  function handleMarkRepaired(id: string) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              damagedCopies: 0,
              availableCopies: b.availableCopies + b.damagedCopies,
            }
          : b,
      ),
    );
  }

  function handleReplace(id: string) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              lostCopies: 0,
              damagedCopies: 0,
              availableCopies:
                b.availableCopies + b.lostCopies + b.damagedCopies,
            }
          : b,
      ),
    );
  }

  const totalTitles = books.length;
  const totalCopies = books.reduce((a, b) => a + b.totalCopies, 0);
  const totalAvailable = books.reduce((a, b) => a + b.availableCopies, 0);
  const totalIssued = books.reduce((a, b) => a + b.issuedCopies, 0);
  const totalDamaged = books.reduce((a, b) => a + b.damagedCopies, 0);
  const totalLost = books.reduce((a, b) => a + b.lostCopies, 0);

  function exportCSV() {
    const header = "Category,Titles,Total Copies,Available,Issued,Damaged,Lost";
    const rows = categories.map((cat) => {
      const catBooks = books.filter((b) => b.category === cat);
      const titles = catBooks.length;
      const copies = catBooks.reduce((a, b) => a + b.totalCopies, 0);
      const avail = catBooks.reduce((a, b) => a + b.availableCopies, 0);
      const issued = catBooks.reduce((a, b) => a + b.issuedCopies, 0);
      const dmg = catBooks.reduce((a, b) => a + b.damagedCopies, 0);
      const lost = catBooks.reduce((a, b) => a + b.lostCopies, 0);
      return `${cat},${titles},${copies},${avail},${issued},${dmg},${lost}`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "books_stock_summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookMarked className="text-primary" size={24} />
          Books Management
        </h2>
        <p className="text-muted-foreground">
          Manage your entire books inventory — titles, stock, categories, and
          condition tracking.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all" data-ocid="books.all.tab">
            All Books
          </TabsTrigger>
          <TabsTrigger value="add" data-ocid="books.add.tab">
            {editingId ? "Edit Book" : "Add Book"}
          </TabsTrigger>
          <TabsTrigger value="categories" data-ocid="books.categories.tab">
            Categories
          </TabsTrigger>
          <TabsTrigger value="damaged" data-ocid="books.damaged.tab">
            Damaged &amp; Lost
            {totalDamaged + totalLost > 0 && (
              <Badge
                variant="destructive"
                className="ml-1.5 px-1.5 py-0 text-xs"
              >
                {totalDamaged + totalLost}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="stock" data-ocid="books.stock.tab">
            Stock Summary
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: All Books ── */}
        <TabsContent value="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Search title, author, ISBN…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
                data-ocid="books.search_input"
              />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-44" data-ocid="books.filter.select">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
                setActiveTab("add");
              }}
              data-ocid="books.add.primary_button"
            >
              <Plus size={16} className="mr-1" /> Add Book
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Publisher</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead className="text-center">Issued</TableHead>
                    <TableHead className="text-center">Damaged</TableHead>
                    <TableHead className="text-center">Lost</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center py-10 text-muted-foreground"
                        data-ocid="books.empty_state"
                      >
                        No books found.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredBooks.map((book, idx) => (
                    <TableRow key={book.id} data-ocid={`books.item.${idx + 1}`}>
                      <TableCell className="font-medium max-w-[180px] truncate">
                        {book.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {book.author}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {book.isbn}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{book.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {book.publisher}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {book.totalCopies}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">
                          {book.availableCopies}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-blue-600">
                          {book.issuedCopies}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {book.damagedCopies > 0 ? (
                          <span className="text-amber-600 font-medium">
                            {book.damagedCopies}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {book.lostCopies > 0 ? (
                          <span className="text-red-600 font-medium">
                            {book.lostCopies}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(book)}
                            data-ocid={`books.edit_button.${idx + 1}`}
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(book.id)}
                            className="text-destructive hover:text-destructive"
                            data-ocid={`books.delete_button.${idx + 1}`}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Add / Edit Book ── */}
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Book" : "Add New Book"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Book title"
                    data-ocid="books.title.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Author <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={form.author}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, author: e.target.value }))
                    }
                    placeholder="Author name"
                    data-ocid="books.author.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    ISBN <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={form.isbn}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isbn: e.target.value }))
                    }
                    placeholder="978-XXXXXXXXXX"
                    data-ocid="books.isbn.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, category: v }))
                    }
                  >
                    <SelectTrigger data-ocid="books.category.select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    placeholder="Subject area"
                    data-ocid="books.subject.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Publisher</Label>
                  <Input
                    value={form.publisher}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, publisher: e.target.value }))
                    }
                    placeholder="Publisher name"
                    data-ocid="books.publisher.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Edition</Label>
                  <Input
                    value={form.edition}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, edition: e.target.value }))
                    }
                    placeholder="e.g. 3rd"
                    data-ocid="books.edition.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Year Published</Label>
                  <Input
                    value={form.yearPublished}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, yearPublished: e.target.value }))
                    }
                    placeholder="e.g. 2020"
                    data-ocid="books.year.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Total Copies</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.totalCopies}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        totalCopies: Number(e.target.value),
                      }))
                    }
                    data-ocid="books.total_copies.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Available Copies</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.availableCopies}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        availableCopies: Number(e.target.value),
                      }))
                    }
                    data-ocid="books.available_copies.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Damaged Copies</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.damagedCopies}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        damagedCopies: Number(e.target.value),
                      }))
                    }
                    data-ocid="books.damaged_copies.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Lost Copies</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.lostCopies}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        lostCopies: Number(e.target.value),
                      }))
                    }
                    data-ocid="books.lost_copies.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Shelf Location</Label>
                  <Input
                    value={form.shelfLocation}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, shelfLocation: e.target.value }))
                    }
                    placeholder="e.g. A-01"
                    data-ocid="books.shelf.input"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Short description of the book…"
                    rows={3}
                    data-ocid="books.description.textarea"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleSave}
                  disabled={!form.title || !form.author || !form.isbn}
                  data-ocid="books.save.submit_button"
                >
                  {editingId ? "Update Book" : "Save Book"}
                </Button>
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    data-ocid="books.cancel.button"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Categories ── */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Book Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name…"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  data-ocid="books.new_category.input"
                />
                <Button
                  onClick={handleAddCategory}
                  data-ocid="books.add_category.button"
                >
                  <Plus size={16} className="mr-1" /> Add
                </Button>
              </div>
              <div className="divide-y divide-border">
                {categories.map((cat, idx) => (
                  <div
                    key={cat}
                    className="flex items-center gap-3 py-2.5"
                    data-ocid={`books.category.item.${idx + 1}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    {editCatIdx === idx ? (
                      <>
                        <Input
                          className="flex-1 h-8"
                          value={editCatValue}
                          onChange={(e) => setEditCatValue(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleRenameCategory(idx)
                          }
                          autoFocus
                          data-ocid={`books.edit_category.input.${idx + 1}`}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleRenameCategory(idx)}
                          data-ocid={`books.save_category.button.${idx + 1}`}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditCatIdx(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium">
                          {cat}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {books.filter((b) => b.category === cat).length}{" "}
                          book(s)
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditCatIdx(idx);
                            setEditCatValue(cat);
                          }}
                          data-ocid={`books.rename_category.button.${idx + 1}`}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCategory(cat)}
                          data-ocid={`books.delete_category.button.${idx + 1}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Damaged & Lost ── */}
        <TabsContent value="damaged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Damaged &amp; Lost Books
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Title</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Damaged</TableHead>
                    <TableHead className="text-center">Lost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {damagedOrLostBooks.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-muted-foreground"
                        data-ocid="books.damaged.empty_state"
                      >
                        No damaged or lost books recorded.
                      </TableCell>
                    </TableRow>
                  )}
                  {damagedOrLostBooks.map((book, idx) => (
                    <TableRow
                      key={book.id}
                      data-ocid={`books.damaged.item.${idx + 1}`}
                    >
                      <TableCell className="font-medium">
                        {book.title}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {book.isbn}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{book.category}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {book.damagedCopies > 0 ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            {book.damagedCopies} damaged
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {book.lostCopies > 0 ? (
                          <Badge variant="destructive">
                            {book.lostCopies} lost
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {book.damagedCopies > 0 && book.lostCopies > 0 ? (
                          <Badge className="bg-red-100 text-red-800">
                            Damaged + Lost
                          </Badge>
                        ) : book.damagedCopies > 0 ? (
                          <Badge className="bg-amber-100 text-amber-800">
                            Damaged
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Lost</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end flex-wrap">
                          {book.damagedCopies > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkRepaired(book.id)}
                              data-ocid={`books.repair.button.${idx + 1}`}
                              title="Mark Repaired"
                            >
                              <Wrench size={13} className="mr-1" /> Repaired
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReplace(book.id)}
                            data-ocid={`books.replace.button.${idx + 1}`}
                          >
                            <Package size={13} className="mr-1" /> Replace
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleWriteOff(book.id)}
                            data-ocid={`books.writeoff.delete_button.${idx + 1}`}
                          >
                            Write Off
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ── Tab 5: Stock Summary ── */}
        <TabsContent value="stock" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Stock Summary</h3>
            <Button
              variant="outline"
              onClick={exportCSV}
              data-ocid="books.export.button"
            >
              <Download size={15} className="mr-1.5" /> Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "Total Titles",
                value: totalTitles,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Total Copies",
                value: totalCopies,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                label: "Available",
                value: totalAvailable,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                label: "Issued",
                value: totalIssued,
                color: "text-sky-600",
                bg: "bg-sky-50",
              },
              {
                label: "Damaged",
                value: totalDamaged,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Lost",
                value: totalLost,
                color: "text-red-600",
                bg: "bg-red-50",
              },
            ].map((s) => (
              <Card
                key={s.label}
                data-ocid={`books.stock.${s.label.toLowerCase().replace(" ", "_")}.card`}
              >
                <CardContent className="pt-4">
                  <div
                    className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-2`}
                  >
                    <BookMarked size={18} />
                  </div>
                  <div className={`text-2xl font-bold ${s.color}`}>
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {s.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Per-Category Breakdown
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Titles</TableHead>
                    <TableHead className="text-center">Total Copies</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead className="text-center">Issued</TableHead>
                    <TableHead className="text-center">Damaged</TableHead>
                    <TableHead className="text-center">Lost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories
                    .filter((cat) => books.some((b) => b.category === cat))
                    .map((cat, idx) => {
                      const catBooks = books.filter((b) => b.category === cat);
                      const copies = catBooks.reduce(
                        (a, b) => a + b.totalCopies,
                        0,
                      );
                      const avail = catBooks.reduce(
                        (a, b) => a + b.availableCopies,
                        0,
                      );
                      const issued = catBooks.reduce(
                        (a, b) => a + b.issuedCopies,
                        0,
                      );
                      const dmg = catBooks.reduce(
                        (a, b) => a + b.damagedCopies,
                        0,
                      );
                      const lost = catBooks.reduce(
                        (a, b) => a + b.lostCopies,
                        0,
                      );
                      return (
                        <TableRow
                          key={cat}
                          data-ocid={`books.stock.row.${idx + 1}`}
                        >
                          <TableCell>
                            <Badge variant="outline">{cat}</Badge>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {catBooks.length}
                          </TableCell>
                          <TableCell className="text-center">
                            {copies}
                          </TableCell>
                          <TableCell className="text-center text-green-600 font-medium">
                            {avail}
                          </TableCell>
                          <TableCell className="text-center text-blue-600">
                            {issued}
                          </TableCell>
                          <TableCell className="text-center">
                            {dmg > 0 ? (
                              <span className="text-amber-600 font-medium">
                                {dmg}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {lost > 0 ? (
                              <span className="text-red-600 font-medium">
                                {lost}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  <TableRow className="font-bold bg-muted/30">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-center">{totalTitles}</TableCell>
                    <TableCell className="text-center">{totalCopies}</TableCell>
                    <TableCell className="text-center text-green-600">
                      {totalAvailable}
                    </TableCell>
                    <TableCell className="text-center text-blue-600">
                      {totalIssued}
                    </TableCell>
                    <TableCell className="text-center text-amber-600">
                      {totalDamaged}
                    </TableCell>
                    <TableCell className="text-center text-red-600">
                      {totalLost}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

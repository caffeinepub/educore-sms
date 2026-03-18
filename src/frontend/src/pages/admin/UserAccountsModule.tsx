import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Edit,
  KeyRound,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../contexts/AppContext";
import type { AppRole, UserAccount } from "../../types";

const roleBadgeColor: Record<AppRole, string> = {
  superadmin: "bg-purple-100 text-purple-700 border-purple-200",
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  teacher: "bg-green-100 text-green-700 border-green-200",
  accountant: "bg-amber-100 text-amber-700 border-amber-200",
  librarian: "bg-cyan-100 text-cyan-700 border-cyan-200",
  student: "bg-indigo-100 text-indigo-700 border-indigo-200",
  parent: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function UserAccountsModule() {
  const {
    userAccounts,
    setUserAccounts,
    forceResetPassword,
    currentSchoolId,
    userProfile,
  } = useApp();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [editAccount, setEditAccount] = useState<UserAccount | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);
  const [resetTarget, setResetTarget] = useState<UserAccount | null>(null);

  const isSuperadmin = userProfile?.role === "superadmin";
  const accounts = isSuperadmin
    ? userAccounts
    : userAccounts.filter(
        (a) => a.schoolId === currentSchoolId || a.schoolId === "system",
      );

  const filtered = accounts.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || a.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalActive = accounts.filter((a) => a.isActive).length;
  const totalInactive = accounts.filter((a) => !a.isActive).length;
  const totalReset = accounts.filter((a) => a.mustChangePassword).length;

  const handleEdit = (acc: UserAccount) => {
    setEditAccount(acc);
    setEditForm({ name: acc.name, email: acc.email });
  };

  const handleSaveEdit = () => {
    if (!editAccount) return;
    setUserAccounts((prev) =>
      prev.map((a) =>
        a.id === editAccount.id
          ? { ...a, name: editForm.name, email: editForm.email }
          : a,
      ),
    );
    toast.success("Account updated successfully");
    setEditAccount(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setUserAccounts((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    toast.success("Account deleted");
    setDeleteTarget(null);
  };

  const handleForceReset = () => {
    if (!resetTarget) return;
    forceResetPassword(resetTarget.id);
    toast.success(`Password reset to Welcome@123 for ${resetTarget.name}`);
    setResetTarget(null);
  };

  const handleToggleActive = (acc: UserAccount) => {
    setUserAccounts((prev) =>
      prev.map((a) => (a.id === acc.id ? { ...a, isActive: !a.isActive } : a)),
    );
    toast.success(`Account ${acc.isActive ? "disabled" : "enabled"}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Accounts</h2>
        <p className="text-muted-foreground">
          Manage login credentials for all users
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Accounts",
            value: accounts.length,
            icon: <Users size={20} />,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Active",
            value: totalActive,
            icon: <UserCheck size={20} />,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Inactive",
            value: totalInactive,
            icon: <UserX size={20} />,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            label: "Must Reset",
            value: totalReset,
            icon: <RefreshCw size={20} />,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div
                className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-3`}
              >
                {s.icon}
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="accounts.search_input"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as AppRole | "all")}
        >
          <SelectTrigger
            className="w-full sm:w-40"
            data-ocid="accounts.role.select"
          >
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {(
              [
                "superadmin",
                "admin",
                "teacher",
                "accountant",
                "librarian",
                "student",
                "parent",
              ] as AppRole[]
            ).map((r) => (
              <SelectItem key={r} value={r} className="capitalize">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-0 overflow-x-auto">
          <Table data-ocid="accounts.table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Must Reset</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                    data-ocid="accounts.empty_state"
                  >
                    No accounts found
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((acc, i) => (
                <TableRow key={acc.id} data-ocid={`accounts.item.${i + 1}`}>
                  <TableCell className="font-medium">{acc.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {acc.email}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${roleBadgeColor[acc.role]}`}
                    >
                      <Shield size={11} />
                      {acc.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={acc.isActive ? "default" : "secondary"}>
                      {acc.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {acc.mustChangePassword ? (
                      <Badge
                        variant="outline"
                        className="text-amber-600 border-amber-300"
                      >
                        Yes
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-300"
                      >
                        No
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {acc.createdAt}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleEdit(acc)}
                        title="Edit"
                        data-ocid={`accounts.edit_button.${i + 1}`}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-amber-600 hover:text-amber-700"
                        onClick={() => setResetTarget(acc)}
                        title="Force Reset Password"
                        data-ocid={`accounts.secondary_button.${i + 1}`}
                      >
                        <KeyRound size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => handleToggleActive(acc)}
                        title={acc.isActive ? "Disable" : "Enable"}
                      >
                        {acc.isActive ? (
                          <UserX size={14} />
                        ) : (
                          <UserCheck size={14} />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(acc)}
                        title="Delete"
                        data-ocid={`accounts.delete_button.${i + 1}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editAccount}
        onOpenChange={(v) => !v && setEditAccount(null)}
      >
        <DialogContent data-ocid="accounts.dialog">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                data-ocid="accounts.input"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                data-ocid="accounts.textarea"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditAccount(null)}
              data-ocid="accounts.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} data-ocid="accounts.save_button">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="accounts.delete_button">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the account for{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="accounts.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="accounts.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Reset Confirm */}
      <AlertDialog
        open={!!resetTarget}
        onOpenChange={(v) => !v && setResetTarget(null)}
      >
        <AlertDialogContent data-ocid="accounts.modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Force Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the password for{" "}
              <strong>{resetTarget?.name}</strong> to <code>Welcome@123</code>{" "}
              and require them to change it on next login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceReset}
              data-ocid="accounts.primary_button"
            >
              Reset Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

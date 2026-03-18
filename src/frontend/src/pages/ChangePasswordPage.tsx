import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";

interface ChangePasswordPageProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordPage({
  open,
  onClose,
}: ChangePasswordPageProps) {
  const { currentAccountId, userAccounts, changePassword } = useApp();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const account = userAccounts.find((a) => a.id === currentAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!account || account.password !== currentPw) {
      setError("Current password is incorrect.");
      return;
    }
    if (newPw.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setError("New passwords do not match.");
      return;
    }
    if (currentAccountId) {
      changePassword(currentAccountId, newPw);
      toast.success("Password changed successfully");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      onClose();
    }
  };

  const PasswordField = ({
    id,
    label,
    value,
    onChange,
    show,
    onToggle,
    ocid,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    ocid: string;
  }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          data-ocid={ocid}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="change_password.dialog">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            id="currentPw"
            label="Current Password"
            value={currentPw}
            onChange={setCurrentPw}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
            ocid="change_password.input"
          />
          <PasswordField
            id="newPw"
            label="New Password"
            value={newPw}
            onChange={setNewPw}
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
            ocid="change_password.textarea"
          />
          <PasswordField
            id="confirmPw"
            label="Confirm New Password"
            value={confirmPw}
            onChange={setConfirmPw}
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            ocid="change_password.select"
          />
          {error && (
            <div
              className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2"
              data-ocid="change_password.error_state"
            >
              {error}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="change_password.cancel_button"
            >
              Cancel
            </Button>
            <Button type="submit" data-ocid="change_password.submit_button">
              Change Password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

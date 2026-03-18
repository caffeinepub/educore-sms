import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, GraduationCap, Lock, Mail } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useApp } from "../contexts/AppContext";

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 400));
    const result = login(email.trim(), password);
    if (!result.success) {
      setError(result.error ?? "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/30 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Branding */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
              <GraduationCap size={30} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                EduCore SMS
              </h1>
              <p className="text-muted-foreground">School Management System</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              "Multi-school management with isolated data",
              "Role-based dashboards for every stakeholder",
              "Library, HR, Students, Front Office & more",
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{f}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: "2", l: "Schools" },
              { n: "10+", l: "Staff" },
              { n: "7", l: "Roles" },
            ].map((s) => (
              <div
                key={s.l}
                className="bg-card rounded-xl p-3 border border-border text-center"
              >
                <div className="text-2xl font-bold text-primary">{s.n}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-border">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 md:hidden mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap size={18} className="text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">EduCore SMS</span>
            </div>
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="email"
                    type="email"
                    data-ocid="login.input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    data-ocid="login.textarea"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-ocid="login.toggle"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                  data-ocid="login.error_state"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!email.trim() || !password.trim() || loading}
                data-ocid="login.submit_button"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Demo Credentials:
              </p>
              <p className="text-xs text-muted-foreground">
                Admin: <span className="font-mono">admin@greenwood.edu</span> /{" "}
                <span className="font-mono">Admin@123</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Superadmin:{" "}
                <span className="font-mono">superadmin@educore.in</span> /{" "}
                <span className="font-mono">Admin@123</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Teacher: <span className="font-mono">james@greenwood.edu</span>{" "}
                / <span className="font-mono">Welcome@123</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

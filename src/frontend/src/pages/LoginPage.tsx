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
import { BarChart3, Building2, Loader2, Shield, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginPageProps {
  onShowRegister: () => void;
}

export function LoginPage({ onShowRegister }: LoginPageProps) {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    login();
  };

  if (isLoginError && loginError) {
    toast.error(loginError.message);
  }

  const features = [
    { icon: Users, label: "Employee Management" },
    { icon: BarChart3, label: "Analytics Dashboard" },
    { icon: Shield, label: "Role-Based Access" },
    { icon: Building2, label: "Multi-Branch Support" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-[oklch(0.17_0.04_220)] to-[oklch(0.12_0.05_210)] p-12 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <img
              src="/assets/generated/workforce-logo-transparent.dim_80x80.png"
              alt="Logo"
              className="w-7 h-7 object-contain"
            />
          </div>
          <span className="text-white font-bold text-xl">WorkForce Pro</span>
        </div>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white leading-tight mb-4"
          >
            Your complete HR
            <br />
            <span className="text-primary">management solution</span>
          </motion.h1>
          <p className="text-white/60 text-base mb-10">
            Streamline employee management, attendance tracking, and leave
            management in one powerful platform.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-white/80 text-sm font-medium">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} WorkForce Pro. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary/70 hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <img
                src="/assets/generated/workforce-logo-transparent.dim_80x80.png"
                alt="Logo"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-bold text-lg text-foreground">
              WorkForce Pro
            </span>
          </div>

          <Card className="shadow-card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    data-ocid="login.input"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    data-ocid="login.password.input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  data-ocid="login.submit_button"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    data-ocid="login.register.link"
                    onClick={onShowRegister}
                    className="text-primary hover:underline font-medium"
                  >
                    Register
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

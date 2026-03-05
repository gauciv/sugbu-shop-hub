import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { signUp } from "@/api/auth";
import { toast } from "sonner";
import { Loader2, ShoppingBag, Store, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function getPasswordStrength(password: string) {
  const checks = [
    password.length >= 6,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];
  return checks.filter(Boolean).length;
}

const STRENGTH_CONFIG = [
  { label: "", color: "" },
  { label: "Very weak", color: "bg-red-400" },
  { label: "Weak", color: "bg-orange-400" },
  { label: "Fair", color: "bg-yellow-400" },
  { label: "Good", color: "bg-emerald-400" },
  { label: "Strong", color: "bg-emerald-500" },
] as const;

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const navigate = useNavigate();

  const passwordValue = watch("password", "");
  const strength = getPasswordStrength(passwordValue);

  async function onSubmit(data: RegisterForm) {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName, role);
      navigate("/verify-email", { state: { email: data.email } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-[32px] border-border/60 shadow-dreamy">
      <CardHeader className="text-center">
        <span className="font-accent text-xl text-accent">~ join us ~</span>
        <CardTitle className="text-2xl font-bold tracking-tight font-display">Join the cozy corner</CardTitle>
        <CardDescription>Create your account and start exploring</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-[20px] border-2 p-4 transition-all",
              role === "buyer"
                ? "border-primary bg-purple-50 text-purple-600 shadow-cozy"
                : "border-border/60 hover:border-purple-200 hover:bg-lavender-100/50"
            )}
          >
            <ShoppingBag className={cn("h-6 w-6", role === "buyer" ? "text-purple-600" : "text-muted-foreground")} />
            <div>
              <p className={cn("text-sm font-semibold", role === "buyer" ? "text-purple-600" : "text-foreground")}>
                Buyer
              </p>
              <p className="text-[11px] text-muted-foreground">Browse & discover finds</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRole("seller")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-[20px] border-2 p-4 transition-all",
              role === "seller"
                ? "border-primary bg-purple-50 text-purple-600 shadow-cozy"
                : "border-border/60 hover:border-purple-200 hover:bg-lavender-100/50"
            )}
          >
            <Store className={cn("h-6 w-6", role === "seller" ? "text-purple-600" : "text-muted-foreground")} />
            <div>
              <p className={cn("text-sm font-semibold", role === "seller" ? "text-purple-600" : "text-foreground")}>
                Seller
              </p>
              <p className="text-[11px] text-muted-foreground">Share your creations</p>
            </div>
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Juan Dela Cruz"
              {...register("fullName", { required: "Name is required" })}
              className="rounded-2xl h-11 border-border/60 focus-visible:ring-purple-400/30"
            />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
              className="rounded-2xl h-11 border-border/60 focus-visible:ring-purple-400/30"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                className="rounded-2xl h-11 border-border/60 pr-10 focus-visible:ring-purple-400/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            {passwordValue.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-colors",
                        i < strength ? STRENGTH_CONFIG[strength].color : "bg-border/60"
                      )}
                    />
                  ))}
                </div>
                <p className={cn(
                  "text-[11px] font-medium",
                  strength <= 2 ? "text-orange-500" : "text-emerald-600"
                )}>
                  {STRENGTH_CONFIG[strength].label}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val) => val === passwordValue || "Passwords do not match",
                })}
                className="rounded-2xl h-11 border-border/60 pr-10 focus-visible:ring-purple-400/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-purple-600 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

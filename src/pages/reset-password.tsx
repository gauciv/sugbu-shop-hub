import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResetForm {
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

export default function ResetPasswordPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordValue = watch("password", "");
  const strength = getPasswordStrength(passwordValue);

  async function onSubmit(data: ResetForm) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="rounded-[32px] border-border/60 shadow-dreamy">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <span className="font-accent text-xl text-accent">~ you're all set ~</span>
          <CardTitle className="text-2xl font-bold tracking-tight font-display">Password updated</CardTitle>
          <CardDescription className="mt-1">
            Your password has been changed successfully. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <Link to="/login">
            <Button className="w-full rounded-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[32px] border-border/60 shadow-dreamy">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
          <KeyRound className="h-7 w-7 text-purple-500" />
        </div>
        <span className="font-accent text-xl text-accent">~ fresh start ~</span>
        <CardTitle className="text-2xl font-bold tracking-tight font-display">Set new password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
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
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sendPasswordResetEmail } from "@/api/auth";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(data: ForgotPasswordForm) {
    setLoading(true);
    try {
      await sendPasswordResetEmail(data.email);
      setSentTo(data.email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <Card className="rounded-[32px] border-border/60 shadow-dreamy">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <span className="font-accent text-xl text-accent">~ check your inbox ~</span>
          <CardTitle className="text-2xl font-bold tracking-tight font-display">Reset link sent</CardTitle>
          <CardDescription className="mt-1">
            If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, we sent a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-8 pt-0">
          <div className="rounded-2xl bg-lavender-100/60 p-4 text-sm text-muted-foreground">
            <p>Click the link in the email to set a new password. If you don't see it, check your spam folder.</p>
          </div>
          <Link to="/login">
            <Button variant="outline" className="w-full rounded-full border-purple-200">
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
          <Mail className="h-7 w-7 text-purple-500" />
        </div>
        <span className="font-accent text-xl text-accent">~ no worries ~</span>
        <CardTitle className="text-2xl font-bold tracking-tight font-display">Forgot your password?</CardTitle>
        <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
        </form>
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border/60" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-purple-600 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

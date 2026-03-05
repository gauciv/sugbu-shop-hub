import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { signIn } from "@/api/auth";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: unknown) {
      let message = "Failed to sign in";
      if (err instanceof Error) {
        if (err.message.includes("Email not confirmed")) {
          message = "Please verify your email before signing in. Check your inbox for the verification link.";
        } else if (err.message.includes("Invalid login credentials")) {
          message = "Incorrect email or password. Please try again.";
        } else {
          message = err.message;
        }
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-[32px] border-border/60 shadow-dreamy">
      <CardHeader className="text-center">
        <span className="font-accent text-xl text-accent">~ welcome back ~</span>
        <CardTitle className="text-2xl font-bold tracking-tight font-display">We missed you!</CardTitle>
        <CardDescription>Sign in to continue shopping</CardDescription>
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password", { required: "Password is required" })}
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
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-purple-600 hover:underline">
                Forgot your password?
              </Link>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border/60" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:text-purple-600 hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

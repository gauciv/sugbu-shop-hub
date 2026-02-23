import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { signUp } from "@/api/auth";
import { toast } from "sonner";
import { Loader2, ShoppingBag, Store } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const navigate = useNavigate();

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
    <Card className="border-border/60 shadow-xl shadow-violet-500/5">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
        <CardDescription>Join the Sugbu marketplace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
              role === "buyer"
                ? "border-violet-500 bg-violet-50 shadow-sm"
                : "border-border/60 hover:border-violet-200 hover:bg-pink-50/50"
            )}
          >
            <ShoppingBag className={cn("h-6 w-6", role === "buyer" ? "text-violet-600" : "text-muted-foreground")} />
            <div>
              <p className={cn("text-sm font-semibold", role === "buyer" ? "text-violet-700" : "text-foreground")}>
                Buyer
              </p>
              <p className="text-[11px] text-muted-foreground">Shop & purchase</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRole("seller")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
              role === "seller"
                ? "border-violet-500 bg-violet-50 shadow-sm"
                : "border-border/60 hover:border-violet-200 hover:bg-pink-50/50"
            )}
          >
            <Store className={cn("h-6 w-6", role === "seller" ? "text-violet-600" : "text-muted-foreground")} />
            <div>
              <p className={cn("text-sm font-semibold", role === "seller" ? "text-violet-700" : "text-foreground")}>
                Seller
              </p>
              <p className="text-[11px] text-muted-foreground">Sell products</p>
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
              className="border-border/60 focus-visible:ring-violet-500/20"
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
              className="border-border/60 focus-visible:ring-violet-500/20"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
              className="border-border/60 focus-visible:ring-violet-500/20"
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm hover:from-violet-700 hover:to-fuchsia-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-violet-600 hover:text-violet-700 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

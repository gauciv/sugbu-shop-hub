import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";

export default function VerifyEmailPage() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? "your email";

  return (
    <Card className="border-border/60 shadow-xl shadow-purple-400/5">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
          <Mail className="h-7 w-7 text-purple-400" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
        <CardDescription className="mt-1">
          We sent a verification link to <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-lavender-100/60 p-4 text-sm text-muted-foreground">
          <p>Click the link in the email to verify your account. Once verified, you can sign in and start using SugbuShop.</p>
          <p className="mt-2">Didn't receive the email? Check your spam folder.</p>
        </div>
        <Link to="/login">
          <Button variant="outline" className="w-full border-purple-200">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

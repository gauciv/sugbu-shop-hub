import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function EmailConfirmedPage() {
  return (
    <Card className="rounded-[32px] border-border/60 shadow-dreamy">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <span className="font-accent text-xl text-accent">~ all done ~</span>
        <CardTitle className="text-2xl font-bold tracking-tight font-display">Email verified</CardTitle>
        <CardDescription className="mt-1">
          Your account has been verified successfully. You can safely close this tab and sign in from your original window.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="rounded-2xl bg-green-50/60 p-4 text-center text-sm text-muted-foreground">
          You may now close this tab.
        </div>
      </CardContent>
    </Card>
  );
}

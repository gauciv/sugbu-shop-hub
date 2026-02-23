import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-8xl font-bold tracking-tighter text-violet-200">404</div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/">
        <Button className="mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>
    </div>
  );
}

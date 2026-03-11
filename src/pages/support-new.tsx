import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTicket } from "@/api/support";
import { TICKET_TYPE_CONFIG, TICKET_TYPES } from "@/lib/constants";
import { useAuth } from "@/context/auth";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function SupportNewPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState<string>("general");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [relatedOrderId, setRelatedOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!profile || profile.role === "admin") {
    return <Navigate to="/" replace />;
  }

  const isValid =
    subject.trim().length > 0 && description.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !profile) return;
    setSubmitting(true);
    try {
      await createTicket({
        submitted_by: profile.id,
        submitted_by_role: profile.role as "buyer" | "seller",
        type,
        subject: subject.trim(),
        description: description.trim(),
        related_order_id: relatedOrderId.trim() || null,
      });
      toast.success("Your support ticket has been submitted. We'll get back to you soon.");
      if (profile.role === "seller") {
        navigate("/seller/orders");
      } else {
        navigate("/orders");
      }
    } catch {
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight">
            Submit a Support Ticket
          </h1>
          <p className="text-sm text-muted-foreground">
            Describe your issue and we'll help resolve it.
          </p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Ticket Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type */}
            <div className="space-y-1.5">
              <Label htmlFor="type">Category</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {TICKET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TICKET_TYPE_CONFIG[t].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue"
                maxLength={120}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened and what you expected..."
                rows={5}
                className="resize-none"
              />
            </div>

            {/* Related Order ID (optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="order-id">
                Related Order ID{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="order-id"
                value={relatedOrderId}
                onChange={(e) => setRelatedOrderId(e.target.value)}
                placeholder="Paste the Order ID if applicable"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                You can find the Order ID on your order detail page.
              </p>
            </div>

            <Button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Ticket
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/api/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@/types";

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 text-center">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto mt-4 h-6 w-48" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Order Placed!</h1>
      <p className="mt-2 text-muted-foreground">
        Your order has been received and is being processed.
      </p>

      {order && (
        <Card className="mt-8 border-border/60 text-left">
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Number</span>
              <span className="font-semibold">{order.order_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span>{order.items?.length ?? 0} items</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/orders">
          <Button variant="outline" className="w-full border-purple-200 sm:w-auto">
            <Package className="mr-2 h-4 w-4" /> View Orders
          </Button>
        </Link>
        <Link to="/shops">
          <Button className="w-full shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-lg sm:w-auto">
            Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

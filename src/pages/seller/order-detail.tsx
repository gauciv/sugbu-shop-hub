import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { getOrderById, updateOrderStatus } from "@/api/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
import { ArrowLeft, Loader2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/types";

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(status: string) {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, status as Order["status"]);
      setOrder((prev) => prev ? { ...prev, status: updated.status } : prev);
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading || !order) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" onClick={() => navigate("/seller/orders")} className="text-muted-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Select value={order.status} onValueChange={handleStatusChange} disabled={updating}>
              <SelectTrigger className="w-48 border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {updating && <Loader2 className="h-4 w-4 animate-spin text-violet-600" />}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-pink-50">
                {item.product_image ? (
                  <img src={item.product_image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><ImageOff className="h-4 w-4 text-muted-foreground/30" /></div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">{item.quantity} x {formatPrice(item.unit_price)}</p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(item.line_total)}</p>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatPrice(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Name:</span> {order.buyer?.full_name}</p>
          <p><span className="text-muted-foreground">Email:</span> {order.buyer?.email}</p>
          <p><span className="text-muted-foreground">Phone:</span> {order.contact_phone ?? "N/A"}</p>
          <p><span className="text-muted-foreground">Address:</span> {order.shipping_address}</p>
          {order.notes && <p><span className="text-muted-foreground">Notes:</span> {order.notes}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

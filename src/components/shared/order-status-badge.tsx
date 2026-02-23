import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_CONFIG, type OrderStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = ORDER_STATUS_CONFIG[status];
  return (
    <Badge variant="secondary" className={cn("border-0 font-medium", config.color)}>
      {config.label}
    </Badge>
  );
}

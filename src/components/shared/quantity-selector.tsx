import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantitySelector({ value, max, onChange }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full border-border/60"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="w-10 text-center text-sm font-semibold tabular-nums">{value}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full border-border/60"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

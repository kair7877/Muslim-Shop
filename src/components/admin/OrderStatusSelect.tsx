import { useState } from "react";
import { updateOrderStatus } from "@/lib/clientStore";
import { orderStatusLabel } from "@/lib/shop";

const STATUSES = ["new", "confirmed", "delivered", "cancelled"];

export function OrderStatusSelect({
  orderId,
  status,
  onChanged,
}: {
  orderId: string;
  status: string;
  onChanged?: () => void;
}) {
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  async function change(next: string) {
    setValue(next);
    setBusy(true);
    try {
      await updateOrderStatus(orderId, next);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => void change(e.target.value)}
      className="ms-field h-10 min-h-10 py-1 font-semibold text-sm"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {orderStatusLabel(s)}
        </option>
      ))}
    </select>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, MapPin, Package } from "lucide-react";
import { useState } from "react";
import { OrderStatus, useMyOrders } from "../hooks/useQueries";

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "Pending",
  [OrderStatus.confirmed]: "Confirmed",
  [OrderStatus.pickedUp]: "Picked Up",
  [OrderStatus.delivered]: "Delivered",
  [OrderStatus.cancelled]: "Cancelled",
};

export function HistoryPage() {
  const { data: orders = [], isLoading } = useMyOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...orders].sort((a, b) => Number(b.createdAt - a.createdAt));

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="navy-bg px-5 pt-12 pb-6">
        <h1 className="text-white font-black text-2xl">Order History</h1>
        <p className="text-white/60 text-sm mt-1">
          {orders.length} {orders.length === 1 ? "order" : "orders"} total
        </p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {isLoading ? (
          ["ld1", "ld2", "ld3"].map((k) => (
            <Skeleton key={k} className="h-24 rounded-2xl" />
          ))
        ) : sorted.length === 0 ? (
          <div
            data-ocid="history.empty_state"
            className="flex flex-col items-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Package size={32} className="text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground text-lg mb-2">
              No Orders Yet
            </h3>
            <p className="text-muted-foreground text-sm">
              Your delivery history will appear here.
            </p>
          </div>
        ) : (
          sorted.map((order, idx) => {
            const isExpanded = expandedId === order.id.toString();
            return (
              <div
                key={order.id.toString()}
                data-ocid={`history.item.${idx + 1}`}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-card"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : order.id.toString())
                  }
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full status-${
                            order.status
                          }`}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin
                          size={12}
                          className="text-green-500 flex-shrink-0"
                        />
                        <p className="text-sm text-foreground truncate">
                          {order.pickupAddress}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin
                          size={12}
                          className="text-red-500 flex-shrink-0"
                        />
                        <p className="text-sm text-muted-foreground truncate">
                          {order.dropAddress}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="font-black text-primary">
                        ₹{Number(order.estimatedPrice)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp
                          size={16}
                          className="text-muted-foreground"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="text-muted-foreground"
                        />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-border animate-fade-in">
                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Order ID
                        </p>
                        <p className="text-sm font-semibold">
                          #{order.id.toString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="text-sm font-semibold">
                          {STATUS_LABELS[order.status]}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Customer
                        </p>
                        <p className="text-sm font-semibold truncate">
                          {order.customerId.slice(0, 8)}...
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-sm font-black text-primary">
                          ₹{Number(order.estimatedPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

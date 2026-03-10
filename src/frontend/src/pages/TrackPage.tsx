import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Package } from "lucide-react";
import { OrderStatus, useMyOrders } from "../hooks/useQueries";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: OrderStatus.pending, label: "Order Placed", icon: "📦" },
  { key: OrderStatus.confirmed, label: "Confirmed", icon: "✅" },
  { key: OrderStatus.pickedUp, label: "Picked Up", icon: "🚚" },
  { key: OrderStatus.delivered, label: "Delivered", icon: "🎉" },
];

function getStepIndex(status: OrderStatus): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export function TrackPage() {
  const { data: orders = [], isLoading } = useMyOrders();

  const activeOrder = orders.find(
    (o) =>
      o.status !== OrderStatus.delivered && o.status !== OrderStatus.cancelled,
  );

  const currentStep = activeOrder ? getStepIndex(activeOrder.status) : -1;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100dvh - 64px)" }}>
      {/* Header */}
      <div className="navy-bg px-5 pt-12 pb-6">
        <h1 className="text-white font-black text-2xl">Track Order</h1>
        <p className="text-white/60 text-sm mt-1">Live delivery tracking</p>
      </div>

      {/* Map placeholder */}
      <div
        data-ocid="tracking.map_marker"
        className="relative mx-4 -mt-4 h-56 rounded-2xl overflow-hidden shadow-elevated"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.75 0.06 210), oklch(0.82 0.04 200))",
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 400 220"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {[40, 80, 120, 160, 200].map((y) => (
            <line
              key={`h-${y}`}
              x1="0"
              y1={y}
              x2="400"
              y2={y}
              stroke="white"
              strokeWidth="0.5"
            />
          ))}
          {[50, 100, 150, 200, 250, 300, 350].map((x) => (
            <line
              key={`v-${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="220"
              stroke="white"
              strokeWidth="0.5"
            />
          ))}
          <path
            d="M 60 180 Q 120 100 200 90 Q 280 80 340 50"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8 4"
          />
        </svg>

        {/* Pin A */}
        <div className="absolute" style={{ left: "14%", top: "72%" }}>
          <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">A</span>
          </div>
        </div>

        {/* Pin B */}
        <div className="absolute" style={{ right: "14%", top: "16%" }}>
          <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">B</span>
          </div>
        </div>

        {/* Vehicle dot */}
        {activeOrder && (
          <div
            className="absolute"
            style={{
              left: "48%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="animate-ripple absolute inset-0 w-6 h-6 rounded-full bg-primary/40" />
            <div className="animate-pulse-dot relative w-6 h-6 rounded-full bg-primary border-2 border-white shadow-orange flex items-center justify-center">
              <span className="text-[8px]">🚚</span>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
          <p className="text-xs font-bold text-foreground">Live Map</p>
        </div>
      </div>

      {/* Active order */}
      {activeOrder ? (
        <div className="mx-4 mt-4 space-y-4">
          {/* Status stepper */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-4">
              Order Status
            </h3>
            <div className="space-y-0">
              {STATUS_STEPS.map((step, idx) => {
                const isActive = idx === currentStep;
                const isDone = idx < currentStep;
                return (
                  <div
                    key={step.key}
                    data-ocid="tracking.status_tab"
                    className="flex items-center gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                          isActive
                            ? "bg-primary text-white shadow-orange animate-pulse-dot"
                            : isDone
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isDone ? "✓" : step.icon}
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-6 transition-colors ${
                            isDone ? "bg-green-500" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-3">
                      <p
                        className={`font-semibold text-sm ${
                          isActive
                            ? "text-primary"
                            : isDone
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isActive && (
                        <p className="text-xs text-muted-foreground">
                          In progress...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order info card */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm">
                Order #{activeOrder.id.toString()}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full status-${
                  activeOrder.status
                }`}
              >
                {activeOrder.status}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  className="text-green-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-sm text-foreground truncate">
                  {activeOrder.pickupAddress}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  className="text-red-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-sm text-foreground truncate">
                  {activeOrder.dropAddress}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Estimated Price
              </span>
              <span className="font-black text-primary">
                ₹{Number(activeOrder.estimatedPrice)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          data-ocid="tracking.empty_state"
          className="flex flex-col items-center justify-center py-16 px-8 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package size={32} className="text-muted-foreground" />
          </div>
          <h3 className="font-bold text-foreground text-lg mb-2">
            No Active Order
          </h3>
          <p className="text-muted-foreground text-sm">
            You don&apos;t have any active delivery right now.
            <br />
            Book one from the Home tab!
          </p>
        </div>
      )}
    </div>
  );
}

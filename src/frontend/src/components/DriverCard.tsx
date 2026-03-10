import { Button } from "@/components/ui/button";
import { Phone, Star } from "lucide-react";
import type { Driver } from "../hooks/useQueries";

interface DriverCardProps {
  driver: Driver;
}

export function DriverCard({ driver }: DriverCardProps) {
  const stars = Number(driver.rating) / 10;
  const initials = driver.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      data-ocid="driver.card"
      className="animate-slide-up bg-card rounded-2xl p-5 shadow-elevated border border-border"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.2 50), oklch(0.55 0.18 30))",
          }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-foreground truncate">
            {driver.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {driver.vehicleTypeName}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={12}
                className={
                  n <= Math.floor(stars)
                    ? "fill-amber-400 text-amber-400"
                    : n <= stars
                      ? "fill-amber-400/50 text-amber-400/50"
                      : "text-muted-foreground/30"
                }
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              {stars.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Call button */}
        <a href={`tel:${driver.phone}`}>
          <Button
            type="button"
            data-ocid="driver.call_button"
            size="icon"
            className="rounded-full bg-primary text-primary-foreground shadow-orange hover:opacity-90"
          >
            <Phone size={18} />
          </Button>
        </a>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Driver assigned</span>
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
          On the way
        </span>
      </div>
    </div>
  );
}

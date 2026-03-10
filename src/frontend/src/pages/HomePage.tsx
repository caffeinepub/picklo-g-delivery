import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { BookingFlow } from "../components/BookingFlow";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useActiveVehicleTypes } from "../hooks/useQueries";

interface HomePageProps {
  onOrderCreated: (orderId: bigint) => void;
  onNavigateTrack: () => void;
}

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune"];

const FEATURES = [
  { icon: "⚡", title: "Fast", desc: "30 min delivery" },
  { icon: "🔒", title: "Secure", desc: "Insured goods" },
  { icon: "📍", title: "Live Track", desc: "Real-time GPS" },
];

export function HomePage({ onOrderCreated, onNavigateTrack }: HomePageProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<
    bigint | undefined
  >();
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const { data: vehicles = [], isLoading } = useActiveVehicleTypes();
  const { identity } = useInternetIdentity();

  const handleBookVehicle = (vehicleId: bigint) => {
    setSelectedVehicleId(vehicleId);
    setBookingOpen(true);
  };

  const handleOrderCreated = (orderId: bigint) => {
    onOrderCreated(orderId);
    setTimeout(() => {
      setBookingOpen(false);
      onNavigateTrack();
    }, 3000);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Header */}
      <div className="navy-bg px-5 pt-12 pb-16 relative overflow-hidden">
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-10"
          style={{ background: "oklch(0.65 0.2 50)" }}
        />
        <div
          className="absolute top-4 -right-4 w-24 h-24 rounded-full opacity-10"
          style={{ background: "oklch(0.65 0.2 50)" }}
        />

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-lg font-black"
              style={{ background: "oklch(0.65 0.2 50)" }}
            >
              P
            </div>
            <span className="text-white font-black text-xl tracking-tight">
              Picklo G
            </span>
          </div>

          {/* City selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCityOpen(!cityOpen)}
              className="flex items-center gap-1.5 bg-white/10 text-white text-sm font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <span className="text-xs">📍</span>
              {selectedCity}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                <title>chevron</title>
                <path d="M0 0l5 6 5-6z" />
              </svg>
            </button>
            {cityOpen && (
              <div className="absolute right-0 top-full mt-2 bg-card rounded-xl shadow-elevated border border-border py-1 z-50 min-w-[140px] animate-fade-in">
                {CITIES.map((city) => (
                  <button
                    type="button"
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setCityOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors ${
                      selectedCity === city
                        ? "text-primary font-semibold"
                        : "text-foreground"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hero text */}
        <div className="mb-6">
          <p className="text-white/70 text-sm font-medium mb-1">
            Hello{identity ? " there" : ""} 👋
          </p>
          <h1 className="text-white text-3xl font-black leading-tight">
            Book a delivery,
            <br />
            <span style={{ color: "oklch(0.85 0.15 60)" }}>anytime.</span>
          </h1>
          <p className="text-white/60 text-sm mt-2">
            Fast, reliable, and affordable delivery across {selectedCity}
          </p>
        </div>

        <Button
          type="button"
          data-ocid="home.book_now_button"
          onClick={() => setBookingOpen(true)}
          className="orange-bg shadow-orange h-12 px-8 text-base font-bold rounded-xl"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Zap size={18} />
          )}
          Book Now
        </Button>
      </div>

      {/* Vehicles grid */}
      <div className="px-4 -mt-6 z-10">
        <div className="bg-card rounded-2xl shadow-elevated border border-border p-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
            Our Services
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
                <Skeleton key={k} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-sm">No services available</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {vehicles.map((v, idx) => (
                <button
                  type="button"
                  key={v.id.toString()}
                  data-ocid={`home.vehicle_item.${idx + 1}`}
                  onClick={() => handleBookVehicle(v.id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 active:scale-95"
                >
                  <span className="text-3xl">{v.iconEmoji}</span>
                  <span className="text-xs font-bold text-foreground leading-tight text-center">
                    {v.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ₹{Number(v.basePrice)}+
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features section */}
      <div className="px-4 mt-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="bg-card rounded-xl p-3 border border-border text-center"
            >
              <div className="text-2xl mb-1">{feat.icon}</div>
              <p className="text-xs font-bold text-foreground">{feat.title}</p>
              <p className="text-[10px] text-muted-foreground">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Promo banner */}
      <div className="px-4 mb-4">
        <div
          className="rounded-2xl p-5 text-white overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.2 0.05 255), oklch(0.28 0.08 260))",
          }}
        >
          <div
            className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20"
            style={{ background: "oklch(0.65 0.2 50)" }}
          />
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-1">
            Promo
          </p>
          <p className="font-black text-lg leading-tight">
            First delivery
            <br />
            <span style={{ color: "oklch(0.85 0.15 60)" }}>FREE</span> of
            charge!
          </p>
          <p className="text-xs text-white/60 mt-2">Use code: PICKLOG1ST</p>
        </div>
      </div>

      {/* Booking flow modal */}
      {bookingOpen && (
        <BookingFlow
          onClose={() => setBookingOpen(false)}
          onOrderCreated={handleOrderCreated}
          initialVehicleId={selectedVehicleId}
        />
      )}
    </div>
  );
}

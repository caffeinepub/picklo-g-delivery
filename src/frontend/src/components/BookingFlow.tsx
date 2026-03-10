import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  MapPin,
  Package,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  type Driver,
  type VehicleType,
  useActiveVehicleTypes,
  useAllDrivers,
  useCreateOrder,
} from "../hooks/useQueries";
import { DriverCard } from "./DriverCard";

interface BookingFlowProps {
  onClose: () => void;
  onOrderCreated: (orderId: bigint) => void;
  initialVehicleId?: bigint;
}

type Step = 1 | 2 | 3 | 4;

const RECENT_ADDRESSES = [
  "Bandra West, Mumbai",
  "Connaught Place, Delhi",
  "Koramangala, Bangalore",
];

function calcEstimate(vehicle: VehicleType): bigint {
  const km = BigInt(Math.floor(Math.random() * 8) + 2);
  return vehicle.basePrice + km * vehicle.perKmRate;
}

export function BookingFlow({ onClose, onOrderCreated }: BookingFlowProps) {
  const [step, setStep] = useState<Step>(1);
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(
    null,
  );
  const [estimatedPrice, setEstimatedPrice] = useState<bigint>(0n);
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<bigint | null>(null);

  const { data: vehicles = [], isLoading: vehiclesLoading } =
    useActiveVehicleTypes();
  const { data: drivers = [] } = useAllDrivers();
  const createOrder = useCreateOrder();

  const handleSelectVehicle = useCallback((v: VehicleType) => {
    setSelectedVehicle(v);
    setEstimatedPrice(calcEstimate(v));
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedVehicle || !pickup || !drop) return;
    try {
      const orderId = await createOrder.mutateAsync({
        pickup,
        drop,
        vehicleTypeId: selectedVehicle.id,
        estimatedPrice,
      });
      setCreatedOrderId(orderId);
      const available = drivers.filter((d) => d.isAvailable);
      if (available.length > 0) {
        setAssignedDriver(
          available[Math.floor(Math.random() * available.length)],
        );
      } else if (drivers.length > 0) {
        setAssignedDriver(drivers[0]);
      }
      setStep(4);
      onOrderCreated(orderId);
      toast.success("Order placed successfully!");
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full"
        onClick={step !== 4 ? onClose : undefined}
        aria-label="Close booking"
      />

      {/* Sheet */}
      <div
        className="animate-slide-up relative w-full max-w-[480px] bg-card rounded-t-3xl overflow-hidden"
        style={{ maxHeight: "92dvh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h2 className="font-bold text-lg">
              {step === 1 && "Set Locations"}
              {step === 2 && "Choose Vehicle"}
              {step === 3 && "Confirm Order"}
              {step === 4 && "Booking Confirmed!"}
            </h2>
            {step !== 4 && (
              <div className="flex items-center gap-1 mt-1">
                {(["Location", "Vehicle", "Confirm"] as const).map(
                  (label, i) => (
                    <div key={label} className="flex items-center gap-1">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i + 1 <= step ? "bg-primary w-8" : "bg-border w-4"
                        }`}
                      />
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
          {step !== 4 && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div
          className="overflow-y-auto px-5 pb-8"
          style={{ maxHeight: "70dvh" }}
        >
          {/* Step 1: Locations */}
          {step === 1 && (
            <div className="space-y-4 py-2">
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500"
                />
                <Input
                  data-ocid="booking.pickup_input"
                  placeholder="Pickup address"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500"
                />
                <Input
                  data-ocid="booking.drop_input"
                  placeholder="Drop address"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Recent
                </p>
                {RECENT_ADDRESSES.map((addr) => (
                  <button
                    type="button"
                    key={addr}
                    onClick={() => (pickup ? setDrop(addr) : setPickup(addr))}
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-accent transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <MapPin size={14} className="text-muted-foreground" />
                    </div>
                    <span className="text-sm">{addr}</span>
                  </button>
                ))}
              </div>

              <Button
                type="button"
                className="w-full h-12 text-base font-semibold orange-bg shadow-orange"
                disabled={!pickup || !drop}
                onClick={() => setStep(2)}
              >
                Continue
                <ChevronRight size={18} />
              </Button>
            </div>
          )}

          {/* Step 2: Vehicle */}
          {step === 2 && (
            <div className="space-y-3 py-2">
              {vehiclesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No vehicles available</p>
                </div>
              ) : (
                vehicles.map((v, idx) => (
                  <button
                    type="button"
                    key={v.id.toString()}
                    data-ocid={`booking.vehicle_item.${idx + 1}`}
                    onClick={() => handleSelectVehicle(v)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      selectedVehicle?.id === v.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{v.iconEmoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base">{v.name}</span>
                          <span className="font-bold text-primary">
                            ₹{Number(v.basePrice)}
                            <span className="text-xs text-muted-foreground font-normal">
                              {" "}
                              onwards
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {v.capacityDescription}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ₹{Number(v.perKmRate)}/km
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}

              <Button
                type="button"
                className="w-full h-12 text-base font-semibold orange-bg shadow-orange"
                disabled={!selectedVehicle}
                onClick={() => setStep(3)}
              >
                Continue
                <ChevronRight size={18} />
              </Button>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && selectedVehicle && (
            <div className="space-y-4 py-2">
              <div className="bg-accent/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup</p>
                    <p className="font-semibold text-sm">{pickup}</p>
                  </div>
                </div>
                <div className="ml-[5px] border-l-2 border-dashed border-border h-4" />
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Drop</p>
                    <p className="font-semibold text-sm">{drop}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedVehicle.iconEmoji}</span>
                  <div className="flex-1">
                    <p className="font-bold">{selectedVehicle.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedVehicle.capacityDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-primary/10 rounded-2xl p-4">
                <span className="font-semibold text-foreground">
                  Estimated Price
                </span>
                <span className="text-2xl font-black text-primary">
                  ₹{Number(estimatedPrice)}
                </span>
              </div>

              <Button
                type="button"
                data-ocid="booking.place_order_button"
                className="w-full h-12 text-base font-semibold orange-bg shadow-orange"
                disabled={createOrder.isPending}
                onClick={handlePlaceOrder}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Placing
                    Order...
                  </>
                ) : (
                  <>
                    Place Order <ChevronRight size={18} />
                  </>
                )}
              </Button>

              <Button
                type="button"
                data-ocid="booking.confirm_button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="py-4 space-y-6">
              <div className="flex flex-col items-center py-4">
                <div className="relative w-20 h-20 mb-4">
                  <div className="absolute inset-0 rounded-full bg-green-100 animate-ripple" />
                  <div className="relative w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-foreground">
                  Booking Confirmed!
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Order #{createdOrderId?.toString()}
                </p>
              </div>

              {assignedDriver ? (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">
                    Your Driver
                  </p>
                  <DriverCard driver={assignedDriver} />
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">A driver will be assigned shortly</p>
                </div>
              )}

              <Button
                type="button"
                className="w-full h-12 text-base font-semibold orange-bg shadow-orange"
                onClick={onClose}
              >
                Track Order
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

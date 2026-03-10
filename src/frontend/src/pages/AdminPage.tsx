import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Loader2, Plus, Star, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  OrderStatus,
  type VehicleType,
  useActiveVehicleTypes,
  useAddServiceArea,
  useAddVehicleType,
  useAllDrivers,
  useAllOrders,
  useIsAdmin,
  useToggleVehicleActive,
  useUpdateOrderStatus,
  useUpdateVehicleType,
} from "../hooks/useQueries";

const STATUS_OPTIONS = [
  OrderStatus.pending,
  OrderStatus.confirmed,
  OrderStatus.pickedUp,
  OrderStatus.delivered,
  OrderStatus.cancelled,
];

const SAMPLE_AREAS = [
  "Mumbai — Bandra, Andheri, Kurla",
  "Delhi — Connaught Place, Lajpat Nagar",
  "Bangalore — Koramangala, Whitefield",
  "Hyderabad — Hitech City, Banjara Hills",
];

interface VehicleFormState {
  name: string;
  iconEmoji: string;
  basePrice: string;
  perKmRate: string;
  capacityDescription: string;
}

const emptyForm: VehicleFormState = {
  name: "",
  iconEmoji: "🚚",
  basePrice: "",
  perKmRate: "",
  capacityDescription: "",
};

export function AdminPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: vehicles = [], isLoading: vehiclesLoading } =
    useActiveVehicleTypes();
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();
  const { data: drivers = [], isLoading: driversLoading } = useAllDrivers();
  const addVehicle = useAddVehicleType();
  const updateVehicle = useUpdateVehicleType();
  const toggleActive = useToggleVehicleActive();
  const updateStatus = useUpdateOrderStatus();
  const addArea = useAddServiceArea();

  const [form, setForm] = useState<VehicleFormState>(emptyForm);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [newArea, setNewArea] = useState("");
  const [areas, setAreas] = useState<string[]>(SAMPLE_AREAS);

  if (adminLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="font-black text-xl text-foreground mb-2">
          Access Denied
        </h2>
        <p className="text-muted-foreground text-sm">
          You don't have permission to access the admin panel.
        </p>
      </div>
    );
  }

  const handleSaveVehicle = async () => {
    if (!form.name || !form.basePrice || !form.perKmRate) {
      toast.error("Please fill all required fields");
      return;
    }
    const vt: VehicleType = {
      id: editingId ?? BigInt(Date.now()),
      name: form.name,
      iconEmoji: form.iconEmoji || "🚚",
      basePrice: BigInt(Math.round(Number(form.basePrice))),
      perKmRate: BigInt(Math.round(Number(form.perKmRate))),
      capacityDescription: form.capacityDescription,
      isActive: true,
    };
    try {
      if (editingId !== null) {
        await updateVehicle.mutateAsync({ id: editingId, vehicleType: vt });
        toast.success("Vehicle updated!");
      } else {
        await addVehicle.mutateAsync(vt);
        toast.success("Vehicle added!");
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch {
      toast.error("Failed to save vehicle");
    }
  };

  const handleAddArea = async () => {
    if (!newArea.trim()) return;
    try {
      await addArea.mutateAsync(newArea.trim());
      setAreas((prev) => [...prev, newArea.trim()]);
      setNewArea("");
      toast.success("Service area added!");
    } catch {
      toast.error("Failed to add area");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="navy-bg px-5 pt-12 pb-6">
        <h1 className="text-white font-black text-2xl">Admin Panel</h1>
        <p className="text-white/60 text-sm mt-1">
          Manage your delivery service
        </p>
      </div>

      <div className="px-4 py-4">
        <Tabs defaultValue="vehicles">
          <TabsList className="w-full mb-4 grid grid-cols-4 h-11">
            <TabsTrigger
              data-ocid="admin.vehicle_tab"
              value="vehicles"
              className="text-xs font-semibold"
            >
              Vehicles
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.orders_tab"
              value="orders"
              className="text-xs font-semibold"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.areas_tab"
              value="areas"
              className="text-xs font-semibold"
            >
              Areas
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.riders_tab"
              value="riders"
              className="text-xs font-semibold"
            >
              Riders
            </TabsTrigger>
          </TabsList>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-4">
            <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
              <h3 className="font-bold text-sm">
                {editingId !== null ? "Edit Vehicle" : "Add New Vehicle"}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Name (e.g. Bike)"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="h-10"
                />
                <Input
                  placeholder="Emoji (e.g. 🛵)"
                  value={form.iconEmoji}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, iconEmoji: e.target.value }))
                  }
                  className="h-10"
                />
                <Input
                  type="number"
                  placeholder="Base price (₹)"
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, basePrice: e.target.value }))
                  }
                  className="h-10"
                />
                <Input
                  type="number"
                  placeholder="Per km rate (₹)"
                  value={form.perKmRate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, perKmRate: e.target.value }))
                  }
                  className="h-10"
                />
              </div>
              <Input
                placeholder="Capacity description"
                value={form.capacityDescription}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    capacityDescription: e.target.value,
                  }))
                }
                className="h-10"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  data-ocid="admin.save_vehicle_button"
                  onClick={handleSaveVehicle}
                  disabled={addVehicle.isPending || updateVehicle.isPending}
                  className="flex-1 orange-bg shadow-orange h-10"
                >
                  {addVehicle.isPending || updateVehicle.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : editingId !== null ? (
                    "Update Vehicle"
                  ) : (
                    <>
                      <Plus size={16} /> Add Vehicle
                    </>
                  )}
                </Button>
                {editingId !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm(emptyForm);
                      setEditingId(null);
                    }}
                    className="h-10"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {vehiclesLoading
                ? ["vl1", "vl2", "vl3"].map((k) => (
                    <Skeleton key={k} className="h-16 rounded-xl" />
                  ))
                : vehicles.map((v) => (
                    <div
                      key={v.id.toString()}
                      className="bg-card rounded-xl border border-border p-3 flex items-center gap-3"
                    >
                      <span className="text-2xl">{v.iconEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{v.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{Number(v.basePrice)} base · ₹{Number(v.perKmRate)}
                          /km
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={v.isActive}
                          onCheckedChange={async () => {
                            try {
                              await toggleActive.mutateAsync(v.id);
                            } catch {
                              toast.error("Failed to toggle");
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(v.id);
                            setForm({
                              name: v.name,
                              iconEmoji: v.iconEmoji,
                              basePrice: v.basePrice.toString(),
                              perKmRate: v.perKmRate.toString(),
                              capacityDescription: v.capacityDescription,
                            });
                          }}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                          aria-label="Edit vehicle"
                        >
                          <Edit2 size={14} className="text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-3">
            {ordersLoading ? (
              ["od1", "od2", "od3", "od4"].map((k) => (
                <Skeleton key={k} className="h-20 rounded-xl" />
              ))
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id.toString()}
                  className="bg-card rounded-xl border border-border p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">
                      #{order.id.toString()}
                    </span>
                    <span className="font-bold text-primary text-sm">
                      ₹{Number(order.estimatedPrice)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">
                    {order.pickupAddress} → {order.dropAddress}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full status-${
                        order.status
                      }`}
                    >
                      {order.status}
                    </span>
                    <select
                      className="ml-auto text-xs border border-border rounded-lg px-2 py-1 bg-background"
                      value={order.status}
                      onChange={async (e) => {
                        try {
                          await updateStatus.mutateAsync({
                            id: order.id,
                            status: e.target.value as OrderStatus,
                          });
                          toast.success("Status updated");
                        } catch {
                          toast.error("Failed to update status");
                        }
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Areas Tab */}
          <TabsContent value="areas" className="space-y-4">
            <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
              <h3 className="font-bold text-sm">Add Service Area</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="City or area name"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  className="h-10 flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddArea()}
                />
                <Button
                  type="button"
                  data-ocid="admin.add_area_button"
                  onClick={handleAddArea}
                  disabled={addArea.isPending}
                  className="orange-bg shadow-orange h-10 px-4"
                >
                  {addArea.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {areas.map((area) => (
                <div
                  key={area}
                  className="bg-card rounded-xl border border-border p-3 flex items-center gap-3"
                >
                  <span className="text-lg">📍</span>
                  <div>
                    <p className="text-sm font-semibold">
                      {area.split(" — ")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {area.split(" — ")[1] || area}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Riders Tab */}
          <TabsContent value="riders" className="space-y-3">
            {driversLoading ? (
              ["dr1", "dr2", "dr3"].map((k) => (
                <Skeleton key={k} className="h-20 rounded-xl" />
              ))
            ) : drivers.length === 0 ? (
              <div
                data-ocid="admin.riders.empty_state"
                className="text-center py-16 text-muted-foreground"
              >
                <Truck size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Koi rider nahi abhi</p>
                <p className="text-xs mt-1">
                  Jab riders join karenge, yahan dikhenge
                </p>
              </div>
            ) : (
              drivers.map((driver) => (
                <div
                  key={driver.id.toString()}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full orange-bg flex items-center justify-center shrink-0">
                      <span className="text-white font-black text-sm">
                        {driver.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{driver.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {driver.phone} · {driver.vehicleTypeName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <Star
                          size={12}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        <span className="text-xs font-bold">
                          {Number(driver.rating).toFixed(1)}
                        </span>
                      </div>
                      <Badge
                        variant={driver.isAvailable ? "default" : "secondary"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {driver.isAvailable ? "Active" : "Offline"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

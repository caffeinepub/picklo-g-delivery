import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Loader2,
  LogIn,
  MapPin,
  Star,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  OrderStatus,
  useAllOrders,
  useAssignDriver,
  useRiderProfile,
  useSaveProfile,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

const VEHICLE_TYPES = ["Bike", "Auto", "Mini Truck", "Tempo", "Large Truck"];

function getStatusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    [OrderStatus.pending]: "Pending",
    [OrderStatus.confirmed]: "Confirmed",
    [OrderStatus.pickedUp]: "Picked Up",
    [OrderStatus.delivered]: "Delivered",
    [OrderStatus.cancelled]: "Cancelled",
  };
  return map[status] ?? status;
}

export function RiderPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: profileResult, isLoading: profileLoading } = useRiderProfile();
  const saveProfile = useSaveProfile();
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();
  const assignDriver = useAssignDriver();
  const updateStatus = useUpdateOrderStatus();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    vehicleType: "",
    city: "",
  });
  const [isActive, setIsActive] = useState(true);
  const [registered, setRegistered] = useState(false);

  const hasProfile = registered || profileResult != null;
  const riderName = profileResult?.name ?? form.name;

  const pendingOrders = orders.filter(
    (o) => o.status === OrderStatus.pending && !o.assignedDriverId,
  );

  const myDeliveries = orders.filter((o) => !!o.assignedDriverId);

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full orange-bg flex items-center justify-center mb-6 shadow-orange">
          <Truck size={36} className="text-white" />
        </div>
        <h2 className="font-black text-2xl text-foreground mb-2">
          Rider Ban Jao!
        </h2>
        <p className="text-muted-foreground text-sm mb-8 max-w-xs">
          Picklo G ke saath delivery karke paise kamao. Pehle login karo.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="orange-bg shadow-orange font-bold rounded-full px-8 py-5"
        >
          {isLoggingIn ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : (
            <LogIn size={16} className="mr-2" />
          )}
          {isLoggingIn ? "Logging in..." : "Pehle Login Karo"}
        </Button>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="flex flex-col">
        <div className="navy-bg px-5 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl orange-bg flex items-center justify-center">
              <Truck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-2xl">
                Rider Join Karo
              </h1>
              <p className="text-white/60 text-xs">
                Picklo G delivery partner bano
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-4">
          <div
            data-ocid="rider.registration_form"
            className="bg-card rounded-2xl border border-border p-5 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="riderName" className="text-sm font-semibold">
                Poora Naam <span className="text-destructive">*</span>
              </Label>
              <Input
                id="riderName"
                data-ocid="rider.name_input"
                placeholder="Jaise: Rahul Sharma"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="riderPhone" className="text-sm font-semibold">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="riderPhone"
                data-ocid="rider.phone_input"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                Vehicle Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.vehicleType}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, vehicleType: v }))
                }
              >
                <SelectTrigger
                  data-ocid="rider.vehicle_select"
                  className="h-11"
                >
                  <SelectValue placeholder="Vehicle chuniye" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((vt) => (
                    <SelectItem key={vt} value={vt}>
                      {vt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="riderCity" className="text-sm font-semibold">
                City
              </Label>
              <Input
                id="riderCity"
                data-ocid="rider.city_input"
                placeholder="Jaise: Mumbai"
                value={form.city}
                onChange={(e) =>
                  setForm((p) => ({ ...p, city: e.target.value }))
                }
                className="h-11"
              />
            </div>

            <Button
              data-ocid="rider.submit_button"
              className="w-full orange-bg shadow-orange font-bold h-12 text-base"
              disabled={saveProfile.isPending}
              onClick={async () => {
                if (!form.name || !form.phone || !form.vehicleType) {
                  toast.error("Naam, phone aur vehicle type zaroori hai!");
                  return;
                }
                try {
                  await saveProfile.mutateAsync({
                    name: form.name,
                    phone: form.phone,
                  });
                  setRegistered(true);
                  toast.success("Welcome to Picklo G rider family! 🎉");
                } catch {
                  toast.error("Registration fail hua, dobara try karo");
                }
              }}
            >
              {saveProfile.isPending ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : (
                <CheckCircle2 size={18} className="mr-2" />
              )}
              {saveProfile.isPending ? "Saving..." : "Join Picklo G as Rider"}
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4 flex gap-3 items-start">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-sm font-bold">Competitive Earnings</p>
              <p className="text-xs text-muted-foreground">
                Har delivery pe transparent pricing. Apne hisab se kaam karo.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="navy-bg px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs mb-0.5">Namaste,</p>
            <h1 className="text-white font-black text-xl">
              {riderName || "Rider"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-xs font-semibold">
              {isActive ? "Active" : "Offline"}
            </span>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white font-black text-lg">
              {pendingOrders.length}
            </p>
            <p className="text-white/60 text-[10px] font-semibold">Available</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white font-black text-lg">
              {myDeliveries.length}
            </p>
            <p className="text-white/60 text-[10px] font-semibold">
              My Deliveries
            </p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-white font-black text-lg">4.8</p>
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-white/60 text-[10px] font-semibold">Rating</p>
          </div>
        </div>
      </div>

      <div data-ocid="rider.dashboard" className="px-4 py-4">
        <Tabs defaultValue="available">
          <TabsList className="w-full mb-4 grid grid-cols-2 h-11">
            <TabsTrigger
              data-ocid="rider.available_tab"
              value="available"
              className="text-xs font-semibold"
            >
              Available Orders
            </TabsTrigger>
            <TabsTrigger
              data-ocid="rider.mydeliveries_tab"
              value="mydeliveries"
              className="text-xs font-semibold"
            >
              My Deliveries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-3">
            {ordersLoading ? (
              [1, 2, 3].map((k) => (
                <Skeleton key={k} className="h-24 rounded-xl" />
              ))
            ) : pendingOrders.length === 0 ? (
              <div
                data-ocid="rider.empty_state"
                className="text-center py-16 text-muted-foreground"
              >
                <Truck size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Abhi koi order nahi</p>
                <p className="text-xs mt-1">Nayi orders aate hi dikhenge</p>
              </div>
            ) : (
              pendingOrders.map((order, idx) => (
                <div
                  key={order.id.toString()}
                  className="bg-card rounded-xl border border-border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">
                      Order #{order.id.toString()}
                    </span>
                    <span className="font-black text-primary">
                      ₹{Number(order.estimatedPrice)}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={12}
                        className="text-green-500 mt-0.5 shrink-0"
                      />
                      <p className="text-xs text-foreground leading-tight">
                        {order.pickupAddress}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={12}
                        className="text-red-500 mt-0.5 shrink-0"
                      />
                      <p className="text-xs text-foreground leading-tight">
                        {order.dropAddress}
                      </p>
                    </div>
                  </div>
                  <Button
                    data-ocid={`rider.accept_button.${idx + 1}`}
                    className="w-full orange-bg shadow-orange font-bold h-10 text-sm"
                    disabled={assignDriver.isPending}
                    onClick={async () => {
                      try {
                        await assignDriver.mutateAsync({
                          orderId: order.id,
                          driverId: BigInt(1),
                        });
                        toast.success("Order accept kar liya! 🚀");
                      } catch {
                        toast.error("Accept nahi hua, dobara try karo");
                      }
                    }}
                  >
                    {assignDriver.isPending ? (
                      <Loader2 size={14} className="animate-spin mr-2" />
                    ) : null}
                    Accept Order
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="mydeliveries" className="space-y-3">
            {ordersLoading ? (
              [1, 2].map((k) => (
                <Skeleton key={k} className="h-28 rounded-xl" />
              ))
            ) : myDeliveries.length === 0 ? (
              <div
                data-ocid="rider.empty_state"
                className="text-center py-16 text-muted-foreground"
              >
                <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Koi delivery nahi abhi</p>
                <p className="text-xs mt-1">Accept karo available orders se</p>
              </div>
            ) : (
              myDeliveries.map((order, idx) => (
                <div
                  key={order.id.toString()}
                  className="bg-card rounded-xl border border-border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">
                      Order #{order.id.toString()}
                    </span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={12}
                        className="text-green-500 mt-0.5 shrink-0"
                      />
                      <p className="text-xs leading-tight">
                        {order.pickupAddress}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={12}
                        className="text-red-500 mt-0.5 shrink-0"
                      />
                      <p className="text-xs leading-tight">
                        {order.dropAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {order.status === OrderStatus.confirmed ||
                    order.status === OrderStatus.pending ? (
                      <Button
                        data-ocid={`rider.pickup_button.${idx + 1}`}
                        size="sm"
                        className="flex-1 h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={updateStatus.isPending}
                        onClick={async () => {
                          try {
                            await updateStatus.mutateAsync({
                              id: order.id,
                              status: OrderStatus.pickedUp,
                            });
                            toast.success("Pickup ho gaya!");
                          } catch {
                            toast.error("Update nahi hua");
                          }
                        }}
                      >
                        📦 Pickup Kar Liya
                      </Button>
                    ) : null}
                    {order.status === OrderStatus.pickedUp ? (
                      <Button
                        data-ocid={`rider.deliver_button.${idx + 1}`}
                        size="sm"
                        className="flex-1 h-9 text-xs font-bold bg-green-600 hover:bg-green-700 text-white"
                        disabled={updateStatus.isPending}
                        onClick={async () => {
                          try {
                            await updateStatus.mutateAsync({
                              id: order.id,
                              status: OrderStatus.delivered,
                            });
                            toast.success("Delivery complete! Bahut badiya 🎉");
                          } catch {
                            toast.error("Update nahi hua");
                          }
                        }}
                      >
                        ✅ Deliver Kar Diya
                      </Button>
                    ) : null}
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

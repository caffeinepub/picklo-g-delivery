import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Driver, Order, UserProfile, VehicleType } from "../backend";
import { OrderStatus } from "../backend";
import { useActor } from "./useActor";

export type { VehicleType, Order, Driver, UserProfile };
export { OrderStatus };

export function useActiveVehicleTypes() {
  const { actor, isFetching } = useActor();
  return useQuery<VehicleType[]>({
    queryKey: ["activeVehicleTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveVehicleTypes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllDrivers() {
  const { actor, isFetching } = useActor();
  return useQuery<Driver[]>({
    queryKey: ["allDrivers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDrivers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pickup,
      drop,
      vehicleTypeId,
      estimatedPrice,
    }: {
      pickup: string;
      drop: string;
      vehicleTypeId: bigint;
      estimatedPrice: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrder(pickup, drop, vehicleTypeId, estimatedPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

export function useAddVehicleType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleType: VehicleType) => {
      if (!actor) throw new Error("Not connected");
      return actor.addVehicleType(vehicleType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeVehicleTypes"] });
    },
  });
}

export function useUpdateVehicleType() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      vehicleType,
    }: { id: bigint; vehicleType: VehicleType }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateVehicleType(id, vehicleType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeVehicleTypes"] });
    },
  });
}

export function useToggleVehicleActive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.toggleVehicleTypeActive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeVehicleTypes"] });
    },
  });
}

export function useAddServiceArea() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.addServiceArea(name);
    },
  });
}

export function useAssignDriver() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      driverId,
    }: { orderId: bigint; driverId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignDriverToOrder(orderId, driverId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useRiderProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["riderProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: { name: string; phone: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riderProfile"] });
    },
  });
}

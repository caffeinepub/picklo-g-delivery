import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface VehicleType {
    id: bigint;
    capacityDescription: string;
    name: string;
    perKmRate: bigint;
    isActive: boolean;
    iconEmoji: string;
    basePrice: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    estimatedPrice: bigint;
    createdAt: bigint;
    assignedDriverId?: bigint;
    pickupAddress: string;
    customerId: string;
    dropAddress: string;
    vehicleTypeId: bigint;
}
export interface UserProfile {
    name: string;
    phone: string;
}
export interface Driver {
    id: bigint;
    name: string;
    isAvailable: boolean;
    vehicleTypeName: string;
    rating: bigint;
    phone: string;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    pickedUp = "pickedUp",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addServiceArea(name: string): Promise<void>;
    addVehicleType(vehicleType: VehicleType): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignDriverToOrder(orderId: bigint, driverId: bigint): Promise<void>;
    createOrder(pickupAddress: string, dropAddress: string, vehicleTypeId: bigint, estimatedPrice: bigint): Promise<bigint>;
    getActiveVehicleTypes(): Promise<Array<VehicleType>>;
    getAllDrivers(): Promise<Array<Driver>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyOrders(): Promise<Array<Order>>;
    getOrderById(id: bigint): Promise<Order>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleServiceAreaActive(id: bigint): Promise<void>;
    toggleVehicleTypeActive(id: bigint): Promise<void>;
    updateOrderStatus(id: bigint, status: OrderStatus): Promise<void>;
    updateVehicleType(id: bigint, vehicleType: VehicleType): Promise<void>;
}

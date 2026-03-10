import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Data Types
  public type VehicleType = {
    id : Nat;
    name : Text;
    iconEmoji : Text;
    basePrice : Nat;
    perKmRate : Nat;
    capacityDescription : Text;
    isActive : Bool;
  };

  public type Driver = {
    id : Nat;
    name : Text;
    phone : Text;
    vehicleTypeName : Text;
    rating : Nat;
    isAvailable : Bool;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #pickedUp;
    #delivered;
    #cancelled;
  };

  public type Order = {
    id : Nat;
    customerId : Text;
    pickupAddress : Text;
    dropAddress : Text;
    vehicleTypeId : Nat;
    status : OrderStatus;
    estimatedPrice : Nat;
    assignedDriverId : ?Nat;
    createdAt : Int;
  };

  public type ServiceArea = {
    id : Nat;
    name : Text;
    isActive : Bool;
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
  };

  module OrderModule {
    public func compare(order1 : Order, order2 : Order) : Order.Order {
      switch (Int.compare(order2.createdAt, order1.createdAt)) {
        case (#equal) { Nat.compare(order1.id, order2.id) };
        case (order) { order };
      };
    };
  };

  // Modular State Management
  let vehicleTypes = Map.empty<Nat, VehicleType>();
  let drivers = Map.empty<Nat, Driver>();
  let orders = Map.empty<Nat, Order>();
  let serviceAreas = Map.empty<Nat, ServiceArea>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextVehicleTypeId = 6;
  var nextDriverId = 4;
  var nextOrderId = 1;
  var nextServiceAreaId = 1;

  // Initialize and store the authorization system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Seed Data
  vehicleTypes.add(
    1,
    {
      id = 1;
      name = "Bike";
      iconEmoji = "🚴";
      basePrice = 30;
      perKmRate = 8;
      capacityDescription = "Small packages";
      isActive = true;
    },
  );
  vehicleTypes.add(
    2,
    {
      id = 2;
      name = "Auto";
      iconEmoji = "🛺";
      basePrice = 50;
      perKmRate = 12;
      capacityDescription = "Small/Medium packages";
      isActive = true;
    },
  );
  vehicleTypes.add(
    3,
    {
      id = 3;
      name = "Mini Truck";
      iconEmoji = "🚚";
      basePrice = 150;
      perKmRate = 20;
      capacityDescription = "Household items";
      isActive = true;
    },
  );
  vehicleTypes.add(
    4,
    {
      id = 4;
      name = "Tempo";
      iconEmoji = "🏎️";
      basePrice = 250;
      perKmRate = 30;
      capacityDescription = "Large packages";
      isActive = true;
    },
  );
  vehicleTypes.add(
    5,
    {
      id = 5;
      name = "Large Truck";
      iconEmoji = "🚛";
      basePrice = 400;
      perKmRate = 45;
      capacityDescription = "Bulk items";
      isActive = true;
    },
  );

  drivers.add(
    1,
    {
      id = 1;
      name = "Rajesh Kumar";
      phone = "9876543210";
      vehicleTypeName = "Bike";
      rating = 48;
      isAvailable = true;
    },
  );
  drivers.add(
    2,
    {
      id = 2;
      name = "Sunita Mehra";
      phone = "9156237890";
      vehicleTypeName = "Auto";
      rating = 45;
      isAvailable = true;
    },
  );
  drivers.add(
    3,
    {
      id = 3;
      name = "Ajay Sharma";
      phone = "9845671230";
      vehicleTypeName = "Mini Truck";
      rating = 50;
      isAvailable = true;
    },
  );

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin Functions
  public shared ({ caller }) func addVehicleType(vehicleType : VehicleType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    vehicleTypes.add(nextVehicleTypeId, { vehicleType with id = nextVehicleTypeId });
    nextVehicleTypeId += 1;
  };

  public shared ({ caller }) func updateVehicleType(id : Nat, vehicleType : VehicleType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not vehicleTypes.containsKey(id)) {
      Runtime.trap("Vehicle type not found");
    };
    vehicleTypes.add(id, { vehicleType with id });
  };

  public shared ({ caller }) func toggleVehicleTypeActive(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (vehicleTypes.get(id)) {
      case (null) { Runtime.trap("Vehicle type not found") };
      case (?v) {
        vehicleTypes.add(id, { v with isActive = not v.isActive });
      };
    };
  };

  public shared ({ caller }) func addServiceArea(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let serviceArea : ServiceArea = {
      id = nextServiceAreaId;
      name;
      isActive = true;
    };
    serviceAreas.add(nextServiceAreaId, serviceArea);
    nextServiceAreaId += 1;
  };

  public shared ({ caller }) func toggleServiceAreaActive(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (serviceAreas.get(id)) {
      case (null) { Runtime.trap("Service area not found") };
      case (?s) {
        serviceAreas.add(id, { s with isActive = not s.isActive });
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getActiveVehicleTypes() : async [VehicleType] {
    vehicleTypes.values().toArray().filter(
      func(v) { v.isActive }
    );
  };

  // Customer Functions
  public shared ({ caller }) func createOrder(pickupAddress : Text, dropAddress : Text, vehicleTypeId : Nat, estimatedPrice : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };
    let customerId = caller.toText();
    let order : Order = {
      id = nextOrderId;
      customerId;
      pickupAddress;
      dropAddress;
      vehicleTypeId;
      status = #pending;
      estimatedPrice;
      assignedDriverId = null;
      createdAt = Time.now();
    };
    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order.id;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let customerId = caller.toText();
    orders.values().toArray().filter(
      func(o) { o.customerId == customerId }
    ).sort();
  };

  public query ({ caller }) func getOrderById(id : Nat) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let customerId = caller.toText();
        if (order.customerId != customerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update orders");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let customerId = caller.toText();
        if (order.customerId != customerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own orders");
        };
        orders.add(id, { order with status });
      };
    };
  };

  // Driver Assignment
  public query ({ caller }) func getAllDrivers() : async [Driver] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    drivers.values().toArray();
  };

  public shared ({ caller }) func assignDriverToOrder(orderId : Nat, driverId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (not drivers.containsKey(driverId)) {
          Runtime.trap("Driver not found");
        };
        orders.add(orderId, { order with assignedDriverId = ?driverId });
      };
    };
  };
};

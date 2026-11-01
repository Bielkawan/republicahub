export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TENANT";
}

export interface Property {
  id: string;
  name: string;
  address: string;
  rooms?: Room[];
  _count?: { rooms: number };
}

export interface Room {
  id: string;
  number: string;
  capacity: number;
  price: string | number;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  propertyId: string;
  property?: { id: string; name: string };
  tenants?: Tenant[];
}

export interface Tenant {
  id: string;
  userId: string;
  roomId: string | null;
  moveInDate: string;
  moveOutDate: string | null;
  emergencyPhone: string | null;
  user: { id: string; name: string; email: string };
  room: (Room & { property: { id: string; name: string } }) | null;
}

export interface Payment {
  id: string;
  amount: string | number;
  dueDate: string;
  paidDate: string | null;
  status: "PENDING" | "PAID" | "OVERDUE";
  tenantId: string;
  tenant: Tenant;
}

export interface Dashboard {
  properties: number;
  rooms: { AVAILABLE: number; OCCUPIED: number; MAINTENANCE: number };
  activeTenants: number;
  payments: { pending: number; paid: number; overdue: number };
  recentPayments: Payment[];
}

export interface CartItem {
  id: string; // unique cart line ID (item.id + selected option ids)
  menuItemId: string;
  name: string;
  basePrice: number;
  imageUrl?: string | null;
  quantity: number;
  selectedOptions: {
    optionId: string;
    optionName: string;
    valueId: string;
    valueName: string;
    priceModifier: number;
  }[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export type FulfilmentType = "PICKUP" | "DELIVERY" | "DINE_IN";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SEATED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

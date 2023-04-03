import type { FetchedExtra, FetchedMeal } from "./menu";

export enum OrderStatus {
  Paid = "Paid",
  Prepared = "Prepared",
  Ready = "Ready",
  Collected = "Collected"
}

export interface OrderDinner {
  dinnerId: number;
  extrasIds: number[];
}

export interface OrderDetails {
  orderId: number;
  collectionDate: number;
  status: OrderStatus;
  dinners: OrderDinner[];
}

export interface OrderInfo {
  user_id: number;
  username: string;
  orders: OrderDetails[];
}

export interface OrderResponse {
  response: OrderInfo;
  dinners: FetchedMeal[];
  extras: FetchedExtra[];
}

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
  response: OrderInfo[];
  dinners: FetchedMeal[];
  extras: FetchedExtra[];
}

export function orderStatusToString(status: OrderStatus) {
  switch(status) {
  case OrderStatus.Paid:
    return "Opłacone";
    break;
  case OrderStatus.Prepared:
    return "Przygotowane";
    break;
  case OrderStatus.Ready:
    return "Gotowe";
    break;
  case OrderStatus.Collected:
    return "Odebrane";
    break;
  default:
    return "Nieznane";
  }
}

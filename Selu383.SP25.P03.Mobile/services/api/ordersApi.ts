import { apiRequest } from "./client";
import {
  ConcessionOrder,
  CreateConcessionOrder,
  UpdateOrderStatus,
} from "./apiTypes";

export const ordersApi = {
  getMyOrders: (): Promise<ConcessionOrder[]> =>
    apiRequest("api/concession-orders"),

  getAllOrders: (): Promise<ConcessionOrder[]> =>
    apiRequest("api/concession-orders/all"),

  getOrderById: (id: number): Promise<ConcessionOrder> =>
    apiRequest(`api/concession-orders/${id}`),

  getOrdersByReservation: (reservationId: number): Promise<ConcessionOrder[]> =>
    apiRequest(`api/concession-orders/reservation/${reservationId}`),

  createOrder: (order: CreateConcessionOrder): Promise<ConcessionOrder> =>
    apiRequest("api/concession-orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),

  updateOrderStatus: (
    id: number,
    status: UpdateOrderStatus
  ): Promise<ConcessionOrder> =>
    apiRequest(`api/concession-orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(status),
    }),

  cancelOrder: (id: number): Promise<void> =>
    apiRequest(`api/concession-orders/${id}`, {
      method: "DELETE",
    }),
};

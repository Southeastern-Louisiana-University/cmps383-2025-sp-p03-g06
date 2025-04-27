import { apiRequest } from "./client";
import {
  ConcessionItem,
  ConcessionCategory,
  CreateConcessionItem,
  CreateConcessionCategory,
} from "./apiTypes";

export const concessionsApi = {
  // items

  getAllItems: (): Promise<ConcessionItem[]> =>
    apiRequest("api/concession-items"),

  getAvailableItems: (): Promise<ConcessionItem[]> =>
    apiRequest("api/concession-items/available"),

  getItemById: (id: number): Promise<ConcessionItem> =>
    apiRequest(`api/concession-items/${id}`),

  getItemsByCategory: (categoryId: number): Promise<ConcessionItem[]> =>
    apiRequest(`api/concession-items/category/${categoryId}`),

  createItem: (item: CreateConcessionItem): Promise<ConcessionItem> =>
    apiRequest("api/concession-items", {
      method: "POST",
      body: JSON.stringify(item),
    }),

  updateItem: (
    id: number,
    item: CreateConcessionItem
  ): Promise<ConcessionItem> =>
    apiRequest(`api/concession-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    }),

  deleteItem: (id: number): Promise<void> =>
    apiRequest(`api/concession-items/${id}`, {
      method: "DELETE",
    }),

  // Categories

  getAllCategories: (): Promise<ConcessionCategory[]> =>
    apiRequest("api/concession-categories"),

  getCategoryById: (id: number): Promise<ConcessionCategory> =>
    apiRequest(`api/concession-categories/${id}`),

  createCategory: (
    category: CreateConcessionCategory
  ): Promise<ConcessionCategory> =>
    apiRequest("api/concession-categories", {
      method: "POST",
      body: JSON.stringify(category),
    }),

  updateCategory: (
    id: number,
    category: CreateConcessionCategory
  ): Promise<ConcessionCategory> =>
    apiRequest(`api/concession-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category),
    }),

  deleteCategory: (id: number): Promise<void> =>
    apiRequest(`api/concession-categories/${id}`, {
      method: "DELETE",
    }),
};

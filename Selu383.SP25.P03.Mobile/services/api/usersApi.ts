// services/api/usersApi.ts
import { apiRequest } from "./client";  

export interface User {
  id: string;
  userName: string;
  email: string;
  password: string;
}
export const usersApi = {
  getCurrent: () => apiRequest<User>("api/users/me"),
  getById:    (id: string) => apiRequest<User>(`api/users/${id}`),
};

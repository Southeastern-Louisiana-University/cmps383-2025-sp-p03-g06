import { ConcessionItem } from "@/services/api/apiTypes";

export interface CartItem extends ConcessionItem {
  quantity: number;
}


export interface ConcessionItem {
	id: number;
	name: string;
	description: string;
	price: number;
	imageUrl: string;
	isAvailable: boolean;
}

export interface CartItem extends ConcessionItem {
	quantity: number;
}

export interface Order {
	id: number;
	items: CartItem[];
	totalPrice: number;
	orderDate: Date;
	status: 'pending' | 'processing' | 'completed' | 'cancelled';
	userId: number;
}
export interface Trip {
	id: string | number;
	title: string;
	description?: string;
	price?: string;
	priceNumber?: number;
	img?: string;
	availableFrom?: string; // ISO date string
	availableTo?: string;   // ISO date string
}

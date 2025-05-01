
export interface Product {
  id: number;
  name: string;
  rack: string;
  openingStock: number;
}

export interface InwardEntry {
  id: number;
  productId: number;
  quantity: number;
  date: string;
}

export interface OutwardEntry {
  id: number;
  productId: number;
  quantity: number;
  date: string;
}

export interface StockSummary {
  productId: number;
  productName: string;
  rack: string;
  openingStock: number;
  inwardTotal: number;
  outwardTotal: number;
  currentStock: number;
}


// Base product/item types
export interface Product {
  id: number;
  name: string;
  rack: string;
  weightPerPiece: number;
  measurement: string;
  temp1?: string;
  temp2?: string;
  temp3?: string;
  remark?: string;
  openingStock: number;
}

export interface Rack {
  id: number;
  number: string; // Alpha Numeric
  temp1?: string;
  temp2?: string;
  remark?: string;
}

export interface Container {
  id: number;
  type: 'Bag' | 'Crate' | 'Loose' | 'Op1' | 'Op2';
  weight: number;
  remark?: string;
}

export interface Measurement {
  id: number;
  type: 'KGS' | 'PCS' | 'Loose';
  temp1?: string;
  temp2?: string;
  remark?: string;
}

// Transaction types
export interface InwardEntry {
  id: number;
  productId: number;
  quantity: number;
  date: string;
  rackId: number;
  containerId: number;
  containerQuantity: number;
  grossWeight: number;
  netWeight: number;
  remark1?: string;
  remark2?: string;
  remark3?: string;
}

export interface OutwardEntry {
  id: number;
  productId: number;
  quantity: number;
  date: string;
  rackId: number;
  containerId: number;
  containerQuantity: number;
  grossWeight: number;
  netWeight: number;
  remark1?: string;
  remark2?: string;
  remark3?: string;
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

export type EntryType = 'inward' | 'outward';

// Update entity types to include 'inward'
export type EntityType = 'product' | 'rack' | 'container' | 'measurement' | 'inward';

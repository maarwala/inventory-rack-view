
import { Product, InwardEntry, OutwardEntry, StockSummary } from '@/types';

// Mock data storage (replace with actual API calls to Google Sheets later)
let products: Product[] = [
  { id: 1, name: 'Laptop Dell XPS', rack: 'A1', openingStock: 10 },
  { id: 2, name: 'iPhone 15 Pro', rack: 'B2', openingStock: 15 },
  { id: 3, name: 'Samsung TV 55"', rack: 'C3', openingStock: 5 },
  { id: 4, name: 'Wireless Keyboard', rack: 'A2', openingStock: 20 },
  { id: 5, name: 'Bluetooth Speaker', rack: 'B3', openingStock: 12 },
];

let inwardEntries: InwardEntry[] = [
  { id: 1, productId: 1, quantity: 5, date: '2025-04-25' },
  { id: 2, productId: 2, quantity: 10, date: '2025-04-26' },
  { id: 3, productId: 3, quantity: 3, date: '2025-04-27' },
];

let outwardEntries: OutwardEntry[] = [
  { id: 1, productId: 1, quantity: 2, date: '2025-04-28' },
  { id: 2, productId: 2, quantity: 5, date: '2025-04-29' },
  { id: 3, productId: 4, quantity: 8, date: '2025-04-30' },
];

// Product Services
export const getProducts = (): Product[] => {
  return [...products];
};

export const getProduct = (id: number): Product | undefined => {
  return products.find(product => product.id === id);
};

export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const newProduct = { ...product, id: newId };
  products = [...products, newProduct];
  return newProduct;
};

export const updateProduct = (updatedProduct: Product): Product | undefined => {
  const index = products.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    products = [
      ...products.slice(0, index),
      updatedProduct,
      ...products.slice(index + 1)
    ];
    return updatedProduct;
  }
  return undefined;
};

export const deleteProduct = (id: number): boolean => {
  const initialLength = products.length;
  products = products.filter(product => product.id !== id);
  return products.length !== initialLength;
};

// Inward Services
export const getInwardEntries = (): InwardEntry[] => {
  return [...inwardEntries];
};

export const addInwardEntry = (entry: Omit<InwardEntry, 'id'>): InwardEntry => {
  const newId = inwardEntries.length > 0 ? Math.max(...inwardEntries.map(e => e.id)) + 1 : 1;
  const newEntry = { ...entry, id: newId };
  inwardEntries = [...inwardEntries, newEntry];
  return newEntry;
};

// Outward Services
export const getOutwardEntries = (): OutwardEntry[] => {
  return [...outwardEntries];
};

export const addOutwardEntry = (entry: Omit<OutwardEntry, 'id'>): OutwardEntry => {
  const newId = outwardEntries.length > 0 ? Math.max(...outwardEntries.map(e => e.id)) + 1 : 1;
  const newEntry = { ...entry, id: newId };
  outwardEntries = [...outwardEntries, newEntry];
  return newEntry;
};

// Stock Summary Service
export const getStockSummary = (): StockSummary[] => {
  return products.map(product => {
    const inwardTotal = inwardEntries
      .filter(entry => entry.productId === product.id)
      .reduce((sum, entry) => sum + entry.quantity, 0);
    
    const outwardTotal = outwardEntries
      .filter(entry => entry.productId === product.id)
      .reduce((sum, entry) => sum + entry.quantity, 0);
    
    const currentStock = product.openingStock + inwardTotal - outwardTotal;
    
    return {
      productId: product.id,
      productName: product.name,
      rack: product.rack,
      openingStock: product.openingStock,
      inwardTotal,
      outwardTotal,
      currentStock
    };
  });
};

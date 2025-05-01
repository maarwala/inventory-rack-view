
import { Product, InwardEntry, OutwardEntry, StockSummary, Rack, Container, Measurement } from '@/types';

// Mock data storage (replace with actual API calls to Google Sheets later)
let products: Product[] = [
  { id: 1, name: 'Laptop Dell XPS', rack: 'A1', weightPerPiece: 2.5, measurement: 'KGS', openingStock: 10 },
  { id: 2, name: 'iPhone 15 Pro', rack: 'B2', weightPerPiece: 0.2, measurement: 'PCS', openingStock: 15 },
  { id: 3, name: 'Samsung TV 55"', rack: 'C3', weightPerPiece: 15, measurement: 'KGS', openingStock: 5 },
  { id: 4, name: 'Wireless Keyboard', rack: 'A2', weightPerPiece: 0.5, measurement: 'PCS', openingStock: 20 },
  { id: 5, name: 'Bluetooth Speaker', rack: 'B3', weightPerPiece: 0.8, measurement: 'PCS', openingStock: 12 },
];

let racks: Rack[] = [
  { id: 1, number: 'A1' },
  { id: 2, number: 'B2' },
  { id: 3, number: 'C3' },
  { id: 4, number: 'A2' },
  { id: 5, number: 'B3' },
];

let containers: Container[] = [
  { id: 1, type: 'Bag', weight: 0.5 },
  { id: 2, type: 'Crate', weight: 2.0 },
  { id: 3, type: 'Loose', weight: 0 },
];

let measurements: Measurement[] = [
  { id: 1, type: 'KGS' },
  { id: 2, type: 'PCS' },
  { id: 3, type: 'Loose' },
];

let inwardEntries: InwardEntry[] = [
  { 
    id: 1, 
    productId: 1, 
    quantity: 5, 
    date: '2025-04-25', 
    rackId: 1,
    containerId: 1,
    containerQuantity: 2,
    grossWeight: 13.5,
    netWeight: 12.5
  },
  { 
    id: 2, 
    productId: 2, 
    quantity: 10, 
    date: '2025-04-26',
    rackId: 2,
    containerId: 2,
    containerQuantity: 1,
    grossWeight: 4.0,
    netWeight: 2.0
  },
  { 
    id: 3, 
    productId: 3, 
    quantity: 3, 
    date: '2025-04-27',
    rackId: 3,
    containerId: 2,
    containerQuantity: 3,
    grossWeight: 51.0,
    netWeight: 45.0
  },
];

let outwardEntries: OutwardEntry[] = [
  { 
    id: 1, 
    productId: 1, 
    quantity: 2, 
    date: '2025-04-28',
    rackId: 1,
    containerId: 1,
    containerQuantity: 1,
    grossWeight: 5.5,
    netWeight: 5.0
  },
  { 
    id: 2, 
    productId: 2, 
    quantity: 5, 
    date: '2025-04-29',
    rackId: 2,
    containerId: 2,
    containerQuantity: 1,
    grossWeight: 3.0,
    netWeight: 1.0
  },
  { 
    id: 3, 
    productId: 4, 
    quantity: 8, 
    date: '2025-04-30',
    rackId: 4,
    containerId: 3,
    containerQuantity: 0,
    grossWeight: 4.0,
    netWeight: 4.0
  },
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

// Rack Services
export const getRacks = (): Rack[] => {
  return [...racks];
};

export const getRack = (id: number): Rack | undefined => {
  return racks.find(rack => rack.id === id);
};

export const addRack = (rack: Omit<Rack, 'id'>): Rack => {
  const newId = racks.length > 0 ? Math.max(...racks.map(r => r.id)) + 1 : 1;
  const newRack = { ...rack, id: newId };
  racks = [...racks, newRack];
  return newRack;
};

export const updateRack = (updatedRack: Rack): Rack | undefined => {
  const index = racks.findIndex(r => r.id === updatedRack.id);
  if (index !== -1) {
    racks = [
      ...racks.slice(0, index),
      updatedRack,
      ...racks.slice(index + 1)
    ];
    return updatedRack;
  }
  return undefined;
};

export const deleteRack = (id: number): boolean => {
  const initialLength = racks.length;
  racks = racks.filter(rack => rack.id !== id);
  return racks.length !== initialLength;
};

// Container Services
export const getContainers = (): Container[] => {
  return [...containers];
};

export const getContainer = (id: number): Container | undefined => {
  return containers.find(container => container.id === id);
};

export const addContainer = (container: Omit<Container, 'id'>): Container => {
  const newId = containers.length > 0 ? Math.max(...containers.map(c => c.id)) + 1 : 1;
  const newContainer = { ...container, id: newId };
  containers = [...containers, newContainer];
  return newContainer;
};

export const updateContainer = (updatedContainer: Container): Container | undefined => {
  const index = containers.findIndex(c => c.id === updatedContainer.id);
  if (index !== -1) {
    containers = [
      ...containers.slice(0, index),
      updatedContainer,
      ...containers.slice(index + 1)
    ];
    return updatedContainer;
  }
  return undefined;
};

export const deleteContainer = (id: number): boolean => {
  const initialLength = containers.length;
  containers = containers.filter(container => container.id !== id);
  return containers.length !== initialLength;
};

// Measurement Services
export const getMeasurements = (): Measurement[] => {
  return [...measurements];
};

export const getMeasurement = (id: number): Measurement | undefined => {
  return measurements.find(measurement => measurement.id === id);
};

export const addMeasurement = (measurement: Omit<Measurement, 'id'>): Measurement => {
  const newId = measurements.length > 0 ? Math.max(...measurements.map(m => m.id)) + 1 : 1;
  const newMeasurement = { ...measurement, id: newId };
  measurements = [...measurements, newMeasurement];
  return newMeasurement;
};

export const updateMeasurement = (updatedMeasurement: Measurement): Measurement | undefined => {
  const index = measurements.findIndex(m => m.id === updatedMeasurement.id);
  if (index !== -1) {
    measurements = [
      ...measurements.slice(0, index),
      updatedMeasurement,
      ...measurements.slice(index + 1)
    ];
    return updatedMeasurement;
  }
  return undefined;
};

export const deleteMeasurement = (id: number): boolean => {
  const initialLength = measurements.length;
  measurements = measurements.filter(measurement => measurement.id !== id);
  return measurements.length !== initialLength;
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

// Helper function to get rack name by ID
export const getRackNameById = (rackId: number): string => {
  const rack = racks.find(r => r.id === rackId);
  return rack ? rack.number : 'Unknown';
};

// Helper function to get container type by ID
export const getContainerTypeById = (containerId: number): string => {
  const container = containers.find(c => c.id === containerId);
  return container ? container.type : 'Unknown';
};

// Helper function to calculate net weight
export const calculateNetWeight = (grossWeight: number, containerId: number, containerQty: number): number => {
  const container = containers.find(c => c.id === containerId);
  if (!container) return grossWeight;
  
  return grossWeight - (container.weight * containerQty);
};


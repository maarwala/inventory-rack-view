
import { Product, InwardEntry, OutwardEntry, StockSummary, Rack, Container, Measurement } from '@/types';
import { openDB, deleteDB, IDBPDatabase } from 'idb';

// Database connection
let db: IDBPDatabase | null = null;

// Define database name and version
const DB_NAME = 'warehouse-db';
const DB_VERSION = 1;

// Initialize database
export const initDatabase = async (): Promise<void> => {
  if (!db) {
    try {
      db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(database, oldVersion, newVersion) {
          // Create object stores if they don't exist
          if (!database.objectStoreNames.contains('products')) {
            const productStore = database.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            productStore.createIndex('name', 'name', { unique: false });
          }
          
          if (!database.objectStoreNames.contains('racks')) {
            const rackStore = database.createObjectStore('racks', { keyPath: 'id', autoIncrement: true });
            rackStore.createIndex('number', 'number', { unique: true });
          }
          
          if (!database.objectStoreNames.contains('containers')) {
            const containerStore = database.createObjectStore('containers', { keyPath: 'id', autoIncrement: true });
            containerStore.createIndex('type', 'type', { unique: false });
          }
          
          if (!database.objectStoreNames.contains('measurements')) {
            const measurementStore = database.createObjectStore('measurements', { keyPath: 'id', autoIncrement: true });
            measurementStore.createIndex('type', 'type', { unique: true });
          }
          
          if (!database.objectStoreNames.contains('inward_entries')) {
            const inwardStore = database.createObjectStore('inward_entries', { keyPath: 'id', autoIncrement: true });
            inwardStore.createIndex('productId', 'productId', { unique: false });
            inwardStore.createIndex('date', 'date', { unique: false });
          }
          
          if (!database.objectStoreNames.contains('outward_entries')) {
            const outwardStore = database.createObjectStore('outward_entries', { keyPath: 'id', autoIncrement: true });
            outwardStore.createIndex('productId', 'productId', { unique: false });
            outwardStore.createIndex('date', 'date', { unique: false });
          }
        },
      });
      
      // Seed initial data if stores are empty
      const productCount = await db.count('products');
      if (productCount === 0) {
        await seedInitialData();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
};

// Seed initial data for testing
const seedInitialData = async (): Promise<void> => {
  if (!db) return;

  // Insert racks
  await db.add('racks', { number: 'A1', temp1: null, temp2: null, remark: null });
  await db.add('racks', { number: 'B2', temp1: null, temp2: null, remark: null });
  await db.add('racks', { number: 'C3', temp1: null, temp2: null, remark: null });
  await db.add('racks', { number: 'A2', temp1: null, temp2: null, remark: null });
  await db.add('racks', { number: 'B3', temp1: null, temp2: null, remark: null });
  
  // Insert containers
  await db.add('containers', { type: 'Bag', weight: 0.5, remark: null });
  await db.add('containers', { type: 'Crate', weight: 2.0, remark: null });
  await db.add('containers', { type: 'Loose', weight: 0, remark: null });
  
  // Insert measurements
  await db.add('measurements', { type: 'KGS', temp1: null, temp2: null, remark: null });
  await db.add('measurements', { type: 'PCS', temp1: null, temp2: null, remark: null });
  await db.add('measurements', { type: 'Loose', temp1: null, temp2: null, remark: null });
  
  // Get rack IDs
  const racks = await db.getAll('racks');
  const rackAId = racks[0].id;
  const rackBId = racks[1].id;
  const rackCId = racks[2].id;
  const rackDId = racks[3].id;
  const rackEId = racks[4].id;
  
  // Get container IDs
  const containers = await db.getAll('containers');
  const bagId = containers[0].id;
  const crateId = containers[1].id;
  const looseId = containers[2].id;
  
  // Insert products
  const product1Id = await db.add('products', {
    name: 'Laptop Dell XPS',
    rack: 'A1',
    weightPerPiece: 2.5,
    measurement: 'KGS',
    openingStock: 10,
    temp1: null,
    temp2: null,
    temp3: null,
    remark: null
  });
  
  const product2Id = await db.add('products', {
    name: 'iPhone 15 Pro',
    rack: 'B2',
    weightPerPiece: 0.2,
    measurement: 'PCS',
    openingStock: 15,
    temp1: null,
    temp2: null,
    temp3: null,
    remark: null
  });
  
  const product3Id = await db.add('products', {
    name: 'Samsung TV 55"',
    rack: 'C3',
    weightPerPiece: 15,
    measurement: 'KGS',
    openingStock: 5,
    temp1: null,
    temp2: null,
    temp3: null,
    remark: null
  });
  
  const product4Id = await db.add('products', {
    name: 'Wireless Keyboard',
    rack: 'A2',
    weightPerPiece: 0.5,
    measurement: 'PCS',
    openingStock: 20,
    temp1: null,
    temp2: null,
    temp3: null,
    remark: null
  });
  
  const product5Id = await db.add('products', {
    name: 'Bluetooth Speaker',
    rack: 'B3',
    weightPerPiece: 0.8,
    measurement: 'PCS',
    openingStock: 12,
    temp1: null,
    temp2: null,
    temp3: null,
    remark: null
  });
  
  // Insert inward entries
  await db.add('inward_entries', {
    productId: product1Id,
    quantity: 5,
    date: '2025-04-25',
    rackId: rackAId,
    containerId: bagId,
    containerQuantity: 2,
    grossWeight: 13.5,
    netWeight: 12.5,
    remark1: null,
    remark2: null,
    remark3: null
  });
  
  await db.add('inward_entries', {
    productId: product2Id,
    quantity: 10,
    date: '2025-04-26',
    rackId: rackBId,
    containerId: crateId,
    containerQuantity: 1,
    grossWeight: 4.0,
    netWeight: 2.0,
    remark1: null,
    remark2: null,
    remark3: null
  });
  
  await db.add('inward_entries', {
    productId: product3Id,
    quantity: 3,
    date: '2025-04-27',
    rackId: rackCId,
    containerId: crateId,
    containerQuantity: 3,
    grossWeight: 51.0,
    netWeight: 45.0,
    remark1: null,
    remark2: null,
    remark3: null
  });
  
  // Insert outward entries
  await db.add('outward_entries', {
    productId: product1Id,
    quantity: 2,
    date: '2025-04-28',
    rackId: rackAId,
    containerId: bagId,
    containerQuantity: 1,
    grossWeight: 5.5,
    netWeight: 5.0,
    remark1: null,
    remark2: null,
    remark3: null
  });
  
  await db.add('outward_entries', {
    productId: product2Id,
    quantity: 5,
    date: '2025-04-29',
    rackId: rackBId,
    containerId: crateId,
    containerQuantity: 1,
    grossWeight: 3.0,
    netWeight: 1.0,
    remark1: null,
    remark2: null,
    remark3: null
  });
  
  await db.add('outward_entries', {
    productId: product4Id,
    quantity: 8,
    date: '2025-04-30',
    rackId: rackDId,
    containerId: looseId,
    containerQuantity: 0,
    grossWeight: 4.0,
    netWeight: 4.0,
    remark1: null,
    remark2: null,
    remark3: null
  });
};

// Product Services
export const getProducts = async (): Promise<Product[]> => {
  if (!db) await initDatabase();
  return await db!.getAll('products');
};

export const getProduct = async (id: number): Promise<Product | undefined> => {
  if (!db) await initDatabase();
  return await db!.get('products', id);
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  if (!db) await initDatabase();
  const id = await db!.add('products', product);
  return { ...product, id: id as number };
};

export const updateProduct = async (updatedProduct: Product): Promise<Product | undefined> => {
  if (!db) await initDatabase();
  await db!.put('products', updatedProduct);
  return updatedProduct;
};

export const deleteProduct = async (id: number): Promise<boolean> => {
  if (!db) await initDatabase();
  await db!.delete('products', id);
  return true;
};

// Rack Services
export const getRacks = async (): Promise<Rack[]> => {
  if (!db) await initDatabase();
  return await db!.getAll('racks');
};

export const getRack = async (id: number): Promise<Rack | undefined> => {
  if (!db) await initDatabase();
  return await db!.get('racks', id);
};

export const addRack = async (rack: Omit<Rack, 'id'>): Promise<Rack> => {
  if (!db) await initDatabase();
  const id = await db!.add('racks', rack);
  return { ...rack, id: id as number };
};

export const updateRack = async (updatedRack: Rack): Promise<Rack | undefined> => {
  if (!db) await initDatabase();
  await db!.put('racks', updatedRack);
  return updatedRack;
};

export const deleteRack = async (id: number): Promise<boolean> => {
  if (!db) await initDatabase();
  await db!.delete('racks', id);
  return true;
};

// Container Services
export const getContainers = async (): Promise<Container[]> => {
  if (!db) await initDatabase();
  return await db!.getAll('containers');
};

export const getContainer = async (id: number): Promise<Container | undefined> => {
  if (!db) await initDatabase();
  return await db!.get('containers', id);
};

export const addContainer = async (container: Omit<Container, 'id'>): Promise<Container> => {
  if (!db) await initDatabase();
  const id = await db!.add('containers', container);
  return { ...container, id: id as number };
};

export const updateContainer = async (updatedContainer: Container): Promise<Container | undefined> => {
  if (!db) await initDatabase();
  await db!.put('containers', updatedContainer);
  return updatedContainer;
};

export const deleteContainer = async (id: number): Promise<boolean> => {
  if (!db) await initDatabase();
  await db!.delete('containers', id);
  return true;
};

// Measurement Services
export const getMeasurements = async (): Promise<Measurement[]> => {
  if (!db) await initDatabase();
  return await db!.getAll('measurements');
};

export const getMeasurement = async (id: number): Promise<Measurement | undefined> => {
  if (!db) await initDatabase();
  return await db!.get('measurements', id);
};

export const addMeasurement = async (measurement: Omit<Measurement, 'id'>): Promise<Measurement> => {
  if (!db) await initDatabase();
  const id = await db!.add('measurements', measurement);
  return { ...measurement, id: id as number };
};

export const updateMeasurement = async (updatedMeasurement: Measurement): Promise<Measurement | undefined> => {
  if (!db) await initDatabase();
  await db!.put('measurements', updatedMeasurement);
  return updatedMeasurement;
};

export const deleteMeasurement = async (id: number): Promise<boolean> => {
  if (!db) await initDatabase();
  await db!.delete('measurements', id);
  return true;
};

// Inward Services
export const getInwardEntries = async (): Promise<InwardEntry[]> => {
  if (!db) await initDatabase();
  return await db!.getAll('inward_entries');
};

export const addInwardEntry = async (entry: Omit<InwardEntry, 'id'>): Promise<InwardEntry> => {
  if (!db) await initDatabase();
  const id = await db!.add('inward_entries', entry);
  return { ...entry, id: id as number };
};

export const updateInwardEntry = async (updatedEntry: InwardEntry): Promise<InwardEntry | undefined> => {
  if (!db) await initDatabase();
  await db!.put('inward_entries', updatedEntry);
  return updatedEntry;
};

export const deleteInwardEntry = async (id: number): Promise<boolean> => {
  if (!db) await initDatabase();
  await db!.delete('inward_entries', id);
  return true;
};

// Outward Services
export const getOutwardEntries = async (): Promise<OutwardEntry[]> => {
  if (!db) await initDatabase();
  return await db!.getAll('outward_entries');
};

export const addOutwardEntry = async (entry: Omit<OutwardEntry, 'id'>): Promise<OutwardEntry> => {
  if (!db) await initDatabase();
  const id = await db!.add('outward_entries', entry);
  return { ...entry, id: id as number };
};

export const updateOutwardEntry = async (updatedEntry: OutwardEntry): Promise<OutwardEntry | undefined> => {
  if (!db) await initDatabase();
  await db!.put('outward_entries', updatedEntry);
  return updatedEntry;
};

export const deleteOutwardEntry = async (id: number): Promise<boolean> => {
  if (!db) await initDatabase();
  await db!.delete('outward_entries', id);
  return true;
};

// Stock Summary Service
export const getStockSummary = async (): Promise<StockSummary[]> => {
  if (!db) await initDatabase();
  
  const products = await db!.getAll('products');
  const inwards = await db!.getAll('inward_entries');
  const outwards = await db!.getAll('outward_entries');
  
  return products.map(product => {
    const productInwards = inwards.filter(i => i.productId === product.id);
    const productOutwards = outwards.filter(o => o.productId === product.id);
    
    const inwardTotal = productInwards.reduce((total, entry) => total + entry.quantity, 0);
    const outwardTotal = productOutwards.reduce((total, entry) => total + entry.quantity, 0);
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

// Optimized version for large datasets
export const getPaginatedStockSummary = async (
  page: number = 1, 
  limit: number = 10,
  searchTerm: string = '',
  rackFilter: string = 'all'
): Promise<{
  data: StockSummary[],
  totalCount: number,
  totalPages: number,
  availableRacks: string[]
}> => {
  if (!db) await initDatabase();
  
  console.time('Stock Summary Calculation');
  
  // Fetch products in chunks to avoid memory issues
  const products = await db!.getAll('products');
  
  // Extract unique rack names for filters
  const availableRacks = Array.from(new Set(products.map(item => item.rack)));
  
  // Apply search and rack filters first to reduce processing
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesRack = rackFilter === 'all' || product.rack === rackFilter;
    return matchesSearch && matchesRack;
  });
  
  // Calculate total count and pages
  const totalCount = filteredProducts.length;
  const totalPages = Math.ceil(totalCount / limit);
  
  // Apply pagination
  const startIndex = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);
  
  // Fetch only inward/outward entries for the paginated products
  const productIds = paginatedProducts.map(p => p.id);
  
  // Get inward entries for these products
  const tx = db!.transaction('inward_entries');
  const inwardIndex = tx.store.index('productId');
  const inwards: InwardEntry[] = [];
  
  for (const id of productIds) {
    const productInwards = await inwardIndex.getAll(IDBKeyRange.only(id));
    inwards.push(...productInwards);
  }
  
  // Get outward entries for these products
  const tx2 = db!.transaction('outward_entries');
  const outwardIndex = tx2.store.index('productId');
  const outwards: OutwardEntry[] = [];
  
  for (const id of productIds) {
    const productOutwards = await outwardIndex.getAll(IDBKeyRange.only(id));
    outwards.push(...productOutwards);
  }
  
  // Calculate summary for each product
  const data = paginatedProducts.map(product => {
    const productInwards = inwards.filter(i => i.productId === product.id);
    const productOutwards = outwards.filter(o => o.productId === product.id);
    
    const inwardTotal = productInwards.reduce((total, entry) => total + entry.quantity, 0);
    const outwardTotal = productOutwards.reduce((total, entry) => total + entry.quantity, 0);
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
  
  console.timeEnd('Stock Summary Calculation');
  
  return {
    data,
    totalCount,
    totalPages,
    availableRacks
  };
};

// Helper function to get rack name by ID
export const getRackNameById = async (rackId: number): Promise<string> => {
  if (!db) await initDatabase();
  const rack = await db!.get('racks', rackId);
  return rack ? rack.number : 'Unknown';
};

// Helper function to get container type by ID
export const getContainerTypeById = async (containerId: number): Promise<string> => {
  if (!db) await initDatabase();
  const container = await db!.get('containers', containerId);
  return container ? container.type : 'Unknown';
};

// Helper function to calculate net weight
export const calculateNetWeight = async (grossWeight: number, containerId: number, containerQty: number): Promise<number> => {
  if (!db) await initDatabase();
  const container = await db!.get('containers', containerId);
  if (!container) return grossWeight;
  
  return grossWeight - (container.weight * containerQty);
};

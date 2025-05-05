
import { Product, InwardEntry, OutwardEntry, StockSummary, Rack, Container, Measurement } from '@/types';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// Database connection
let db: Database | null = null;

// Initialize database
export const initDatabase = async (): Promise<void> => {
  if (!db) {
    db = await open({
      filename: './warehouse.db',
      driver: sqlite3.Database
    });
    
    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rack TEXT NOT NULL,
        weightPerPiece REAL NOT NULL,
        measurement TEXT NOT NULL,
        temp1 TEXT,
        temp2 TEXT,
        temp3 TEXT,
        remark TEXT,
        openingStock INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS racks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT NOT NULL UNIQUE,
        temp1 TEXT,
        temp2 TEXT,
        remark TEXT
      );
      
      CREATE TABLE IF NOT EXISTS containers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        weight REAL NOT NULL,
        remark TEXT
      );
      
      CREATE TABLE IF NOT EXISTS measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL UNIQUE,
        temp1 TEXT,
        temp2 TEXT,
        remark TEXT
      );
      
      CREATE TABLE IF NOT EXISTS inward_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        date TEXT NOT NULL,
        rackId INTEGER NOT NULL,
        containerId INTEGER NOT NULL,
        containerQuantity INTEGER NOT NULL,
        grossWeight REAL NOT NULL,
        netWeight REAL NOT NULL,
        remark1 TEXT,
        remark2 TEXT,
        remark3 TEXT,
        FOREIGN KEY (productId) REFERENCES products (id),
        FOREIGN KEY (rackId) REFERENCES racks (id),
        FOREIGN KEY (containerId) REFERENCES containers (id)
      );
      
      CREATE TABLE IF NOT EXISTS outward_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        date TEXT NOT NULL,
        rackId INTEGER NOT NULL,
        containerId INTEGER NOT NULL,
        containerQuantity INTEGER NOT NULL,
        grossWeight REAL NOT NULL,
        netWeight REAL NOT NULL,
        remark1 TEXT,
        remark2 TEXT,
        remark3 TEXT,
        FOREIGN KEY (productId) REFERENCES products (id),
        FOREIGN KEY (rackId) REFERENCES racks (id),
        FOREIGN KEY (containerId) REFERENCES containers (id)
      );
    `);

    // Add seed data if tables are empty
    const productCount = await db.get('SELECT COUNT(*) as count FROM products');
    if (productCount.count === 0) {
      await seedInitialData();
    }
  }
};

// Seed initial data for testing
const seedInitialData = async (): Promise<void> => {
  if (!db) return;

  // Insert racks
  await db.run(`INSERT INTO racks (number) VALUES ('A1')`);
  await db.run(`INSERT INTO racks (number) VALUES ('B2')`);
  await db.run(`INSERT INTO racks (number) VALUES ('C3')`);
  await db.run(`INSERT INTO racks (number) VALUES ('A2')`);
  await db.run(`INSERT INTO racks (number) VALUES ('B3')`);
  
  // Insert containers
  await db.run(`INSERT INTO containers (type, weight) VALUES ('Bag', 0.5)`);
  await db.run(`INSERT INTO containers (type, weight) VALUES ('Crate', 2.0)`);
  await db.run(`INSERT INTO containers (type, weight) VALUES ('Loose', 0)`);
  
  // Insert measurements
  await db.run(`INSERT INTO measurements (type) VALUES ('KGS')`);
  await db.run(`INSERT INTO measurements (type) VALUES ('PCS')`);
  await db.run(`INSERT INTO measurements (type) VALUES ('Loose')`);
  
  // Insert products
  await db.run(`
    INSERT INTO products (name, rack, weightPerPiece, measurement, openingStock) 
    VALUES ('Laptop Dell XPS', 'A1', 2.5, 'KGS', 10)
  `);
  await db.run(`
    INSERT INTO products (name, rack, weightPerPiece, measurement, openingStock) 
    VALUES ('iPhone 15 Pro', 'B2', 0.2, 'PCS', 15)
  `);
  await db.run(`
    INSERT INTO products (name, rack, weightPerPiece, measurement, openingStock) 
    VALUES ('Samsung TV 55"', 'C3', 15, 'KGS', 5)
  `);
  await db.run(`
    INSERT INTO products (name, rack, weightPerPiece, measurement, openingStock) 
    VALUES ('Wireless Keyboard', 'A2', 0.5, 'PCS', 20)
  `);
  await db.run(`
    INSERT INTO products (name, rack, weightPerPiece, measurement, openingStock) 
    VALUES ('Bluetooth Speaker', 'B3', 0.8, 'PCS', 12)
  `);
  
  // Insert inward entries
  await db.run(`
    INSERT INTO inward_entries (productId, quantity, date, rackId, containerId, containerQuantity, grossWeight, netWeight) 
    VALUES (1, 5, '2025-04-25', 1, 1, 2, 13.5, 12.5)
  `);
  await db.run(`
    INSERT INTO inward_entries (productId, quantity, date, rackId, containerId, containerQuantity, grossWeight, netWeight) 
    VALUES (2, 10, '2025-04-26', 2, 2, 1, 4.0, 2.0)
  `);
  await db.run(`
    INSERT INTO inward_entries (productId, quantity, date, rackId, containerId, containerQuantity, grossWeight, netWeight) 
    VALUES (3, 3, '2025-04-27', 3, 2, 3, 51.0, 45.0)
  `);
  
  // Insert outward entries
  await db.run(`
    INSERT INTO outward_entries (productId, quantity, date, rackId, containerId, containerQuantity, grossWeight, netWeight) 
    VALUES (1, 2, '2025-04-28', 1, 1, 1, 5.5, 5.0)
  `);
  await db.run(`
    INSERT INTO outward_entries (productId, quantity, date, rackId, containerId, containerQuantity, grossWeight, netWeight) 
    VALUES (2, 5, '2025-04-29', 2, 2, 1, 3.0, 1.0)
  `);
  await db.run(`
    INSERT INTO outward_entries (productId, quantity, date, rackId, containerId, containerQuantity, grossWeight, netWeight) 
    VALUES (4, 8, '2025-04-30', 4, 3, 0, 4.0, 4.0)
  `);
};

// Product Services
export const getProducts = async (): Promise<Product[]> => {
  if (!db) await initDatabase();
  return await db!.all('SELECT * FROM products');
};

export const getProduct = async (id: number): Promise<Product | undefined> => {
  if (!db) await initDatabase();
  return await db!.get('SELECT * FROM products WHERE id = ?', id);
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  if (!db) await initDatabase();
  const result = await db!.run(
    'INSERT INTO products (name, rack, weightPerPiece, measurement, temp1, temp2, temp3, remark, openingStock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [product.name, product.rack, product.weightPerPiece, product.measurement, product.temp1, product.temp2, product.temp3, product.remark, product.openingStock]
  );
  return { ...product, id: result.lastID! };
};

export const updateProduct = async (updatedProduct: Product): Promise<Product | undefined> => {
  if (!db) await initDatabase();
  await db!.run(
    'UPDATE products SET name = ?, rack = ?, weightPerPiece = ?, measurement = ?, temp1 = ?, temp2 = ?, temp3 = ?, remark = ?, openingStock = ? WHERE id = ?',
    [updatedProduct.name, updatedProduct.rack, updatedProduct.weightPerPiece, updatedProduct.measurement, updatedProduct.temp1, updatedProduct.temp2, updatedProduct.temp3, updatedProduct.remark, updatedProduct.openingStock, updatedProduct.id]
  );
  return updatedProduct;
};

export const deleteProduct = async (id: number): Promise<boolean> => {
  if (!db) await initDatabase();
  const result = await db!.run('DELETE FROM products WHERE id = ?', id);
  return result.changes! > 0;
};

// Rack Services
export const getRacks = async (): Promise<Rack[]> => {
  if (!db) await initDatabase();
  return await db!.all('SELECT * FROM racks');
};

export const getRack = async (id: number): Promise<Rack | undefined> => {
  if (!db) await initDatabase();
  return await db!.get('SELECT * FROM racks WHERE id = ?', id);
};

export const addRack = async (rack: Omit<Rack, 'id'>): Promise<Rack> => {
  if (!db) await initDatabase();
  const result = await db!.run(
    'INSERT INTO racks (number, temp1, temp2, remark) VALUES (?, ?, ?, ?)',
    [rack.number, rack.temp1, rack.temp2, rack.remark]
  );
  return { ...rack, id: result.lastID! };
};

export const updateRack = async (updatedRack: Rack): Promise<Rack | undefined> => {
  if (!db) await initDatabase();
  await db!.run(
    'UPDATE racks SET number = ?, temp1 = ?, temp2 = ?, remark = ? WHERE id = ?',
    [updatedRack.number, updatedRack.temp1, updatedRack.temp2, updatedRack.remark, updatedRack.id]
  );
  return updatedRack;
};

export const deleteRack = async (id: number): Promise<boolean> => {
  if (!db) await initDatabase();
  const result = await db!.run('DELETE FROM racks WHERE id = ?', id);
  return result.changes! > 0;
};

// Container Services
export const getContainers = async (): Promise<Container[]> => {
  if (!db) await initDatabase();
  return await db!.all('SELECT * FROM containers');
};

export const getContainer = async (id: number): Promise<Container | undefined> => {
  if (!db) await initDatabase();
  return await db!.get('SELECT * FROM containers WHERE id = ?', id);
};

export const addContainer = async (container: Omit<Container, 'id'>): Promise<Container> => {
  if (!db) await initDatabase();
  const result = await db!.run(
    'INSERT INTO containers (type, weight, remark) VALUES (?, ?, ?)',
    [container.type, container.weight, container.remark]
  );
  return { ...container, id: result.lastID! };
};

export const updateContainer = async (updatedContainer: Container): Promise<Container | undefined> => {
  if (!db) await initDatabase();
  await db!.run(
    'UPDATE containers SET type = ?, weight = ?, remark = ? WHERE id = ?',
    [updatedContainer.type, updatedContainer.weight, updatedContainer.remark, updatedContainer.id]
  );
  return updatedContainer;
};

export const deleteContainer = async (id: number): Promise<boolean> => {
  if (!db) await initDatabase();
  const result = await db!.run('DELETE FROM containers WHERE id = ?', id);
  return result.changes! > 0;
};

// Measurement Services
export const getMeasurements = async (): Promise<Measurement[]> => {
  if (!db) await initDatabase();
  return await db!.all('SELECT * FROM measurements');
};

export const getMeasurement = async (id: number): Promise<Measurement | undefined> => {
  if (!db) await initDatabase();
  return await db!.get('SELECT * FROM measurements WHERE id = ?', id);
};

export const addMeasurement = async (measurement: Omit<Measurement, 'id'>): Promise<Measurement> => {
  if (!db) await initDatabase();
  const result = await db!.run(
    'INSERT INTO measurements (type, temp1, temp2, remark) VALUES (?, ?, ?, ?)',
    [measurement.type, measurement.temp1, measurement.temp2, measurement.remark]
  );
  return { ...measurement, id: result.lastID! };
};

export const updateMeasurement = async (updatedMeasurement: Measurement): Promise<Measurement | undefined> => {
  if (!db) await initDatabase();
  await db!.run(
    'UPDATE measurements SET type = ?, temp1 = ?, temp2 = ?, remark = ? WHERE id = ?',
    [updatedMeasurement.type, updatedMeasurement.temp1, updatedMeasurement.temp2, updatedMeasurement.remark, updatedMeasurement.id]
  );
  return updatedMeasurement;
};

export const deleteMeasurement = async (id: number): Promise<boolean> => {
  if (!db) await initDatabase();
  const result = await db!.run('DELETE FROM measurements WHERE id = ?', id);
  return result.changes! > 0;
};

// Inward Services
export const getInwardEntries = async (): Promise<InwardEntry[]> => {
  if (!db) await initDatabase();
  return await db!.all('SELECT * FROM inward_entries');
};

export const addInwardEntry = async (entry: Omit<InwardEntry, 'id'>): Promise<InwardEntry> => {
  if (!db) await initDatabase();
  const result = await db!.run(
    'INSERT INTO inward_entries (productId, quantity, date, rackId, containerId, containerQuantity, grossWeight, netWeight, remark1, remark2, remark3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [entry.productId, entry.quantity, entry.date, entry.rackId, entry.containerId, entry.containerQuantity, entry.grossWeight, entry.netWeight, entry.remark1, entry.remark2, entry.remark3]
  );
  return { ...entry, id: result.lastID! };
};

export const updateInwardEntry = async (updatedEntry: InwardEntry): Promise<InwardEntry | undefined> => {
  if (!db) await initDatabase();
  await db!.run(
    'UPDATE inward_entries SET productId = ?, quantity = ?, date = ?, rackId = ?, containerId = ?, containerQuantity = ?, grossWeight = ?, netWeight = ?, remark1 = ?, remark2 = ?, remark3 = ? WHERE id = ?',
    [updatedEntry.productId, updatedEntry.quantity, updatedEntry.date, updatedEntry.rackId, updatedEntry.containerId, updatedEntry.containerQuantity, updatedEntry.grossWeight, updatedEntry.netWeight, updatedEntry.remark1, updatedEntry.remark2, updatedEntry.remark3, updatedEntry.id]
  );
  return updatedEntry;
};

export const deleteInwardEntry = async (id: number): Promise<boolean> => {
  if (!db) await initDatabase();
  const result = await db!.run('DELETE FROM inward_entries WHERE id = ?', id);
  return result.changes! > 0;
};

// Outward Services
export const getOutwardEntries = async (): Promise<OutwardEntry[]> => {
  if (!db) await initDatabase();
  return await db!.all('SELECT * FROM outward_entries');
};

export const addOutwardEntry = async (entry: Omit<OutwardEntry, 'id'>): Promise<OutwardEntry> => {
  if (!db) await initDatabase();
  const result = await db!.run(
    'INSERT INTO outward_entries (productId, quantity, date, rackId, containerId, containerQuantity, grossWeight, netWeight, remark1, remark2, remark3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [entry.productId, entry.quantity, entry.date, entry.rackId, entry.containerId, entry.containerQuantity, entry.grossWeight, entry.netWeight, entry.remark1, entry.remark2, entry.remark3]
  );
  return { ...entry, id: result.lastID! };
};

export const updateOutwardEntry = async (updatedEntry: OutwardEntry): Promise<OutwardEntry | undefined> => {
  if (!db) await initDatabase();
  await db!.run(
    'UPDATE outward_entries SET productId = ?, quantity = ?, date = ?, rackId = ?, containerId = ?, containerQuantity = ?, grossWeight = ?, netWeight = ?, remark1 = ?, remark2 = ?, remark3 = ? WHERE id = ?',
    [updatedEntry.productId, updatedEntry.quantity, updatedEntry.date, updatedEntry.rackId, updatedEntry.containerId, updatedEntry.containerQuantity, updatedEntry.grossWeight, updatedEntry.netWeight, updatedEntry.remark1, updatedEntry.remark2, updatedEntry.remark3, updatedEntry.id]
  );
  return updatedEntry;
};

export const deleteOutwardEntry = async (id: number): Promise<boolean> => {
  if (!db) await initDatabase();
  const result = await db!.run('DELETE FROM outward_entries WHERE id = ?', id);
  return result.changes! > 0;
};

// Stock Summary Service
export const getStockSummary = async (): Promise<StockSummary[]> => {
  if (!db) await initDatabase();
  
  const products = await db!.all(`
    SELECT 
      p.id as productId, 
      p.name as productName, 
      p.rack, 
      p.openingStock,
      COALESCE(SUM(i.quantity), 0) as inwardTotal,
      COALESCE(SUM(o.quantity), 0) as outwardTotal,
      p.openingStock + COALESCE(SUM(i.quantity), 0) - COALESCE(SUM(o.quantity), 0) as currentStock
    FROM 
      products p
    LEFT JOIN 
      (SELECT productId, SUM(quantity) as quantity FROM inward_entries GROUP BY productId) i ON p.id = i.productId
    LEFT JOIN 
      (SELECT productId, SUM(quantity) as quantity FROM outward_entries GROUP BY productId) o ON p.id = o.productId
    GROUP BY 
      p.id
  `);
  
  return products;
};

// Helper function to get rack name by ID
export const getRackNameById = async (rackId: number): Promise<string> => {
  if (!db) await initDatabase();
  const rack = await db!.get('SELECT number FROM racks WHERE id = ?', rackId);
  return rack ? rack.number : 'Unknown';
};

// Helper function to get container type by ID
export const getContainerTypeById = async (containerId: number): Promise<string> => {
  if (!db) await initDatabase();
  const container = await db!.get('SELECT type FROM containers WHERE id = ?', containerId);
  return container ? container.type : 'Unknown';
};

// Helper function to calculate net weight
export const calculateNetWeight = async (grossWeight: number, containerId: number, containerQty: number): Promise<number> => {
  if (!db) await initDatabase();
  const container = await db!.get('SELECT weight FROM containers WHERE id = ?', containerId);
  if (!container) return grossWeight;
  
  return grossWeight - (container.weight * containerQty);
};

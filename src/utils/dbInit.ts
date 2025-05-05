
import { initDatabase } from '@/services/dataService';

export const initializeApp = async () => {
  console.log('Initializing database...');
  try {
    await initDatabase();
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

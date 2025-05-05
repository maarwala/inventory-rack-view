
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeApp } from './utils/dbInit.ts'

// Initialize the database before rendering the app
initializeApp().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});

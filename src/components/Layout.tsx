
import React from 'react';
import Navbar from './Navbar';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-muted py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} RackWise Stock Management System</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

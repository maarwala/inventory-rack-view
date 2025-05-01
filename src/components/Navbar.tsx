
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Database, FileText, BarChart2, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-muted' : '';
  };

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Link to="/" className="flex items-center">
          <h1 className="text-xl font-bold tracking-tighter">RackWise</h1>
        </Link>
        <nav className="ml-auto flex gap-2">
          <Button variant="ghost" asChild className={isActive('/')}>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild className={isActive('/database')}>
            <Link to="/database">
              <Database className="h-4 w-4 mr-2" />
              Database
            </Link>
          </Button>
          <Button variant="ghost" asChild className={isActive('/entry')}>
            <Link to="/entry">
              <FileText className="h-4 w-4 mr-2" />
              Entry Sheet
            </Link>
          </Button>
          <Button variant="ghost" asChild className={isActive('/summary')}>
            <Link to="/summary">
              <BarChart2 className="h-4 w-4 mr-2" />
              Stock Summary
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

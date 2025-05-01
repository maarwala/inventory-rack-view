
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">RackWise</span>
          </div>
          
          <nav className="hidden md:flex space-x-4">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/inward">Inward</NavLink>
            <NavLink to="/outward">Outward</NavLink>
            <NavLink to="/summary">Stock Summary</NavLink>
          </nav>

          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => {
  // We'll manually check if the current path matches the link
  const isActive = window.location.pathname === to;

  return (
    <Link 
      to={to}
      className={cn(
        "px-3 py-1.5 rounded-md text-sm font-medium transition",
        isActive 
          ? "bg-primary-foreground text-primary" 
          : "text-primary-foreground hover:bg-primary-foreground/10"
      )}
    >
      {children}
    </Link>
  );
};

const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-primary-foreground"
      >
        <span className="sr-only">Open menu</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
          <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link to="/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
            Products
          </Link>
          <Link to="/inward" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
            Inward
          </Link>
          <Link to="/outward" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
            Outward
          </Link>
          <Link to="/summary" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
            Stock Summary
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;

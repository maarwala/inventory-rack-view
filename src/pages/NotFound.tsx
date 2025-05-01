
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl mb-8">Page not found</p>
      <p className="text-muted-foreground mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
};

export default NotFound;

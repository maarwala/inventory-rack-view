
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import { getStockSummary } from '@/services/dataService';
import { StockSummary } from '@/types';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = React.useState<StockSummary[]>([]);
  
  React.useEffect(() => {
    setSummary(getStockSummary());
  }, []);
  
  const totalProducts = summary.length;
  const totalStock = summary.reduce((sum, item) => sum + item.currentStock, 0);
  const lowStockItems = summary.filter(item => item.currentStock <= 5).length;
  const racks = [...new Set(summary.map(item => item.rack))].length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Overview of your inventory status"
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Products" value={totalProducts} link="/products" linkText="View all" />
        <StatsCard title="Total Stock" value={totalStock} link="/summary" linkText="View summary" />
        <StatsCard title="Low Stock Items" value={lowStockItems} link="/summary" linkText="View details" />
        <StatsCard title="Rack Locations" value={racks} link="/products" linkText="View racks" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest stock movements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">This section will show recent inward and outward movements.</p>
              <Link to="/inward" className="text-primary text-sm font-medium">
                View all inward entries →
              </Link>
              <Link to="/outward" className="text-primary text-sm font-medium block mt-2">
                View all outward entries →
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
            <CardDescription>Products that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems > 0 ? (
              <div className="space-y-4">
                <ul className="space-y-2">
                  {summary
                    .filter(item => item.currentStock <= 5)
                    .slice(0, 5)
                    .map(item => (
                      <li key={item.productId} className="flex justify-between items-center text-sm">
                        <span>{item.productName}</span>
                        <span className="font-medium text-destructive">{item.currentStock} left</span>
                      </li>
                    ))}
                </ul>
                <Link to="/summary" className="text-primary text-sm font-medium">
                  View all low stock items →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No low stock items at the moment.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  link: string;
  linkText: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, link, linkText }) => {
  return (
    <div className="stat-card">
      <h3 className="text-muted-foreground font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <Link to={link} className="text-primary text-sm">
        {linkText} →
      </Link>
    </div>
  );
};

export default Dashboard;

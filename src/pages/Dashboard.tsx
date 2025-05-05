
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import { getStockSummary, getProducts, getInwardEntries, getOutwardEntries } from '@/services/dataService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Database, FileText, Inbox, ArrowUpCircle, ArrowDownCircle, BarChart2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [inwardCount, setInwardCount] = useState(0);
  const [outwardCount, setOutwardCount] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get data for stats
        const stockSummary = await getStockSummary();
        const products = await getProducts();
        const inward = await getInwardEntries();
        const outward = await getOutwardEntries();

        // Calculate stats
        setLowStockCount(stockSummary.filter(item => item.currentStock <= 5).length);
        setTotalItems(products.length);
        setInwardCount(inward.length);
        setOutwardCount(outward.length);

        // Prepare chart data - get top 5 items by current stock
        const topItems = [...stockSummary]
          .sort((a, b) => b.currentStock - a.currentStock)
          .slice(0, 5)
          .map(item => ({
            name: item.productName.length > 10 
              ? item.productName.substring(0, 10) + '...' 
              : item.productName,
            current: item.currentStock,
            inward: item.inwardTotal,
            outward: item.outwardTotal
          }));
          
        setChartData(topItems);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to RackWise Stock Management System"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Link to="/database">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Items in the database
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/summary">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <BarChart2 className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground">
                Items with 5 or fewer units
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/entry">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inward Entries</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inwardCount}</div>
              <p className="text-xs text-muted-foreground">
                Total inward transactions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/entry">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outward Entries</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outwardCount}</div>
              <p className="text-xs text-muted-foreground">
                Total outward transactions
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>
              Top 5 items in stock with inward and outward movement
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#3b82f6" name="Current Stock" />
                <Bar dataKey="inward" fill="#10b981" name="Inward" />
                <Bar dataKey="outward" fill="#ef4444" name="Outward" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card className="col-span-2 md:col-span-4">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/database">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted">
                  <Database size={24} className="mb-2" />
                  <span>Database</span>
                </div>
              </Link>
              <Link to="/entry">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted">
                  <FileText size={24} className="mb-2" />
                  <span>Daily Entry Sheet</span>
                </div>
              </Link>
              <Link to="/summary">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted">
                  <BarChart2 size={24} className="mb-2" />
                  <span>Stock Summary</span>
                </div>
              </Link>
              <Link to="/inward">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted">
                  <Inbox size={24} className="mb-2" />
                  <span>Inward/Outward</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

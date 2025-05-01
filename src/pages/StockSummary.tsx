
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import { getStockSummary } from '@/services/dataService';
import { StockSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const StockSummaryPage: React.FC = () => {
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rackFilter, setRackFilter] = useState<string>('');
  const [availableRacks, setAvailableRacks] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = getStockSummary();
    setSummary(data);
    
    // Extract unique rack names
    const racks = Array.from(new Set(data.map(item => item.rack)));
    setAvailableRacks(racks);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRackFilterChange = (value: string) => {
    setRackFilter(value);
  };

  const filteredSummary = summary.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRack = !rackFilter || item.rack === rackFilter;
    return matchesSearch && matchesRack;
  });

  const handleExport = () => {
    // In a real application, this would generate a PDF or Excel file
    toast({
      title: "Export initiated",
      description: "Your stock summary is being prepared for download."
    });
    
    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Export completed",
        description: "Your stock summary has been exported successfully."
      });
    }, 1500);
  };

  return (
    <div>
      <PageHeader
        title="Stock Summary"
        subtitle="Current inventory status"
        action={
          <Button onClick={handleExport}>
            Export Summary
          </Button>
        }
      />
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        
        <Select value={rackFilter} onValueChange={handleRackFilterChange}>
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder="Filter by rack" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Racks</SelectItem>
            {availableRacks.map(rack => (
              <SelectItem key={rack} value={rack}>
                {rack}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Rack</TableHead>
              <TableHead>Opening Stock</TableHead>
              <TableHead>Inward</TableHead>
              <TableHead>Outward</TableHead>
              <TableHead className="font-semibold">Current Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSummary.length > 0 ? (
              filteredSummary.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.rack}</TableCell>
                  <TableCell>{item.openingStock}</TableCell>
                  <TableCell className="text-emerald-600">+{item.inwardTotal}</TableCell>
                  <TableCell className="text-red-600">-{item.outwardTotal}</TableCell>
                  <TableCell className={`font-semibold ${item.currentStock <= 5 ? 'text-red-600' : ''}`}>
                    {item.currentStock}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  {searchTerm || rackFilter ? 'No products found matching your search criteria.' : 'No products found. Add products to see summary.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-6">
        <div className="bg-muted p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Legend</h3>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              <span>Red numbers indicate low stock (5 or fewer)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span>Green numbers indicate inward stock</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StockSummaryPage;

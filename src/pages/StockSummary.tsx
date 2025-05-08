
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/PageHeader';
import { getStockSummary } from '@/services/dataService';
import { StockSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

const StockSummaryPage: React.FC = () => {
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rackFilter, setRackFilter] = useState<string>('all');
  const [availableRacks, setAvailableRacks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getStockSummary();
      setSummary(data);
      
      // Extract unique rack names
      const racks = Array.from(new Set(data.map(item => item.rack)));
      setAvailableRacks(racks);
    } catch (error) {
      console.error("Error loading stock summary:", error);
      toast({
        title: "Error",
        description: "Failed to load stock summary",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRackFilterChange = (value: string) => {
    setRackFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const filteredSummary = summary.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRack = rackFilter === 'all' || item.rack === rackFilter;
    return matchesSearch && matchesRack;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSummary.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSummary = filteredSummary.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPageButtons = 5;
    
    if (totalPages <= maxPageButtons) {
      // Show all pages if total pages are less than max buttons
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of middle pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at start or end
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push(-1); // Use -1 to indicate ellipsis
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push(-2); // Use -2 to indicate ellipsis
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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

  // Group by rack for rack-wise view - now using only paginated data
  const rackwiseSummary = paginatedSummary.reduce((acc, item) => {
    if (!acc[item.rack]) {
      acc[item.rack] = [];
    }
    acc[item.rack].push(item);
    return acc;
  }, {} as Record<string, StockSummary[]>);

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>Loading stock summary...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Stock Summary"
        subtitle="Current inventory status"
        action={
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
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
            <SelectItem value="all">All Racks</SelectItem>
            {availableRacks.map(rack => (
              <SelectItem key={rack} value={rack}>
                {rack}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="text-sm text-muted-foreground mb-2">
        Showing {paginatedSummary.length} of {filteredSummary.length} items (Page {currentPage} of {totalPages || 1})
      </div>
      
      <Tabs defaultValue="product-wise" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="product-wise">Product View</TabsTrigger>
          <TabsTrigger value="rack-wise">Rack View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="product-wise">
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
                {paginatedSummary.length > 0 ? (
                  paginatedSummary.map((item) => (
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
                      {searchTerm || rackFilter !== 'all' ? 'No products found matching your search criteria.' : 'No products found. Add products to see summary.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredSummary.length > 0 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === -1 || page === -2 ? (
                      <PaginationLink>...</PaginationLink>
                    ) : (
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => handlePageChange(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
        
        <TabsContent value="rack-wise">
          {Object.entries(rackwiseSummary).length > 0 ? (
            Object.entries(rackwiseSummary).map(([rack, items]) => (
              <div key={rack} className="mb-6">
                <h3 className="text-lg font-semibold mb-2 bg-muted p-2 rounded-md">Rack: {rack}</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Opening Stock</TableHead>
                        <TableHead>Inward</TableHead>
                        <TableHead>Outward</TableHead>
                        <TableHead className="font-semibold">Current Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>{item.openingStock}</TableCell>
                          <TableCell className="text-emerald-600">+{item.inwardTotal}</TableCell>
                          <TableCell className="text-red-600">-{item.outwardTotal}</TableCell>
                          <TableCell className={`font-semibold ${item.currentStock <= 5 ? 'text-red-600' : ''}`}>
                            {item.currentStock}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center border rounded-md">
              {searchTerm || rackFilter !== 'all' ? 'No products found matching your search criteria.' : 'No products found. Add products to see summary.'}
            </div>
          )}
          
          {filteredSummary.length > 0 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === -1 || page === -2 ? (
                      <PaginationLink>...</PaginationLink>
                    ) : (
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => handlePageChange(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
      </Tabs>
      
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

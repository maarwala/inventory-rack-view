
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/PageHeader';
import { getPaginatedStockSummary } from '@/services/dataService';
import { StockSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Loader2 } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious, 
  PaginationEllipsis
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

const StockSummaryPage: React.FC = () => {
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rackFilter, setRackFilter] = useState<string>('all');
  const [availableRacks, setAvailableRacks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData(currentPage, searchTerm, rackFilter);
  }, [currentPage]);

  // Handle filter changes with debounce
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      // Reset to first page when filters change
      if (currentPage === 1) {
        loadData(1, searchTerm, rackFilter);
      } else {
        setCurrentPage(1); // This will trigger the first useEffect
      }
    }, 500); // 500ms debounce
    
    setDebounceTimer(timer);
    
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [searchTerm, rackFilter]);

  const loadData = async (page: number, search: string, rack: string) => {
    try {
      setIsLoading(true);
      console.log(`Loading page ${page} with search: "${search}" and rack filter: "${rack}"`);
      
      const result = await getPaginatedStockSummary(
        page, 
        ITEMS_PER_PAGE, 
        search, 
        rack
      );
      
      setSummary(result.data);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalCount);
      setAvailableRacks(result.availableRacks);
      
      console.log(`Loaded ${result.data.length} items. Total: ${result.totalCount}`);
    } catch (error) {
      console.error("Error loading stock summary:", error);
      toast({
        title: "Error",
        description: "Failed to load stock summary data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRackFilterChange = (value: string) => {
    setRackFilter(value);
  };

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

  // Group by rack for rack-wise view
  const rackwiseSummary = summary.reduce((acc, item) => {
    if (!acc[item.rack]) {
      acc[item.rack] = [];
    }
    acc[item.rack].push(item);
    return acc;
  }, {} as Record<string, StockSummary[]>);

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center p-10 space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-lg">Loading stock summary data...</p>
      <p className="text-sm text-muted-foreground">This may take a moment for large datasets</p>
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center p-10 space-y-4">
      <p className="text-lg text-destructive">Failed to load stock summary</p>
      <Button onClick={() => loadData(currentPage, searchTerm, rackFilter)}>
        Retry
      </Button>
    </div>
  );

  const EmptyState = ({ filtered = false }) => (
    <div className="p-6 text-center border rounded-md">
      {filtered 
        ? 'No products found matching your search criteria.' 
        : 'No products found. Add products to see summary.'}
    </div>
  );

  if (isLoading && currentPage === 1) {
    return <LoadingState />;
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
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </span>
        ) : (
          <span>
            Showing {summary.length} of {totalItems} items (Page {currentPage} of {totalPages || 1})
          </span>
        )}
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
                {isLoading && currentPage !== 1 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        <span>Loading data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : summary.length > 0 ? (
                  summary.map((item) => (
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
                      {searchTerm || rackFilter !== 'all' ? 
                        'No products found matching your search criteria.' : 
                        'No products found. Add products to see summary.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 0 && (
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
                      <PaginationEllipsis />
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
          {isLoading && currentPage !== 1 ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
              <span className="text-lg">Loading rack view...</span>
            </div>
          ) : Object.entries(rackwiseSummary).length > 0 ? (
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
            <EmptyState filtered={searchTerm.length > 0 || rackFilter !== 'all'} />
          )}
          
          {totalPages > 0 && (
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
                      <PaginationEllipsis />
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

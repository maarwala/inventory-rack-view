
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/PageHeader';
import { getProducts, getInwardEntries, addInwardEntry } from '@/services/dataService';
import { Product, InwardEntry } from '@/types';
import { useToast } from '@/hooks/use-toast';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const InwardEntryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [entries, setEntries] = useState<InwardEntry[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<InwardEntry, 'id'>>({
    productId: 0,
    quantity: 1,
    date: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(getProducts());
    setEntries(getInwardEntries());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntry.productId === 0) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive"
      });
      return;
    }

    try {
      addInwardEntry(newEntry);
      toast({
        title: "Entry added",
        description: "Inward entry has been added successfully"
      });
      setNewEntry({
        productId: 0,
        quantity: 1,
        date: new Date().toISOString().split('T')[0]
      });
      setIsAddDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add inward entry",
        variant: "destructive"
      });
    }
  };

  const getProductName = (productId: number): string => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const filteredEntries = entries.filter(entry => {
    const productName = getProductName(entry.productId).toLowerCase();
    return productName.includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <PageHeader
        title="Inward Entries"
        subtitle="Record new stock arrivals"
        action={
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Inward Entry</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Inward Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Select 
                    value={newEntry.productId.toString()} 
                    onValueChange={(value) => setNewEntry({ ...newEntry, productId: parseInt(value) })}
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - Rack: {product.rack}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newEntry.quantity}
                    onChange={(e) => setNewEntry({ ...newEntry, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Entry</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="mb-6">
        <Input
          placeholder="Search entries by product name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.id}</TableCell>
                  <TableCell className="font-medium">{getProductName(entry.productId)}</TableCell>
                  <TableCell>{entry.quantity}</TableCell>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  {searchTerm ? 'No entries found matching your search.' : 'No inward entries found. Add one to get started!'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InwardEntryPage;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/PageHeader';
import { 
  getProducts, 
  getInwardEntries, 
  addInwardEntry, 
  getRacks, 
  getContainers,
  updateInwardEntry,
  deleteInwardEntry
} from '@/services/dataService';
import { Product, InwardEntry, Rack, Container, EntityType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import ExcelImportDialog from '@/components/ExcelImportDialog';
import SearchableSelect from '@/components/SearchableSelect';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const InwardEntryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [entries, setEntries] = useState<InwardEntry[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<InwardEntry | null>(null);
  const [newEntry, setNewEntry] = useState<Omit<InwardEntry, 'id'>>({
    productId: 0,
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
    rackId: 0,
    containerId: 0,
    containerQuantity: 0,
    grossWeight: 0,
    netWeight: 0,
    remark1: '',
    remark2: '',
    remark3: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(getProducts());
    setRacks(getRacks());
    setContainers(getContainers());
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
      if (editingEntry) {
        updateInwardEntry({ ...newEntry, id: editingEntry.id });
        toast({
          title: "Entry updated",
          description: "Inward entry has been updated successfully"
        });
      } else {
        addInwardEntry(newEntry);
        toast({
          title: "Entry added",
          description: "Inward entry has been added successfully"
        });
      }
      
      setNewEntry({
        productId: 0,
        quantity: 1,
        date: new Date().toISOString().split('T')[0],
        rackId: 0,
        containerId: 0,
        containerQuantity: 0,
        grossWeight: 0,
        netWeight: 0,
        remark1: '',
        remark2: '',
        remark3: ''
      });
      setEditingEntry(null);
      setIsAddDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingEntry ? 'update' : 'add'} inward entry`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (entry: InwardEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      productId: entry.productId,
      quantity: entry.quantity,
      date: entry.date,
      rackId: entry.rackId || 0,
      containerId: entry.containerId || 0,
      containerQuantity: entry.containerQuantity || 0,
      grossWeight: entry.grossWeight || 0,
      netWeight: entry.netWeight || 0,
      remark1: entry.remark1 || '',
      remark2: entry.remark2 || '',
      remark3: entry.remark3 || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    try {
      deleteInwardEntry(id);
      toast({
        title: "Entry deleted",
        description: "Inward entry has been deleted successfully"
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete inward entry",
        variant: "destructive"
      });
    }
  };

  const getProductName = (productId: number): string => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const handleImport = (data: any[]) => {
    try {
      let importCount = 0;
      data.forEach((item) => {
        if (item.productId && item.quantity && item.date) {
          addInwardEntry({
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity),
            date: item.date,
            rackId: item.rackId ? parseInt(item.rackId) : 0,
            containerId: item.containerId ? parseInt(item.containerId) : 0,
            containerQuantity: item.containerQuantity ? parseInt(item.containerQuantity) : 0,
            grossWeight: item.grossWeight ? parseFloat(item.grossWeight) : 0,
            netWeight: item.netWeight ? parseFloat(item.netWeight) : 0,
            remark1: item.remark1 || '',
            remark2: item.remark2 || '',
            remark3: item.remark3 || ''
          });
          importCount++;
        }
      });
      
      toast({
        title: 'Import Successful',
        description: `${importCount} inward entries imported successfully.`
      });
      
      loadData();
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: `Failed to import inward entries: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const filteredEntries = entries.filter(entry => {
    const productName = getProductName(entry.productId).toLowerCase();
    return productName.includes(searchTerm.toLowerCase());
  });

  // Prepare options for searchable selects
  const productOptions = products.map(product => ({
    id: product.id,
    label: product.name,
    value: product.id
  }));

  const rackOptions = racks.map(rack => ({
    id: rack.id,
    label: rack.number,
    value: rack.id
  }));

  const containerOptions = containers.map(container => ({
    id: container.id,
    label: `${container.type} (${container.weight}kg)`,
    value: container.id
  }));

  return (
    <div>
      <PageHeader
        title="Inward Entries"
        subtitle="Record new stock arrivals"
        action={
          <div className="flex gap-2">
            <ExcelImportDialog 
              title="Import Inward Entries" 
              entityType="inward"
              onImport={handleImport}
            />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Inward Entry</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingEntry ? 'Edit Inward Entry' : 'Add Inward Entry'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEntry} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Product</Label>
                    <SearchableSelect
                      options={productOptions}
                      placeholder="Search for a product"
                      value={newEntry.productId}
                      onChange={(value) => setNewEntry({ ...newEntry, productId: parseInt(value.toString()) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rack">Rack</Label>
                    <SearchableSelect
                      options={rackOptions}
                      placeholder="Search for a rack"
                      value={newEntry.rackId}
                      onChange={(value) => setNewEntry({ ...newEntry, rackId: parseInt(value.toString()) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="container">Container</Label>
                    <SearchableSelect
                      options={containerOptions}
                      placeholder="Search for a container"
                      value={newEntry.containerId}
                      onChange={(value) => setNewEntry({ ...newEntry, containerId: parseInt(value.toString()) })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" type="button" onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingEntry(null);
                      setNewEntry({
                        productId: 0,
                        quantity: 1,
                        date: new Date().toISOString().split('T')[0],
                        rackId: 0,
                        containerId: 0,
                        containerQuantity: 0,
                        grossWeight: 0,
                        netWeight: 0,
                        remark1: '',
                        remark2: '',
                        remark3: ''
                      });
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingEntry ? 'Update Entry' : 'Add Entry'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
              <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
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

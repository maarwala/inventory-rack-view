import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  addProduct, 
  deleteProduct, 
  getProducts, 
  updateProduct, 
  getMeasurements,
  getRacks
} from '@/services/dataService';
import { Product, Measurement, Rack } from '@/types';
import PageHeader from '@/components/PageHeader';
import SearchableSelect from '@/components/SearchableSelect';
import ExcelImportDialog from '@/components/ExcelImportDialog';

const ItemForm = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm<Product>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const productsData = await getProducts();
      const measurementsData = await getMeasurements();
      const racksData = await getRacks();
      
      setItems(productsData);
      setMeasurements(measurementsData);
      setRacks(racksData);
    } catch (error) {
      console.error("Error loading item data:", error);
      toast({
        title: "Error",
        description: "Failed to load item data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (editingItem) {
      setValue('id', editingItem.id);
      setValue('name', editingItem.name);
      setValue('rack', editingItem.rack);
      setValue('weightPerPiece', editingItem.weightPerPiece);
      setValue('measurement', editingItem.measurement);
      setValue('temp1', editingItem.temp1 || '');
      setValue('temp2', editingItem.temp2 || '');
      setValue('temp3', editingItem.temp3 || '');
      setValue('remark', editingItem.remark || '');
      setValue('openingStock', editingItem.openingStock);
    }
  }, [editingItem, setValue]);

  const handleFormSubmit = async (data: Product) => {
    try {
      if (editingItem) {
        await updateProduct(data);
        toast({
          title: 'Item Updated',
          description: `Item "${data.name}" has been updated successfully.`
        });
      } else {
        const newItem = await addProduct({
          name: data.name,
          rack: data.rack,
          weightPerPiece: data.weightPerPiece,
          measurement: data.measurement,
          temp1: data.temp1,
          temp2: data.temp2,
          temp3: data.temp3,
          remark: data.remark,
          openingStock: data.openingStock
        });
        toast({
          title: 'Item Added',
          description: `Item "${newItem.name}" has been added successfully.`
        });
      }
      
      setEditingItem(null);
      reset();
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingItem ? 'update' : 'add'} item: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (item: Product) => {
    setEditingItem(item);
  };

  const handleDelete = (id: number, name: string) => {
    try {
      const success = deleteProduct(id);
      if (success) {
        toast({
          title: 'Item Deleted',
          description: `Item "${name}" has been deleted successfully.`
        });
        loadData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete item. It might be in use.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete item: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    reset();
  };
  
  const handleExcelImport = (data: any[]) => {
    try {
      let successCount = 0;
      
      data.forEach(row => {
        try {
          addProduct({
            name: row.name || '',
            rack: row.rack || '',
            weightPerPiece: parseFloat(row.weightPerPiece) || 0,
            measurement: row.measurement || 'KGS',
            temp1: row.temp1 || '',
            temp2: row.temp2 || '',
            temp3: row.temp3 || '',
            remark: row.remark || '',
            openingStock: parseInt(row.openingStock) || 0
          });
          successCount++;
        } catch (error) {
          console.error('Error importing row:', row, error);
        }
      });
      
      if (successCount > 0) {
        loadData();
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${successCount} items.`
        });
      }
    } catch (error) {
      toast({
        title: 'Import Error',
        description: `Error importing items: ${error}`,
        variant: 'destructive'
      });
    }
  };
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rack.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const rackOptions = racks.map(rack => ({
    id: rack.id,
    label: rack.number,
    value: rack.number
  }));

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>Loading items data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Item Management" 
        subtitle="Create, modify, and delete items" 
        action={
          <ExcelImportDialog 
            title="Import Items from Excel" 
            entityType="product"
            onImport={handleExcelImport} 
          />
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" {...register('name', { required: true })} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rack">Rack</Label>
                <SearchableSelect
                  options={rackOptions}
                  placeholder="Search for a rack"
                  value={watch('rack')}
                  onChange={(value) => setValue('rack', value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weightPerPiece">Weight per Piece</Label>
                <Input 
                  id="weightPerPiece" 
                  type="number" 
                  step="0.01"
                  {...register('weightPerPiece', { 
                    required: true,
                    valueAsNumber: true 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="measurement">Measurement</Label>
                <Select 
                  onValueChange={(value) => setValue('measurement', value)} 
                  defaultValue={editingItem?.measurement || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select measurement" />
                  </SelectTrigger>
                  <SelectContent>
                    {measurements.map((m) => (
                      <SelectItem key={m.id} value={m.type}>
                        {m.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="temp1">Temp1</Label>
                <Input id="temp1" {...register('temp1')} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="temp2">Temp2</Label>
                <Input id="temp2" {...register('temp2')} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="temp3">Temp3</Label>
                <Input id="temp3" {...register('temp3')} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="openingStock">Opening Stock</Label>
                <Input 
                  id="openingStock" 
                  type="number"
                  {...register('openingStock', { 
                    required: true,
                    valueAsNumber: true 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="remark">Remark</Label>
                <Textarea id="remark" {...register('remark')} />
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" type="button" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Add'} Item
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Item List</CardTitle>
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Rack</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length > 0 ? filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.rack}</TableCell>
                        <TableCell>{item.weightPerPiece}</TableCell>
                        <TableCell>{item.measurement}</TableCell>
                        <TableCell>{item.openingStock}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(item.id, item.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          {searchTerm ? 'No matching items found.' : 'No items found. Add your first item using the form.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;

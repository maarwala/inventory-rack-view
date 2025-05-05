import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/PageHeader';
import { getProducts, addProduct, updateProduct, deleteProduct, getMeasurements, getRacks } from '@/services/dataService';
import { Product, Measurement, Rack } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';
import ExcelImportDialog from '@/components/ExcelImportDialog';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    rack: '',
    weightPerPiece: 0,
    measurement: 'KGS',
    temp1: '',
    temp2: '',
    temp3: '',
    remark: '',
    openingStock: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const productsData = await getProducts();
      const measurementsData = await getMeasurements();
      const racksData = await getRacks();
      
      setProducts(productsData);
      setMeasurements(measurementsData);
      setRacks(racksData);
    } catch (error) {
      console.error("Error loading product data:", error);
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.rack.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addProduct(newProduct);
      toast({
        title: "Product added",
        description: `${newProduct.name} has been added successfully`
      });
      setNewProduct({ 
        name: '', 
        rack: '', 
        weightPerPiece: 0,
        measurement: 'KGS',
        temp1: '',
        temp2: '',
        temp3: '',
        remark: '',
        openingStock: 0 
      });
      setIsAddDialogOpen(false);
      loadData(); // Fix: Changed from loadProducts to loadData
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProduct) {
      try {
        updateProduct(currentProduct);
        toast({
          title: "Product updated",
          description: `${currentProduct.name} has been updated successfully`
        });
        setIsEditDialogOpen(false);
        loadData(); // Fix: Changed from loadProducts to loadData
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update product",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteProduct = () => {
    if (currentProduct) {
      try {
        deleteProduct(currentProduct.id);
        toast({
          title: "Product deleted",
          description: `${currentProduct.name} has been deleted successfully`
        });
        setIsDeleteDialogOpen(false);
        loadData(); // Fix: Changed from loadProducts to loadData
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive"
        });
      }
    }
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
          description: `Successfully imported ${successCount} products.`
        });
      }
    } catch (error) {
      toast({
        title: 'Import Error',
        description: `Error importing products: ${error}`,
        variant: 'destructive'
      });
    }
  };
  
  const rackOptions = racks.map(rack => ({
    id: rack.id,
    label: rack.number,
    value: rack.number
  }));

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product inventory"
        action={
          <div className="flex gap-2">
            <ExcelImportDialog 
              title="Import Products from Excel" 
              entityType="product" 
              onImport={handleExcelImport} 
            />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Product</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rack">Rack Location</Label>
                    <SearchableSelect
                      options={rackOptions}
                      placeholder="Search for rack"
                      value={newProduct.rack}
                      onChange={(value) => setNewProduct({ ...newProduct, rack: value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightPerPiece">Weight per Piece</Label>
                    <Input
                      id="weightPerPiece"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProduct.weightPerPiece}
                      onChange={(e) => setNewProduct({ ...newProduct, weightPerPiece: parseFloat(e.target.value) })}
                      placeholder="Enter weight per piece"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="measurement">Measurement Unit</Label>
                    <Select
                      value={newProduct.measurement}
                      onValueChange={(value) => setNewProduct({ ...newProduct, measurement: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
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
                    <Label htmlFor="openingStock">Opening Stock</Label>
                    <Input
                      id="openingStock"
                      type="number"
                      min="0"
                      value={newProduct.openingStock}
                      onChange={(e) => setNewProduct({ ...newProduct, openingStock: parseInt(e.target.value) })}
                      placeholder="Enter opening stock"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Product</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      
      <div className="mb-6">
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="Search products by name or rack..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Rack</TableHead>
              <TableHead>Weight/Unit</TableHead>
              <TableHead>Measurement</TableHead>
              <TableHead>Opening Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.rack}</TableCell>
                  <TableCell>{product.weightPerPiece}</TableCell>
                  <TableCell>{product.measurement}</TableCell>
                  <TableCell>{product.openingStock}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentProduct(product);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setCurrentProduct(product);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  {searchTerm ? 'No products found matching your search.' : 'No products found. Add one to get started!'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rack">Rack Location</Label>
                <SearchableSelect
                  options={rackOptions}
                  placeholder="Search for rack"
                  value={currentProduct.rack}
                  onChange={(value) => setCurrentProduct({ ...currentProduct, rack: value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-weightPerPiece">Weight per Piece</Label>
                <Input
                  id="edit-weightPerPiece"
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentProduct.weightPerPiece}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, weightPerPiece: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-measurement">Measurement Unit</Label>
                <Select
                  value={currentProduct.measurement}
                  onValueChange={(value) => setCurrentProduct({ ...currentProduct, measurement: value })}
                >
                  <SelectTrigger id="edit-measurement">
                    <SelectValue placeholder="Select unit" />
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
                <Label htmlFor="edit-openingStock">Opening Stock</Label>
                <Input
                  id="edit-openingStock"
                  type="number"
                  min="0"
                  value={currentProduct.openingStock}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, openingStock: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Product</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete <strong>{currentProduct?.name}</strong>?</p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;

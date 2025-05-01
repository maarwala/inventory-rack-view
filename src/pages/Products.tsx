
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/PageHeader';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/services/dataService';
import { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    rack: '',
    openingStock: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(getProducts());
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
      setNewProduct({ name: '', rack: '', openingStock: 0 });
      setIsAddDialogOpen(false);
      loadProducts();
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
        loadProducts();
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
        loadProducts();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product inventory"
        action={
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
                  <Input
                    id="rack"
                    value={newProduct.rack}
                    onChange={(e) => setNewProduct({ ...newProduct, rack: e.target.value })}
                    placeholder="Enter rack location"
                    required
                  />
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
        }
      />
      
      <div className="mb-6">
        <Input
          placeholder="Search products by name or rack..."
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
              <TableHead>Product Name</TableHead>
              <TableHead>Rack</TableHead>
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
                <TableCell colSpan={5} className="text-center py-6">
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
                <Input
                  id="edit-rack"
                  value={currentProduct.rack}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, rack: e.target.value })}
                  required
                />
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

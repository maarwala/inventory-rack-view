
import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Search, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  getProducts, 
  getRacks, 
  getContainers, 
  addInwardEntry, 
  addOutwardEntry,
} from '@/services/dataService';
import { Product, Rack, Container, EntryType } from '@/types';
import SearchableSelect from '@/components/SearchableSelect';

interface EntryFormProps {
  type: EntryType;
}

interface FormValues {
  date: Date;
  productId: number;
  rackId: number;
  containerId: number;
  containerQuantity: number;
  grossWeight: number;
  netWeight: number;
  quantity: number;
  remark1?: string;
  remark2?: string;
  remark3?: string;
}

const EntryForm: React.FC<EntryFormProps> = ({ type }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      date: new Date(),
      containerQuantity: 0,
      grossWeight: 0,
      netWeight: 0,
      quantity: 0,
    }
  });
  
  const watchGrossWeight = watch('grossWeight');
  const watchContainerId = watch('containerId');
  const watchContainerQuantity = watch('containerQuantity');
  
  // Calculate net weight automatically when related values change
  useEffect(() => {
    if (watchGrossWeight && watchContainerId && selectedContainer) {
      const netWeight = watchGrossWeight - (selectedContainer.weight * watchContainerQuantity);
      setValue('netWeight', parseFloat(netWeight.toFixed(2)));
    }
  }, [watchGrossWeight, watchContainerId, watchContainerQuantity, selectedContainer, setValue]);
  
  useEffect(() => {
    // Load reference data
    setProducts(getProducts());
    setRacks(getRacks());
    setContainers(getContainers());
  }, []);
  
  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);
  
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setValue('productId', product.id);
    setSearchTerm(product.name);
  };
  
  const handleContainerSelect = (containerId: number) => {
    const container = containers.find(c => c.id === parseInt(containerId.toString()));
    setSelectedContainer(container || null);
    setValue('containerId', containerId);
  };
  
  const handleRackSelect = (rackId: number) => {
    const rack = racks.find(r => r.id === rackId);
    setSelectedRack(rack || null);
    setValue('rackId', rackId);
  };
  
  const handleFormSubmit = (data: FormValues) => {
    try {
      if (!selectedProduct) {
        toast({
          title: "Error",
          description: "Please select a product",
          variant: "destructive"
        });
        return;
      }
      
      const entry = {
        productId: data.productId,
        rackId: data.rackId,
        quantity: data.quantity,
        date: format(data.date, 'yyyy-MM-dd'),
        containerId: data.containerId,
        containerQuantity: data.containerQuantity,
        grossWeight: data.grossWeight,
        netWeight: data.netWeight,
        remark1: data.remark1,
        remark2: data.remark2,
        remark3: data.remark3
      };
      
      if (type === 'inward') {
        addInwardEntry(entry);
        toast({
          title: "Inward Entry Added",
          description: `${data.quantity} units of ${selectedProduct.name} successfully added to inventory.`
        });
      } else {
        addOutwardEntry(entry);
        toast({
          title: "Outward Entry Added",
          description: `${data.quantity} units of ${selectedProduct.name} successfully removed from inventory.`
        });
      }
      
      // Reset form
      reset();
      setSelectedProduct(null);
      setSelectedContainer(null);
      setSelectedRack(null);
      setSearchTerm('');
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add ${type} entry: ${error}`,
        variant: "destructive"
      });
    }
  };
  
  // Prepare options for searchable selects
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'inward' ? (
            <><ArrowDownCircle className="text-emerald-500" size={20} /> Inward Entry</>
          ) : (
            <><ArrowUpCircle className="text-red-500" size={20} /> Outward Entry</>
          )}
        </CardTitle>
        <CardDescription>
          Record {type === 'inward' ? 'incoming' : 'outgoing'} inventory
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form id="entryForm" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="flex">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch('date') && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('date') ? format(watch('date'), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch('date')}
                      onSelect={(date) => date && setValue('date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productSearch">Item Name</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="productSearch"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  placeholder="Search for items..."
                />
                {searchTerm && filteredProducts.length > 0 && !selectedProduct && (
                  <div className="absolute mt-1 w-full bg-background border rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-2 hover:bg-muted cursor-pointer"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Rack: {product.rack} | Weight: {product.weightPerPiece} | Unit: {product.measurement}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedProduct && (
                <div className="mt-2 text-sm">
                  <div className="p-2 bg-muted rounded-md">
                    <div className="font-medium">{selectedProduct.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Weight per piece: {selectedProduct.weightPerPiece} | Unit: {selectedProduct.measurement}
                    </div>
                    <button 
                      type="button" 
                      className="text-xs text-blue-500 mt-1"
                      onClick={() => {
                        setSelectedProduct(null);
                        setSearchTerm('');
                      }}
                    >
                      Change selection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rack">Rack</Label>
              <SearchableSelect
                options={rackOptions}
                placeholder="Search for a rack"
                value={watch('rackId')}
                onChange={handleRackSelect}
              />
              {selectedRack && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected rack: {selectedRack.number}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="container">Bag/Crate</Label>
              <SearchableSelect
                options={containerOptions}
                placeholder="Search for a container"
                value={watch('containerId')}
                onChange={handleContainerSelect}
              />
              {selectedContainer && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedContainer.type} - Weight: {selectedContainer.weight} kg
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="containerQuantity">Qty of Bag/Crate</Label>
              <Input
                id="containerQuantity"
                type="number"
                min="0"
                step="1"
                {...register('containerQuantity', {
                  valueAsNumber: true
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grossWeight">Gross Weight</Label>
              <Input
                id="grossWeight"
                type="number"
                min="0"
                step="0.01"
                {...register('grossWeight', {
                  valueAsNumber: true
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="netWeight">Net Weight</Label>
              <Input
                id="netWeight"
                type="number"
                readOnly
                {...register('netWeight', {
                  valueAsNumber: true
                })}
                className="bg-muted"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              step="1"
              {...register('quantity', {
                required: "Quantity is required",
                valueAsNumber: true,
                min: {
                  value: 1,
                  message: "Quantity must be at least 1"
                }
              })}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="remark1">Remark 1</Label>
              <Input id="remark1" {...register('remark1')} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remark2">Remark 2</Label>
              <Input id="remark2" {...register('remark2')} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remark3">Remark 3</Label>
              <Input id="remark3" {...register('remark3')} />
            </div>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => reset()}>
          Reset
        </Button>
        <Button type="submit" form="entryForm" className={type === 'inward' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
          Add {type === 'inward' ? 'Inward' : 'Outward'} Entry
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EntryForm;

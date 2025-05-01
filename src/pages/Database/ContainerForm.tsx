
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
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  addContainer, 
  deleteContainer, 
  getContainers, 
  updateContainer 
} from '@/services/dataService';
import { Container } from '@/types';
import PageHeader from '@/components/PageHeader';

const containerTypes = ['Bag', 'Crate', 'Loose', 'Op1', 'Op2'] as const;

const ContainerForm = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm<Container>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setContainers(getContainers());
  };

  useEffect(() => {
    if (editingContainer) {
      setValue('id', editingContainer.id);
      setValue('type', editingContainer.type);
      setValue('weight', editingContainer.weight);
      setValue('remark', editingContainer.remark || '');
    }
  }, [editingContainer, setValue]);

  const handleFormSubmit = (data: Container) => {
    try {
      if (editingContainer) {
        updateContainer(data);
        toast({
          title: 'Container Updated',
          description: `Container "${data.type}" has been updated successfully.`
        });
      } else {
        const newContainer = addContainer({
          type: data.type,
          weight: data.weight,
          remark: data.remark,
        });
        toast({
          title: 'Container Added',
          description: `Container "${newContainer.type}" has been added successfully.`
        });
      }
      
      setEditingContainer(null);
      reset();
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingContainer ? 'update' : 'add'} container: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (container: Container) => {
    setEditingContainer(container);
  };

  const handleDelete = (id: number, type: string) => {
    try {
      const success = deleteContainer(id);
      if (success) {
        toast({
          title: 'Container Deleted',
          description: `Container "${type}" has been deleted successfully.`
        });
        loadData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete container. It might be in use.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete container: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditingContainer(null);
    reset();
  };

  const handleTypeChange = (value: string) => {
    setValue('type', value as any);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Bag/Crate Management" 
        subtitle="Create, modify, and delete container types" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{editingContainer ? 'Edit Container' : 'Add New Container'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Container Type</Label>
                <Select 
                  onValueChange={handleTypeChange}
                  defaultValue={editingContainer?.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select container type" />
                  </SelectTrigger>
                  <SelectContent>
                    {containerTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input 
                  id="weight" 
                  type="number" 
                  step="0.01"
                  {...register('weight', { 
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
                  {editingContainer ? 'Update' : 'Add'} Container
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Container List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Remark</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {containers.length > 0 ? containers.map((container) => (
                      <TableRow key={container.id}>
                        <TableCell className="font-medium">{container.type}</TableCell>
                        <TableCell>{container.weight} KG</TableCell>
                        <TableCell>{container.remark}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(container)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(container.id, container.type)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6">
                          No containers found. Add your first container using the form.
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

export default ContainerForm;

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Pencil, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  addContainer, 
  deleteContainer, 
  getContainers, 
  updateContainer 
} from '@/services/dataService';
import { Container } from '@/types';
import PageHeader from '@/components/PageHeader';
import ExcelImportDialog from '@/components/ExcelImportDialog';

const ContainerForm = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm<Container>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getContainers();
      setContainers(data);
    } catch (error) {
      console.error("Error loading containers:", error);
      toast({
        title: "Error",
        description: "Failed to load containers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (editingContainer) {
      setValue('id', editingContainer.id);
      setValue('type', editingContainer.type);
      setValue('weight', editingContainer.weight);
      setValue('remark', editingContainer.remark || '');
    }
  }, [editingContainer, setValue]);

  const handleFormSubmit = async (data: Container) => {
    try {
      if (editingContainer) {
        await updateContainer(data);
        toast({
          title: 'Container Updated',
          description: `Container "${data.type}" has been updated successfully.`
        });
      } else {
        const newContainer = await addContainer({
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

  const handleImport = (data: any[]) => {
    try {
      let importCount = 0;
      data.forEach((item) => {
        if (item.type && item.weight) {
          addContainer({
            type: item.type,
            weight: parseFloat(item.weight),
            remark: item.remark || ''
          });
          importCount++;
        }
      });
      
      toast({
        title: 'Import Successful',
        description: `${importCount} containers imported successfully.`
      });
      
      loadData();
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: `Failed to import containers: ${error}`,
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>Loading containers...</p>
      </div>
    );
  }

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
                <Input 
                  id="type" 
                  type="text" 
                  {...register('type', { required: true })} 
                  placeholder="Enter container type"
                />
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Container List</CardTitle>
              <ExcelImportDialog 
                title="Import Containers" 
                entityType="container"
                onImport={handleImport}
              />
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

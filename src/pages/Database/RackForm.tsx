
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
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  addRack, 
  deleteRack, 
  getRacks, 
  updateRack 
} from '@/services/dataService';
import { Rack } from '@/types';
import PageHeader from '@/components/PageHeader';

const RackForm = () => {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [editingRack, setEditingRack] = useState<Rack | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<Rack>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRacks(getRacks());
  };

  useEffect(() => {
    if (editingRack) {
      setValue('id', editingRack.id);
      setValue('number', editingRack.number);
      setValue('temp1', editingRack.temp1 || '');
      setValue('temp2', editingRack.temp2 || '');
      setValue('remark', editingRack.remark || '');
    }
  }, [editingRack, setValue]);

  const handleFormSubmit = (data: Rack) => {
    try {
      if (editingRack) {
        updateRack(data);
        toast({
          title: 'Rack Updated',
          description: `Rack "${data.number}" has been updated successfully.`
        });
      } else {
        const newRack = addRack({
          number: data.number,
          temp1: data.temp1,
          temp2: data.temp2,
          remark: data.remark
        });
        toast({
          title: 'Rack Added',
          description: `Rack "${newRack.number}" has been added successfully.`
        });
      }
      
      setEditingRack(null);
      reset();
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingRack ? 'update' : 'add'} rack: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (rack: Rack) => {
    setEditingRack(rack);
  };

  const handleDelete = (id: number, number: string) => {
    try {
      const success = deleteRack(id);
      if (success) {
        toast({
          title: 'Rack Deleted',
          description: `Rack "${number}" has been deleted successfully.`
        });
        loadData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete rack. It might be in use.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete rack: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditingRack(null);
    reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Rack Management" 
        subtitle="Create, modify, and delete racks" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{editingRack ? 'Edit Rack' : 'Add New Rack'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="number">Rack Number (Alpha Numeric)</Label>
                <Input id="number" {...register('number', { required: true })} />
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
                <Label htmlFor="remark">Remark</Label>
                <Textarea id="remark" {...register('remark')} />
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" type="button" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRack ? 'Update' : 'Add'} Rack
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Rack List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rack Number</TableHead>
                      <TableHead>Temp1</TableHead>
                      <TableHead>Temp2</TableHead>
                      <TableHead>Remark</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {racks.length > 0 ? racks.map((rack) => (
                      <TableRow key={rack.id}>
                        <TableCell className="font-medium">{rack.number}</TableCell>
                        <TableCell>{rack.temp1}</TableCell>
                        <TableCell>{rack.temp2}</TableCell>
                        <TableCell>{rack.remark}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(rack)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(rack.id, rack.number)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          No racks found. Add your first rack using the form.
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

export default RackForm;

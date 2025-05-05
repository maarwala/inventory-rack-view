
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
import { Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  addRack, 
  deleteRack, 
  getRacks, 
  updateRack 
} from '@/services/dataService';
import { Rack } from '@/types';
import PageHeader from '@/components/PageHeader';
import ExcelImportDialog from '@/components/ExcelImportDialog';

const RackForm = () => {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [editingRack, setEditingRack] = useState<Rack | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
  
  const handleExcelImport = (data: any[]) => {
    try {
      let successCount = 0;
      
      data.forEach(row => {
        try {
          addRack({
            number: row.number || '',
            temp1: row.temp1 || '',
            temp2: row.temp2 || '',
            remark: row.remark || ''
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
          description: `Successfully imported ${successCount} racks.`
        });
      }
    } catch (error) {
      toast({
        title: 'Import Error',
        description: `Error importing racks: ${error}`,
        variant: 'destructive'
      });
    }
  };
  
  const filteredRacks = racks.filter(rack => 
    rack.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Rack Management" 
        subtitle="Create, modify, and delete racks"
        action={
          <ExcelImportDialog 
            title="Import Racks from Excel" 
            entityType="rack"
            onImport={handleExcelImport} 
          />
        }
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rack List</CardTitle>
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  placeholder="Search racks..."
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
                      <TableHead>Rack Number</TableHead>
                      <TableHead>Temp1</TableHead>
                      <TableHead>Temp2</TableHead>
                      <TableHead>Remark</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRacks.length > 0 ? filteredRacks.map((rack) => (
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
                          {searchTerm ? 'No matching racks found.' : 'No racks found. Add your first rack using the form.'}
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

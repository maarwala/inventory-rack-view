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
  addMeasurement,
  deleteMeasurement,
  getMeasurements,
  updateMeasurement
} from '@/services/dataService';
import { Measurement } from '@/types';
import PageHeader from '@/components/PageHeader';
import ExcelImportDialog from '@/components/ExcelImportDialog';

const MeasurementForm = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<Measurement>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getMeasurements();
      setMeasurements(data);
    } catch (error) {
      console.error("Error loading measurements:", error);
      toast({
        title: "Error",
        description: "Failed to load measurements",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (editingMeasurement) {
      setValue('id', editingMeasurement.id);
      setValue('type', editingMeasurement.type);
      setValue('temp1', editingMeasurement.temp1 || '');
      setValue('temp2', editingMeasurement.temp2 || '');
      setValue('remark', editingMeasurement.remark || '');
    }
  }, [editingMeasurement, setValue]);

  const handleFormSubmit = async (data: Measurement) => {
    try {
      if (editingMeasurement) {
        await updateMeasurement(data);
        toast({
          title: 'Measurement Updated',
          description: `Measurement "${data.type}" has been updated successfully.`
        });
      } else {
        const newMeasurement = await addMeasurement({
          type: data.type,
          temp1: data.temp1,
          temp2: data.temp2,
          remark: data.remark
        });
        toast({
          title: 'Measurement Added',
          description: `Measurement "${newMeasurement.type}" has been added successfully.`
        });
      }
      
      setEditingMeasurement(null);
      reset();
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingMeasurement ? 'update' : 'add'} measurement: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (measurement: Measurement) => {
    setEditingMeasurement(measurement);
  };

  const handleDelete = (id: number, type: string) => {
    try {
      const success = deleteMeasurement(id);
      if (success) {
        toast({
          title: 'Measurement Deleted',
          description: `Measurement "${type}" has been deleted successfully.`
        });
        loadData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete measurement. It might be in use.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete measurement: ${error}`,
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditingMeasurement(null);
    reset();
  };

  const handleImport = (data: any[]) => {
    try {
      let importCount = 0;
      data.forEach((item) => {
        if (item.type) {
          addMeasurement({
            type: item.type,
            temp1: item.temp1 || '',
            temp2: item.temp2 || '',
            remark: item.remark || ''
          });
          importCount++;
        }
      });
      
      toast({
        title: 'Import Successful',
        description: `${importCount} measurements imported successfully.`
      });
      
      loadData();
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: `Failed to import measurements: ${error}`,
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>Loading measurements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Measurement Management" 
        subtitle="Create, modify, and delete measurement units" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{editingMeasurement ? 'Edit Measurement' : 'Add New Measurement'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Measurement Type</Label>
                <Input 
                  id="type" 
                  type="text"
                  {...register('type', { required: true })} 
                  placeholder="Enter measurement type"
                />
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
                  {editingMeasurement ? 'Update' : 'Add'} Measurement
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Measurement List</CardTitle>
              <ExcelImportDialog 
                title="Import Measurements" 
                entityType="measurement"
                onImport={handleImport}
              />
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Temp1</TableHead>
                      <TableHead>Temp2</TableHead>
                      <TableHead>Remark</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measurements.length > 0 ? measurements.map((measurement) => (
                      <TableRow key={measurement.id}>
                        <TableCell className="font-medium">{measurement.type}</TableCell>
                        <TableCell>{measurement.temp1}</TableCell>
                        <TableCell>{measurement.temp2}</TableCell>
                        <TableCell>{measurement.remark}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(measurement)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(measurement.id, measurement.type)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          No measurements found. Add your first measurement using the form.
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

export default MeasurementForm;

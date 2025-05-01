
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
  addMeasurement,
  deleteMeasurement,
  getMeasurements,
  updateMeasurement
} from '@/services/dataService';
import { Measurement } from '@/types';
import PageHeader from '@/components/PageHeader';

const measurementTypes = ['KGS', 'PCS', 'Loose'] as const;

const MeasurementForm = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<Measurement>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMeasurements(getMeasurements());
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

  const handleFormSubmit = (data: Measurement) => {
    try {
      if (editingMeasurement) {
        updateMeasurement(data);
        toast({
          title: 'Measurement Updated',
          description: `Measurement "${data.type}" has been updated successfully.`
        });
      } else {
        const newMeasurement = addMeasurement({
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

  const handleTypeChange = (value: string) => {
    setValue('type', value as any);
  };

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
                <Select 
                  onValueChange={handleTypeChange}
                  defaultValue={editingMeasurement?.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select measurement type" />
                  </SelectTrigger>
                  <SelectContent>
                    {measurementTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
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
            <CardHeader>
              <CardTitle>Measurement List</CardTitle>
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


import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import ItemForm from './ItemForm';
import RackForm from './RackForm';
import ContainerForm from './ContainerForm';
import MeasurementForm from './MeasurementForm';

const Database: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Database Management"
        subtitle="Configure your inventory system"
      />
      
      <Tabs defaultValue="items" className="w-full mt-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="racks">Racks</TabsTrigger>
          <TabsTrigger value="containers">Bags/Crates</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items">
          <Card className="border-t-0 rounded-t-none p-6">
            <ItemForm />
          </Card>
        </TabsContent>
        
        <TabsContent value="racks">
          <Card className="border-t-0 rounded-t-none p-6">
            <RackForm />
          </Card>
        </TabsContent>
        
        <TabsContent value="containers">
          <Card className="border-t-0 rounded-t-none p-6">
            <ContainerForm />
          </Card>
        </TabsContent>
        
        <TabsContent value="measurements">
          <Card className="border-t-0 rounded-t-none p-6">
            <MeasurementForm />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Database;


import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EntryForm from '@/components/EntryForm';
import PageHeader from '@/components/PageHeader';
import { EntryType } from '@/types';

const EntrySheet: React.FC = () => {
  const [activeType, setActiveType] = useState<EntryType>('inward');
  
  return (
    <div>
      <PageHeader
        title="Daily Entry Sheet"
        subtitle="Record inward and outward inventory movements"
      />
      
      <Tabs 
        defaultValue="inward" 
        className="w-full mt-6"
        onValueChange={(value) => setActiveType(value as EntryType)}
      >
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="inward">Inward</TabsTrigger>
          <TabsTrigger value="outward">Outward</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="inward">
            <EntryForm type="inward" />
          </TabsContent>
          
          <TabsContent value="outward">
            <EntryForm type="outward" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default EntrySheet;

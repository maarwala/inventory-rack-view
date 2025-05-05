
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateTemplate, parseExcelFile } from '@/utils/excelUtils';

interface ExcelImportDialogProps {
  title: string;
  entityType: 'product' | 'rack' | 'container' | 'measurement';
  onImport: (data: any[]) => void;
}

const ExcelImportDialog: React.FC<ExcelImportDialogProps> = ({ title, entityType, onImport }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const blob = generateTemplate(entityType);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_template.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await parseExcelFile(selectedFile);
      
      if (data.length === 0) {
        throw new Error('No data found in the file');
      }
      
      onImport(data);
      
      toast({
        title: "Import Successful",
        description: `${data.length} records have been imported successfully.`
      });
      
      setSelectedFile(null);
    } catch (error) {
      console.error('Import error:', error);
      setError(error instanceof Error ? error.message : 'Failed to import data');
      
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Failed to import data',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Import from Excel</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="flex flex-col gap-2">
            <Button variant="link" className="justify-start p-0 h-auto" onClick={downloadTemplate}>
              Download template file
            </Button>
            <p className="text-sm text-muted-foreground">Download and fill in the template with your data.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload Excel File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground">
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Select an Excel file (.xlsx, .xls)'}
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleImport} disabled={isLoading || !selectedFile}>
              {isLoading ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImportDialog;

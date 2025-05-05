import * as XLSX from 'xlsx';
import { Product, Rack, Container, Measurement, EntityType } from '@/types';

// Define template structures for each entity type
export const productTemplate = [
  'name', 'rack', 'weightPerPiece', 'measurement', 'temp1', 'temp2', 'temp3', 'remark', 'openingStock'
];

export const rackTemplate = [
  'number', 'temp1', 'temp2', 'remark'
];

export const containerTemplate = [
  'type', 'weight', 'remark'
];

export const measurementTemplate = [
  'type', 'temp1', 'temp2', 'remark'
];

export const inwardTemplate = [
  'productId', 'quantity', 'date', 'rackId', 'containerId', 'containerQuantity', 
  'grossWeight', 'netWeight', 'remark1', 'remark2', 'remark3'
];

// Function to generate template Excel files
export const generateTemplate = (templateType: EntityType): Blob => {
  let templateData: string[] = [];
  
  switch(templateType) {
    case 'product':
      templateData = productTemplate;
      break;
    case 'rack':
      templateData = rackTemplate;
      break;
    case 'container':
      templateData = containerTemplate;
      break;
    case 'measurement':
      templateData = measurementTemplate;
      break;
    case 'inward':
      templateData = inwardTemplate;
      break;
  }
  
  const worksheet = XLSX.utils.aoa_to_sheet([templateData]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, templateType);
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Function to parse Excel file data
export const parseExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

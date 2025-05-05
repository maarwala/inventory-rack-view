
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchableSelectProps {
  options: Array<{ id: number; label: string; value: any }>;
  placeholder: string;
  value?: any;
  onChange: (value: any) => void;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  placeholder,
  value,
  onChange,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Find selected option label when value changes
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(option => option.value === value);
      if (selectedOption) {
        setSelectedLabel(selectedOption.label);
      }
    } else {
      setSelectedLabel('');
    }
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: any, optionLabel: string) => {
    onChange(optionValue);
    setSelectedLabel(optionLabel);
    setShowOptions(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          value={showOptions ? searchTerm : selectedLabel}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowOptions(true)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
      
      {showOptions && (
        <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className="p-2 hover:bg-muted cursor-pointer"
                onClick={() => handleSelect(option.value, option.label)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-2 text-muted-foreground">No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;

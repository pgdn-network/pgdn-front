import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { getAvailableScanners, getDefaultScanners } from '@/config/scanTypes';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scanners: string[]) => void;
  isLoading?: boolean;
}

export const ScanModal: React.FC<ScanModalProps> = ({ isOpen, onClose, onConfirm, isLoading = false }) => {
  const scannerOptions = getAvailableScanners();
  const [selectedScanners, setSelectedScanners] = useState<string[]>(getDefaultScanners());

  // Reset to defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedScanners(getDefaultScanners());
    }
  }, [isOpen]);

  const handleCheckedChange = (scannerId: string, checked: boolean) => {
    if (checked) {
      setSelectedScanners([...selectedScanners, scannerId]);
    } else {
      setSelectedScanners(selectedScanners.filter(id => id !== scannerId));
    }
  };

  const handleConfirm = () => {
    if (selectedScanners.length > 0) {
      onConfirm(selectedScanners);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Configure Scan</DialogTitle>
          <DialogDescription>
            Select the scanners you want to run on this node.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {scannerOptions.map((scanner) => (
            <div key={scanner.id} className="flex items-center space-x-3">
              <Checkbox
                id={scanner.id}
                checked={selectedScanners.includes(scanner.id)}
                onCheckedChange={(checked) => handleCheckedChange(scanner.id, checked as boolean)}
                disabled={isLoading}
              />
              <div className="flex-1">
                <label
                  htmlFor={scanner.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block"
                >
                  {scanner.label}
                </label>
                <p className="text-sm text-muted-foreground mt-1">{scanner.description}</p>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={selectedScanners.length === 0 || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Starting Scan...' : 'Start Scan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Protocol {
  id: string;
  name: string;
  description?: string;
}

interface ProtocolSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (protocol: Protocol) => void;
  protocols: Protocol[];
}

export const ProtocolSelectModal: React.FC<ProtocolSelectModalProps> = ({ isOpen, onClose, onSelect, protocols }) => {
  const [selected, setSelected] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Select Protocol</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2 mb-4">
          {protocols.map((proto) => (
            <div
              key={proto.id}
              className={`flex items-center p-2 rounded cursor-pointer border transition-colors ${selected === proto.id ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
              onClick={() => setSelected(proto.id)}
            >
              <span className="font-medium mr-2">{proto.name}</span>
              {proto.description && <span className="text-xs text-gray-500">{proto.description}</span>}
            </div>
          ))}
        </div>
        <Button
          className="w-full"
          disabled={!selected}
          onClick={() => {
            const proto = protocols.find(p => p.id === selected);
            if (proto) onSelect(proto);
          }}
        >
          Select Protocol
        </Button>
      </div>
    </div>
  );
}; 
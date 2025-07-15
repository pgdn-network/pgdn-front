import React from 'react';
import { Loader2 } from 'lucide-react';

interface NodeScanTaskLoaderProps {
  remaining: number;
  total: number;
}

export const NodeScanTaskLoader: React.FC<NodeScanTaskLoaderProps> = ({ remaining, total }) => {
  if (remaining === 0) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900 rounded shadow-sm border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-100 text-xs font-medium w-fit">
      <Loader2 className="animate-spin w-4 h-4 mr-1" />
      Scans running: <span className="font-bold mx-1">{remaining}</span> remaining of <span className="font-bold mx-1">{total}</span>
    </div>
  );
}; 
import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

interface NodeScanTaskLoaderProps {
  remaining: number;
  loading?: boolean;
  scanJustStarted?: boolean;
  scanCompleted?: boolean;
}

export const NodeScanTaskLoader: React.FC<NodeScanTaskLoaderProps> = ({ remaining, loading = false, scanJustStarted = false, scanCompleted = false }) => {
  // Show loader if: tasks are running, or loading, or a scan was just started, or scan completed
  const shouldShow = remaining > 0 || loading || scanJustStarted || scanCompleted;
  
  if (!shouldShow) return null;
  
  // Determine the icon and message based on state
  const isCompleted = scanCompleted && remaining === 0 && !loading && !scanJustStarted;
  const icon = isCompleted ? (
    <CheckCircle className="w-4 h-4 mr-1" />
  ) : (
    <Loader2 className="animate-spin w-4 h-4 mr-1" />
  );
  
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900 rounded-md shadow-lg border border-green-200 dark:border-green-800 text-green-800 dark:text-green-100 text-sm font-medium w-fit h-9">
      {icon}
      {isCompleted ? (
        <>Scans completed</>
      ) : loading && remaining === 0 ? (
        <>Loading tasks...</>
      ) : scanJustStarted && remaining === 0 ? (
        <>Starting scan...</>
      ) : remaining === 1 ? (
        <><span className="font-bold mx-1">{remaining}</span> scan running</>
      ) : (
        <><span className="font-bold mx-1">{remaining}</span> scans running</>
      )}
    </div>
  );
}; 
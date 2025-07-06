import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScanProgressBar } from './ScanProgressBar';
import type { ScanSessionStatus } from '@/types/node';

interface ScanProgressNotificationProps {
  sessionStatus: ScanSessionStatus;
  onClose: () => void;
}

export const ScanProgressNotification: React.FC<ScanProgressNotificationProps> = ({
  sessionStatus,
  onClose
}) => {
  // Defensive programming: ensure scans array exists and is valid
  const scans = Array.isArray(sessionStatus.scans) ? sessionStatus.scans : [];
  const completedScans = scans.filter(scan => scan && scan.status === 'completed').length;
  const totalScans = sessionStatus.total_scans || 0;
  const allComplete = completedScans === totalScans;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg max-w-md w-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {allComplete ? 'Scan Session Complete' : 'Scan Session Running'}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {completedScans} of {totalScans} scans completed
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <div className="space-y-2">
        {scans.map((scan) => (
          <ScanProgressBar
            key={scan.id}
            scanType={scan.scan_type}
            status={scan.status}
            progress={scan.progress}
            target={scan.target}
            createdAt={scan.created_at}
          />
        ))}
      </div>

      {allComplete && (
        <div className="mt-3 text-center">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            All scans completed successfully!
          </p>
        </div>
      )}
    </div>
  );
};
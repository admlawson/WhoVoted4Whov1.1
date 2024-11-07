import React from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface DataSyncStatusProps {
  lastSync: string | null;
  syncStatus: 'success' | 'error' | 'syncing' | 'idle';
  error?: string | null;
}

export function DataSyncStatus({ lastSync, syncStatus, error }: DataSyncStatusProps) {
  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return `${Math.floor(hours / 24)} days ago`;
    }
    if (hours > 0) {
      return `${hours} hours ago`;
    }
    return `${minutes} minutes ago`;
  };

  return (
    <div className="space-y-4">
      {lastSync && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Last synchronized: {formatTimeAgo(lastSync)}</span>
        </div>
      )}

      {syncStatus === 'error' && error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {syncStatus === 'success' && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span>Data synchronized successfully</span>
        </div>
      )}
    </div>
  );
}
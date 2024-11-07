import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] animate-fade-in">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="mt-4 text-sm text-gray-500">Loading election data...</p>
    </div>
  );
}
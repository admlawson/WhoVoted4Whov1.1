import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  error: string | null;
  children: React.ReactNode;
}

export function ErrorBoundary({ error, children }: ErrorBoundaryProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-4 animate-fade-in">
        <div className="flex items-center gap-3 text-red-700 mb-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <h3 className="font-semibold text-lg">Error loading election data</h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex items-center gap-2 text-sm text-red-500">
          <RefreshCw className="w-4 h-4" />
          <p>Please try selecting different election years or refreshing the page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
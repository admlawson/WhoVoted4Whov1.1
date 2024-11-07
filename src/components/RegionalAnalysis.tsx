import React from 'react';
import { BarChart3 } from 'lucide-react';
import { RegionalData } from '../types/election';

interface RegionalAnalysisProps {
  winner: {
    name: string;
    party: string;
    regionalData: RegionalData[];
  };
  runnerUp: {
    name: string;
    party: string;
    regionalData: RegionalData[];
  };
}

export function RegionalAnalysis({ winner, runnerUp }: RegionalAnalysisProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="text-gray-500" />
        <h2 className="text-lg font-semibold">Regional Analysis</h2>
      </div>

      <div className="space-y-6">
        {winner.regionalData.map((region) => (
          <div key={region.region} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{region.region}</span>
              <span className="text-gray-500">
                {region.previousPercentage && (
                  <span className="mr-2 text-xs">
                    vs {region.previousPercentage.toFixed(1)}%
                  </span>
                )}
                {region.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  winner.party === 'Democratic' ? 'bg-blue-500' : 'bg-red-500'
                }`}
                style={{ width: `${region.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
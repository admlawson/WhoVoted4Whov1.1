import React from 'react';
import { Filter, Clock, AlertTriangle } from 'lucide-react';
import { ELECTION_YEARS } from '../config/constants';
import { US_STATES } from '../config/states';
import { useLastUpdate } from '../hooks/useLastUpdate';

interface FilterBarProps {
  selectedParty: string;
  setSelectedParty: (party: string) => void;
  primaryYear: number;
  setPrimaryYear: (year: number) => void;
  comparisonYear: number;
  setComparisonYear: (year: number) => void;
  selectedState: string | null;
  setSelectedState: (state: string) => void;
}

export function FilterBar({
  selectedParty,
  setSelectedParty,
  primaryYear,
  setPrimaryYear,
  comparisonYear,
  setComparisonYear,
  selectedState,
  setSelectedState,
}: FilterBarProps) {
  const { lastUpdate, isStale } = useLastUpdate();

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    return 'just now';
  };

  const selectClassName = `mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2
    text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200`;

  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Filter className="w-5 h-5" />
          <h2 className="font-semibold">Filter Options</h2>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-500" />
          {lastUpdate ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">
                Last updated: {formatTimeAgo(lastUpdate)}
              </span>
              {isStale && (
                <div className="flex items-center gap-1 text-amber-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Data may be outdated</span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500">No updates recorded</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label htmlFor="party" className={labelClassName}>
            Party
          </label>
          <select
            id="party"
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className={selectClassName}
          >
            <option value="all">All Parties</option>
            <option value="DEM">Democratic</option>
            <option value="REP">Republican</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="primaryYear" className={labelClassName}>
            Primary Year
          </label>
          <select
            id="primaryYear"
            value={primaryYear}
            onChange={(e) => setPrimaryYear(Number(e.target.value))}
            className={selectClassName}
          >
            {ELECTION_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="comparisonYear" className={labelClassName}>
            Comparison Year
          </label>
          <select
            id="comparisonYear"
            value={comparisonYear}
            onChange={(e) => setComparisonYear(Number(e.target.value))}
            className={selectClassName}
          >
            {ELECTION_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="state" className={labelClassName}>
            State
          </label>
          <select
            id="state"
            value={selectedState || ''}
            onChange={(e) => setSelectedState(e.target.value)}
            className={selectClassName}
          >
            <option value="">All States</option>
            {Object.entries(US_STATES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
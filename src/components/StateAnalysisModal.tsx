import React, { useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import type { Election } from '../types/election';
import { US_STATES } from '../config/states';

interface StateAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: string | null;
  election: Election | null;
  comparisonElection: Election | null;
}

export function StateAnalysisModal({ 
  isOpen, 
  onClose, 
  state, 
  election,
  comparisonElection 
}: StateAnalysisModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !state || !election) return null;

  const stateData = election.stateResults[state];
  const comparisonStateData = comparisonElection?.stateResults[state];
  const stateName = US_STATES[state];

  const calculateMetrics = (data: typeof stateData) => {
    if (!data) return null;
    const totalVotes = data.popularVotes.democratic + data.popularVotes.republican;
    const margin = ((data.popularVotes[data.winnerParty.toLowerCase()] - 
                    data.popularVotes[data.winnerParty === 'Democratic' ? 'republican' : 'democratic']) / 
                    totalVotes) * 100;
    return { totalVotes, margin };
  };

  const currentMetrics = calculateMetrics(stateData);
  const previousMetrics = comparisonStateData ? calculateMetrics(comparisonStateData) : null;

  const marginChange = previousMetrics && currentMetrics
    ? currentMetrics.margin - previousMetrics.margin
    : null;

  const turnoutChange = comparisonStateData && stateData
    ? stateData.turnout - comparisonStateData.turnout
    : null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!stateData || !currentMetrics) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div 
          className="modal-content p-6"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4">No Data Available</h2>
          <p>No election data available for {stateName || state}.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const MetricBox = ({ label, value, trend }: { label: string; value: string; trend?: number }) => (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <p className="font-medium text-lg">{value}</p>
        {trend !== undefined && (
          <div className={`flex items-center ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="ml-1 text-sm">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="state-analysis-title"
    >
      <div 
        ref={modalRef}
        className="modal-content my-4 sm:my-8 mx-auto max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 id="state-analysis-title" className="text-xl font-bold">
                {stateName} Election Results
              </h2>
              <p className="text-gray-500">
                Comparing {election.year} vs {comparisonElection?.year}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 
                       hover:bg-gray-100 rounded-full"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Year */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{election.year}</h3>
              
              <MetricBox 
                label="Winner"
                value={stateData.winner}
              />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-500">Victory Margin</p>
                  <span className="font-medium">
                    {Math.abs(currentMetrics.margin).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      stateData.winnerParty === 'Democratic' ? 'bg-blue-500' : 'bg-red-500'
                    } transition-all duration-500`}
                    style={{ width: `${Math.min(Math.abs(currentMetrics.margin) * 2, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <MetricBox 
                  label="Democratic"
                  value={stateData.popularVotes.democratic.toLocaleString()}
                />
                <MetricBox 
                  label="Republican"
                  value={stateData.popularVotes.republican.toLocaleString()}
                />
              </div>

              <MetricBox 
                label="Voter Turnout"
                value={`${stateData.turnout.toFixed(1)}%`}
                trend={turnoutChange || undefined}
              />
            </div>

            {/* Comparison Year */}
            {comparisonStateData && previousMetrics && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{comparisonElection?.year}</h3>
                
                <MetricBox 
                  label="Winner"
                  value={comparisonStateData.winner}
                />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500">Victory Margin</p>
                    <span className="font-medium">
                      {Math.abs(previousMetrics.margin).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        comparisonStateData.winnerParty === 'Democratic' ? 'bg-blue-500' : 'bg-red-500'
                      } transition-all duration-500`}
                      style={{ width: `${Math.min(Math.abs(previousMetrics.margin) * 2, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MetricBox 
                    label="Democratic"
                    value={comparisonStateData.popularVotes.democratic.toLocaleString()}
                  />
                  <MetricBox 
                    label="Republican"
                    value={comparisonStateData.popularVotes.republican.toLocaleString()}
                  />
                </div>

                <MetricBox 
                  label="Voter Turnout"
                  value={`${comparisonStateData.turnout.toFixed(1)}%`}
                />
              </div>
            )}
          </div>

          {/* Changes Section */}
          {comparisonStateData && marginChange !== null && turnoutChange !== null && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-4">
                Changes from {comparisonElection?.year} to {election.year}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricBox 
                  label="Margin Shift"
                  value={`${marginChange > 0 ? '+' : ''}${marginChange.toFixed(1)}%`}
                  trend={marginChange}
                />
                <MetricBox 
                  label="Turnout Change"
                  value={`${turnoutChange > 0 ? '+' : ''}${turnoutChange.toFixed(1)}%`}
                  trend={turnoutChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
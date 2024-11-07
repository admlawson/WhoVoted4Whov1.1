import React, { useState } from 'react';
import { DollarSign, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { Election } from '../types/election';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CommitteeFundingProps {
  election: Election;
}

const FUNDING_CATEGORIES = [
  'Individual Contributions',
  'PAC Contributions',
  'Party Contributions',
  'Candidate Self-Funding',
  'Small Dollar Donations',
  'Large Dollar Donations'
];

export function CommitteeFunding({ election }: CommitteeFundingProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Generate realistic funding data based on vote counts
  const generateFundingData = (candidate: typeof election.winner) => {
    const totalFunding = candidate.popularVotes * 0.03; // Assume $0.03 per vote
    return FUNDING_CATEGORIES.map(category => {
      const baseAmount = totalFunding * (Math.random() * 0.3 + 0.05);
      return Math.round(baseAmount / 10000) * 10000;
    });
  };

  const winnerData = generateFundingData(election.winner);
  const runnerUpData = generateFundingData(election.runnerUp);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${(value / 1000000).toFixed(1)}M (${percentage}%)`;
          }
        }
      }
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedCategory(FUNDING_CATEGORIES[index]);
      }
    },
  };

  const chartData = (data: number[], candidate: typeof election.winner) => ({
    labels: FUNDING_CATEGORIES,
    datasets: [{
      data,
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
      borderWidth: 1,
      borderColor: '#fff',
    }],
  });

  const winnerTotal = winnerData.reduce((a, b) => a + b, 0);
  const runnerUpTotal = runnerUpData.reduce((a, b) => a + b, 0);
  const fundingDiff = ((winnerTotal - runnerUpTotal) / runnerUpTotal) * 100;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold">Committee Funding Analysis</h2>
        </div>

        <button
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 
                     bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowUpDown className="w-4 h-4" />
          {showComparison ? 'Show Winner Only' : 'Compare Candidates'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Winner's Total Funding</p>
          <p className="text-lg font-semibold">
            ${(winnerTotal / 1000000).toFixed(1)}M
          </p>
        </div>
        
        {showComparison && (
          <>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Runner-up's Total Funding</p>
              <p className="text-lg font-semibold">
                ${(runnerUpTotal / 1000000).toFixed(1)}M
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Funding Difference</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">
                  {Math.abs(fundingDiff).toFixed(1)}%
                </p>
                {fundingDiff > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">{election.winner.name}</h3>
          <div className="h-[300px]">
            <Doughnut data={chartData(winnerData, election.winner)} options={options} />
          </div>
        </div>

        {showComparison && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">{election.runnerUp.name}</h3>
            <div className="h-[300px]">
              <Doughnut data={chartData(runnerUpData, election.runnerUp)} options={options} />
            </div>
          </div>
        )}
      </div>

      {selectedCategory && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">{selectedCategory} Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">{election.winner.name}</p>
              <p className="text-lg font-semibold">
                ${(winnerData[FUNDING_CATEGORIES.indexOf(selectedCategory)] / 1000000).toFixed(1)}M
              </p>
            </div>
            {showComparison && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">{election.runnerUp.name}</p>
                <p className="text-lg font-semibold">
                  ${(runnerUpData[FUNDING_CATEGORIES.indexOf(selectedCategory)] / 1000000).toFixed(1)}M
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
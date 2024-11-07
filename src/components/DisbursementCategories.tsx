import React, { useState } from 'react';
import { CircleDollarSign, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { Election } from '../types/election';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DisbursementCategoriesProps {
  election: Election;
}

const SPENDING_CATEGORIES = [
  'Media Advertising',
  'Campaign Events',
  'Staff Salaries',
  'Direct Mail',
  'Digital Marketing',
  'Polling/Research',
  'Travel',
  'Office Expenses'
];

export function DisbursementCategories({ election }: DisbursementCategoriesProps) {
  const [showComparison, setShowComparison] = useState(false);

  // Generate realistic spending data based on total votes
  const generateSpendingData = (candidate: typeof election.winner) => {
    const totalBudget = candidate.popularVotes * 0.05; // Assume 5% of votes as dollars
    return SPENDING_CATEGORIES.map(category => {
      const baseAmount = totalBudget * (Math.random() * 0.2 + 0.05);
      return Math.round(baseAmount / 10000) * 10000; // Round to nearest 10k
    });
  };

  const winnerData = generateSpendingData(election.winner);
  const runnerUpData = generateSpendingData(election.runnerUp);

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Campaign Spending Categories',
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              label += '$' + (context.parsed.x / 1000000).toFixed(1) + 'M';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: (value: number) => '$' + (value / 1000000).toFixed(1) + 'M',
          padding: 8,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          padding: 8,
        }
      }
    },
  };

  const data = {
    labels: SPENDING_CATEGORIES,
    datasets: showComparison ? [
      {
        label: election.winner.name,
        data: winnerData,
        backgroundColor: election.winner.party === 'Democratic' ? 
          'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      },
      {
        label: election.runnerUp.name,
        data: runnerUpData,
        backgroundColor: election.runnerUp.party === 'Democratic' ? 
          'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      }
    ] : [
      {
        label: election.winner.name,
        data: winnerData,
        backgroundColor: election.winner.party === 'Democratic' ? 
          'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      }
    ],
  };

  // Calculate total spending for each candidate
  const winnerTotal = winnerData.reduce((a, b) => a + b, 0);
  const runnerUpTotal = runnerUpData.reduce((a, b) => a + b, 0);
  const spendingDiff = ((winnerTotal - runnerUpTotal) / runnerUpTotal) * 100;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <CircleDollarSign className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold">Campaign Spending Analysis</h2>
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
          <p className="text-sm text-gray-500 mb-1">Winner's Total Spending</p>
          <p className="text-lg font-semibold">
            ${(winnerTotal / 1000000).toFixed(1)}M
          </p>
        </div>
        
        {showComparison && (
          <>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Runner-up's Total Spending</p>
              <p className="text-lg font-semibold">
                ${(runnerUpTotal / 1000000).toFixed(1)}M
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Spending Difference</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">
                  {Math.abs(spendingDiff).toFixed(1)}%
                </p>
                {spendingDiff > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="h-[400px] sm:h-[500px]">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
}
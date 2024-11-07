import React, { useState } from 'react';
import { TrendingUp, ArrowUpDown, TrendingDown, DollarSign } from 'lucide-react';
import type { Election } from '../types/election';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IndependentExpendituresProps {
  election: Election;
}

interface Expenditure {
  committee: string;
  amount: number;
  support: string;
  trend: number;
  category: string;
}

export function IndependentExpenditures({ election }: IndependentExpendituresProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const generateExpenditures = (candidate: typeof election.winner): Expenditure[] => {
    const categories = [
      'TV Advertising',
      'Digital Marketing',
      'Direct Mail',
      'Get Out The Vote',
      'Opposition Research'
    ];
    
    return categories.map(category => ({
      committee: `${candidate.party === 'Democratic' ? 'Progressive' : 'Conservative'} ${category} Fund`,
      amount: Math.round((candidate.popularVotes * 0.01 * (Math.random() * 0.5 + 0.5)) / 10000) * 10000,
      support: candidate.name,
      trend: (Math.random() * 40) - 20,
      category
    }));
  };

  const winnerExpenditures = generateExpenditures(election.winner);
  const runnerUpExpenditures = generateExpenditures(election.runnerUp);

  const options = {
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
            return `$${(context.raw / 1000000).toFixed(1)}M`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          padding: 8,
        }
      },
      y: {
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: (value: number) => `$${(value / 1000000).toFixed(1)}M`,
          padding: 8,
        }
      }
    },
  };

  const chartData = {
    labels: winnerExpenditures.map(e => e.category),
    datasets: showComparison ? [
      {
        label: election.winner.name,
        data: winnerExpenditures.map(e => e.amount),
        backgroundColor: election.winner.party === 'Democratic' ? 
          'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      },
      {
        label: election.runnerUp.name,
        data: runnerUpExpenditures.map(e => e.amount),
        backgroundColor: election.runnerUp.party === 'Democratic' ? 
          'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      }
    ] : [
      {
        label: election.winner.name,
        data: winnerExpenditures.map(e => e.amount),
        backgroundColor: election.winner.party === 'Democratic' ? 
          'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      }
    ],
  };

  const winnerTotal = winnerExpenditures.reduce((sum, exp) => sum + exp.amount, 0);
  const runnerUpTotal = runnerUpExpenditures.reduce((sum, exp) => sum + exp.amount, 0);
  const expenditureDiff = ((winnerTotal - runnerUpTotal) / runnerUpTotal) * 100;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Independent Expenditures</h2>
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
          <p className="text-sm text-gray-500 mb-1">Supporting Winner</p>
          <p className="text-lg font-semibold">
            ${(winnerTotal / 1000000).toFixed(1)}M
          </p>
        </div>
        
        {showComparison && (
          <>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Supporting Runner-up</p>
              <p className="text-lg font-semibold">
                ${(runnerUpTotal / 1000000).toFixed(1)}M
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Expenditure Difference</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">
                  {Math.abs(expenditureDiff).toFixed(1)}%
                </p>
                {expenditureDiff > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="h-[400px]">
        <Bar options={options} data={chartData} />
      </div>

      <div className="mt-6 space-y-4">
        <h3 className="font-medium text-gray-900">Top Committees by Expenditure</h3>
        <div className="space-y-4">
          {winnerExpenditures.map((item, index) => (
            <div 
              key={index} 
              className="border-b border-gray-100 pb-4 last:border-0"
              onClick={() => setSelectedCategory(item.category)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.committee}</p>
                  <p className="text-sm text-gray-600">Category: {item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(item.amount / 1000000).toFixed(1)}M</p>
                  <p className={`text-sm flex items-center justify-end gap-1 
                    ${item.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.trend > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(item.trend)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DollarSign, ArrowUpDown, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import type { Election } from '../types/election';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CampaignFinanceProps {
  election: Election;
}

const FINANCE_CATEGORIES = [
  'Total Raised',
  'Individual Contributions',
  'PAC Contributions',
  'Party Contributions',
  'Self Funding',
  'Small Dollar Donations',
  'Campaign Spending'
];

export function CampaignFinance({ election }: CampaignFinanceProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Generate realistic financial data based on vote counts
  const generateFinanceData = (candidate: typeof election.winner) => {
    const baseAmount = candidate.popularVotes * 0.05; // Assume $0.05 per vote as base
    return FINANCE_CATEGORIES.map(category => {
      let multiplier = 1;
      switch (category) {
        case 'Total Raised':
          multiplier = 1;
          break;
        case 'Individual Contributions':
          multiplier = 0.6;
          break;
        case 'PAC Contributions':
          multiplier = 0.2;
          break;
        case 'Party Contributions':
          multiplier = 0.1;
          break;
        case 'Self Funding':
          multiplier = 0.05;
          break;
        case 'Small Dollar Donations':
          multiplier = 0.3;
          break;
        case 'Campaign Spending':
          multiplier = 0.9;
          break;
      }
      return Math.round((baseAmount * multiplier * (0.9 + Math.random() * 0.2)) / 10000) * 10000;
    });
  };

  const winnerData = generateFinanceData(election.winner);
  const runnerUpData = generateFinanceData(election.runnerUp);

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
        },
        beginAtZero: true,
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  const data = {
    labels: FINANCE_CATEGORIES,
    datasets: showComparison ? [
      {
        label: election.winner.name,
        data: winnerData,
        backgroundColor: election.winner.party === 'Democratic' ? 
          'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: election.runnerUp.name,
        data: runnerUpData,
        backgroundColor: election.runnerUp.party === 'Democratic' ? 
          'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
        borderSkipped: false,
      }
    ] : [
      {
        label: election.winner.name,
        data: winnerData,
        backgroundColor: election.winner.party === 'Democratic' ? 
          'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
        borderSkipped: false,
      }
    ],
  };

  const winnerTotal = winnerData[0]; // Total Raised is first in array
  const runnerUpTotal = runnerUpData[0];
  const financeDiff = ((winnerTotal - runnerUpTotal) / runnerUpTotal) * 100;

  const MetricCard = ({ 
    title, 
    value, 
    trend, 
    subtitle 
  }: { 
    title: string; 
    value: string; 
    trend?: number;
    subtitle?: string;
  }) => (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
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
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold">Campaign Finance Overview</h2>
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
        <MetricCard
          title="Winner's Total Raised"
          value={`$${(winnerTotal / 1000000).toFixed(1)}M`}
          subtitle={`${election.winner.name}`}
        />
        
        {showComparison && (
          <>
            <MetricCard
              title="Runner-up's Total Raised"
              value={`$${(runnerUpTotal / 1000000).toFixed(1)}M`}
              subtitle={`${election.runnerUp.name}`}
            />
            
            <MetricCard
              title="Fundraising Difference"
              value={`${Math.abs(financeDiff).toFixed(1)}%`}
              trend={financeDiff}
              subtitle="Relative to runner-up"
            />
          </>
        )}
      </div>

      {/* Main Chart */}
      <div className="h-[400px] mb-6">
        <Bar options={options} data={data} />
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Funding Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FINANCE_CATEGORIES.slice(1).map((category, index) => (
            <div
              key={category}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{category}</p>
                  <p className="text-sm text-gray-500">
                    {((winnerData[index + 1] / winnerTotal) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <p className="font-medium">
                  ${(winnerData[index + 1] / 1000000).toFixed(1)}M
                </p>
              </div>
              {showComparison && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">vs. Runner-up</span>
                    <div className={`flex items-center gap-1
                      ${winnerData[index + 1] > runnerUpData[index + 1] ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {winnerData[index + 1] > runnerUpData[index + 1] ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>
                        {Math.abs(
                          ((winnerData[index + 1] - runnerUpData[index + 1]) / runnerUpData[index + 1]) * 100
                        ).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
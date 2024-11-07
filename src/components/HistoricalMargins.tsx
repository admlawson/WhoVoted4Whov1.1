import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Info, ArrowUpDown } from 'lucide-react';
import type { Election } from '../types/election';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HistoricalMarginsProps {
  elections: Election[];
}

export function HistoricalMargins({ elections }: HistoricalMarginsProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const sortedElections = [...elections].sort((a, b) => a.year - b.year);

  const getMargin = (election: Election) => {
    const totalVotes = election.winner.popularVotes + election.runnerUp.popularVotes;
    return ((election.winner.popularVotes - election.runnerUp.popularVotes) / totalVotes) * 100;
  };

  const getElectoralMargin = (election: Election) => {
    return ((election.winner.electoralVotes - election.runnerUp.electoralVotes) / election.totalElectoralVotes) * 100;
  };

  const data = {
    labels: sortedElections.map(e => e.year),
    datasets: [
      {
        label: 'Popular Vote Margin (%)',
        data: sortedElections.map(getMargin),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'white',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
      },
      {
        label: 'Electoral Margin (%)',
        data: sortedElections.map(getElectoralMargin),
        borderColor: 'rgb(244, 63, 94)',
        backgroundColor: 'rgba(244, 63, 94, 0.5)',
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'white',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
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
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: (value: number) => value.toFixed(1) + '%',
          padding: 8,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          padding: 8,
        }
      }
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedYear(sortedElections[index].year);
      }
    },
  };

  const getSelectedElection = () => {
    if (!selectedYear) return null;
    return sortedElections.find(e => e.year === selectedYear);
  };

  const selectedElection = getSelectedElection();

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold">Victory Margins Over Time</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 
                       bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowUpDown className="w-4 h-4" />
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          <button
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full 
                       hover:bg-gray-100 transition-colors"
            title="Click on data points to see detailed election information"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="h-[400px] mb-6">
        <Line options={options} data={data} />
      </div>

      {showDetails && selectedElection && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">
            {selectedElection.year} Election Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Winner</p>
              <p className="font-medium">{selectedElection.winner.name}</p>
              <p className="text-sm text-gray-500">
                {selectedElection.winner.party}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Popular Vote Margin</p>
              <p className="font-medium">
                {getMargin(selectedElection).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">
                {((selectedElection.winner.popularVotes / selectedElection.totalPopularVotes) * 100).toFixed(1)}% of total votes
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Electoral Margin</p>
              <p className="font-medium">
                {getElectoralMargin(selectedElection).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">
                {selectedElection.winner.electoralVotes} electoral votes
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Voter Turnout</p>
              <p className="font-medium">
                {selectedElection.turnoutPercentage}%
              </p>
              <p className="text-sm text-gray-500">
                {(selectedElection.totalPopularVotes / 1000000).toFixed(1)}M votes
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
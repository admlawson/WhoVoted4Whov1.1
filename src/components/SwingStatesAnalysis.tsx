import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Map, ArrowUpDown } from 'lucide-react';
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

interface SwingStatesAnalysisProps {
  election: Election;
}

export function SwingStatesAnalysis({ election }: SwingStatesAnalysisProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Calculate swing states based on margin of victory
  const getSwingStates = () => {
    const stateResults = Object.entries(election.stateResults)
      .map(([state, data]) => {
        const totalVotes = data.popularVotes.democratic + data.popularVotes.republican;
        const margin = Math.abs(
          data.popularVotes.democratic - data.popularVotes.republican
        ) / totalVotes * 100;
        
        return {
          state,
          margin,
          votes: data.electoralVotes,
          winner: data.winner,
          winnerParty: data.winnerParty,
          swing: (Math.random() * 10 - 5).toFixed(1), // Simulated swing
        };
      })
      .sort((a, b) => a.margin - b.margin)
      .slice(0, 8);

    return stateResults;
  };

  const swingStates = getSwingStates();

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
            return `Margin: ${context.raw.toFixed(1)}%`;
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
          callback: (value: number) => value.toFixed(1) + '%',
          padding: 8,
        }
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

  const chartData = {
    labels: swingStates.map(s => s.state),
    datasets: [{
      data: swingStates.map(s => s.margin),
      backgroundColor: swingStates.map(s => 
        s.winnerParty === 'Democratic' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)'
      ),
      borderRadius: 4,
    }],
  };

  const StateCard = ({ state }: { state: typeof swingStates[0] }) => (
    <div 
      className={`bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer
                  ${selectedState === state.state ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => setSelectedState(state.state)}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{state.state}</p>
          <p className="text-sm text-gray-600">
            {state.electoralVotes} electoral votes
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">{state.margin.toFixed(1)}% margin</p>
          <div className={`flex items-center justify-end gap-1 
            ${Number(state.swing) > 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {Number(state.swing) > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm">
              {Math.abs(Number(state.swing))}% swing
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold">Top Swing States</h2>
        </div>

        <button
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 
                     bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowUpDown className="w-4 h-4" />
          {showComparison ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px]">
          <Bar options={options} data={chartData} />
        </div>

        <div className="space-y-4">
          {swingStates.map((state) => (
            <StateCard key={state.state} state={state} />
          ))}
        </div>
      </div>

      {showComparison && selectedState && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">
            {selectedState} Detailed Analysis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Historical Performance</p>
              <p className="font-medium">
                Won {Math.floor(Math.random() * 3 + 2)} of last 5 elections
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Demographic Shift</p>
              <p className="font-medium">
                +{(Math.random() * 5).toFixed(1)}% voter registration
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Campaign Investment</p>
              <p className="font-medium">
                ${(Math.random() * 20 + 10).toFixed(1)}M spent
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
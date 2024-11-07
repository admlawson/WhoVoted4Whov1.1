import React, { useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Info } from 'lucide-react';
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

interface ElectionTrendsProps {
  elections: Election[];
  primaryYear: number;
  comparisonYear: number;
}

export function ElectionTrends({ elections, primaryYear, comparisonYear }: ElectionTrendsProps) {
  const chartRef = useRef<ChartJS>(null);
  const [hiddenDatasets, setHiddenDatasets] = useState<Set<number>>(new Set());
  const [hoveredLegend, setHoveredLegend] = useState<number | null>(null);

  const relevantYears = elections
    .map(e => e.year)
    .filter(year => year >= Math.min(primaryYear, comparisonYear) && year <= Math.max(primaryYear, comparisonYear))
    .sort((a, b) => a - b);

  const relevantElections = elections
    .filter(e => relevantYears.includes(e.year))
    .sort((a, b) => a.year - b.year);

  const data: ChartData<'line'> = {
    labels: relevantElections.map(e => e.year),
    datasets: [
      {
        label: 'Voter Turnout (%)',
        data: relevantElections.map(e => e.turnoutPercentage),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'white',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        hidden: hiddenDatasets.has(0),
      },
      {
        label: 'Total Votes (Millions)',
        data: relevantElections.map(e => e.totalPopularVotes / 1000000),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'white',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        hidden: hiddenDatasets.has(1),
      },
      {
        label: 'Democratic Vote Share (%)',
        data: relevantElections.map(e => {
          const demVotes = e.winner.party === 'Democratic' ? e.winner.popularVotes : e.runnerUp.popularVotes;
          return (demVotes / e.totalPopularVotes) * 100;
        }),
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'white',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        hidden: hiddenDatasets.has(2),
      },
      {
        label: 'Republican Vote Share (%)',
        data: relevantElections.map(e => {
          const repVotes = e.winner.party === 'Republican' ? e.winner.popularVotes : e.runnerUp.popularVotes;
          return (repVotes / e.totalPopularVotes) * 100;
        }),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'white',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        hidden: hiddenDatasets.has(3),
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
        display: false, // We'll create our own legend
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (context: any) => `Election Year: ${context[0].label}`,
          label: (context: any) => {
            const label = context.dataset.label;
            const value = context.parsed.y;
            if (label.includes('Total Votes')) {
              return `${label}: ${value.toFixed(1)}M`;
            }
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          padding: 8,
          callback: (value: number) => value.toFixed(1) + '%',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          padding: 8,
        },
      },
    },
    transitions: {
      active: {
        animation: {
          duration: 300,
        },
      },
    },
  };

  const toggleDataset = (index: number) => {
    const newHidden = new Set(hiddenDatasets);
    if (newHidden.has(index)) {
      newHidden.delete(index);
    } else {
      newHidden.add(index);
    }
    setHiddenDatasets(newHidden);
  };

  const CustomLegend = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4" role="group" aria-label="Chart legend">
      {data.datasets.map((dataset, index) => (
        <button
          key={dataset.label}
          onClick={() => toggleDataset(index)}
          onMouseEnter={() => setHoveredLegend(index)}
          onMouseLeave={() => setHoveredLegend(null)}
          onFocus={() => setHoveredLegend(index)}
          onBlur={() => setHoveredLegend(null)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                     ${hiddenDatasets.has(index) ? 'opacity-50 bg-gray-100' : 'bg-white shadow-sm'}
                     ${hoveredLegend === index ? 'ring-2 ring-blue-500' : ''}
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-pressed={!hiddenDatasets.has(index)}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: dataset.borderColor as string }}
          />
          <span className="text-sm font-medium text-gray-700">
            {dataset.label}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Election Trends</h2>
        </div>
        <button
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full 
                     hover:bg-gray-100 transition-colors"
          title="Click legend items to show/hide data series. Hover over points for detailed information."
          aria-label="Chart information"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="h-[400px] mb-4">
        <Line
          ref={chartRef}
          data={data}
          options={options}
          aria-label="Election trends chart showing voter turnout and vote distribution"
        />
      </div>

      <CustomLegend />
    </div>
  );
}
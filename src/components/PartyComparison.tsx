import React from 'react';
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
import { BarChart2 } from 'lucide-react';
import type { Election } from '../types/election';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PartyComparisonProps {
  elections: Election[];
}

export function PartyComparison({ elections }: PartyComparisonProps) {
  const sortedElections = [...elections].sort((a, b) => a.year - b.year);

  const data = {
    labels: sortedElections.map(e => e.year),
    datasets: [
      {
        label: 'Democratic',
        data: sortedElections.map(e => 
          e.winner.party === 'Democratic' 
            ? e.winner.popularVotes 
            : e.runnerUp.popularVotes
        ),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Republican',
        data: sortedElections.map(e => 
          e.winner.party === 'Republican' 
            ? e.winner.popularVotes 
            : e.runnerUp.popularVotes
        ),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

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
      title: {
        display: true,
        text: 'Popular Vote by Party',
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
            if (context.parsed.y !== null) {
              label += (context.parsed.y / 1000000).toFixed(1) + 'M votes';
            }
            return label;
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
          padding: 8,
          callback: (value: number) => `${(value / 1000000).toFixed(1)}M`,
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold">Party Vote Distribution</h2>
      </div>
      <div className="h-[400px]">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Award, BarChart, BarChart2 } from 'lucide-react';
import { Election } from '../types/election';
import { useFECData } from '../hooks/useFECData';
import { API_ENDPOINTS } from '../config/constants';
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

interface MetricsProps {
  currentElection: Election;
  previousElection?: Election;
}

export function ElectionMetrics({ currentElection, previousElection }: MetricsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'votes' | 'turnout' | 'margin' | null>(null);
  const [detailedMetrics, setDetailedMetrics] = useState<any>(null);

  // Fetch detailed election metrics from FEC API
  const { data: currentMetricsData, loading: currentLoading } = useFECData(
    `${API_ENDPOINTS.PRESIDENTIAL_RESULTS}/${currentElection.year}/summary`
  );

  const { data: previousMetricsData, loading: previousLoading } = useFECData(
    previousElection ? `${API_ENDPOINTS.PRESIDENTIAL_RESULTS}/${previousElection.year}/summary` : ''
  );

  useEffect(() => {
    if (currentMetricsData?.results && !currentLoading) {
      setDetailedMetrics(prev => ({
        ...prev,
        current: currentMetricsData.results[0]
      }));
    }
  }, [currentMetricsData, currentLoading]);

  useEffect(() => {
    if (previousMetricsData?.results && !previousLoading) {
      setDetailedMetrics(prev => ({
        ...prev,
        previous: previousMetricsData.results[0]
      }));
    }
  }, [previousMetricsData, previousLoading]);

  // Calculate differences using API data when available
  const voteDiff = detailedMetrics?.previous
    ? ((detailedMetrics.current.total_votes - detailedMetrics.previous.total_votes) / 
       detailedMetrics.previous.total_votes) * 100
    : ((currentElection.totalPopularVotes - (previousElection?.totalPopularVotes || 0)) / 
       (previousElection?.totalPopularVotes || 1)) * 100;

  const turnoutDiff = detailedMetrics?.previous
    ? detailedMetrics.current.turnout_percentage - detailedMetrics.previous.turnout_percentage
    : currentElection.turnoutPercentage - (previousElection?.turnoutPercentage || 0);

  const currentMargin = detailedMetrics?.current
    ? Math.abs(detailedMetrics.current.winner_electoral_votes - 
              detailedMetrics.current.runner_up_electoral_votes)
    : Math.abs(currentElection.winner.electoralVotes - currentElection.runnerUp.electoralVotes);

  const previousMargin = detailedMetrics?.previous
    ? Math.abs(detailedMetrics.previous.winner_electoral_votes - 
              detailedMetrics.previous.runner_up_electoral_votes)
    : previousElection
      ? Math.abs(previousElection.winner.electoralVotes - previousElection.runnerUp.electoralVotes)
      : 0;

  const marginDiff = previousMargin ? ((currentMargin - previousMargin) / previousMargin) * 100 : 0;

  const MetricCard = ({ 
    title, 
    value, 
    diff, 
    icon: Icon,
    selected,
    onClick,
    subtitle,
    loading = false
  }: { 
    title: string;
    value: string | number;
    diff?: number;
    icon: React.ElementType;
    selected?: boolean;
    onClick?: () => void;
    subtitle?: string;
    loading?: boolean;
  }) => (
    <div 
      className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                  ${selected ? 'ring-2 ring-blue-500' : ''}
                  ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${selected ? 'text-blue-500' : 'text-gray-500'}`} />
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
      <div className="flex items-center justify-between">
        <div>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </>
          )}
        </div>
        {!loading && diff !== undefined && diff !== 0 && (
          <div className={`flex items-center ${diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {diff > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="ml-1 text-sm font-medium">{Math.abs(diff).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const getChartData = () => {
    if (!selectedMetric) return null;

    const labels = [currentElection.year.toString()];
    if (previousElection) {
      labels.unshift(previousElection.year.toString());
    }

    let datasets;
    switch (selectedMetric) {
      case 'votes':
        datasets = [{
          label: 'Total Votes',
          data: previousElection 
            ? [previousElection.totalPopularVotes, currentElection.totalPopularVotes]
            : [currentElection.totalPopularVotes],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderRadius: 4,
        }];
        break;
      case 'turnout':
        datasets = [{
          label: 'Voter Turnout (%)',
          data: previousElection 
            ? [previousElection.turnoutPercentage, currentElection.turnoutPercentage]
            : [currentElection.turnoutPercentage],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderRadius: 4,
        }];
        break;
      case 'margin':
        datasets = [{
          label: 'Electoral Margin',
          data: previousElection 
            ? [previousMargin, currentMargin]
            : [currentMargin],
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderRadius: 4,
        }];
        break;
      default:
        datasets = [];
    }

    return { labels, datasets };
  };

  const chartOptions = {
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
            const value = context.raw;
            switch (selectedMetric) {
              case 'votes':
                return `Total Votes: ${value.toLocaleString()}`;
              case 'turnout':
                return `Turnout: ${value.toFixed(1)}%`;
              case 'margin':
                return `Margin: ${value} electoral votes`;
              default:
                return '';
            }
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
          callback: (value: number) => {
            switch (selectedMetric) {
              case 'votes':
                return (value / 1000000).toFixed(1) + 'M';
              case 'turnout':
                return value.toFixed(1) + '%';
              case 'margin':
                return value;
              default:
                return value;
            }
          }
        },
        beginAtZero: true,
      }
    },
  };

  const chartData = getChartData();

  return (
    <div className="space-y-6 mb-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Votes"
          value={currentElection.totalPopularVotes}
          diff={voteDiff}
          icon={Users}
          selected={selectedMetric === 'votes'}
          onClick={() => setSelectedMetric(selectedMetric === 'votes' ? null : 'votes')}
          subtitle={`${(currentElection.totalPopularVotes / 1000000).toFixed(1)}M votes cast`}
          loading={currentLoading}
        />
        <MetricCard
          title="Voter Turnout"
          value={`${currentElection.turnoutPercentage}%`}
          diff={turnoutDiff}
          icon={BarChart}
          selected={selectedMetric === 'turnout'}
          onClick={() => setSelectedMetric(selectedMetric === 'turnout' ? null : 'turnout')}
          subtitle="Of eligible voters"
          loading={currentLoading}
        />
        <MetricCard
          title="Electoral Margin"
          value={currentMargin}
          diff={marginDiff}
          icon={Award}
          selected={selectedMetric === 'margin'}
          onClick={() => setSelectedMetric(selectedMetric === 'margin' ? null : 'margin')}
          subtitle="Electoral vote difference"
          loading={currentLoading}
        />
      </div>

      {selectedMetric && chartData && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">
              {selectedMetric === 'votes' && 'Vote Count Comparison'}
              {selectedMetric === 'turnout' && 'Turnout Comparison'}
              {selectedMetric === 'margin' && 'Electoral Margin Comparison'}
            </h2>
          </div>
          <div className="h-[300px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
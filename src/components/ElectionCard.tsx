import React from 'react';
import { ChevronRight, Award, Users, TrendingUp } from 'lucide-react';
import type { Election } from '../types/election';

interface ElectionCardProps {
  election: Election;
  onClick: () => void;
}

export function ElectionCard({ election, onClick }: ElectionCardProps) {
  const winMargin = ((election.winner.popularVotes / election.totalPopularVotes) * 100).toFixed(1);
  const partyColor = election.winner.party === 'Democratic' ? 'blue' : 'red';

  return (
    <div 
      onClick={onClick}
      className="card hover:scale-[1.02] cursor-pointer overflow-hidden animate-fade-in
                 transform transition-all duration-200 ease-out active:scale-[0.98]"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Award className={`w-5 h-5 text-${partyColor}-500`} />
            <h3 className="text-xl font-bold">{election.year} Election</h3>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-lg">{election.winner.name}</p>
              <p className={`text-sm text-${partyColor}-600 font-medium`}>
                {election.winner.party}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-lg">{winMargin}%</p>
              <p className="text-sm text-gray-500">Win Margin</p>
            </div>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-${partyColor}-500 transition-all duration-1000 ease-out`}
              style={{ width: `${winMargin}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-500">Electoral Votes</p>
              </div>
              <p className="font-medium text-lg">{election.winner.electoralVotes}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-500">Turnout</p>
              </div>
              <p className="font-medium text-lg">{election.turnoutPercentage}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
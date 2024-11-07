import React from 'react';
import { type ElectionResult } from '../types/election';

interface Props {
  data: ElectionResult;
  onClose: () => void;
}

export function ElectionDetails({ data, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{data.election_year} Election Results</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          {data.candidates.map((candidate) => (
            <div 
              key={candidate.candidate_id}
              className="border-b pb-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{candidate.name}</p>
                  <p className="text-sm text-gray-600">{candidate.party}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {candidate.votes.toLocaleString()} votes
                  </p>
                  <p className="text-sm text-gray-600">
                    {((candidate.votes / data.total_votes) * 100).toFixed(1)}%
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
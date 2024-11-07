import React from 'react';
import { X, TrendingUp, Users, Award } from 'lucide-react';

interface DetailModalProps {
  election: {
    year: number;
    winner: string;
    party: string;
    electoralVotes: number;
    popularVote: string;
    opponent: string;
    turnout: string;
    keyIssues: string[];
  };
  onClose: () => void;
}

export default function DetailModal({ election, onClose }: DetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>

        <h2 className="text-3xl font-bold mb-6">{election.year} Election</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="text-yellow-500" />
              <div>
                <p className="font-semibold">Winner</p>
                <p className="text-lg">{election.winner}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="text-blue-500" />
              <div>
                <p className="font-semibold">Electoral Votes</p>
                <p className="text-lg">{election.electoralVotes}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="text-green-500" />
              <div>
                <p className="font-semibold">Voter Turnout</p>
                <p className="text-lg">{election.turnout}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Key Issues</h3>
            <ul className="list-disc list-inside space-y-2">
              {election.keyIssues.map((issue, index) => (
                <li key={index} className="text-gray-700">{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
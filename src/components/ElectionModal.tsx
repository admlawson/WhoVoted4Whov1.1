import React from 'react';
import type { Election } from '../types/election';

interface ElectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  election: Election | null;
}

export function ElectionModal({ isOpen, onClose, election }: ElectionModalProps) {
  if (!isOpen || !election) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">{election.year} Election Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Winner</h3>
            <p>{election.winner}</p>
          </div>
          <div>
            <h3 className="font-semibold">Popular Vote</h3>
            <p>{election.popularVote.toLocaleString()} votes</p>
          </div>
          <div>
            <h3 className="font-semibold">Electoral College</h3>
            <p>{election.electoralVotes} electoral votes</p>
          </div>
          <div>
            <h3 className="font-semibold">Voter Turnout</h3>
            <p>{election.turnout}%</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}
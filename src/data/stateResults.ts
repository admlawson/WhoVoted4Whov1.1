import { US_STATES } from '../config/states';
import { StateResult } from '../types/election';

export function generateStateResults(winner: string, winnerParty: 'Democratic' | 'Republican'): { [key: string]: StateResult } {
  const stateResults: { [key: string]: StateResult } = {};
  
  Object.keys(US_STATES).forEach(state => {
    const margin = Math.random() * 30 - 15; // Random margin between -15 and +15
    const turnout = 55 + Math.random() * 25; // Random turnout between 55% and 80%
    const totalVotes = Math.floor(100000 + Math.random() * 900000);
    
    const winnerVotes = Math.floor(totalVotes * (0.5 + margin / 200));
    const loserVotes = totalVotes - winnerVotes;
    
    stateResults[state] = {
      winner,
      winnerParty,
      electoralVotes: Math.floor(5 + Math.random() * 50),
      popularVotes: {
        democratic: winnerParty === 'Democratic' ? winnerVotes : loserVotes,
        republican: winnerParty === 'Republican' ? winnerVotes : loserVotes
      },
      turnout,
      margin
    };
  });
  
  return stateResults;
}
export interface Candidate {
  name: string;
  party: 'Democratic' | 'Republican';
  electoralVotes: number;
  popularVotes: number;
}

export interface StateResult {
  winner: string;
  winnerParty: 'Democratic' | 'Republican';
  electoralVotes: number;
  popularVotes: {
    democratic: number;
    republican: number;
  };
  turnout: number;
  margin: number;
}

export interface Election {
  year: number;
  winner: Candidate;
  runnerUp: Candidate;
  totalElectoralVotes: number;
  totalPopularVotes: number;
  turnoutPercentage: number;
  source: string;
  stateResults: {
    [key: string]: StateResult;
  };
}
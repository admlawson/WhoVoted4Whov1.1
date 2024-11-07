import { Election } from '../types/election';
import { US_STATES } from '../config/states';

// Generate realistic state-level data for each election
function generateStateResults(winner: string, winnerParty: 'Democratic' | 'Republican') {
  const stateResults: { [key: string]: any } = {};
  
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

// Sample election data with state-level results
export const elections: Election[] = [
  {
    year: 2020,
    winner: {
      name: 'Joe Biden',
      party: 'Democratic',
      electoralVotes: 306,
      popularVotes: 81283098,
    },
    runnerUp: {
      name: 'Donald Trump',
      party: 'Republican',
      electoralVotes: 232,
      popularVotes: 74222958,
    },
    totalElectoralVotes: 538,
    totalPopularVotes: 155507469,
    turnoutPercentage: 66.8,
    source: 'Federal Election Commission',
    stateResults: generateStateResults('Joe Biden', 'Democratic')
  },
  {
    year: 2016,
    winner: {
      name: 'Donald Trump',
      party: 'Republican',
      electoralVotes: 304,
      popularVotes: 62984828,
    },
    runnerUp: {
      name: 'Hillary Clinton',
      party: 'Democratic',
      electoralVotes: 227,
      popularVotes: 65853516,
    },
    totalElectoralVotes: 538,
    totalPopularVotes: 128838342,
    turnoutPercentage: 60.1,
    source: 'Federal Election Commission',
    stateResults: generateStateResults('Donald Trump', 'Republican')
  },
  {
    year: 2012,
    winner: {
      name: 'Barack Obama',
      party: 'Democratic',
      electoralVotes: 332,
      popularVotes: 65915795,
    },
    runnerUp: {
      name: 'Mitt Romney',
      party: 'Republican',
      electoralVotes: 206,
      popularVotes: 60933504,
    },
    totalElectoralVotes: 538,
    totalPopularVotes: 126849299,
    turnoutPercentage: 58.6,
    source: 'Federal Election Commission',
    stateResults: generateStateResults('Barack Obama', 'Democratic')
  },
  {
    year: 2008,
    winner: {
      name: 'Barack Obama',
      party: 'Democratic',
      electoralVotes: 365,
      popularVotes: 69498516,
    },
    runnerUp: {
      name: 'John McCain',
      party: 'Republican',
      electoralVotes: 173,
      popularVotes: 59948323,
    },
    totalElectoralVotes: 538,
    totalPopularVotes: 129446839,
    turnoutPercentage: 61.6,
    source: 'Federal Election Commission',
    stateResults: generateStateResults('Barack Obama', 'Democratic')
  },
  {
    year: 2004,
    winner: {
      name: 'George W. Bush',
      party: 'Republican',
      electoralVotes: 286,
      popularVotes: 62040610,
    },
    runnerUp: {
      name: 'John Kerry',
      party: 'Democratic',
      electoralVotes: 251,
      popularVotes: 59028444,
    },
    totalElectoralVotes: 538,
    totalPopularVotes: 121069054,
    turnoutPercentage: 60.1,
    source: 'Federal Election Commission',
    stateResults: generateStateResults('George W. Bush', 'Republican')
  }
];
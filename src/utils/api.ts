import { FEC_API_KEY, FEC_API_BASE_URL } from '../config/constants';

class FECApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'FECApiError';
  }
}

export async function fetchFECData(endpoint: string, params: Record<string, string> = {}) {
  if (!FEC_API_KEY) {
    throw new FECApiError('FEC API key is not configured');
  }

  try {
    const queryParams = new URLSearchParams({
      api_key: FEC_API_KEY,
      ...params,
    });

    const response = await fetch(`${FEC_API_BASE_URL}${endpoint}?${queryParams}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new FECApiError(
        `FEC API Error: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof FECApiError) throw error;
    throw new FECApiError('Failed to connect to FEC API');
  }
}

// Additional API utility functions
export async function fetchCandidateDetails(candidateId: string) {
  return fetchFECData(`/candidate/${candidateId}`);
}

export async function fetchCommitteeDetails(committeeId: string) {
  return fetchFECData(`/committee/${committeeId}`);
}

export async function fetchCandidateFinancials(candidateId: string, electionYear: number) {
  return fetchFECData(`/candidate/${candidateId}/totals`, {
    election_year: electionYear.toString(),
  });
}

export async function fetchIndependentExpenditures(candidateId: string, electionYear: number) {
  return fetchFECData(`/schedules/schedule_e/by_candidate`, {
    candidate_id: candidateId,
    cycle: electionYear.toString(),
  });
}

export async function fetchDisbursements(committeeId: string, electionYear: number) {
  return fetchFECData(`/committee/${committeeId}/disbursements`, {
    two_year_transaction_period: electionYear.toString(),
  });
}

export async function fetchStateResults(electionYear: number) {
  return fetchFECData(`/presidential/${electionYear}/results/state`);
}
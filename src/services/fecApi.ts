import { FEC_API_KEY, FEC_API_BASE_URL, API_ENDPOINTS } from '../config/constants';
import type { Election } from '../types/election';

export class FECApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'FECApiError';
  }
}

async function fetchFromFEC<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
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
    return data as T;
  } catch (error) {
    if (error instanceof FECApiError) throw error;
    throw new FECApiError('Failed to connect to FEC API');
  }
}

export async function getPresidentialResults(year: number) {
  return fetchFromFEC(`${API_ENDPOINTS.PRESIDENTIAL_RESULTS}/${year}`);
}

export async function getCandidateDetails(candidateId: string) {
  return fetchFromFEC(`${API_ENDPOINTS.CANDIDATE_DETAILS}/${candidateId}`);
}

export async function getCommitteeDetails(committeeId: string) {
  return fetchFromFEC(`${API_ENDPOINTS.COMMITTEE_DETAILS}/${committeeId}`);
}

export async function getIndependentExpenditures(params: Record<string, string>) {
  return fetchFromFEC(API_ENDPOINTS.INDEPENDENT_EXPENDITURES, params);
}

export async function getDisbursements(params: Record<string, string>) {
  return fetchFromFEC(API_ENDPOINTS.DISBURSEMENTS, params);
}

export async function getReceipts(params: Record<string, string>) {
  return fetchFromFEC(API_ENDPOINTS.RECEIPTS, params);
}
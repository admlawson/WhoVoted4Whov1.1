import { useFECData } from './useFECData';
import { API_ENDPOINTS } from '../config/constants';

export function useCampaignFinance(candidateId: string, electionYear: number) {
  const { data, loading, error } = useFECData(
    `${API_ENDPOINTS.CANDIDATE_DETAILS}/${candidateId}/totals`,
    { election_year: electionYear.toString() }
  );

  return {
    data,
    loading,
    error,
    totalRaised: data?.results[0]?.total_receipts || 0,
    totalSpent: data?.results[0]?.total_disbursements || 0,
    cashOnHand: data?.results[0]?.cash_on_hand_end_period || 0,
    debts: data?.results[0]?.debts_owed || 0,
  };
}
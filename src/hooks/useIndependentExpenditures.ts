import { useFECData } from './useFECData';
import { API_ENDPOINTS } from '../config/constants';

export function useIndependentExpenditures(candidateId: string, electionYear: number) {
  const { data, loading, error } = useFECData(
    `${API_ENDPOINTS.INDEPENDENT_EXPENDITURES}/by_candidate`,
    {
      candidate_id: candidateId,
      cycle: electionYear.toString(),
    }
  );

  return {
    data,
    loading,
    error,
    supportTotal: data?.results.reduce((sum: number, item: any) => 
      sum + (item.support_oppose_indicator === 'S' ? item.total : 0), 0) || 0,
    opposeTotal: data?.results.reduce((sum: number, item: any) => 
      sum + (item.support_oppose_indicator === 'O' ? item.total : 0), 0) || 0,
  };
}
import { useFECData } from './useFECData';
import { API_ENDPOINTS } from '../config/constants';

export function useDisbursements(committeeId: string, electionYear: number) {
  const { data, loading, error } = useFECData(
    `${API_ENDPOINTS.DISBURSEMENTS}`,
    {
      committee_id: committeeId,
      two_year_transaction_period: electionYear.toString(),
      sort: '-disbursement_amount',
      per_page: '20',
    }
  );

  return {
    data,
    loading,
    error,
    totalDisbursements: data?.results.reduce((sum: number, item: any) => 
      sum + item.disbursement_amount, 0) || 0,
    categories: data?.results.reduce((acc: Record<string, number>, item: any) => {
      const category = item.disbursement_description || 'Other';
      acc[category] = (acc[category] || 0) + item.disbursement_amount;
      return acc;
    }, {}) || {},
  };
}
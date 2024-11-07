const BASE_URL = 'https://api.open.fec.gov/v1';
const API_KEY = import.meta.env.VITE_FEC_API_KEY;

export async function fetchPresidentialResults(year: number) {
  const response = await fetch(
    `${BASE_URL}/presidential/results/${year}?api_key=${API_KEY}`
  );
  if (!response.ok) throw new Error('Failed to fetch election data');
  return response.json();
}
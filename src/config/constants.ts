// Environment variables
export const FEC_API_KEY = import.meta.env.VITE_FEC_API_KEY || 'ytXWzjsThi4KLHFwfAmiTV9WUozjrEw79QmAvDbu';
export const FEC_API_BASE_URL = 'https://api.open.fec.gov/v1';

// API Endpoints
export const API_ENDPOINTS = {
  PRESIDENTIAL_RESULTS: '/presidential/results',
  CANDIDATE_DETAILS: '/candidate',
  COMMITTEE_DETAILS: '/committee',
  INDEPENDENT_EXPENDITURES: '/schedules/schedule_e',
  DISBURSEMENTS: '/schedules/schedule_b',
  RECEIPTS: '/schedules/schedule_a'
};

// Application constants
export const ELECTION_YEARS = [2020, 2016, 2012, 2008, 2004];

export const REGIONS = {
  MIDWEST: ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'],
  NORTHEAST: ['CT', 'ME', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT'],
  SOUTH: ['AL', 'AR', 'DE', 'FL', 'GA', 'KY', 'LA', 'MD', 'MS', 'NC', 'SC', 'TN', 'VA', 'WV'],
  WEST: ['AK', 'AZ', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'NM', 'OR', 'UT', 'WA', 'WY']
};

// Storage Keys
export const STORAGE_KEYS = {
  ELECTION_DATA: 'stored_election_data',
  LAST_UPDATE: 'last_data_update',
  API_KEY: 'fec_api_key'
};

// Cache Keys
export const CACHE_KEYS = {
  API_RESPONSES: 'api_cache_',
  LAST_SYNC: 'last_api_sync'
};

// Durations
export const API_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const DATA_UPDATE_REMINDER = 7 * 24 * 60 * 60 * 1000; // 7 days

// Encryption
export const ENCRYPTION_KEY = 'your-encryption-key-here';
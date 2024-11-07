import { useState, useEffect, useCallback } from 'react';
import { fetchFECData } from '../utils/api';
import { API_CACHE_DURATION } from '../config/constants';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Use localStorage for persistent caching
const CACHE_PREFIX = 'fec_data_';

function getFromCache<T>(key: string): CacheItem<T> | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < API_CACHE_DURATION) {
        return parsed;
      }
      // Remove expired cache
      localStorage.removeItem(CACHE_PREFIX + key);
    }
  } catch (error) {
    console.warn('Cache read error:', error);
  }
  return null;
}

function setToCache<T>(key: string, data: T): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Cache write error:', error);
  }
}

export function useFECData<T>(endpoint: string | null, params: Record<string, string> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = endpoint ? `${endpoint}?${new URLSearchParams(params).toString()}` : null;

  const fetchData = useCallback(async () => {
    if (!endpoint || !cacheKey) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = getFromCache<T>(cacheKey);
      if (cached) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      const result = await fetchFECData(endpoint, params);
      
      // Cache the result
      setToCache(cacheKey, result);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [endpoint, cacheKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    if (cacheKey) {
      localStorage.removeItem(CACHE_PREFIX + cacheKey);
      fetchData();
    }
  }, [cacheKey, fetchData]);

  return { data, loading, error, refetch };
}
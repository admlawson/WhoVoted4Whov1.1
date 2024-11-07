import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, Trash2, Clock, AlertTriangle, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { syncElectionData, getStoredElectionData } from '../../services/dataSync';
import { CACHE_KEYS, API_CACHE_DURATION, DATA_UPDATE_REMINDER } from '../../config/constants';
import { useLastUpdate } from '../../hooks/useLastUpdate';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { DataSyncStatus } from './DataSyncStatus';
import { useAuth } from '../../contexts/AuthContext';

export function DataManagementPage() {
  const [loading, setLoading] = useState(false);
  const { lastUpdate, isStale } = useLastUpdate();
  const [syncStatus, setSyncStatus] = useState<'success' | 'error' | 'syncing' | 'idle'>('idle');
  const [cacheStatus, setCacheStatus] = useState({
    size: '0',
    items: 0
  });

  const { syncData, fetchData, error: supabaseError } = useSupabaseData();
  const { isConfigured } = useAuth();

  useEffect(() => {
    updateCacheStatus();
  }, []);

  const updateCacheStatus = () => {
    const cached = Object.keys(localStorage).filter(key => 
      key.startsWith(CACHE_KEYS.API_RESPONSES)
    );

    const totalSize = cached.reduce((size, key) => {
      const item = localStorage.getItem(key);
      return size + (item ? item.length : 0);
    }, 0);

    setCacheStatus({
      size: (totalSize / 1024).toFixed(2),
      items: cached.length
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await syncElectionData();
      updateCacheStatus();
      toast.success('Data refreshed successfully');

      // Force reload the main application to reflect new data
      if (window.location.pathname === '/') {
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseSync = async () => {
    setSyncStatus('syncing');
    try {
      const localData = getStoredElectionData();
      if (!localData) {
        throw new Error('No local data available');
      }
      await syncData(localData);
      setSyncStatus('success');
    } catch (error) {
      setSyncStatus('error');
      console.error('Sync error:', error);
    }
  };

  const handleSupabaseFetch = async () => {
    setSyncStatus('syncing');
    try {
      const data = await fetchData();
      // Store the fetched data locally
      localStorage.setItem(CACHE_KEYS.API_RESPONSES, JSON.stringify(data));
      setSyncStatus('success');
      toast.success('Data fetched from Supabase successfully');
    } catch (error) {
      setSyncStatus('error');
      toast.error('Failed to fetch data from Supabase');
    }
  };

  const clearCache = () => {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_KEYS.API_RESPONSES))
        .forEach(key => localStorage.removeItem(key));
      
      updateCacheStatus();
      toast.success('Cache cleared successfully');
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  if (!isConfigured) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 text-amber-600 mb-4">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-lg font-medium">Supabase Configuration Required</h2>
        </div>
        <p className="text-gray-600">
          Please configure your Supabase environment variables to enable data synchronization.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold">Data Management</h2>
      </div>

      <div className="space-y-6">
        {isStale && (
          <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-800 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
            <p>Data is stale and should be refreshed</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-transparent 
                     rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>

          <button
            onClick={clearCache}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-transparent 
                     rounded-md shadow-sm text-sm font-medium text-white bg-red-600 
                     hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cache
          </button>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium mb-4">Supabase Synchronization</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleSupabaseSync}
              disabled={syncStatus === 'syncing'}
              className="flex items-center justify-center px-4 py-2 border border-transparent 
                       rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 
                       hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4 mr-2" />
              Sync to Supabase
            </button>

            <button
              onClick={handleSupabaseFetch}
              disabled={syncStatus === 'syncing'}
              className="flex items-center justify-center px-4 py-2 border border-transparent 
                       rounded-md shadow-sm text-sm font-medium text-white bg-green-600 
                       hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Fetch from Supabase
            </button>
          </div>

          <DataSyncStatus
            lastSync={lastUpdate}
            syncStatus={syncStatus}
            error={supabaseError}
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Cache Status:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Cache Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {cacheStatus.items}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Cache Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {cacheStatus.size} KB
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Sync Information:</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>Data is synchronized with Supabase for backup and sharing</li>
            <li>Local cache is maintained for faster access</li>
            <li>API responses are cached for {API_CACHE_DURATION / (1000 * 60 * 60)} hours</li>
            <li>Data is considered stale after {DATA_UPDATE_REMINDER / (1000 * 60 * 60 * 24)} days</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
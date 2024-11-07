import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStoredCredentials } from '../../utils/auth';

export function ApiKeyPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('FEC_API_KEY');
    if (key) setApiKey(key);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate API key format
      if (!apiKey.match(/^[a-zA-Z0-9]{40}$/)) {
        throw new Error('Invalid API key format');
      }

      localStorage.setItem('FEC_API_KEY', apiKey);
      toast.success('API key updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-8">
        <Key className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold">API Key Management</h2>
      </div>

      <div className="max-w-2xl space-y-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Important Security Notice</p>
              <p>Your API key grants access to sensitive election data. Please ensure you:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Store it securely</li>
                <li>Never share it publicly</li>
                <li>Rotate it periodically</li>
                <li>Use it only within the admin dashboard</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">FEC API Key</span>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="block w-full rounded-lg border-gray-300 pr-10
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-colors duration-200"
                placeholder="Enter your FEC API key"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 px-3 flex items-center
                         text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </label>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center w-full sm:w-auto px-6 py-2.5
                     text-sm font-medium text-white bg-blue-600 rounded-lg
                     hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save API Key'}
          </button>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <h3 className="font-medium text-gray-900 mb-2">API Key Requirements:</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Must be exactly 40 characters long
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Can only contain letters and numbers
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Case sensitive
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
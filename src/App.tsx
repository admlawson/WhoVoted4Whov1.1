import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FilterBar } from './components/FilterBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ElectionMetrics } from './components/ElectionMetrics';
import { ElectionTrends } from './components/ElectionTrends';
import { PartyComparison } from './components/PartyComparison';
import { USMap } from './components/USMap';
import { CampaignFinance } from './components/CampaignFinance';
import { SwingStatesAnalysis } from './components/SwingStatesAnalysis';
import { HistoricalMargins } from './components/HistoricalMargins';
import { WelcomeModal } from './components/WelcomeModal';
import { CommitteeFunding } from './components/CommitteeFunding';
import { IndependentExpenditures } from './components/IndependentExpenditures';
import { DisbursementCategories } from './components/DisbursementCategories';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoginPage } from './components/admin/LoginPage';
import { ApiKeyPage } from './components/admin/ApiKeyPage';
import { DataManagementPage } from './components/admin/DataManagementPage';
import { StateAnalysisModal } from './components/StateAnalysisModal';
import { ELECTION_YEARS } from './config/constants';
import { useElectionData } from './hooks/useElectionData';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/api-key" replace />} />
          <Route path="api-key" element={<ApiKeyPage />} />
          <Route path="data" element={<DataManagementPage />} />
        </Route>
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Main Application Route */}
        <Route path="/" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}

function MainApp() {
  const [showWelcome, setShowWelcome] = React.useState(true);
  const [selectedParty, setSelectedParty] = React.useState<string>('all');
  const [primaryYear, setPrimaryYear] = React.useState<number>(ELECTION_YEARS[0]);
  const [comparisonYear, setComparisonYear] = React.useState<number>(ELECTION_YEARS[1]);
  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const [showStateModal, setShowStateModal] = React.useState(false);

  const {
    elections,
    loading,
    error,
    primaryElection,
    comparisonElection
  } = useElectionData(primaryYear, comparisonYear);

  const handleStateClick = (state: string) => {
    setSelectedState(state);
    setShowStateModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">US Election Data Explorer</h1>
          <p className="text-gray-600">Explore historical election data and trends</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <FilterBar
          selectedParty={selectedParty}
          setSelectedParty={setSelectedParty}
          primaryYear={primaryYear}
          setPrimaryYear={setPrimaryYear}
          comparisonYear={comparisonYear}
          setComparisonYear={setComparisonYear}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
        />

        <ErrorBoundary error={error}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            primaryElection && comparisonElection && (
              <>
                <ElectionMetrics
                  currentElection={primaryElection}
                  previousElection={comparisonElection}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <ElectionTrends
                    elections={elections}
                    primaryYear={primaryYear}
                    comparisonYear={comparisonYear}
                  />
                  <PartyComparison elections={[primaryElection, comparisonElection]} />
                </div>

                <USMap 
                  election={primaryElection}
                  onStateClick={handleStateClick}
                  selectedState={selectedState || ''}
                  highlightOnly={false}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <CommitteeFunding election={primaryElection} />
                  <IndependentExpenditures election={primaryElection} />
                  <DisbursementCategories election={primaryElection} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <CampaignFinance election={primaryElection} />
                  <SwingStatesAnalysis election={primaryElection} />
                </div>

                <HistoricalMargins elections={[primaryElection, comparisonElection]} />

                <StateAnalysisModal
                  isOpen={showStateModal}
                  onClose={() => setShowStateModal(false)}
                  state={selectedState}
                  election={primaryElection}
                  comparisonElection={comparisonElection}
                />
              </>
            )
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}
import React, { useState } from 'react';
import { Header } from './components/Header';
import { AnalyzerForm } from './components/AnalyzerForm';
import { CrawlerBots } from './components/CrawlerBots';
import { SEOScoreCard } from './components/SEOScoreCard';
import { RecommendationsList } from './components/RecommendationsList';
import { ReportDownload } from './components/ReportDownload';
import { useSEOAnalysis } from './hooks/useSEOAnalysis';

function App() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const { isAnalyzing, analysis, crawlerBots, error, startAnalysis, clearError } = useSEOAnalysis();

  const handleAnalyze = (url: string) => {
    clearError();
    startAnalysis(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analyzer' && (
          <div className="space-y-8">
            <AnalyzerForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-red-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Analysis Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {(isAnalyzing || analysis) && (
              <CrawlerBots bots={crawlerBots} />
            )}
            
            {analysis && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(analysis.categories).map(([key, category]) => (
                    <SEOScoreCard
                      key={key}
                      category={key}
                      score={category.score}
                      status={category.status}
                      issues={category.issues.length}
                      positives={category.positives.length}
                      change={Math.floor(Math.random() * 20) - 10}
                    />
                  ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <RecommendationsList recommendations={analysis.recommendations} />
                  <ReportDownload analysis={analysis} />
                </div>
              </>
            )}
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
            <p className="text-gray-600">Dashboard functionality coming soon...</p>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports</h2>
            <p className="text-gray-600">Reports management coming soon...</p>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { Globe, Play, Loader2 } from 'lucide-react';

interface AnalyzerFormProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
}

export const AnalyzerForm: React.FC<AnalyzerFormProps> = ({ onAnalyze, isAnalyzing }) => {
  const [url, setUrl] = useState('');
  const [analysisType, setAnalysisType] = useState('comprehensive');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (trimmedUrl) {
      // Add protocol if missing
      let finalUrl = trimmedUrl;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      onAnalyze(finalUrl);
    }
  };

  const analysisTypes = [
    { id: 'quick', label: 'Quick Scan', description: 'Basic SEO analysis (2-3 minutes)' },
    { id: 'comprehensive', label: 'Comprehensive', description: 'Full SEO audit (5-10 minutes)' },
    { id: 'deep', label: 'Deep Analysis', description: 'Advanced analysis with competitor research (15-20 minutes)' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <Globe className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Website SEO Analysis</h2>
          <p className="text-gray-600">Enter your website URL to start comprehensive SEO analysis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <div className="relative">
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={isAnalyzing}
            />
            <Globe className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Analysis Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysisTypes.map((type) => (
              <label
                key={type.id}
                className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${
                  analysisType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="analysisType"
                  value={type.id}
                  checked={analysisType === type.id}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-gray-900">{type.label}</span>
                <span className="text-xs text-gray-500 mt-1">{type.description}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!url.trim() || isAnalyzing}
          className={`w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all ${
            !url.trim() || isAnalyzing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              <span>Start SEO Analysis</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
import { useState, useCallback } from 'react';
import { SEOAnalysis, CrawlerBot, Issue, Recommendation } from '../types/seo';
import { SEOAnalyzer } from '../services/seoAnalyzer';

export const useSEOAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [crawlerBots, setCrawlerBots] = useState<CrawlerBot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analyzer] = useState(() => new SEOAnalyzer());

  const startAnalysis = useCallback(async (url: string) => {
    // Validate URL format before starting
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setCrawlerBots([]);
    setError(null);

    try {
      const finalAnalysis = await analyzer.analyzeSite(url, setCrawlerBots);
      setAnalysis(finalAnalysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed due to an unknown error';
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzer]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAnalyzing,
    analysis,
    crawlerBots,
    error,
    startAnalysis,
    clearError,
  };
};
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SEOScoreCardProps {
  category: string;
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  issues: number;
  positives: number;
  change?: number;
}

export const SEOScoreCard: React.FC<SEOScoreCardProps> = ({
  category,
  score,
  status,
  issues,
  positives,
  change,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'excellent':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'good':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'poor':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-blue-600';
    if (score >= 40) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getTrendIcon = () => {
    if (!change) return <Minus className="h-4 w-4 text-gray-400" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className={`border rounded-lg p-6 transition-all hover:shadow-md ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold capitalize">{category}</h3>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          {change && (
            <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-end space-x-2 mb-4">
        <span className={`text-3xl font-bold ${getScoreColor()}`}>{score}</span>
        <span className="text-gray-500 text-sm mb-1">/100</span>
      </div>

      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Issues:</span>
          <span className="ml-2 font-medium text-red-600">{issues}</span>
        </div>
        <div>
          <span className="text-gray-600">Positives:</span>
          <span className="ml-2 font-medium text-green-600">{positives}</span>
        </div>
      </div>
    </div>
  );
};
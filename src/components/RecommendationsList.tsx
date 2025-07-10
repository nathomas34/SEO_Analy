import React from 'react';
import { AlertTriangle, Info, CheckCircle, Clock, Zap, Target } from 'lucide-react';
import { Recommendation } from '../types/seo';

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case 'easy':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'hard':
        return <Target className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Target className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">SEO Recommendations</h3>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {recommendations.length} items
        </span>
      </div>

      <div className="space-y-4">
        {sortedRecommendations.map((rec) => (
          <div
            key={rec.id}
            className={`border rounded-lg p-4 transition-all hover:shadow-md ${getPriorityColor(rec.priority)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getPriorityIcon(rec.priority)}
                <div>
                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-gray-600 capitalize">{rec.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {rec.priority} priority
                </span>
                <div className="flex items-center space-x-1">
                  {getEffortIcon(rec.effort)}
                  <span className="text-xs text-gray-500 capitalize">{rec.effort}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-3">{rec.description}</p>

            <div className="bg-blue-50 p-3 rounded-md mb-3">
              <p className="text-sm text-blue-800 font-medium">Impact: {rec.impact}</p>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-gray-900">Steps to implement:</h5>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                {rec.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
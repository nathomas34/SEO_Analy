import React from 'react';
import { Bot, CheckCircle, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { CrawlerBot } from '../types/seo';

interface CrawlerBotsProps {
  bots: CrawlerBot[];
}

export const CrawlerBots: React.FC<CrawlerBotsProps> = ({ bots }) => {
  const getStatusIcon = (status: CrawlerBot['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: CrawlerBot['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200';
      case 'running':
        return 'bg-blue-100 border-blue-200';
      case 'error':
        return 'bg-red-100 border-red-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <Bot className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Crawler Bots Status</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bots.map((bot) => (
          <div
            key={bot.name}
            className={`border rounded-lg p-4 transition-all ${getStatusColor(bot.status)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{bot.icon}</span>
                <span className="font-medium text-gray-900">{bot.name}</span>
              </div>
              {getStatusIcon(bot.status)}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{bot.description}</p>
            
            {bot.status === 'running' && (
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{bot.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${bot.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {bot.status === 'completed' && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>{bot.findings} findings</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
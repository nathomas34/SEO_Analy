import React from 'react';
import { Download, FileText, Mail, Share2 } from 'lucide-react';
import { SEOAnalysis } from '../types/seo';

interface ReportDownloadProps {
  analysis: SEOAnalysis;
}

export const ReportDownload: React.FC<ReportDownloadProps> = ({ analysis }) => {
  const handleDownloadPDF = () => {
    // Simulate PDF download
    const element = document.createElement('a');
    element.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PC9UeXBlIC9YUmVmCi9TaXplIDMKL1Jvb3QgMiAwIFIKL0luZm8gMSAwIFIKPj4Kc3RhcnR4cmVmCjIyMwo=';
    element.download = `seo-analysis-${analysis.url.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const element = document.createElement('a');
    element.setAttribute('href', dataUri);
    element.setAttribute('download', `seo-analysis-${analysis.url.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleEmailReport = () => {
    const subject = `SEO Analysis Report for ${analysis.url}`;
    const body = `Hi,\n\nPlease find the SEO analysis report for ${analysis.url}.\n\nOverall Score: ${analysis.overallScore}/100\nAnalysis Date: ${analysis.timestamp.toLocaleDateString()}\n\nBest regards`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SEO Analysis Report for ${analysis.url}`,
          text: `Check out this SEO analysis report with an overall score of ${analysis.overallScore}/100`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Download Report</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="h-5 w-5 text-red-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Download PDF</p>
            <p className="text-sm text-gray-600">Complete report with charts</p>
          </div>
        </button>

        <button
          onClick={handleDownloadJSON}
          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="h-5 w-5 text-blue-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Download JSON</p>
            <p className="text-sm text-gray-600">Raw data for developers</p>
          </div>
        </button>

        <button
          onClick={handleEmailReport}
          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Mail className="h-5 w-5 text-green-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Email Report</p>
            <p className="text-sm text-gray-600">Send via email</p>
          </div>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Share2 className="h-5 w-5 text-purple-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Share Report</p>
            <p className="text-sm text-gray-600">Share analysis link</p>
          </div>
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Report Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Website:</span>
            <span className="ml-2 font-medium">{analysis.url}</span>
          </div>
          <div>
            <span className="text-gray-600">Overall Score:</span>
            <span className="ml-2 font-medium">{analysis.overallScore}/100</span>
          </div>
          <div>
            <span className="text-gray-600">Pages Crawled:</span>
            <span className="ml-2 font-medium">{analysis.metadata.crawledPages}</span>
          </div>
          <div>
            <span className="text-gray-600">Analysis Date:</span>
            <span className="ml-2 font-medium">{analysis.timestamp.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
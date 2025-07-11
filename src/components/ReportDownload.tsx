import React from 'react';
import { Download, FileText, Mail, Share2 } from 'lucide-react';
import { SEOAnalysis } from '../types/seo';

interface ReportDownloadProps {
  analysis: SEOAnalysis;
}

export const ReportDownload: React.FC<ReportDownloadProps> = ({ analysis }) => {
  const generatePDFContent = (): string => {
    // Génération d'un contenu PDF basique en HTML qui peut être converti
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>SEO Analysis Report - ${analysis.url}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .score { font-size: 24px; font-weight: bold; color: #2563eb; }
          .category { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .category h3 { margin: 0 0 10px 0; color: #374151; }
          .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .metric { padding: 5px 0; }
          .issues { margin-top: 15px; }
          .issue { margin: 10px 0; padding: 10px; background: #fef2f2; border-radius: 4px; }
          .positive { margin: 10px 0; padding: 10px; background: #f0fdf4; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SEO Analysis Report</h1>
          <p><strong>Website:</strong> ${analysis.url}</p>
          <p><strong>Analysis Date:</strong> ${analysis.timestamp.toLocaleDateString()}</p>
          <div class="score">Overall Score: ${analysis.overallScore}/100</div>
        </div>
        
        ${Object.entries(analysis.categories).map(([categoryName, category]) => `
          <div class="category">
            <h3>${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Analysis</h3>
            <p><strong>Score:</strong> ${category.score}/100 (${category.status})</p>
            
            <div class="metrics">
              ${Object.entries(category.metrics).map(([key, value]) => `
                <div class="metric"><strong>${key}:</strong> ${value}</div>
              `).join('')}
            </div>
            
            ${category.issues.length > 0 ? `
              <div class="issues">
                <h4>Issues Found:</h4>
                ${category.issues.map(issue => `
                  <div class="issue">
                    <strong>${issue.title}</strong> (${issue.severity})
                    <p>${issue.description}</p>
                    <p><em>Recommendation: ${issue.recommendation}</em></p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${category.positives.length > 0 ? `
              <div class="positives">
                <h4>Positive Points:</h4>
                ${category.positives.map(positive => `
                  <div class="positive">${positive}</div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
        
        <div class="category">
          <h3>Recommendations</h3>
          ${analysis.recommendations.map(rec => `
            <div class="issue">
              <strong>${rec.title}</strong> (${rec.priority} priority - ${rec.effort} effort)
              <p>${rec.description}</p>
              <p><em>Impact: ${rec.impact}</em></p>
              <ul>
                ${rec.steps.map(step => `<li>${step}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
    
    return htmlContent;
  };

  const handleDownloadPDF = () => {
    try {
      const htmlContent = generatePDFContent();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const element = document.createElement('a');
      element.href = url;
      element.download = `seo-analysis-${analysis.url.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Nettoyer l'URL créée
      URL.revokeObjectURL(url);
      
      console.log('PDF report downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du rapport PDF. Veuillez réessayer.');
    }
  };

  const handleDownloadJSON = () => {
    try {
      // Créer une version sérialisable de l'analyse
      const serializableAnalysis = {
        ...analysis,
        timestamp: analysis.timestamp.toISOString(),
        metadata: {
          ...analysis.metadata,
          lastModified: analysis.metadata.lastModified.toISOString()
        }
      };
      
      const dataStr = JSON.stringify(serializableAnalysis, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const element = document.createElement('a');
      element.href = url;
      element.download = `seo-analysis-${analysis.url.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Nettoyer l'URL créée
      URL.revokeObjectURL(url);
      
      console.log('JSON report downloaded successfully');
    } catch (error) {
      console.error('Error downloading JSON:', error);
      alert('Erreur lors du téléchargement du rapport JSON. Veuillez réessayer.');
    }
  };

  const handleEmailReport = () => {
    try {
      const subject = `Rapport d'analyse SEO pour ${analysis.url}`;
      const body = `Bonjour,

Veuillez trouver ci-joint le rapport d'analyse SEO pour ${analysis.url}.

📊 RÉSUMÉ DE L'ANALYSE
• Score global : ${analysis.overallScore}/100
• Date d'analyse : ${analysis.timestamp.toLocaleDateString()}
• Pages analysées : ${analysis.metadata.crawledPages}

📈 SCORES PAR CATÉGORIE
${Object.entries(analysis.categories).map(([name, cat]) => 
  `• ${name.charAt(0).toUpperCase() + name.slice(1)} : ${cat.score}/100 (${cat.status})`
).join('\n')}

🎯 RECOMMANDATIONS PRIORITAIRES
${analysis.recommendations.slice(0, 5).map((rec, index) => 
  `${index + 1}. ${rec.title} (Priorité ${rec.priority})`
).join('\n')}

Pour plus de détails, veuillez consulter le rapport complet.

Cordialement`;

      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      
      console.log('Email report initiated');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Erreur lors de l\'ouverture du client email. Veuillez réessayer.');
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: `Rapport d'analyse SEO pour ${analysis.url}`,
        text: `Découvrez ce rapport d'analyse SEO avec un score global de ${analysis.overallScore}/100`,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        console.log('Report shared successfully');
      } else {
        // Fallback - copie dans le presse-papier
        const textToShare = `Rapport d'analyse SEO pour ${analysis.url}\nScore: ${analysis.overallScore}/100\nLien: ${window.location.href}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToShare);
          alert('Lien copié dans le presse-papier !');
        } else {
          // Fallback pour les navigateurs plus anciens
          const textArea = document.createElement('textarea');
          textArea.value = textToShare;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Lien copié dans le presse-papier !');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Erreur lors du partage. Le lien a été copié dans le presse-papier.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Estimation de la taille des fichiers
  const estimatedJSONSize = new Blob([JSON.stringify(analysis)]).size;
  const estimatedHTMLSize = new Blob([generatePDFContent()]).size;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Télécharger le Rapport</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <Download className="h-5 w-5 text-red-600 group-hover:text-red-700" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Télécharger HTML</p>
            <p className="text-sm text-gray-600">Rapport complet avec graphiques (~{formatFileSize(estimatedHTMLSize)})</p>
          </div>
        </button>

        <button
          onClick={handleDownloadJSON}
          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <Download className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Télécharger JSON</p>
            <p className="text-sm text-gray-600">Données brutes pour développeurs (~{formatFileSize(estimatedJSONSize)})</p>
          </div>
        </button>

        <button
          onClick={handleEmailReport}
          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <Mail className="h-5 w-5 text-green-600 group-hover:text-green-700" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Envoyer par Email</p>
            <p className="text-sm text-gray-600">Partager le résumé par email</p>
          </div>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <Share2 className="h-5 w-5 text-purple-600 group-hover:text-purple-700" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Partager le Rapport</p>
            <p className="text-sm text-gray-600">Partager le lien d'analyse</p>
          </div>
        </button>
      </div>

      {/* Résumé du rapport */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Résumé du Rapport</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Site web :</span>
              <span className="ml-2 font-medium text-blue-600">{analysis.url}</span>
            </div>
            <div>
              <span className="text-gray-600">Score global :</span>
              <span className={`ml-2 font-bold ${
                analysis.overallScore >= 80 ? 'text-green-600' :
                analysis.overallScore >= 60 ? 'text-blue-600' :
                analysis.overallScore >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {analysis.overallScore}/100
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Pages analysées :</span>
              <span className="ml-2 font-medium">{analysis.metadata.crawledPages}</span>
            </div>
            <div>
              <span className="text-gray-600">Date d'analyse :</span>
              <span className="ml-2 font-medium">{analysis.timestamp.toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
        
        {/* Aperçu des scores par catégorie */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2">Scores par catégorie :</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(analysis.categories).map(([name, category]) => (
              <div key={name} className="flex justify-between">
                <span className="text-gray-600 capitalize">{name} :</span>
                <span className={`font-medium ${
                  category.score >= 80 ? 'text-green-600' :
                  category.score >= 60 ? 'text-blue-600' :
                  category.score >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {category.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
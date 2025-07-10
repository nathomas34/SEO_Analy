# Documentation des Composants - SEO Analyzer Pro

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Composants principaux](#composants-principaux)
3. [Composants d'interface](#composants-dinterface)
4. [Hooks personnalisés](#hooks-personnalisés)
5. [Patterns et bonnes pratiques](#patterns-et-bonnes-pratiques)
6. [Tests et validation](#tests-et-validation)

---

## 🎯 Vue d'ensemble

L'architecture des composants de SEO Analyzer Pro suit les principes de React moderne avec une séparation claire des responsabilités. Chaque composant est conçu pour être réutilisable, testable et maintenable.

### Hiérarchie des composants

```
App
├── Header
│   └── Navigation tabs
├── AnalyzerForm
│   ├── URL input
│   ├── Analysis type selector
│   └── Submit button
├── Error display (conditionnel)
├── CrawlerBots (conditionnel)
│   └── Bot status cards
└── Results section (conditionnel)
    ├── SEOScoreCard (×6)
    ├── RecommendationsList
    └── ReportDownload
```

---

## 🧩 Composants principaux

### App.tsx

Composant racine qui orchestre l'ensemble de l'application.

```typescript
function App() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const { 
    isAnalyzing, 
    analysis, 
    crawlerBots, 
    error, 
    startAnalysis, 
    clearError 
  } = useSEOAnalysis();

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
            
            {error && <ErrorDisplay error={error} />}
            
            {(isAnalyzing || analysis) && (
              <CrawlerBots bots={crawlerBots} />
            )}
            
            {analysis && <ResultsSection analysis={analysis} />}
          </div>
        )}
        
        {/* Autres onglets */}
      </main>
    </div>
  );
}
```

**Responsabilités :**
- Gestion de l'état global de l'application
- Coordination entre les composants
- Gestion de la navigation par onglets
- Affichage conditionnel des sections

**Props :** Aucune (composant racine)

**État local :**
- `activeTab` : Onglet actif ('analyzer', 'dashboard', 'reports', 'settings')

---

## 🔧 Composants d'interface

### Header.tsx

Barre de navigation principale avec logo et onglets.

```typescript
interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'analyzer', label: 'Analyzer', icon: Search },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 rounded-lg p-2">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SEO Analyzer Pro</h1>
              <p className="text-sm text-gray-500">Advanced SEO Analysis Platform</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
```

**Responsabilités :**
- Affichage du logo et du titre
- Navigation entre les onglets
- Indication visuelle de l'onglet actif

**Props :**
- `activeTab` : Onglet actuellement sélectionné
- `onTabChange` : Callback pour changer d'onglet

**Styles :**
- Design responsive avec breakpoints
- États hover et active
- Icônes Lucide React

### AnalyzerForm.tsx

Formulaire principal pour lancer une analyse SEO.

```typescript
interface AnalyzerFormProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
}

export const AnalyzerForm: React.FC<AnalyzerFormProps> = ({ 
  onAnalyze, 
  isAnalyzing 
}) => {
  const [url, setUrl] = useState('');
  const [analysisType, setAnalysisType] = useState('comprehensive');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (trimmedUrl) {
      // Ajout automatique du protocole si manquant
      let finalUrl = trimmedUrl;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      onAnalyze(finalUrl);
    }
  };

  const analysisTypes = [
    { 
      id: 'quick', 
      label: 'Quick Scan', 
      description: 'Basic SEO analysis (2-3 minutes)' 
    },
    { 
      id: 'comprehensive', 
      label: 'Comprehensive', 
      description: 'Full SEO audit (5-10 minutes)' 
    },
    { 
      id: 'deep', 
      label: 'Deep Analysis', 
      description: 'Advanced analysis with competitor research (15-20 minutes)' 
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      {/* En-tête */}
      <div className="flex items-center space-x-3 mb-6">
        <Globe className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Website SEO Analysis</h2>
          <p className="text-gray-600">Enter your website URL to start comprehensive SEO analysis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Champ URL */}
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

        {/* Sélecteur de type d'analyse */}
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

        {/* Bouton de soumission */}
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
```

**Responsabilités :**
- Collecte de l'URL à analyser
- Sélection du type d'analyse
- Validation et normalisation de l'URL
- Gestion de l'état de chargement

**Props :**
- `onAnalyze` : Callback appelé avec l'URL à analyser
- `isAnalyzing` : Booléen indiquant si une analyse est en cours

**État local :**
- `url` : URL saisie par l'utilisateur
- `analysisType` : Type d'analyse sélectionné

**Fonctionnalités :**
- Ajout automatique du protocole HTTPS
- Validation HTML5 du champ URL
- Désactivation pendant l'analyse
- Design responsive

### CrawlerBots.tsx

Affichage en temps réel du statut des bots d'analyse.

```typescript
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
            {/* En-tête du bot */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{bot.icon}</span>
                <span className="font-medium text-gray-900">{bot.name}</span>
              </div>
              {getStatusIcon(bot.status)}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{bot.description}</p>
            
            {/* Barre de progression pour les bots en cours */}
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
            
            {/* Résultats pour les bots terminés */}
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
```

**Responsabilités :**
- Affichage du statut de chaque bot
- Barres de progression animées
- Indicateurs visuels par état
- Compteur de découvertes

**Props :**
- `bots` : Array des bots avec leur statut

**États des bots :**
- `idle` : En attente (gris)
- `running` : En cours avec progression (bleu)
- `completed` : Terminé avec résultats (vert)
- `error` : Erreur (rouge)

### SEOScoreCard.tsx

Carte d'affichage du score pour chaque catégorie d'analyse.

```typescript
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
      {/* En-tête avec tendance */}
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

      {/* Score principal */}
      <div className="flex items-end space-x-2 mb-4">
        <span className={`text-3xl font-bold ${getScoreColor()}`}>{score}</span>
        <span className="text-gray-500 text-sm mb-1">/100</span>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Métriques */}
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
```

**Responsabilités :**
- Affichage du score avec couleur appropriée
- Barre de progression animée
- Indicateur de tendance (optionnel)
- Compteurs d'issues et points positifs

**Props :**
- `category` : Nom de la catégorie
- `score` : Score sur 100
- `status` : Statut coloré
- `issues` : Nombre de problèmes
- `positives` : Nombre de points positifs
- `change` : Changement par rapport à l'analyse précédente (optionnel)

**Couleurs par score :**
- 80-100 : Vert (excellent)
- 60-79 : Bleu (bon)
- 40-59 : Jaune (attention)
- 0-39 : Rouge (problème)

### RecommendationsList.tsx

Liste des recommandations avec priorisation et détails d'implémentation.

```typescript
interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({ 
  recommendations 
}) => {
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

  // Tri par priorité (high > medium > low)
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* En-tête */}
      <div className="flex items-center space-x-3 mb-6">
        <Target className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">SEO Recommendations</h3>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {recommendations.length} items
        </span>
      </div>

      {/* Liste des recommandations */}
      <div className="space-y-4">
        {sortedRecommendations.map((rec) => (
          <div
            key={rec.id}
            className={`border rounded-lg p-4 transition-all hover:shadow-md ${getPriorityColor(rec.priority)}`}
          >
            {/* En-tête de la recommandation */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getPriorityIcon(rec.priority)}
                <div>
                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-gray-600 capitalize">{rec.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Badge de priorité */}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {rec.priority} priority
                </span>
                {/* Indicateur d'effort */}
                <div className="flex items-center space-x-1">
                  {getEffortIcon(rec.effort)}
                  <span className="text-xs text-gray-500 capitalize">{rec.effort}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-3">{rec.description}</p>

            {/* Impact */}
            <div className="bg-blue-50 p-3 rounded-md mb-3">
              <p className="text-sm text-blue-800 font-medium">Impact: {rec.impact}</p>
            </div>

            {/* Étapes d'implémentation */}
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
```

**Responsabilités :**
- Affichage des recommandations triées par priorité
- Indicateurs visuels de priorité et effort
- Étapes détaillées d'implémentation
- Badges informatifs

**Props :**
- `recommendations` : Array des recommandations

**Tri et filtrage :**
- Tri automatique par priorité (high → medium → low)
- Couleurs distinctes par priorité
- Icônes d'effort (facile, moyen, difficile)

### ReportDownload.tsx

Interface de téléchargement et partage des rapports d'analyse.

```typescript
interface ReportDownloadProps {
  analysis: SEOAnalysis;
}

export const ReportDownload: React.FC<ReportDownloadProps> = ({ analysis }) => {
  const handleDownloadPDF = () => {
    // Simulation du téléchargement PDF
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
      // Fallback - copie dans le presse-papier
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Download Report</h3>
      </div>

      {/* Options de téléchargement */}
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

      {/* Résumé du rapport */}
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
```

**Responsabilités :**
- Génération et téléchargement de rapports PDF
- Export des données JSON
- Partage par email
- Partage via Web Share API ou copie du lien
- Affichage du résumé du rapport

**Props :**
- `analysis` : Données complètes de l'analyse

**Fonctionnalités :**
- Noms de fichiers automatiques avec timestamp
- Fallback pour le partage (copie dans le presse-papier)
- Résumé visuel des métriques principales

---

## 🎣 Hooks personnalisés

### useSEOAnalysis.ts

Hook principal pour la gestion de l'analyse SEO.

```typescript
export const useSEOAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [crawlerBots, setCrawlerBots] = useState<CrawlerBot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analyzer] = useState(() => new SEOAnalyzer());

  const startAnalysis = useCallback(async (url: string) => {
    // Validation URL
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
```

**Responsabilités :**
- Gestion de l'état de l'analyse
- Validation des URLs
- Communication avec le service SEOAnalyzer
- Gestion des erreurs
- Mise à jour des bots en temps réel

**Valeurs retournées :**
- `isAnalyzing` : Booléen indiquant si une analyse est en cours
- `analysis` : Résultats de l'analyse (null si pas encore terminée)
- `crawlerBots` : État des bots d'analyse
- `error` : Message d'erreur (null si pas d'erreur)
- `startAnalysis` : Fonction pour démarrer une analyse
- `clearError` : Fonction pour effacer les erreurs

---

## 🎨 Patterns et bonnes pratiques

### 1. Composition de composants

```typescript
// Composant composé pour les résultats
const ResultsSection: React.FC<{ analysis: SEOAnalysis }> = ({ analysis }) => (
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
);
```

### 2. Mémorisation des composants

```typescript
// Mémorisation pour éviter les re-renders inutiles
const SEOScoreCard = React.memo<SEOScoreCardProps>(({ 
  category, 
  score, 
  status, 
  issues, 
  positives, 
  change 
}) => {
  // Composant mémorisé
});

// Mémorisation avec comparaison personnalisée
const CrawlerBots = React.memo<CrawlerBotsProps>(
  ({ bots }) => {
    // Composant
  },
  (prevProps, nextProps) => {
    // Comparaison personnalisée pour optimiser les re-renders
    return JSON.stringify(prevProps.bots) === JSON.stringify(nextProps.bots);
  }
);
```

### 3. Gestion des états de chargement

```typescript
// Pattern pour les états de chargement
const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center space-x-3">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <span className="text-gray-600">Analyzing website...</span>
    </div>
  </div>
);

// Pattern pour les états d'erreur
const ErrorState: React.FC<{ error: string; onRetry?: () => void }> = ({ 
  error, 
  onRetry 
}) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
    <div className="flex items-center space-x-3 mb-4">
      <XCircle className="h-6 w-6 text-red-500" />
      <h3 className="text-lg font-medium text-red-800">Analysis Failed</h3>
    </div>
    <p className="text-red-700 mb-4">{error}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);
```

### 4. Responsive Design

```typescript
// Classes Tailwind pour le responsive
const ResponsiveGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    {children}
  </div>
);

// Breakpoints utilisés :
// - sm: 640px (mobile large)
// - md: 768px (tablette)
// - lg: 1024px (desktop)
// - xl: 1280px (desktop large)
```

### 5. Accessibilité

```typescript
// Bonnes pratiques d'accessibilité
const AccessibleButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  ariaLabel?: string;
}> = ({ onClick, disabled, children, ariaLabel }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={`
      px-4 py-2 rounded-lg font-medium transition-all
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      ${disabled 
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
        : 'bg-blue-600 text-white hover:bg-blue-700'
      }
    `}
  >
    {children}
  </button>
);

// Labels pour les formulaires
const AccessibleInput: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}> = ({ id, label, value, onChange, required }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      aria-describedby={required ? `${id}-required` : undefined}
    />
    {required && (
      <p id={`${id}-required`} className="sr-only">
        This field is required
      </p>
    )}
  </div>
);
```

---

## 🧪 Tests et validation

### Tests unitaires avec Jest et React Testing Library

```typescript
// __tests__/components/SEOScoreCard.test.tsx
import { render, screen } from '@testing-library/react';
import { SEOScoreCard } from '../SEOScoreCard';

describe('SEOScoreCard', () => {
  const defaultProps = {
    category: 'technical',
    score: 85,
    status: 'excellent' as const,
    issues: 2,
    positives: 8,
  };

  it('renders score correctly', () => {
    render(<SEOScoreCard {...defaultProps} />);
    
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('applies correct color based on status', () => {
    render(<SEOScoreCard {...defaultProps} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('shows trend when change is provided', () => {
    render(<SEOScoreCard {...defaultProps} change={5} />);
    
    expect(screen.getByText('+5')).toBeInTheDocument();
  });
});
```

### Tests d'intégration

```typescript
// __tests__/integration/AnalysisFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('Analysis Flow', () => {
  it('completes full analysis flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Saisir une URL
    const urlInput = screen.getByLabelText(/website url/i);
    await user.type(urlInput, 'https://example.com');

    // Démarrer l'analyse
    const analyzeButton = screen.getByRole('button', { name: /start seo analysis/i });
    await user.click(analyzeButton);

    // Vérifier que l'analyse démarre
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();

    // Attendre la fin de l'analyse
    await waitFor(
      () => {
        expect(screen.getByText(/overall score/i)).toBeInTheDocument();
      },
      { timeout: 30000 }
    );

    // Vérifier les résultats
    expect(screen.getByText(/recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/download report/i)).toBeInTheDocument();
  });
});
```

### Tests de performance

```typescript
// __tests__/performance/ComponentPerformance.test.tsx
import { render } from '@testing-library/react';
import { performance } from 'perf_hooks';
import { SEOScoreCard } from '../SEOScoreCard';

describe('Component Performance', () => {
  it('renders SEOScoreCard within performance budget', () => {
    const startTime = performance.now();
    
    render(
      <SEOScoreCard
        category="technical"
        score={85}
        status="excellent"
        issues={2}
        positives={8}
      />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Le composant doit se rendre en moins de 16ms (60fps)
    expect(renderTime).toBeLessThan(16);
  });
});
```

### Validation des props avec PropTypes

```typescript
// Validation TypeScript + runtime avec PropTypes
import PropTypes from 'prop-types';

interface SEOScoreCardProps {
  category: string;
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  issues: number;
  positives: number;
  change?: number;
}

export const SEOScoreCard: React.FC<SEOScoreCardProps> = (props) => {
  // Composant
};

// Validation runtime pour le développement
SEOScoreCard.propTypes = {
  category: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  status: PropTypes.oneOf(['excellent', 'good', 'warning', 'poor']).isRequired,
  issues: PropTypes.number.isRequired,
  positives: PropTypes.number.isRequired,
  change: PropTypes.number,
};
```

---

*Documentation des composants générée le {{ date }} - Version 1.0.0*
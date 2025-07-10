# API Documentation - SEO Analyzer Pro

## 📋 Table des Matières

1. [Vue d'ensemble de l'API](#vue-densemble-de-lapi)
2. [Service SEOAnalyzer](#service-seoanalyzer)
3. [Méthodes d'analyse](#méthodes-danalyse)
4. [Gestion des erreurs](#gestion-des-erreurs)
5. [Types et interfaces](#types-et-interfaces)
6. [Exemples d'utilisation](#exemples-dutilisation)

---

## 🔌 Vue d'ensemble de l'API

L'API du SEO Analyzer Pro est construite autour du service `SEOAnalyzer` qui orchestre 6 types d'analyses SEO différentes. Chaque analyse est exécutée de manière asynchrone avec un système de retry robuste et des fallbacks pour gérer les erreurs réseau.

### Architecture

```
SEOAnalyzer
├── analyzeSite()              # Point d'entrée principal
├── runTechnicalAnalysis()     # Analyse technique
├── runContentAnalysis()       # Analyse de contenu
├── runPerformanceAnalysis()   # Analyse de performance
├── runMobileAnalysis()        # Analyse mobile
├── runSecurityAnalysis()      # Analyse de sécurité
├── runAccessibilityAnalysis() # Analyse d'accessibilité
└── fetchWithTimeout()         # Gestion réseau robuste
```

---

## 🛠️ Service SEOAnalyzer

### Classe principale

```typescript
export class SEOAnalyzer {
  private baseUrl: string = '';
  private crawledUrls: Set<string> = new Set();
  private maxPages: number = 50;
  private results: Record<string, CategoryAnalysis> = {};
}
```

### Méthode principale

#### `analyzeSite(url: string, onBotUpdate: Function): Promise<SEOAnalysis>`

Lance une analyse SEO complète d'un site web.

**Paramètres :**
- `url` (string) : URL du site à analyser
- `onBotUpdate` (Function) : Callback pour les mises à jour des bots

**Retour :**
- `Promise<SEOAnalysis>` : Résultat complet de l'analyse

**Exemple :**
```typescript
const analyzer = new SEOAnalyzer();

const updateBots = (bots: CrawlerBot[]) => {
  console.log('Bots status:', bots);
};

try {
  const analysis = await analyzer.analyzeSite('https://example.com', updateBots);
  console.log('Analysis complete:', analysis);
} catch (error) {
  console.error('Analysis failed:', error);
}
```

---

## 🔍 Méthodes d'analyse

### 1. Technical SEO Analysis

#### `runTechnicalAnalysis(url, bots, botIndex, onBotUpdate)`

Analyse les aspects techniques du SEO.

**Vérifications effectuées :**

| Élément | Critère | Sévérité |
|---------|---------|----------|
| Title tag | Présence et longueur (30-60 chars) | High |
| Meta description | Présence | High |
| H1 tag | Unique et présent | Medium |
| Images alt text | Présence sur toutes les images | Medium |
| Robots.txt | Existence du fichier | Low |
| SSL/HTTPS | Certificat valide | High |

**Scoring :** `100 - (nombre d'issues × 15)`

**Exemple de résultat :**
```typescript
{
  score: 85,
  status: 'excellent',
  issues: [
    {
      id: 'tech-1',
      severity: 'medium',
      title: 'Multiple H1 tags',
      description: 'Page has 2 H1 tags',
      recommendation: 'Use only one H1 tag per page',
      affectedPages: ['https://example.com']
    }
  ],
  positives: [
    'Title tag present and adequate length',
    'Meta description present',
    'SSL certificate installed'
  ],
  metrics: {
    'Title Length': '45 chars',
    'Meta Description': 'Present',
    'H1 Tags': '2',
    'Images': '5',
    'Images with Alt': '4/5'
  }
}
```

### 2. Content Analysis

#### `runContentAnalysis(url, bots, botIndex, onBotUpdate)`

Évalue la qualité et l'optimisation du contenu.

**Vérifications effectuées :**

| Élément | Critère | Sévérité |
|---------|---------|----------|
| Nombre de mots | Minimum 300 mots | Medium |
| Structure headings | Minimum 3 headings | Low |
| Liens internes | Minimum 3 liens | Medium |
| Duplication title/meta | Similarité excessive | Low |

**Scoring :** `100 - (nombre d'issues × 12)`

### 3. Performance Analysis

#### `runPerformanceAnalysis(url, bots, botIndex, onBotUpdate)`

Mesure les performances de chargement.

**Métriques mesurées :**

| Métrique | Seuil Excellent | Seuil Bon | Seuil Moyen |
|----------|----------------|-----------|-------------|
| Temps de chargement | < 1.5s | < 3s | < 5s |
| Taille de page | < 500KB | < 1MB | < 2MB |
| Nombre de scripts | < 3 | < 5 | < 10 |
| Optimisation images | WebP/AVIF | Formats modernes | Compression |

**Scoring :** `100 - (nombre d'issues × 15)`

### 4. Mobile SEO Analysis

#### `runMobileAnalysis(url, bots, botIndex, onBotUpdate)`

Vérifie l'optimisation mobile.

**Vérifications effectuées :**

| Élément | Critère | Sévérité |
|---------|---------|----------|
| Viewport meta tag | Présence et configuration | High |
| Media queries | Responsive design | Medium |
| Touch elements | Éléments tactiles | Low |
| Mobile icons | Apple touch icon | Low |

**Scoring :** `100 - (nombre d'issues × 20)`

### 5. Security Analysis

#### `runSecurityAnalysis(url, bots, botIndex, onBotUpdate)`

Analyse la sécurité du site.

**Vérifications effectuées :**

| Élément | Critère | Sévérité |
|---------|---------|----------|
| HTTPS | Certificat SSL valide | High |
| Mixed content | Ressources HTTP sur HTTPS | Medium |
| Security headers | HSTS, X-Frame-Options, etc. | Medium |
| Formulaires sécurisés | Actions HTTPS | High |

**Scoring :** `100 - (nombre d'issues × 25)`

### 6. Accessibility Analysis

#### `runAccessibilityAnalysis(url, bots, botIndex, onBotUpdate)`

Évalue l'accessibilité du site.

**Vérifications effectuées :**

| Élément | Critère | Sévérité |
|---------|---------|----------|
| Images alt text | Alt text sur toutes les images | Medium |
| Form labels | Labels ou aria-label | Medium |
| Heading hierarchy | Structure logique H1-H6 | Low |
| Skip links | Navigation clavier | Low |

**Scoring :** `100 - (nombre d'issues × 15)`

---

## ⚠️ Gestion des erreurs

### Système de retry

La méthode `fetchWithTimeout` implémente un système de retry robuste :

```typescript
private async fetchWithTimeout(url: string, timeout: number = 10000): Promise<Response> {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 seconde
  
  const corsProxies = [
    'https://api.allorigins.win/get?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest='
  ];

  const retryFetch = async (attempt: number): Promise<Response> => {
    try {
      // Tentative de fetch direct
      return await fetch(url, { signal: controller.signal });
    } catch (directError) {
      // Fallback vers proxies CORS
      for (const proxy of corsProxies) {
        try {
          return await fetchWithProxy(proxy, url);
        } catch (proxyError) {
          continue; // Essayer le proxy suivant
        }
      }
      
      // Retry avec backoff exponentiel
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryFetch(attempt + 1);
      }
      
      throw new Error(`Network error after ${maxRetries} attempts`);
    }
  };

  return retryFetch(1);
}
```

### Types d'erreurs

| Type d'erreur | Description | Gestion |
|---------------|-------------|---------|
| `ValidationError` | URL invalide | Validation côté client |
| `NetworkError` | Problème de connectivité | Retry avec proxies |
| `TimeoutError` | Délai d'attente dépassé | Retry avec délai croissant |
| `ParseError` | HTML malformé | Fallback avec analyse partielle |
| `ProxyError` | Tous les proxies échouent | Erreur utilisateur |

### Fallback par analyse

Si une analyse échoue, un résultat de fallback est généré :

```typescript
private handleAnalysisError(category: string, error: any) {
  this.results[category] = {
    score: 0,
    status: 'poor',
    issues: [{
      id: `${category}-error`,
      severity: 'high',
      title: `${category} analysis failed`,
      description: `Unable to complete analysis: ${error.message}`,
      recommendation: 'Please check URL accessibility and try again',
      affectedPages: [this.baseUrl]
    }],
    positives: [],
    metrics: {
      'Status': 'Analysis Failed',
      'Error': error.message.substring(0, 50) + '...'
    }
  };
}
```

---

## 📝 Types et interfaces

### SEOAnalysis

```typescript
interface SEOAnalysis {
  id: string;                    // Identifiant unique
  url: string;                   // URL analysée
  timestamp: Date;               // Date de l'analyse
  overallScore: number;          // Score global (0-100)
  categories: {                  // Résultats par catégorie
    technical: CategoryAnalysis;
    content: CategoryAnalysis;
    performance: CategoryAnalysis;
    security: CategoryAnalysis;
    mobile: CategoryAnalysis;
    accessibility: CategoryAnalysis;
  };
  recommendations: Recommendation[]; // Recommandations prioritaires
  metadata: {                    // Métadonnées de l'analyse
    crawledPages: number;
    totalLinks: number;
    analysisDuration: number;
    lastModified: Date;
  };
}
```

### CategoryAnalysis

```typescript
interface CategoryAnalysis {
  score: number;                 // Score de la catégorie (0-100)
  status: 'excellent' | 'good' | 'warning' | 'poor'; // Statut coloré
  issues: Issue[];               // Problèmes détectés
  positives: string[];           // Points positifs
  metrics: Record<string, number | string>; // Métriques détaillées
}
```

### Issue

```typescript
interface Issue {
  id: string;                    // Identifiant unique
  severity: 'high' | 'medium' | 'low'; // Niveau de sévérité
  title: string;                 // Titre du problème
  description: string;           // Description détaillée
  recommendation: string;        // Recommandation de correction
  affectedPages: string[];       // Pages affectées
}
```

### Recommendation

```typescript
interface Recommendation {
  id: string;                    // Identifiant unique
  category: string;              // Catégorie d'analyse
  priority: 'high' | 'medium' | 'low'; // Priorité de correction
  title: string;                 // Titre de la recommandation
  description: string;           // Description du problème
  impact: string;                // Impact de la correction
  effort: 'easy' | 'medium' | 'hard'; // Effort requis
  steps: string[];               // Étapes d'implémentation
}
```

### CrawlerBot

```typescript
interface CrawlerBot {
  name: string;                  // Nom du bot
  description: string;           // Description de l'analyse
  icon: string;                  // Emoji d'icône
  status: 'idle' | 'running' | 'completed' | 'error'; // Statut
  progress: number;              // Progression (0-100)
  findings: number;              // Nombre de découvertes
}
```

---

## 💡 Exemples d'utilisation

### Utilisation basique

```typescript
import { SEOAnalyzer } from './services/seoAnalyzer';

const analyzer = new SEOAnalyzer();

// Callback pour suivre la progression
const handleBotUpdate = (bots: CrawlerBot[]) => {
  bots.forEach(bot => {
    console.log(`${bot.name}: ${bot.status} (${bot.progress}%)`);
  });
};

// Lancer l'analyse
try {
  const analysis = await analyzer.analyzeSite(
    'https://example.com',
    handleBotUpdate
  );
  
  console.log(`Overall Score: ${analysis.overallScore}/100`);
  console.log(`Issues found: ${analysis.recommendations.length}`);
  
} catch (error) {
  console.error('Analysis failed:', error.message);
}
```

### Utilisation avec React Hook

```typescript
import { useSEOAnalysis } from './hooks/useSEOAnalysis';

function MyComponent() {
  const { 
    isAnalyzing, 
    analysis, 
    crawlerBots, 
    error, 
    startAnalysis 
  } = useSEOAnalysis();

  const handleAnalyze = async () => {
    try {
      await startAnalysis('https://example.com');
    } catch (err) {
      console.error('Analysis error:', err);
    }
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={isAnalyzing}>
        {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {analysis && (
        <div>
          <h2>Score: {analysis.overallScore}/100</h2>
          {/* Affichage des résultats */}
        </div>
      )}
    </div>
  );
}
```

### Analyse personnalisée

```typescript
// Analyser seulement certaines catégories
class CustomSEOAnalyzer extends SEOAnalyzer {
  async analyzeOnlyTechnical(url: string): Promise<CategoryAnalysis> {
    const bots: CrawlerBot[] = [
      { name: 'Technical SEO Bot', description: 'Technical analysis', icon: '🔧', status: 'idle', progress: 0, findings: 0 }
    ];
    
    await this.runTechnicalAnalysis(url, bots, 0, () => {});
    return this.results.technical;
  }
}

// Utilisation
const customAnalyzer = new CustomSEOAnalyzer();
const technicalResult = await customAnalyzer.analyzeOnlyTechnical('https://example.com');
```

### Configuration des timeouts

```typescript
class ConfigurableSEOAnalyzer extends SEOAnalyzer {
  private timeouts = {
    technical: 15000,     // 15 secondes
    content: 10000,       // 10 secondes
    performance: 20000,   // 20 secondes pour mesurer les performances
    mobile: 8000,         // 8 secondes
    security: 12000,      // 12 secondes
    accessibility: 10000  // 10 secondes
  };

  protected async fetchWithTimeout(url: string, category?: string): Promise<Response> {
    const timeout = category ? this.timeouts[category] || 10000 : 10000;
    return super.fetchWithTimeout(url, timeout);
  }
}
```

### Gestion avancée des erreurs

```typescript
class RobustSEOAnalyzer extends SEOAnalyzer {
  private errorHandlers = new Map<string, (error: Error) => void>();

  onError(category: string, handler: (error: Error) => void) {
    this.errorHandlers.set(category, handler);
  }

  protected handleAnalysisError(category: string, error: any) {
    // Appeler le handler personnalisé si défini
    const handler = this.errorHandlers.get(category);
    if (handler) {
      handler(error);
    }

    // Appeler la gestion d'erreur par défaut
    super.handleAnalysisError(category, error);
  }
}

// Utilisation
const robustAnalyzer = new RobustSEOAnalyzer();

robustAnalyzer.onError('technical', (error) => {
  console.log('Technical analysis failed:', error.message);
  // Envoyer à un service de monitoring
});

robustAnalyzer.onError('performance', (error) => {
  console.log('Performance analysis failed:', error.message);
  // Retry avec des paramètres différents
});
```

---

## 🔧 Configuration et personnalisation

### Variables de configuration

```typescript
interface SEOAnalyzerConfig {
  maxRetries: number;           // Nombre max de tentatives (défaut: 3)
  baseDelay: number;            // Délai de base pour retry (défaut: 1000ms)
  defaultTimeout: number;       // Timeout par défaut (défaut: 10000ms)
  corsProxies: string[];        // Liste des proxies CORS
  userAgent: string;            // User agent pour les requêtes
  maxPages: number;             // Nombre max de pages à crawler
}

class ConfigurableSEOAnalyzer extends SEOAnalyzer {
  constructor(private config: Partial<SEOAnalyzerConfig> = {}) {
    super();
    this.applyConfig();
  }

  private applyConfig() {
    if (this.config.maxPages) {
      this.maxPages = this.config.maxPages;
    }
    // Appliquer d'autres configurations...
  }
}
```

### Extensibilité

```typescript
// Interface pour les analyseurs personnalisés
interface CustomAnalyzer {
  name: string;
  analyze(url: string, doc: Document): Promise<CategoryAnalysis>;
}

// Exemple d'analyseur personnalisé
class SchemaAnalyzer implements CustomAnalyzer {
  name = 'schema';

  async analyze(url: string, doc: Document): Promise<CategoryAnalysis> {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    const issues: Issue[] = [];
    const positives: string[] = [];

    if (scripts.length === 0) {
      issues.push({
        id: 'schema-1',
        severity: 'medium',
        title: 'No structured data found',
        description: 'Page lacks JSON-LD structured data',
        recommendation: 'Add relevant schema.org markup',
        affectedPages: [url]
      });
    } else {
      positives.push(`Found ${scripts.length} structured data blocks`);
    }

    return {
      score: scripts.length > 0 ? 100 : 60,
      status: scripts.length > 0 ? 'excellent' : 'warning',
      issues,
      positives,
      metrics: {
        'Structured Data Blocks': scripts.length.toString()
      }
    };
  }
}

// SEOAnalyzer extensible
class ExtensibleSEOAnalyzer extends SEOAnalyzer {
  private customAnalyzers: CustomAnalyzer[] = [];

  addAnalyzer(analyzer: CustomAnalyzer) {
    this.customAnalyzers.push(analyzer);
  }

  async analyzeSite(url: string, onBotUpdate: Function): Promise<SEOAnalysis> {
    // Exécuter les analyses standard
    const standardAnalysis = await super.analyzeSite(url, onBotUpdate);

    // Exécuter les analyses personnalisées
    for (const analyzer of this.customAnalyzers) {
      try {
        const response = await this.fetchWithTimeout(url);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        
        const result = await analyzer.analyze(url, doc);
        standardAnalysis.categories[analyzer.name] = result;
      } catch (error) {
        console.error(`Custom analyzer ${analyzer.name} failed:`, error);
      }
    }

    return standardAnalysis;
  }
}

// Utilisation
const extensibleAnalyzer = new ExtensibleSEOAnalyzer();
extensibleAnalyzer.addAnalyzer(new SchemaAnalyzer());
```

---

*Documentation API générée le {{ date }} - Version 1.0.0*
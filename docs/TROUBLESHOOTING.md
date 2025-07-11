# Guide de Dépannage - SEO Analyzer Pro

## 📋 Table des Matières

1. [Problèmes courants](#problèmes-courants)
2. [Erreurs réseau](#erreurs-réseau)
3. [Problèmes de performance](#problèmes-de-performance)
4. [Erreurs d'analyse](#erreurs-danalyse)
5. [Problèmes d'interface](#problèmes-dinterface)
6. [Erreurs de déploiement](#erreurs-de-déploiement)
7. [Debugging et logs](#debugging-et-logs)
8. [FAQ](#faq)

---

## 🚨 Problèmes courants

### 1. L'analyse ne démarre pas

**Symptômes :**
- Le bouton "Start SEO Analysis" ne répond pas
- Aucun bot d'analyse ne s'affiche
- L'interface reste figée

**Causes possibles :**
- URL invalide ou malformée
- Problème de validation côté client
- Erreur JavaScript non gérée

**Solutions :**

```typescript
// Vérification de l'URL
const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Debug dans la console
console.log('URL validation:', validateUrl(inputUrl));
console.log('Analysis state:', { isAnalyzing, error });
```

**Étapes de résolution :**
1. Vérifier la console du navigateur pour les erreurs JavaScript
2. Tester avec une URL simple (ex: https://google.com)
3. Vider le cache du navigateur
4. Redémarrer l'application en mode développement

### 2. Résultats d'analyse incomplets

**Symptômes :**
- Certains bots restent en statut "idle" ou "error"
- Scores manquants pour certaines catégories
- Recommandations partielles

**Causes possibles :**
- Timeout des requêtes réseau
- Site web inaccessible ou protégé
- Proxies CORS indisponibles

**Solutions :**

```typescript
// Augmenter les timeouts
const EXTENDED_TIMEOUTS = {
  technical: 20000,    // 20 secondes
  content: 15000,      // 15 secondes
  performance: 25000,  // 25 secondes
  mobile: 15000,       // 15 secondes
  security: 15000,     // 15 secondes
  accessibility: 15000 // 15 secondes
};

// Vérifier la disponibilité des proxies
const testProxies = async () => {
  const proxies = [
    'https://api.allorigins.win/get?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest='
  ];
  
  for (const proxy of proxies) {
    try {
      const response = await fetch(proxy + encodeURIComponent('https://httpbin.org/status/200'));
      console.log(`✅ Proxy ${proxy}: OK`);
    } catch (error) {
      console.log(`❌ Proxy ${proxy}: ${error.message}`);
    }
  }
};
```

---

## 🌐 Erreurs réseau

### 1. Erreur CORS

**Message d'erreur :**
```
Access to fetch at 'https://example.com' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Cause :** Le site cible ne permet pas les requêtes cross-origin depuis votre domaine.

**Solutions :**

```typescript
// Utilisation de proxies CORS multiples
const corsProxies = [
  'https://api.allorigins.win/get?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://thingproxy.freeboard.io/fetch/'
];

// Fonction de fallback robuste
const fetchWithCorsProxy = async (url: string): Promise<Response> => {
  // Tentative directe d'abord
  try {
    return await fetch(url, { mode: 'cors' });
  } catch (directError) {
    console.log('Direct fetch failed, trying proxies...');
    
    // Essayer chaque proxy
    for (let i = 0; i < corsProxies.length; i++) {
      try {
        const proxyUrl = corsProxies[i] + encodeURIComponent(url);
        const response = await fetch(proxyUrl);
        
        if (corsProxies[i].includes('allorigins.win')) {
          const data = await response.json();
          return new Response(data.contents, {
            status: 200,
            headers: new Headers({ 'content-type': 'text/html' })
          });
        }
        
        return response;
      } catch (proxyError) {
        console.log(`Proxy ${i + 1} failed:`, proxyError.message);
        continue;
      }
    }
    
    throw new Error('All CORS proxies failed');
  }
};
```

### 2. Timeout des requêtes

**Message d'erreur :**
```
Request timeout: Unable to fetch https://example.com within 10000ms
```

**Cause :** Le site web met trop de temps à répondre.

**Solutions :**

```typescript
// Configuration de timeouts adaptatifs
const getTimeoutForSite = (url: string): number => {
  const domain = new URL(url).hostname;
  
  // Timeouts spécifiques par type de site
  const timeoutMap = {
    'wordpress.com': 20000,
    'shopify.com': 15000,
    'wix.com': 25000,
    'squarespace.com': 20000,
  };
  
  // Vérifier si le domaine correspond à un pattern connu
  for (const [pattern, timeout] of Object.entries(timeoutMap)) {
    if (domain.includes(pattern)) {
      return timeout;
    }
  }
  
  return 10000; // Timeout par défaut
};

// Retry avec backoff exponentiel
const fetchWithRetry = async (url: string, maxRetries = 3): Promise<Response> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeout = getTimeoutForSite(url) * attempt; // Augmenter le timeout à chaque tentative
      return await fetchWithTimeout(url, timeout);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
};
```

### 3. Erreurs de proxy

**Message d'erreur :**
```
Proxy 1 failed: HTTP 429 - Too Many Requests
```

**Cause :** Les proxies CORS ont des limites de taux ou sont temporairement indisponibles.

**Solutions :**

```typescript
// Rotation intelligente des proxies
class ProxyManager {
  private proxies = [
    { url: 'https://api.allorigins.win/get?url=', weight: 1, failures: 0 },
    { url: 'https://cors-anywhere.herokuapp.com/', weight: 1, failures: 0 },
    { url: 'https://api.codetabs.com/v1/proxy?quest=', weight: 1, failures: 0 },
  ];
  
  private getNextProxy() {
    // Trier par nombre d'échecs et poids
    const available = this.proxies
      .filter(p => p.failures < 3)
      .sort((a, b) => a.failures - b.failures || b.weight - a.weight);
    
    if (available.length === 0) {
      // Reset des compteurs d'échecs si tous les proxies ont échoué
      this.proxies.forEach(p => p.failures = 0);
      return this.proxies[0];
    }
    
    return available[0];
  }
  
  async fetchWithProxy(url: string): Promise<Response> {
    const proxy = this.getNextProxy();
    
    try {
      const response = await fetch(proxy.url + encodeURIComponent(url));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Succès - réduire le compteur d'échecs
      proxy.failures = Math.max(0, proxy.failures - 1);
      return response;
      
    } catch (error) {
      // Échec - incrémenter le compteur
      proxy.failures++;
      throw error;
    }
  }
}
```

---

## ⚡ Problèmes de performance

### 1. Analyse lente

**Symptômes :**
- L'analyse prend plus de 30 secondes
- Les bots restent longtemps en progression
- Interface qui se fige

**Causes possibles :**
- Site web très lent
- Trop de ressources à analyser
- Proxies surchargés

**Solutions :**

```typescript
// Analyse en parallèle avec limitation
const analyzeWithConcurrency = async (url: string) => {
  const analyses = [
    () => runTechnicalAnalysis(url),
    () => runContentAnalysis(url),
    () => runPerformanceAnalysis(url),
    () => runMobileAnalysis(url),
    () => runSecurityAnalysis(url),
    () => runAccessibilityAnalysis(url),
  ];
  
  // Limiter à 3 analyses simultanées
  const results = await Promise.allSettled(
    analyses.map((analysis, index) => 
      new Promise(resolve => 
        setTimeout(() => resolve(analysis()), index * 1000) // Décalage de 1s
      )
    )
  );
  
  return results;
};

// Cache des résultats pour éviter les re-analyses
const analysisCache = new Map<string, SEOAnalysis>();

const getCachedAnalysis = (url: string): SEOAnalysis | null => {
  const cached = analysisCache.get(url);
  if (cached && Date.now() - cached.timestamp.getTime() < 3600000) { // 1 heure
    return cached;
  }
  return null;
};
```

### 2. Interface qui se fige

**Symptômes :**
- Boutons non cliquables
- Barres de progression figées
- Console pleine d'erreurs

**Solutions :**

```typescript
// Debouncing des mises à jour d'état
import { debounce } from 'lodash';

const debouncedBotUpdate = debounce((bots: CrawlerBot[]) => {
  setCrawlerBots([...bots]);
}, 100); // Mise à jour max toutes les 100ms

// Web Workers pour les calculs lourds
const analyzeInWorker = (data: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('/workers/seo-analyzer.js');
    
    worker.postMessage(data);
    
    worker.onmessage = (event) => {
      resolve(event.data);
      worker.terminate();
    };
    
    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };
    
    // Timeout de sécurité
    setTimeout(() => {
      worker.terminate();
      reject(new Error('Worker timeout'));
    }, 30000);
  });
};
```

---

## 🔍 Erreurs d'analyse

### 1. Parsing HTML échoue

**Message d'erreur :**
```
DOMParser error: Invalid HTML content
```

**Cause :** Le HTML retourné est malformé ou incomplet.

**Solutions :**

```typescript
// Parser HTML robuste
const parseHTMLSafely = (html: string): Document => {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Vérifier les erreurs de parsing
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('HTML parsing warning:', parserError.textContent);
      
      // Tentative de nettoyage du HTML
      const cleanedHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Supprimer les scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Supprimer les styles
        .replace(/<!--[\s\S]*?-->/g, ''); // Supprimer les commentaires
      
      return new DOMParser().parseFromString(cleanedHtml, 'text/html');
    }
    
    return doc;
  } catch (error) {
    console.error('HTML parsing failed:', error);
    
    // Fallback: créer un document minimal
    const fallbackDoc = new DOMParser().parseFromString(
      `<html><head><title>Parsing Error</title></head><body></body></html>`,
      'text/html'
    );
    
    return fallbackDoc;
  }
};

// Extraction de contenu avec fallbacks
const extractTextContent = (doc: Document): string => {
  try {
    return doc.body?.textContent || doc.documentElement?.textContent || '';
  } catch (error) {
    console.warn('Text extraction failed:', error);
    return '';
  }
};
```

### 2. Métriques incorrectes

**Symptômes :**
- Scores incohérents (ex: 150/100)
- Compteurs négatifs
- Métriques manquantes

**Solutions :**

```typescript
// Validation des métriques
const validateScore = (score: number): number => {
  if (typeof score !== 'number' || isNaN(score)) {
    console.warn('Invalid score detected, defaulting to 0');
    return 0;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

const validateCategoryAnalysis = (analysis: CategoryAnalysis): CategoryAnalysis => {
  return {
    score: validateScore(analysis.score),
    status: ['excellent', 'good', 'warning', 'poor'].includes(analysis.status) 
      ? analysis.status 
      : 'poor',
    issues: Array.isArray(analysis.issues) ? analysis.issues : [],
    positives: Array.isArray(analysis.positives) ? analysis.positives : [],
    metrics: analysis.metrics || {},
  };
};

// Calcul de score robuste
const calculateScore = (issues: Issue[], positives: string[], maxPenalty = 15): number => {
  const totalPenalty = issues.reduce((sum, issue) => {
    const penalty = issue.severity === 'high' ? maxPenalty : 
                   issue.severity === 'medium' ? maxPenalty * 0.6 : 
                   maxPenalty * 0.3;
    return sum + penalty;
  }, 0);
  
  const bonus = Math.min(positives.length * 2, 20); // Max 20 points de bonus
  const baseScore = Math.max(0, 100 - totalPenalty + bonus);
  
  return validateScore(baseScore);
};
```

---

## 🎨 Problèmes d'interface

### 1. Styles cassés

**Symptômes :**
- Mise en page déformée
- Couleurs incorrectes
- Éléments qui se chevauchent

**Solutions :**

```bash
# Vérifier la compilation Tailwind
npm run build:css

# Purger le cache de Tailwind
rm -rf node_modules/.cache
npm run dev
```

```typescript
// Debug des classes CSS
const debugTailwind = () => {
  const elements = document.querySelectorAll('[class*="bg-"], [class*="text-"], [class*="border-"]');
  elements.forEach(el => {
    console.log(el.tagName, el.className);
  });
};

// Fallback pour les classes manquantes
const ensureClassExists = (element: HTMLElement, className: string, fallback: string) => {
  if (!element.classList.contains(className)) {
    console.warn(`Class ${className} not found, using fallback: ${fallback}`);
    element.className = element.className.replace(className, fallback);
  }
};
```

### 2. Responsive design cassé

**Symptômes :**
- Interface non adaptée sur mobile
- Éléments trop petits ou trop grands
- Débordement horizontal

**Solutions :**

```css
/* Debug responsive dans le CSS */
@media (max-width: 640px) {
  * {
    border: 1px solid red !important;
  }
}

/* Classes de debug Tailwind */
.debug-screens::before {
  content: 'xs';
  @apply sm:content-['sm'] md:content-['md'] lg:content-['lg'] xl:content-['xl'];
  @apply fixed top-0 right-0 bg-black text-white p-2 z-50;
}
```

```typescript
// Hook pour détecter la taille d'écran
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState('unknown');
  
  useEffect(() => {
    const updateScreenSize = () => {
      if (window.innerWidth < 640) setScreenSize('sm');
      else if (window.innerWidth < 768) setScreenSize('md');
      else if (window.innerWidth < 1024) setScreenSize('lg');
      else setScreenSize('xl');
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);
  
  return screenSize;
};
```

---

## 🚀 Erreurs de déploiement

### 1. Build échoue

**Message d'erreur :**
```
Error: Build failed with 1 error:
src/components/Component.tsx:15:23: ERROR: Could not resolve "missing-module"
```

**Solutions :**

```bash
# Vérifier les dépendances manquantes
npm ls --depth=0

# Installer les dépendances manquantes
npm install missing-module

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Build avec plus de détails
npm run build -- --verbose
```

### 2. Variables d'environnement manquantes

**Message d'erreur :**
```
ReferenceError: process is not defined
```

**Solutions :**

```typescript
// Vérification des variables d'environnement
const checkEnvVars = () => {
  const required = [
    'VITE_APP_TITLE',
    'VITE_API_TIMEOUT',
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Valeurs par défaut
const config = {
  appTitle: import.meta.env.VITE_APP_TITLE || 'SEO Analyzer Pro',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  maxRetries: parseInt(import.meta.env.VITE_MAX_RETRIES) || 3,
};
```

### 3. Erreurs de routing

**Symptômes :**
- 404 sur les routes après déploiement
- Rechargement de page ne fonctionne pas

**Solutions :**

```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

```json
// vercel.json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 🔧 Debugging et logs

### 1. Configuration des logs

```typescript
// utils/logger.ts
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private level: LogLevel;
  
  constructor() {
    this.level = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN;
  }
  
  error(message: string, data?: any) {
    if (this.level >= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, data);
    }
  }
  
  warn(message: string, data?: any) {
    if (this.level >= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, data);
    }
  }
  
  info(message: string, data?: any) {
    if (this.level >= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, data);
    }
  }
  
  debug(message: string, data?: any) {
    if (this.level >= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
}

export const logger = new Logger();
```

### 2. Monitoring en temps réel

```typescript
// utils/monitor.ts
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startTimer(name: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    };
  }
  
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Garder seulement les 100 dernières valeurs
    if (values.length > 100) {
      values.shift();
    }
    
    logger.debug(`Metric ${name}:`, {
      current: value,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    });
  }
  
  getReport(): Record<string, any> {
    const report: Record<string, any> = {};
    
    for (const [name, values] of this.metrics) {
      report[name] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    }
    
    return report;
  }
}

export const monitor = new PerformanceMonitor();

// Utilisation
const endTimer = monitor.startTimer('seo-analysis');
// ... code d'analyse ...
endTimer();
```

### 3. Debug des états React

```typescript
// hooks/useDebugState.ts
import { useEffect, useRef } from 'react';

export const useDebugState = (stateName: string, state: any) => {
  const prevState = useRef(state);
  
  useEffect(() => {
    if (prevState.current !== state) {
      console.log(`[STATE] ${stateName} changed:`, {
        from: prevState.current,
        to: state,
      });
      prevState.current = state;
    }
  }, [stateName, state]);
};

// Utilisation dans les composants
const MyComponent = () => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  useDebugState('analysis', analysis);
  useDebugState('isAnalyzing', isAnalyzing);
  
  // ...
};
```

---

## ❓ FAQ

### Q: L'analyse échoue toujours pour certains sites

**R:** Certains sites web ont des protections anti-bot ou des configurations CORS très restrictives. Essayez :
1. Vérifier si le site est accessible publiquement
2. Tester avec un autre site pour confirmer que l'outil fonctionne
3. Contacter l'administrateur du site pour les autorisations

### Q: Les scores semblent incorrects

**R:** Les scores sont calculés selon des critères spécifiques. Vérifiez :
1. La liste des issues détectées
2. Les métriques dans chaque catégorie
3. Comparez avec d'autres outils SEO pour validation

### Q: L'interface est lente sur mobile

**R:** Optimisations possibles :
1. Désactiver les animations sur mobile
2. Réduire la fréquence des mises à jour
3. Utiliser la version desktop pour les analyses complexes

### Q: Comment signaler un bug ?

**R:** Pour signaler un bug :
1. Reproduire le problème de manière consistante
2. Noter l'URL testée et le navigateur utilisé
3. Copier les messages d'erreur de la console
4. Créer une issue sur GitHub avec ces informations

### Q: Puis-je analyser des sites en local ?

**R:** Non, l'outil ne peut analyser que des sites accessibles publiquement via HTTP/HTTPS. Pour les sites en local, utilisez des outils comme Lighthouse en local.

---

*Guide de dépannage généré le 10/07/2025 par nathan Piraux - Version 1.0.0*
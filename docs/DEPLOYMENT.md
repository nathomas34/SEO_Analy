# Guide de Déploiement - SEO Analyzer Pro

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Préparation du build](#préparation-du-build)
3. [Déploiement sur Netlify](#déploiement-sur-netlify)
4. [Déploiement sur Vercel](#déploiement-sur-vercel)
5. [Déploiement sur GitHub Pages](#déploiement-sur-github-pages)
6. [Déploiement Docker](#déploiement-docker)
7. [Configuration des domaines](#configuration-des-domaines)
8. [Monitoring et analytics](#monitoring-et-analytics)
9. [Optimisations de production](#optimisations-de-production)
10. [Maintenance et mises à jour](#maintenance-et-mises-à-jour)

---

## 🎯 Vue d'ensemble

SEO Analyzer Pro est une application React statique qui peut être déployée sur n'importe quelle plateforme supportant les sites statiques. Ce guide couvre les principales options de déploiement avec leurs avantages et configurations spécifiques.

### Prérequis

- Node.js 18+
- npm ou yarn
- Git
- Compte sur la plateforme de déploiement choisie

### Architecture de déploiement

```
Source Code (GitHub)
├── Build Process (CI/CD)
├── Static Assets Generation
├── CDN Distribution
└── Production Deployment
```

---

## 🔨 Préparation du build

### Configuration de l'environnement

Créez les fichiers d'environnement pour la production :

```bash
# .env.production
VITE_APP_TITLE="SEO Analyzer Pro"
VITE_APP_VERSION="1.0.0"
VITE_API_TIMEOUT=15000
VITE_MAX_RETRIES=3
VITE_CORS_PROXIES="https://api.allorigins.win/get?url=,https://cors-anywhere.herokuapp.com/,https://api.codetabs.com/v1/proxy?quest="
```

### Optimisation du build

```bash
# Installation des dépendances
npm ci --only=production

# Build optimisé pour la production
npm run build

# Vérification du build
npm run preview
```

### Analyse du bundle

```bash
# Installation de l'analyseur de bundle
npm install --save-dev vite-bundle-analyzer

# Analyse du bundle
npx vite-bundle-analyzer
```

### Configuration Vite optimisée

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Optimisations de build
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    
    // Optimisation des chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          lucide: ['lucide-react'],
        },
      },
    },
    
    // Optimisation des assets
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
  },
  
  // Optimisations des dépendances
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom'],
  },
  
  // Configuration du serveur de preview
  preview: {
    port: 4173,
    host: true,
  },
});
```

---

## 🌐 Déploiement sur Netlify

### Configuration automatique

1. **Connexion du repository**
   ```bash
   # Connecter votre repository GitHub à Netlify
   # Via l'interface web Netlify
   ```

2. **Configuration de build**
   ```toml
   # netlify.toml
   [build]
     publish = "dist"
     command = "npm run build"
   
   [build.environment]
     NODE_VERSION = "18"
     NPM_VERSION = "9"
   
   # Redirections pour SPA
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   # Headers de sécurité
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
       Referrer-Policy = "strict-origin-when-cross-origin"
   
   # Cache des assets
   [[headers]]
     for = "/assets/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"
   ```

3. **Variables d'environnement**
   ```bash
   # Dans l'interface Netlify > Site settings > Environment variables
   VITE_APP_TITLE=SEO Analyzer Pro
   VITE_API_TIMEOUT=15000
   VITE_MAX_RETRIES=3
   ```

### Déploiement manuel

```bash
# Installation de Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build et déploiement
npm run build
netlify deploy --prod --dir=dist
```

### Configuration avancée

```toml
# netlify.toml - Configuration avancée
[build]
  publish = "dist"
  command = "npm run build"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"
  NODE_ENV = "production"

# Optimisations
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

# Fonctions serverless (optionnel)
[[functions]]
  directory = "netlify/functions"

# Formulaires (si nécessaire)
[forms]
  spam_protection = true

# Analytics
[analytics]
  provider = "netlify"
```

---

## ⚡ Déploiement sur Vercel

### Configuration automatique

1. **Connexion du repository**
   ```bash
   # Via l'interface Vercel ou CLI
   npx vercel
   ```

2. **Configuration de build**
   ```json
   {
     "version": 2,
     "name": "seo-analyzer-pro",
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/assets/(.*)",
         "headers": {
           "cache-control": "public, max-age=31536000, immutable"
         }
       },
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-XSS-Protection",
             "value": "1; mode=block"
           },
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           }
         ]
       }
     ]
   }
   ```

3. **Variables d'environnement**
   ```bash
   # Via l'interface Vercel ou CLI
   vercel env add VITE_APP_TITLE production
   vercel env add VITE_API_TIMEOUT production
   ```

### Déploiement avec CLI

```bash
# Installation de Vercel CLI
npm install -g vercel

# Login
vercel login

# Déploiement
vercel --prod
```

### Configuration avancée

```json
{
  "version": 2,
  "name": "seo-analyzer-pro",
  "alias": ["seoanalyzer.pro", "www.seoanalyzer.pro"],
  
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist",
        "framework": "vite"
      }
    }
  ],
  
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  
  "regions": ["iad1", "fra1"],
  
  "github": {
    "autoAlias": false
  }
}
```

---

## 📄 Déploiement sur GitHub Pages

### Configuration avec GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_APP_TITLE: ${{ secrets.VITE_APP_TITLE }}
        VITE_API_TIMEOUT: ${{ secrets.VITE_API_TIMEOUT }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        cname: seoanalyzer.pro
```

### Configuration manuelle

```bash
# Installation de gh-pages
npm install --save-dev gh-pages

# Script de déploiement dans package.json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}

# Déploiement
npm run deploy
```

### Configuration du domaine personnalisé

```bash
# Créer un fichier CNAME dans le dossier public
echo "seoanalyzer.pro" > public/CNAME
```

---

## 🐳 Déploiement Docker

### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copie du code source
COPY . .

# Build de l'application
RUN npm run build

# Image de production avec Nginx
FROM nginx:alpine

# Copie des fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exposition du port
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
```

### Configuration Nginx

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache des assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Headers de sécurité
        add_header X-Frame-Options "DENY" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        
        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  seo-analyzer:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  # Reverse proxy (optionnel)
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./proxy.conf:/etc/nginx/nginx.conf
    depends_on:
      - seo-analyzer
```

### Commandes Docker

```bash
# Build de l'image
docker build -t seo-analyzer-pro .

# Lancement du conteneur
docker run -d -p 80:80 --name seo-analyzer seo-analyzer-pro

# Avec Docker Compose
docker-compose up -d

# Logs
docker logs seo-analyzer

# Arrêt
docker stop seo-analyzer
```

---

## 🌍 Configuration des domaines

### Configuration DNS

```bash
# Enregistrements DNS requis
Type    Name                Value                   TTL
A       seoanalyzer.pro     192.168.1.100          300
CNAME   www                 seoanalyzer.pro         300
TXT     _verification       verification-code       300
```

### Certificat SSL

#### Let's Encrypt avec Certbot

```bash
# Installation de Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtention du certificat
sudo certbot --nginx -d seoanalyzer.pro -d www.seoanalyzer.pro

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Cloudflare SSL

```bash
# Configuration via l'interface Cloudflare
# SSL/TLS > Overview > Full (strict)
# SSL/TLS > Edge Certificates > Always Use HTTPS: On
```

### Configuration du CDN

#### Cloudflare

```javascript
// Page Rules Cloudflare
// seoanalyzer.pro/*
{
  "cache_level": "cache_everything",
  "edge_cache_ttl": 86400,
  "browser_cache_ttl": 31536000
}

// seoanalyzer.pro/assets/*
{
  "cache_level": "cache_everything",
  "edge_cache_ttl": 31536000,
  "browser_cache_ttl": 31536000
}
```

---

## 📊 Monitoring et analytics

### Google Analytics 4

```typescript
// src/utils/analytics.ts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const initGA = (measurementId: string) => {
  // Script Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Configuration
  window.gtag = window.gtag || function() {
    (window.gtag as any).q = (window.gtag as any).q || [];
    (window.gtag as any).q.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, parameters);
  }
};

// Utilisation dans App.tsx
useEffect(() => {
  if (import.meta.env.PROD) {
    initGA('G-XXXXXXXXXX');
  }
}, []);
```

### Monitoring des erreurs avec Sentry

```typescript
// src/utils/sentry.ts
import * as Sentry from '@sentry/react';

export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
    
    beforeSend(event) {
      // Filtrer les erreurs en développement
      if (import.meta.env.DEV) {
        return null;
      }
      return event;
    },
  });
};

// Wrapper pour les composants
export const withSentryErrorBoundary = (Component: React.ComponentType) => {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error, resetError }) => (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <button onClick={resetError}>Try again</button>
      </div>
    ),
  });
};
```

### Monitoring des performances

```typescript
// src/utils/performance.ts
export const measurePerformance = () => {
  // Core Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
};

// Monitoring des analyses SEO
export const trackAnalysisPerformance = (url: string, duration: number, success: boolean) => {
  // Envoi vers service de monitoring
  fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'seo_analysis',
      url: new URL(url).hostname,
      duration,
      success,
      timestamp: Date.now(),
    }),
  });
};
```

---

## ⚡ Optimisations de production

### Optimisation des images

```bash
# Compression des images avec imagemin
npm install --save-dev imagemin imagemin-webp imagemin-mozjpeg imagemin-pngquant

# Script d'optimisation
node scripts/optimize-images.js
```

```javascript
// scripts/optimize-images.js
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

(async () => {
  await imagemin(['src/assets/images/*.{jpg,png}'], {
    destination: 'src/assets/images/optimized',
    plugins: [
      imageminMozjpeg({ quality: 80 }),
      imageminPngquant({ quality: [0.6, 0.8] }),
      imageminWebp({ quality: 80 })
    ]
  });
  
  console.log('Images optimized!');
})();
```

### Service Worker pour le cache

```typescript
// public/sw.js
const CACHE_NAME = 'seo-analyzer-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la réponse du cache ou faire la requête
        return response || fetch(event.request);
      })
  );
});
```

### Optimisation du bundle

```typescript
// vite.config.ts - Optimisations avancées
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          react: ['react', 'react-dom'],
          lucide: ['lucide-react'],
          
          // Feature chunks
          analyzer: ['./src/services/seoAnalyzer.ts'],
          components: [
            './src/components/AnalyzerForm.tsx',
            './src/components/CrawlerBots.tsx',
            './src/components/SEOScoreCard.tsx'
          ],
        },
      },
    },
    
    // Optimisation Terser
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  
  // Préchargement des modules
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
});
```

---

## 🔄 Maintenance et mises à jour

### Stratégie de déploiement

```bash
# Déploiement Blue-Green
# 1. Déployer sur l'environnement de staging
npm run build:staging
npm run deploy:staging

# 2. Tests automatisés
npm run test:e2e:staging

# 3. Déploiement en production
npm run deploy:production

# 4. Monitoring post-déploiement
npm run monitor:production
```

### Scripts de maintenance

```json
{
  "scripts": {
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production",
    
    "deploy:staging": "netlify deploy --dir=dist",
    "deploy:production": "netlify deploy --prod --dir=dist",
    
    "test:e2e": "playwright test",
    "test:e2e:staging": "STAGING=true playwright test",
    
    "monitor:production": "node scripts/health-check.js",
    
    "update:deps": "npm update && npm audit fix",
    "security:check": "npm audit && snyk test"
  }
}
```

### Monitoring de santé

```javascript
// scripts/health-check.js
const https = require('https');

const healthCheck = async (url) => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve({ status: 'healthy', statusCode: res.statusCode });
      } else {
        reject({ status: 'unhealthy', statusCode: res.statusCode });
      }
    });
    
    req.on('error', (error) => {
      reject({ status: 'error', error: error.message });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject({ status: 'timeout' });
    });
  });
};

const checkEndpoints = async () => {
  const endpoints = [
    'https://seoanalyzer.pro',
    'https://seoanalyzer.pro/health',
  ];
  
  for (const endpoint of endpoints) {
    try {
      const result = await healthCheck(endpoint);
      console.log(`✅ ${endpoint}: ${result.status}`);
    } catch (error) {
      console.error(`❌ ${endpoint}: ${error.status}`);
      process.exit(1);
    }
  }
};

checkEndpoints();
```

### Rollback automatique

```yaml
# .github/workflows/rollback.yml
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout specific version
      uses: actions/checkout@v3
      with:
        ref: ${{ github.event.inputs.version }}
        
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install and build
      run: |
        npm ci
        npm run build
        
    - name: Deploy rollback
      run: |
        netlify deploy --prod --dir=dist
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

*Guide de déploiement généré le 10/07/2025 par nathan Piraux - Version 1.0.0*
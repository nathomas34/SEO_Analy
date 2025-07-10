import { SEOAnalysis, CategoryAnalysis, Issue, Recommendation, CrawlerBot } from '../types/seo';

export class SEOAnalyzer {
  private baseUrl: string = '';
  private crawledUrls: Set<string> = new Set();
  private maxPages: number = 50;
  private results: Record<string, CategoryAnalysis> = {};

  async analyzeSite(url: string, onBotUpdate: (bots: CrawlerBot[]) => void): Promise<SEOAnalysis> {
    // Validate URL format
    try {
      const urlObj = new URL(url);
      this.baseUrl = urlObj.origin;
    } catch (error) {
      throw new Error('Invalid URL format provided');
    }

    this.crawledUrls.clear();
    this.results = {};

    const bots: CrawlerBot[] = [
      { name: 'Technical SEO Bot', description: 'Analyzing technical SEO factors', icon: '🔧', status: 'idle', progress: 0, findings: 0 },
      { name: 'Content Analysis Bot', description: 'Evaluating content quality and optimization', icon: '📝', status: 'idle', progress: 0, findings: 0 },
      { name: 'Performance Bot', description: 'Measuring site speed and performance', icon: '⚡', status: 'idle', progress: 0, findings: 0 },
      { name: 'Mobile SEO Bot', description: 'Checking mobile optimization', icon: '📱', status: 'idle', progress: 0, findings: 0 },
      { name: 'Security Scanner', description: 'Scanning for security issues', icon: '🔒', status: 'idle', progress: 0, findings: 0 },
      { name: 'Accessibility Bot', description: 'Checking accessibility compliance', icon: '♿', status: 'idle', progress: 0, findings: 0 },
    ];

    // Start crawling and analysis with proper error handling
    const analysisPromises = [
      this.runAnalysisWithFallback('technical', () => this.runTechnicalAnalysis(url, bots, 0, onBotUpdate), bots, 0, onBotUpdate),
      this.runAnalysisWithFallback('content', () => this.runContentAnalysis(url, bots, 1, onBotUpdate), bots, 1, onBotUpdate),
      this.runAnalysisWithFallback('performance', () => this.runPerformanceAnalysis(url, bots, 2, onBotUpdate), bots, 2, onBotUpdate),
      this.runAnalysisWithFallback('mobile', () => this.runMobileAnalysis(url, bots, 3, onBotUpdate), bots, 3, onBotUpdate),
      this.runAnalysisWithFallback('security', () => this.runSecurityAnalysis(url, bots, 4, onBotUpdate), bots, 4, onBotUpdate),
      this.runAnalysisWithFallback('accessibility', () => this.runAccessibilityAnalysis(url, bots, 5, onBotUpdate), bots, 5, onBotUpdate),
    ];

    // Wait for all analyses to complete
    await Promise.allSettled(analysisPromises);

    return this.generateFinalReport(url);
  }

  private async runAnalysisWithFallback(
    category: string, 
    analysisFunction: () => Promise<void>, 
    bots: CrawlerBot[], 
    botIndex: number, 
    onBotUpdate: (bots: CrawlerBot[]) => void
  ): Promise<void> {
    try {
      await analysisFunction();
    } catch (error) {
      this.handleAnalysisError(category, bots, botIndex, onBotUpdate, error);
    }
  }

  private handleAnalysisError(category: string, bots: CrawlerBot[], botIndex: number, onBotUpdate: (bots: CrawlerBot[]) => void, error: any) {
    console.error(`${category} analysis error:`, error);
    
    // Set bot status to error
    bots[botIndex].status = 'error';
    bots[botIndex].progress = 0;
    bots[botIndex].findings = 1;
    onBotUpdate([...bots]);

    // Create a fallback result for this category
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    this.results[category] = {
      score: 0,
      status: 'poor',
      issues: [{
        id: `${category}-error`,
        severity: 'high' as const,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} analysis failed`,
        description: `Unable to complete ${category} analysis: ${errorMessage}`,
        recommendation: 'Please check the URL accessibility and try again',
        affectedPages: [this.baseUrl]
      }],
      positives: [],
      metrics: {
        'Status': 'Analysis Failed',
        'Error': errorMessage.substring(0, 50) + (errorMessage.length > 50 ? '...' : '')
      }
    };
  }

  private async runTechnicalAnalysis(url: string, bots: CrawlerBot[], botIndex: number, onBotUpdate: (bots: CrawlerBot[]) => void) {
    bots[botIndex].status = 'running';
    onBotUpdate([...bots]);

    try {
      const response = await this.fetchWithTimeout(url, 10000);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const issues: Issue[] = [];
      const positives: string[] = [];

      // Progress updates with proper timing
      for (let progress = 0; progress <= 100; progress += 20) {
        bots[botIndex].progress = progress;
        onBotUpdate([...bots]);
        await this.delay(200);
      }

      // Check meta tags
      const title = doc.querySelector('title');
      const metaDescription = doc.querySelector('meta[name="description"]');

      if (!title || !title.textContent || title.textContent.trim().length < 30) {
        issues.push({
          id: 'tech-1',
          severity: 'high',
          title: 'Title tag missing or too short',
          description: 'Page title is missing or shorter than 30 characters',
          recommendation: 'Add a descriptive title between 30-60 characters',
          affectedPages: [url]
        });
      } else {
        positives.push('Title tag present and adequate length');
      }

      if (!metaDescription || !metaDescription.getAttribute('content')) {
        issues.push({
          id: 'tech-2',
          severity: 'high',
          title: 'Meta description missing',
          description: 'Page is missing meta description',
          recommendation: 'Add a compelling meta description between 150-160 characters',
          affectedPages: [url]
        });
      } else {
        positives.push('Meta description present');
      }

      // Check heading structure
      const h1Tags = doc.querySelectorAll('h1');
      if (h1Tags.length === 0) {
        issues.push({
          id: 'tech-3',
          severity: 'medium',
          title: 'Missing H1 tag',
          description: 'Page is missing H1 heading tag',
          recommendation: 'Add a single H1 tag with main page topic',
          affectedPages: [url]
        });
      } else if (h1Tags.length > 1) {
        issues.push({
          id: 'tech-4',
          severity: 'medium',
          title: 'Multiple H1 tags',
          description: 'Page has multiple H1 tags',
          recommendation: 'Use only one H1 tag per page',
          affectedPages: [url]
        });
      } else {
        positives.push('Proper H1 tag structure');
      }

      // Check images alt text
      const images = doc.querySelectorAll('img');
      let imagesWithoutAlt = 0;
      images.forEach(img => {
        if (!img.getAttribute('alt')) {
          imagesWithoutAlt++;
        }
      });

      if (imagesWithoutAlt > 0) {
        issues.push({
          id: 'tech-5',
          severity: 'medium',
          title: 'Images missing alt text',
          description: `${imagesWithoutAlt} images are missing alt text`,
          recommendation: 'Add descriptive alt text to all images',
          affectedPages: [url]
        });
      } else if (images.length > 0) {
        positives.push('All images have alt text');
      }

      // Check for robots.txt
      try {
        const robotsResponse = await this.fetchWithTimeout(`${this.baseUrl}/robots.txt`, 5000);
        if (robotsResponse.ok) {
          positives.push('Robots.txt file present');
        }
      } catch {
        issues.push({
          id: 'tech-6',
          severity: 'low',
          title: 'Robots.txt missing',
          description: 'No robots.txt file found',
          recommendation: 'Create a robots.txt file to guide search engine crawlers',
          affectedPages: [url]
        });
      }

      // Check SSL
      if (url.startsWith('https://')) {
        positives.push('SSL certificate installed');
      } else {
        issues.push({
          id: 'tech-7',
          severity: 'high',
          title: 'No SSL certificate',
          description: 'Website is not using HTTPS',
          recommendation: 'Install SSL certificate and redirect HTTP to HTTPS',
          affectedPages: [url]
        });
      }

      this.results.technical = {
        score: Math.max(0, 100 - (issues.length * 15)),
        status: this.getStatusFromScore(100 - (issues.length * 15)),
        issues,
        positives,
        metrics: {
          'Title Length': title?.textContent ? `${title.textContent.trim().length} chars` : 'Missing',
          'Meta Description': metaDescription?.getAttribute('content') ? 'Present' : 'Missing',
          'H1 Tags': h1Tags.length.toString(),
          'Images': images.length.toString(),
          'Images with Alt': `${images.length - imagesWithoutAlt}/${images.length}`
        }
      };

      bots[botIndex].status = 'completed';
      bots[botIndex].findings = issues.length + positives.length;
      onBotUpdate([...bots]);

    } catch (error) {
      throw new Error(`Technical analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async runContentAnalysis(url: string, bots: CrawlerBot[], botIndex: number, onBotUpdate: (bots: CrawlerBot[]) => void) {
    bots[botIndex].status = 'running';
    onBotUpdate([...bots]);

    try {
      const response = await this.fetchWithTimeout(url, 10000);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const issues: Issue[] = [];
      const positives: string[] = [];

      // Progress updates
      for (let progress = 0; progress <= 100; progress += 25) {
        bots[botIndex].progress = progress;
        onBotUpdate([...bots]);
        await this.delay(300);
      }

      // Extract text content safely
      const textContent = doc.body?.textContent || '';
      const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;

      if (wordCount < 300) {
        issues.push({
          id: 'content-1',
          severity: 'medium',
          title: 'Low word count',
          description: `Page has only ${wordCount} words`,
          recommendation: 'Add more quality content (aim for 300+ words)',
          affectedPages: [url]
        });
      } else {
        positives.push(`Good word count (${wordCount} words)`);
      }

      // Check heading hierarchy
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length < 3) {
        issues.push({
          id: 'content-2',
          severity: 'low',
          title: 'Poor heading structure',
          description: 'Page has insufficient heading structure',
          recommendation: 'Use more headings to structure content (H2, H3, etc.)',
          affectedPages: [url]
        });
      } else {
        positives.push('Good heading structure');
      }

      // Check for duplicate content (simplified)
      const title = doc.querySelector('title')?.textContent?.trim() || '';
      const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
      
      if (title && metaDesc && title.toLowerCase().includes(metaDesc.toLowerCase().substring(0, 20))) {
        issues.push({
          id: 'content-3',
          severity: 'low',
          title: 'Title and meta description too similar',
          description: 'Title and meta description are very similar',
          recommendation: 'Make title and meta description unique and complementary',
          affectedPages: [url]
        });
      }

      // Check for internal links
      const internalLinks = doc.querySelectorAll(`a[href*="${this.baseUrl}"], a[href^="/"], a[href^="./"], a[href^="../"]`);
      if (internalLinks.length < 3) {
        issues.push({
          id: 'content-4',
          severity: 'medium',
          title: 'Few internal links',
          description: 'Page has very few internal links',
          recommendation: 'Add more internal links to improve site navigation and SEO',
          affectedPages: [url]
        });
      } else {
        positives.push(`Good internal linking (${internalLinks.length} links)`);
      }

      this.results.content = {
        score: Math.max(0, 100 - (issues.length * 12)),
        status: this.getStatusFromScore(100 - (issues.length * 12)),
        issues,
        positives,
        metrics: {
          'Word Count': wordCount.toString(),
          'Headings': headings.length.toString(),
          'Internal Links': internalLinks.length.toString(),
          'Readability': wordCount > 300 ? 'Good' : 'Poor'
        }
      };

      bots[botIndex].status = 'completed';
      bots[botIndex].findings = issues.length + positives.length;
      onBotUpdate([...bots]);

    } catch (error) {
      throw new Error(`Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async runPerformanceAnalysis(url: string, bots: CrawlerBot[], botIndex: number, onBotUpdate: (bots: CrawlerBot[]) => void) {
    bots[botIndex].status = 'running';
    onBotUpdate([...bots]);

    try {
      const startTime = performance.now();
      const response = await this.fetchWithTimeout(url, 15000);
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const issues: Issue[] = [];
      const positives: string[] = [];

      // Progress updates
      for (let progress = 0; progress <= 100; progress += 20) {
        bots[botIndex].progress = progress;
        onBotUpdate([...bots]);
        await this.delay(250);
      }

      // Check load time
      if (loadTime > 3000) {
        issues.push({
          id: 'perf-1',
          severity: 'high',
          title: 'Slow page load time',
          description: `Page took ${Math.round(loadTime)}ms to load`,
          recommendation: 'Optimize images, minify CSS/JS, use CDN',
          affectedPages: [url]
        });
      } else if (loadTime > 1500) {
        issues.push({
          id: 'perf-2',
          severity: 'medium',
          title: 'Moderate page load time',
          description: `Page took ${Math.round(loadTime)}ms to load`,
          recommendation: 'Consider optimizing resources for faster loading',
          affectedPages: [url]
        });
      } else {
        positives.push(`Fast load time (${Math.round(loadTime)}ms)`);
      }

      // Check image optimization
      const images = doc.querySelectorAll('img');
      let unoptimizedImages = 0;
      images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.includes('.webp') && !src.includes('.avif')) {
          unoptimizedImages++;
        }
      });

      if (unoptimizedImages > 0) {
        issues.push({
          id: 'perf-3',
          severity: 'medium',
          title: 'Unoptimized images',
          description: `${unoptimizedImages} images could be optimized`,
          recommendation: 'Use modern image formats (WebP, AVIF) and compress images',
          affectedPages: [url]
        });
      } else if (images.length > 0) {
        positives.push('Images appear optimized');
      }

      // Check for external resources
      const scripts = doc.querySelectorAll('script[src]');
      const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
      
      if (scripts.length > 5 || stylesheets.length > 3) {
        issues.push({
          id: 'perf-4',
          severity: 'low',
          title: 'Many external resources',
          description: 'Page loads many external scripts and stylesheets',
          recommendation: 'Combine and minify CSS/JS files',
          affectedPages: [url]
        });
      } else {
        positives.push('Reasonable number of external resources');
      }

      // Estimate page size
      const pageSize = new Blob([html]).size;
      if (pageSize > 1000000) { // 1MB
        issues.push({
          id: 'perf-5',
          severity: 'medium',
          title: 'Large page size',
          description: `Page size is approximately ${Math.round(pageSize / 1024)}KB`,
          recommendation: 'Reduce page size by optimizing content and resources',
          affectedPages: [url]
        });
      } else {
        positives.push(`Reasonable page size (${Math.round(pageSize / 1024)}KB)`);
      }

      this.results.performance = {
        score: Math.max(0, 100 - (issues.length * 15)),
        status: this.getStatusFromScore(100 - (issues.length * 15)),
        issues,
        positives,
        metrics: {
          'Load Time': `${Math.round(loadTime)}ms`,
          'Page Size': `${Math.round(pageSize / 1024)}KB`,
          'Images': images.length.toString(),
          'Scripts': scripts.length.toString(),
          'Stylesheets': stylesheets.length.toString()
        }
      };

      bots[botIndex].status = 'completed';
      bots[botIndex].findings = issues.length + positives.length;
      onBotUpdate([...bots]);

    } catch (error) {
      throw new Error(`Performance analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async runMobileAnalysis(url: string, bots: CrawlerBot[], botIndex: number, onBotUpdate: (bots: CrawlerBot[]) => void) {
    bots[botIndex].status = 'running';
    onBotUpdate([...bots]);

    try {
      const response = await this.fetchWithTimeout(url, 10000);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const issues: Issue[] = [];
      const positives: string[] = [];

      // Progress updates
      for (let progress = 0; progress <= 100; progress += 33) {
        bots[botIndex].progress = progress;
        onBotUpdate([...bots]);
        await this.delay(200);
      }

      // Check viewport meta tag
      const viewport = doc.querySelector('meta[name="viewport"]');
      if (!viewport) {
        issues.push({
          id: 'mobile-1',
          severity: 'high',
          title: 'Missing viewport meta tag',
          description: 'Page is missing viewport meta tag for mobile optimization',
          recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
          affectedPages: [url]
        });
      } else {
        const content = viewport.getAttribute('content') || '';
        if (!content.includes('width=device-width')) {
          issues.push({
            id: 'mobile-2',
            severity: 'medium',
            title: 'Incorrect viewport configuration',
            description: 'Viewport meta tag is not properly configured',
            recommendation: 'Set viewport to width=device-width, initial-scale=1',
            affectedPages: [url]
          });
        } else {
          positives.push('Proper viewport meta tag');
        }
      }

      // Check for responsive design indicators
      const mediaQueries = html.match(/@media[^{]+\{/g) || [];
      if (mediaQueries.length === 0) {
        issues.push({
          id: 'mobile-3',
          severity: 'medium',
          title: 'No responsive design detected',
          description: 'No CSS media queries found for responsive design',
          recommendation: 'Implement responsive design with CSS media queries',
          affectedPages: [url]
        });
      } else {
        positives.push(`Responsive design detected (${mediaQueries.length} media queries)`);
      }

      // Check touch-friendly elements
      const buttons = doc.querySelectorAll('button, input[type="button"], input[type="submit"]');
      const links = doc.querySelectorAll('a');
      
      if (buttons.length + links.length > 0) {
        positives.push('Interactive elements present');
      }

      // Check for mobile-specific optimizations
      const appleTouchIcon = doc.querySelector('link[rel="apple-touch-icon"]');
      if (!appleTouchIcon) {
        issues.push({
          id: 'mobile-4',
          severity: 'low',
          title: 'Missing mobile icons',
          description: 'No Apple touch icon found',
          recommendation: 'Add apple-touch-icon for better mobile experience',
          affectedPages: [url]
        });
      } else {
        positives.push('Mobile icons configured');
      }

      this.results.mobile = {
        score: Math.max(0, 100 - (issues.length * 20)),
        status: this.getStatusFromScore(100 - (issues.length * 20)),
        issues,
        positives,
        metrics: {
          'Viewport': viewport ? 'Configured' : 'Missing',
          'Media Queries': mediaQueries.length.toString(),
          'Touch Elements': (buttons.length + links.length).toString(),
          'Mobile Icons': appleTouchIcon ? 'Present' : 'Missing'
        }
      };

      bots[botIndex].status = 'completed';
      bots[botIndex].findings = issues.length + positives.length;
      onBotUpdate([...bots]);

    } catch (error) {
      throw new Error(`Mobile analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async runSecurityAnalysis(url: string, bots: CrawlerBot[], botIndex: number, onBotUpdate: (bots: CrawlerBot[]) => void) {
    bots[botIndex].status = 'running';
    onBotUpdate([...bots]);

    try {
      const response = await this.fetchWithTimeout(url, 10000);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const issues: Issue[] = [];
      const positives: string[] = [];

      // Progress updates
      for (let progress = 0; progress <= 100; progress += 25) {
        bots[botIndex].progress = progress;
        onBotUpdate([...bots]);
        await this.delay(300);
      }

      // Check HTTPS
      if (url.startsWith('https://')) {
        positives.push('HTTPS enabled');
      } else {
        issues.push({
          id: 'security-1',
          severity: 'high',
          title: 'No HTTPS encryption',
          description: 'Website is not using HTTPS',
          recommendation: 'Install SSL certificate and enable HTTPS',
          affectedPages: [url]
        });
      }

      // Check for mixed content
      const httpResources = html.match(/http:\/\/[^"'\s>]+/g) || [];
      if (httpResources.length > 0 && url.startsWith('https://')) {
        issues.push({
          id: 'security-2',
          severity: 'medium',
          title: 'Mixed content detected',
          description: `${httpResources.length} HTTP resources found on HTTPS page`,
          recommendation: 'Update all resources to use HTTPS',
          affectedPages: [url]
        });
      }

      // Check for security headers (simulated based on common patterns)
      const headers = response.headers;
      const securityHeaders = [
        'strict-transport-security',
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection'
      ];

      let missingHeaders = 0;
      securityHeaders.forEach(header => {
        if (!headers.get(header)) {
          missingHeaders++;
        }
      });

      if (missingHeaders > 2) {
        issues.push({
          id: 'security-3',
          severity: 'medium',
          title: 'Missing security headers',
          description: `${missingHeaders} important security headers are missing`,
          recommendation: 'Configure security headers (HSTS, X-Frame-Options, etc.)',
          affectedPages: [url]
        });
      } else {
        positives.push('Security headers configured');
      }

      // Check for forms without HTTPS
      const forms = doc.querySelectorAll('form');
      let insecureForms = 0;
      forms.forEach(form => {
        const action = form.getAttribute('action');
        if (action && action.startsWith('http://')) {
          insecureForms++;
        }
      });

      if (insecureForms > 0) {
        issues.push({
          id: 'security-4',
          severity: 'high',
          title: 'Insecure forms detected',
          description: `${insecureForms} forms submit to HTTP URLs`,
          recommendation: 'Update form actions to use HTTPS',
          affectedPages: [url]
        });
      } else if (forms.length > 0) {
        positives.push('Forms are secure');
      }

      this.results.security = {
        score: Math.max(0, 100 - (issues.length * 25)),
        status: this.getStatusFromScore(100 - (issues.length * 25)),
        issues,
        positives,
        metrics: {
          'HTTPS': url.startsWith('https://') ? 'Enabled' : 'Disabled',
          'Mixed Content': httpResources.length.toString(),
          'Security Headers': `${securityHeaders.length - missingHeaders}/${securityHeaders.length}`,
          'Secure Forms': forms.length > 0 ? (insecureForms === 0 ? 'Yes' : 'No') : 'N/A'
        }
      };

      bots[botIndex].status = 'completed';
      bots[botIndex].findings = issues.length + positives.length;
      onBotUpdate([...bots]);

    } catch (error) {
      throw new Error(`Security analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async runAccessibilityAnalysis(url: string, bots: CrawlerBot[], botIndex: number, onBotUpdate: (bots: CrawlerBot[]) => void) {
    bots[botIndex].status = 'running';
    onBotUpdate([...bots]);

    try {
      const response = await this.fetchWithTimeout(url, 10000);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const issues: Issue[] = [];
      const positives: string[] = [];

      // Progress updates
      for (let progress = 0; progress <= 100; progress += 20) {
        bots[botIndex].progress = progress;
        onBotUpdate([...bots]);
        await this.delay(250);
      }

      // Check images alt text
      const images = doc.querySelectorAll('img');
      let imagesWithoutAlt = 0;
      images.forEach(img => {
        if (!img.getAttribute('alt')) {
          imagesWithoutAlt++;
        }
      });

      if (imagesWithoutAlt > 0) {
        issues.push({
          id: 'a11y-1',
          severity: 'medium',
          title: 'Images missing alt text',
          description: `${imagesWithoutAlt} images are missing alt text`,
          recommendation: 'Add descriptive alt text to all images',
          affectedPages: [url]
        });
      } else if (images.length > 0) {
        positives.push('All images have alt text');
      }

      // Check form labels
      const inputs = doc.querySelectorAll('input, textarea, select');
      let inputsWithoutLabels = 0;
      inputs.forEach(input => {
        const id = input.getAttribute('id');
        const label = id ? doc.querySelector(`label[for="${id}"]`) : null;
        const ariaLabel = input.getAttribute('aria-label');
        if (!label && !ariaLabel) {
          inputsWithoutLabels++;
        }
      });

      if (inputsWithoutLabels > 0) {
        issues.push({
          id: 'a11y-2',
          severity: 'medium',
          title: 'Form inputs missing labels',
          description: `${inputsWithoutLabels} form inputs are missing labels`,
          recommendation: 'Add proper labels or aria-label attributes to form inputs',
          affectedPages: [url]
        });
      } else if (inputs.length > 0) {
        positives.push('Form inputs have proper labels');
      }

      // Check heading hierarchy
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let headingIssues = false;
      let previousLevel = 0;

      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > previousLevel + 1) {
          headingIssues = true;
        }
        previousLevel = level;
      });

      if (headingIssues) {
        issues.push({
          id: 'a11y-3',
          severity: 'low',
          title: 'Heading hierarchy issues',
          description: 'Heading levels skip numbers (e.g., H1 to H3)',
          recommendation: 'Use proper heading hierarchy (H1, H2, H3, etc.)',
          affectedPages: [url]
        });
      } else if (headings.length > 0) {
        positives.push('Proper heading hierarchy');
      }

      // Check for skip links
      const skipLinks = doc.querySelectorAll('a[href^="#"]');
      if (skipLinks.length === 0) {
        issues.push({
          id: 'a11y-4',
          severity: 'low',
          title: 'No skip navigation links',
          description: 'Page lacks skip navigation links for keyboard users',
          recommendation: 'Add skip links to main content for better keyboard navigation',
          affectedPages: [url]
        });
      } else {
        positives.push('Skip navigation links present');
      }

      this.results.accessibility = {
        score: Math.max(0, 100 - (issues.length * 15)),
        status: this.getStatusFromScore(100 - (issues.length * 15)),
        issues,
        positives,
        metrics: {
          'Images with Alt': `${images.length - imagesWithoutAlt}/${images.length}`,
          'Labeled Inputs': `${inputs.length - inputsWithoutLabels}/${inputs.length}`,
          'Heading Structure': headingIssues ? 'Issues' : 'Good',
          'Skip Links': skipLinks.length.toString()
        }
      };

      bots[botIndex].status = 'completed';
      bots[botIndex].findings = issues.length + positives.length;
      onBotUpdate([...bots]);

    } catch (error) {
      throw new Error(`Accessibility analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchWithTimeout(url: string, timeout: number = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Retry configuration
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    // Multiple CORS proxy options for better reliability
    const corsProxies = [
      'https://api.allorigins.win/get?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://api.codetabs.com/v1/proxy?quest='
    ];

    // Retry function with exponential backoff
    const retryFetch = async (attempt: number): Promise<Response> => {
      try {
        // Try direct fetch first
        const response = await fetch(url, {
          signal: controller.signal,
          mode: 'cors',
          headers: {
            'User-Agent': 'SEO-Analyzer-Bot/1.0'
          }
        });
        return response;
      } catch (directError) {
        // If direct fetch fails, try CORS proxies
        for (let proxyIndex = 0; proxyIndex < corsProxies.length; proxyIndex++) {
          try {
            const proxyUrl = corsProxies[proxyIndex] + encodeURIComponent(url);
            const proxyController = new AbortController();
            const proxyTimeoutId = setTimeout(() => proxyController.abort(), timeout);
            
            const response = await fetch(proxyUrl, {
              signal: proxyController.signal
            });
            clearTimeout(proxyTimeoutId);
            
            // Handle different proxy response formats
            if (corsProxies[proxyIndex].includes('allorigins.win')) {
              const data = await response.json();
              if (!response.ok || !data.contents || data.status?.http_code !== 200) {
                throw new Error(`Proxy ${proxyIndex + 1} failed: HTTP ${data.status?.http_code || 'unknown'}`);
              }
              return new Response(data.contents, {
                status: 200,
                statusText: 'OK',
                headers: new Headers({
                  'content-type': 'text/html'
                })
              });
            } else {
              // For other proxies, return response directly
              if (!response.ok) {
                throw new Error(`Proxy ${proxyIndex + 1} failed: HTTP ${response.status}`);
              }
              return response;
            }
          } catch (proxyError) {
            console.warn(`CORS proxy ${proxyIndex + 1} failed:`, proxyError);
            // Continue to next proxy
          }
        }
        
        // If this is not the last attempt, retry with exponential backoff
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(`Fetch attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return retryFetch(attempt + 1);
        }
        
        // All attempts failed
        const errorMessage = directError instanceof Error ? directError.message : 'Unknown error';
        if (errorMessage.includes('aborted')) {
          throw new Error(`Request timeout: Unable to fetch ${url} within ${timeout}ms after ${maxRetries} attempts`);
        } else if (errorMessage === 'Failed to fetch') {
          throw new Error(`Network error: Unable to connect to ${url} after ${maxRetries} attempts with multiple proxies`);
        } else {
          throw new Error(`Fetch failed for ${url} after ${maxRetries} attempts: ${errorMessage}`);
        }
      }
    };

    try {
      const response = await retryFetch(1);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getStatusFromScore(score: number): 'excellent' | 'good' | 'warning' | 'poor' {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'warning';
    return 'poor';
  }

  private generateFinalReport(url: string): SEOAnalysis {
    const allIssues: Issue[] = [];
    const allRecommendations: Recommendation[] = [];
    let totalScore = 0;
    let categoryCount = 0;

    // Ensure all categories exist with default values
    const defaultCategories = ['technical', 'content', 'performance', 'mobile', 'security', 'accessibility'];
    defaultCategories.forEach(category => {
      if (!this.results[category]) {
        this.results[category] = {
          score: 0,
          status: 'poor',
          issues: [],
          positives: [],
          metrics: {}
        };
      }
    });

    // Collect all issues and calculate overall score
    Object.values(this.results).forEach((category: CategoryAnalysis) => {
      if (category.score !== undefined) {
        totalScore += category.score;
        categoryCount++;
        allIssues.push(...category.issues);
      }
    });

    const overallScore = categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0;

    // Generate recommendations based on issues
    allIssues.forEach(issue => {
      const priority = issue.severity === 'high' ? 'high' : issue.severity === 'medium' ? 'medium' : 'low';
      const effort = issue.severity === 'high' ? 'medium' : issue.severity === 'medium' ? 'easy' : 'easy';

      allRecommendations.push({
        id: `rec-${issue.id}`,
        category: issue.id.split('-')[0],
        priority,
        title: issue.title,
        description: issue.description,
        impact: this.getImpactDescription(issue.severity),
        effort,
        steps: [issue.recommendation]
      });
    });

    return {
      id: Date.now().toString(),
      url,
      timestamp: new Date(),
      overallScore,
      categories: {
        technical: this.results.technical,
        content: this.results.content,
        performance: this.results.performance,
        security: this.results.security,
        mobile: this.results.mobile,
        accessibility: this.results.accessibility,
      },
      recommendations: allRecommendations,
      metadata: {
        crawledPages: this.crawledUrls.size || 1,
        totalLinks: 0,
        analysisDuration: 0,
        lastModified: new Date()
      }
    };
  }

  private getImpactDescription(severity: string): string {
    switch (severity) {
      case 'high':
        return 'High impact on SEO rankings and user experience. Should be addressed immediately.';
      case 'medium':
        return 'Moderate impact on SEO performance. Recommended to fix within a few weeks.';
      case 'low':
        return 'Minor impact on SEO. Can be addressed as time permits for optimization.';
      default:
        return 'Impact varies depending on implementation.';
    }
  }
}
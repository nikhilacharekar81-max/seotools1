export type ExecutionMode = 'client' | 'gemini-ai';

export interface MainCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  position: number;
  isActive: boolean;
}

export interface Subcategory {
  id: string;
  parentCategoryId: string;
  name: string;
  slug: string;
  description: string;
  position: number;
  isActive: boolean;
}

export type ToolComponentKey =
  | 'serp-simulator'
  | 'meta-tag-generator'
  | 'schema-builder'
  | 'robots-generator'
  | 'keyword-density-Readability'
  | 'sitemap-hreflang-generator'
  | 'redirect-rule-builder'
  | 'ai-geo-optimizer'
  | 'ai-keyword-clusters'
  | 'ai-visual-audit'
  | 'ai-schema-architect'
  | 'ai-autonomous-agent';

export interface SeoTool {
  id: string;
  name: string;
  slug: string;
  componentKey: ToolComponentKey;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  subcategoryId: string;
  executionMode: ExecutionMode;
  position: number;
  isActive: boolean;
  schemaType: string;
  canonicalPath: string;
  avgLatencyMs: number;
  costPerRunUsd: number;
  temperature?: number;
  modelName?: string;
  thinkingLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RateLimitConfig {
  maxRequestsPerWindow: number;
  windowSeconds: number;
  cacheTtlSeconds: number;
  enableCaching: boolean;
  modelSelection: string;
  defaultTemperature: number;
  defaultThinkingLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ApiMetricLog {
  id: string;
  timestamp: string;
  toolSlug: string;
  toolName: string;
  model: string;
  latencyMs: number;
  cached: boolean;
  status: 'success' | 'rate_limited' | 'error';
  estimatedTokens: number;
  estimatedCostUsd: number;
}

export interface GeoOptimizationResult {
  readinessScore: number;
  directAnswerSnippet: string;
  SnippetWordCount: number;
  citationWorthinessAnalysis: string;
  missingEntities: Array<{
    entity: string;
    category: string;
    reasonToInclude: string;
  }>;
  structuredKeyTakeaways: string[];
  faqPairsForAiOverviews: Array<{
    question: string;
    conciseAnswer: string;
  }>;
  technicalGeoRecommendations: string[];
}

export interface KeywordClusterResult {
  primaryTopic: string;
  overallSearchIntentSummary: string;
  clusters: Array<{
    clusterName: string;
    dominantIntent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
    difficultyEstimate: 'Low' | 'Medium' | 'High';
    targetSerpFeature: string;
    recommendedContentFormat: string;
    keywords: Array<{
      term: string;
      intentNuance: string;
      suggestedTitleAngle: string;
    }>;
  }>;
  semanticContentGaps: string[];
  internalLinkingAnchorSuggestions: string[];
}

export interface VisualAuditResult {
  overallTechnicalHealthScore: number;
  lcpCandidateAnalysis: string;
  clsRiskAssessment: string;
  aboveTheFoldClarity: string;
  headingHierarchyEvaluation: string;
  detectedIssues: Array<{
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    category: 'Core Web Vitals' | 'On-Page SEO' | 'Accessibility' | 'CRO & UX';
    finding: string;
    remediationCodeOrAction: string;
  }>;
  semanticHtmlChecklist: Array<{
    element: string;
    status: 'Pass' | 'Warn' | 'Fail';
    recommendation: string;
  }>;
}

export interface AiSchemaArchitectResult {
  detectedPrimarySchemaType: string;
  entityExtractionSummary: string[];
  jsonLdString: string;
  nextJsGenerateMetadataCode: string;
  seoValidationNotes: string[];
}

export interface AiAutonomousAgentResult {
  architectureSummary: string;
  multiStepReasoningPlan: Array<{
    stepNumber: number;
    phase: string;
    technicalDecision: string;
    expectedSeoImpact: string;
  }>;
  programmaticUrlTaxonomy: Array<{
    routePattern: string;
    targetSearchIntent: string;
    dynamicSchemaTypes: string[];
    isrRevalidationSeconds: number;
  }>;
  nextJs15AppRouterCode: string;
  coreWebVitalsGuardrails: string[];
}

export const INITIAL_CATEGORIES: MainCategory[] = [
  {
    id: 'cat-onpage-client',
    name: 'Client-Side Micro SEO Utilities',
    slug: 'client-seo-utilities',
    description: 'Zero-latency browser utilities for SERP pixel simulation, metadata generation, structured data, and crawl directives.',
    position: 1,
    isActive: true,
  },
  {
    id: 'cat-gemini-ai',
    name: 'Gemini AI SEO Engines',
    slug: 'gemini-ai-engines',
    description: 'Serverless AI engines using deterministic JSON schemas for Generative Engine Optimization (GEO), keyword clustering, and multimodal site audits.',
    position: 2,
    isActive: true,
  },
  {
    id: 'cat-technical-seo',
    name: 'Technical SEO & Crawl Architecture',
    slug: 'technical-seo',
    description: 'Structured data validation, crawl budget controls, and programmatic Next.js metadata generators.',
    position: 3,
    isActive: true,
  },
];

export const INITIAL_SUBCATEGORIES: Subcategory[] = [
  {
    id: 'sub-serp-meta',
    parentCategoryId: 'cat-onpage-client',
    name: 'SERP & Snippet Optimization',
    slug: 'serp-snippet-optimization',
    description: 'Pixel-accurate Google SERP simulators, title width meters, and OpenGraph social tag builders.',
    position: 1,
    isActive: true,
  },
  {
    id: 'sub-content-micro',
    parentCategoryId: 'cat-onpage-client',
    name: 'On-Page Content Analyzers',
    slug: 'on-page-content-analyzers',
    description: 'Browser-side n-gram keyword density, Flesch-Kincaid readability, and heading outline extractors.',
    position: 2,
    isActive: true,
  },
  {
    id: 'sub-geo-ai',
    parentCategoryId: 'cat-gemini-ai',
    name: 'Generative Engine Optimization (GEO)',
    slug: 'generative-engine-optimization',
    description: 'Optimize pages for AI Overviews, LLM citations, semantic entity coverage, and missing topic clusters.',
    position: 1,
    isActive: true,
  },
  {
    id: 'sub-vision-audit',
    parentCategoryId: 'cat-gemini-ai',
    name: 'Multimodal & Vision Site Audits',
    slug: 'multimodal-vision-audits',
    description: 'Analyze page screenshots and DOM structures for Core Web Vitals (LCP/CLS) and visual hierarchy.',
    position: 2,
    isActive: true,
  },
  {
    id: 'sub-schema-crawl',
    parentCategoryId: 'cat-technical-seo',
    name: 'Schema & Bot Directives',
    slug: 'schema-bot-directives',
    description: 'JSON-LD structured data generators, AI crawler robots.txt matrices, and Next.js metadata code.',
    position: 1,
    isActive: true,
  },
];

export const INITIAL_TOOLS: SeoTool[] = [
  {
    id: 'tool-serp-sim',
    name: 'SERP Pixel-Width Simulator & Snippet Counter',
    slug: 'serp-pixel-simulator',
    componentKey: 'serp-simulator',
    shortDescription: 'Measure exact Arial 20px/14px pixel widths for Google Desktop & Mobile SERPs with truncation alerts.',
    fullDescription: 'Zero-latency browser simulator that calculates exact pixel widths using Google SERP typography metrics (600px title cap, 960px desktop / 680px mobile description cap) and previews rich snippets.',
    categoryId: 'cat-onpage-client',
    subcategoryId: 'sub-serp-meta',
    executionMode: 'client',
    position: 1,
    isActive: true,
    schemaType: 'SoftwareApplication',
    canonicalPath: '/tools/serp-pixel-simulator',
    avgLatencyMs: 0,
    costPerRunUsd: 0,
  },
  {
    id: 'tool-meta-gen',
    name: 'Meta Tag, OpenGraph & Social Card Generator',
    slug: 'meta-opengraph-generator',
    componentKey: 'meta-tag-generator',
    shortDescription: 'Generate production HTML meta tags, OpenGraph cards, Twitter cards, and Next.js 15 Metadata objects.',
    fullDescription: 'Client-side generator for SEO meta tags, canonical links, robot indexing directives, OpenGraph properties, and Next.js 15 App Router generateMetadata() TypeScript definitions.',
    categoryId: 'cat-onpage-client',
    subcategoryId: 'sub-serp-meta',
    executionMode: 'client',
    position: 2,
    isActive: true,
    schemaType: 'SoftwareApplication',
    canonicalPath: '/tools/meta-opengraph-generator',
    avgLatencyMs: 0,
    costPerRunUsd: 0,
  },
  {
    id: 'tool-keyword-density',
    name: 'N-Gram Keyword Density & Readability Analyzer',
    slug: 'keyword-density-analyzer',
    componentKey: 'keyword-density-Readability',
    shortDescription: 'Instant 1-gram, 2-gram, and 3-gram frequency analysis with Flesch reading ease & over-optimization flags.',
    fullDescription: 'Zero-cost browser text analyzer that extracts 1-word, 2-word, and 3-word phrases, calculates TF ratios, checks keyword stuffing thresholds, and scores reading complexity.',
    categoryId: 'cat-onpage-client',
    subcategoryId: 'sub-content-micro',
    executionMode: 'client',
    position: 3,
    isActive: true,
    schemaType: 'SoftwareApplication',
    canonicalPath: '/tools/keyword-density-analyzer',
    avgLatencyMs: 0,
    costPerRunUsd: 0,
  },
  {
    id: 'tool-schema-builder',
    name: 'Interactive JSON-LD Schema Markup Builder',
    slug: 'json-ld-schema-builder',
    componentKey: 'schema-builder',
    shortDescription: 'Visual generator for FAQPage, Article, Product, SoftwareApplication, and LocalBusiness JSON-LD.',
    fullDescription: 'Client-side structured data composer with real-time Google Rich Result property verification and instant script tag or Next.js JSON-LD component export.',
    categoryId: 'cat-technical-seo',
    subcategoryId: 'sub-schema-crawl',
    executionMode: 'client',
    position: 1,
    isActive: true,
    schemaType: 'SoftwareApplication',
    canonicalPath: '/tools/json-ld-schema-builder',
    avgLatencyMs: 0,
    costPerRunUsd: 0,
  },
  {
    id: 'tool-robots-gen',
    name: 'Robots.txt & AI Crawler Governance Generator',
    slug: 'robots-txt-generator',
    componentKey: 'robots-generator',
    shortDescription: 'Configure crawl directives for Googlebot, GPTBot, Google-Extended, ClaudeBot, and XML sitemaps.',
    fullDescription: 'Granular robots.txt matrix builder with presets for managing search engine indexation alongside LLM training and AI search user-agents.',
    categoryId: 'cat-technical-seo',
    subcategoryId: 'sub-schema-crawl',
    executionMode: 'client',
    position: 2,
    isActive: true,
    schemaType: 'SoftwareApplication',
    canonicalPath: '/tools/robots-txt-generator',
    avgLatencyMs: 0,
    costPerRunUsd: 0,
  },
  {
    id: 'tool-ai-geo',
    name: 'AI Overview (GEO) Citation & Entity Optimizer',
    slug: 'ai-overview-geo-optimizer',
    componentKey: 'ai-geo-optimizer',
    shortDescription: 'Restructure content for Google AI Overviews with 45-word citation blocks and missing entity injection.',
    fullDescription: 'Powered by Gemini with strict responseSchema at temperature 0.2. Evaluates draft copy against target queries, outputs a direct citation snippet, identifies missing knowledge-graph entities, and constructs FAQ pairs.',
    categoryId: 'cat-gemini-ai',
    subcategoryId: 'sub-geo-ai',
    executionMode: 'gemini-ai',
    position: 1,
    isActive: true,
    schemaType: 'WebApplication',
    canonicalPath: '/tools/ai-overview-geo-optimizer',
    avgLatencyMs: 1180,
    costPerRunUsd: 0.00018,
    temperature: 0.2,
    modelName: 'gemini-3.8-flash',
  },
  {
    id: 'tool-ai-keywords',
    name: 'Missing Keyword Discovery & Intent Cluster Engine',
    slug: 'ai-keyword-intent-clusters',
    componentKey: 'ai-keyword-clusters',
    shortDescription: 'Generate semantic keyword clusters mapped to Search Intent, SERP features, and content gaps.',
    fullDescription: 'Uses deterministic Gemini JSON schemas to uncover semantic keyword clusters, classify search intent nuances, identify competitor content gaps, and suggest internal link anchor texts.',
    categoryId: 'cat-gemini-ai',
    subcategoryId: 'sub-geo-ai',
    executionMode: 'gemini-ai',
    position: 2,
    isActive: true,
    schemaType: 'WebApplication',
    canonicalPath: '/tools/ai-keyword-intent-clusters',
    avgLatencyMs: 1320,
    costPerRunUsd: 0.00022,
    temperature: 0.2,
    modelName: 'gemini-3.8-flash',
  },
  {
    id: 'tool-ai-vision-audit',
    name: 'Multimodal Visual Site Audit & CWV Analyzer',
    slug: 'ai-multimodal-site-audit',
    componentKey: 'ai-visual-audit',
    shortDescription: 'Upload a page screenshot or HTML snippet for Gemini Vision analysis of LCP, CLS, UX, and heading hierarchy.',
    fullDescription: 'Multimodal Gemini engine that inspects above-the-fold page screenshots and DOM markup to pinpoint Core Web Vitals bottlenecks, visual clutter, heading hierarchy issues, and remediation code.',
    categoryId: 'cat-gemini-ai',
    subcategoryId: 'sub-vision-audit',
    executionMode: 'gemini-ai',
    position: 1,
    isActive: true,
    schemaType: 'WebApplication',
    canonicalPath: '/tools/ai-multimodal-site-audit',
    avgLatencyMs: 1640,
    costPerRunUsd: 0.00031,
    temperature: 0.15,
    modelName: 'gemini-3.8-flash',
  },
  {
    id: 'tool-ai-schema-architect',
    name: 'Automated AI JSON-LD & Next.js Metadata Architect',
    slug: 'ai-schema-metadata-architect',
    componentKey: 'ai-schema-architect',
    shortDescription: 'Convert unstructured page copy into nested Schema.org JSON-LD and Next.js 15 generateMetadata() code.',
    fullDescription: 'Extracts named entities, pricing, authorship, and FAQs from raw text to synthesize valid @graph JSON-LD structured data and ready-to-paste Next.js 15 App Router metadata TypeScript.',
    categoryId: 'cat-technical-seo',
    subcategoryId: 'sub-schema-crawl',
    executionMode: 'gemini-ai',
    position: 3,
    isActive: true,
    schemaType: 'WebApplication',
    canonicalPath: '/tools/ai-schema-metadata-architect',
    avgLatencyMs: 1210,
    costPerRunUsd: 0.00019,
    temperature: 0.1,
    modelName: 'gemini-3.8-flash',
    thinkingLevel: 'HIGH',
  },
  {
    id: 'tool-sitemap-hreflang',
    name: 'XML Sitemap & Hreflang Matrix Generator',
    slug: 'xml-sitemap-hreflang-generator',
    componentKey: 'sitemap-hreflang-generator',
    shortDescription: 'Generate localized XML sitemaps with xhtml:link hreflang alternates and Next.js 15 app/sitemap.ts code.',
    fullDescription: 'Zero-latency international SEO builder that compiles valid XML sitemaps with x-default and regional hreflang annotations alongside Next.js 15 MetadataRoute.Sitemap TypeScript exports.',
    categoryId: 'cat-technical-seo',
    subcategoryId: 'sub-schema-crawl',
    executionMode: 'client',
    position: 4,
    isActive: true,
    schemaType: 'SoftwareApplication',
    canonicalPath: '/tools/xml-sitemap-hreflang-generator',
    avgLatencyMs: 0,
    costPerRunUsd: 0,
  },
  {
    id: 'tool-redirect-builder',
    name: 'Next.js 15 & Edge 301/308 Redirect Rule Builder',
    slug: 'redirect-rule-builder',
    componentKey: 'redirect-rule-builder',
    shortDescription: 'Compile bulk legacy URLs into Next.js next.config.ts redirects, Vercel JSON, and Apache .htaccess rules.',
    fullDescription: 'Client-side migration utility that validates source-to-destination URL mappings, detects redirect loops, and outputs permanent 308/301 rules for Next.js 15 App Router and edge servers.',
    categoryId: 'cat-technical-seo',
    subcategoryId: 'sub-schema-crawl',
    executionMode: 'client',
    position: 5,
    isActive: true,
    schemaType: 'SoftwareApplication',
    canonicalPath: '/tools/redirect-rule-builder',
    avgLatencyMs: 0,
    costPerRunUsd: 0,
  },
  {
    id: 'tool-ai-autonomous',
    name: 'Autonomous Multi-Step SEO & Next.js 15 Architect',
    slug: 'autonomous-seo-nextjs-architect',
    componentKey: 'ai-autonomous-agent',
    shortDescription: 'High-thinking multi-step agent that plans programmatic URL taxonomies, ISR caching, and Next.js 15 code.',
    fullDescription: 'Autonomous AI SEO Agent powered by gemini-3.8-flash with thinkingConfig: { thinkingLevel: "HIGH" } and strict responseSchema. Executes multi-step architectural planning and generates complete Next.js 15 App Router programmatic SEO implementations.',
    categoryId: 'cat-gemini-ai',
    subcategoryId: 'sub-geo-ai',
    executionMode: 'gemini-ai',
    position: 3,
    isActive: true,
    schemaType: 'WebApplication',
    canonicalPath: '/tools/autonomous-seo-nextjs-architect',
    avgLatencyMs: 1850,
    costPerRunUsd: 0.00029,
    temperature: 0.2,
    modelName: 'gemini-3.8-flash',
    thinkingLevel: 'HIGH',
  },
];

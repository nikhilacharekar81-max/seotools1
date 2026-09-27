import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel, GenerateContentResponse } from '@google/genai';
import {
  INITIAL_CATEGORIES,
  INITIAL_SUBCATEGORIES,
  INITIAL_TOOLS,
  MainCategory,
  Subcategory,
  SeoTool,
  RateLimitConfig,
  ApiMetricLog,
} from './src/types/seo.ts';

dotenv.config();

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), '.data');
const STATE_FILE = path.join(DATA_DIR, 'platform-state.json');

interface PersistedState {
  categories: MainCategory[];
  subcategories: Subcategory[];
  tools: SeoTool[];
  rateLimitConfig: RateLimitConfig;
  metrics: ApiMetricLog[];
}

const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequestsPerWindow: 20,
  windowSeconds: 60,
  cacheTtlSeconds: 3600,
  enableCaching: true,
  modelSelection: 'gemini-3.8-flash',
  defaultTemperature: 0.2,
};

const INITIAL_METRICS: ApiMetricLog[] = [
  {
    id: 'log-seed-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    toolSlug: 'ai-overview-geo-optimizer',
    toolName: 'AI Overview (GEO) Citation & Entity Optimizer',
    model: 'gemini-3.8-flash',
    latencyMs: 1142,
    cached: false,
    status: 'success',
    estimatedTokens: 940,
    estimatedCostUsd: 0.00018,
  },
  {
    id: 'log-seed-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    toolSlug: 'ai-keyword-intent-clusters',
    toolName: 'Missing Keyword Discovery & Intent Cluster Engine',
    model: 'gemini-3.8-flash',
    latencyMs: 1285,
    cached: false,
    status: 'success',
    estimatedTokens: 1120,
    estimatedCostUsd: 0.00022,
  },
  {
    id: 'log-seed-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    toolSlug: 'ai-overview-geo-optimizer',
    toolName: 'AI Overview (GEO) Citation & Entity Optimizer',
    model: 'gemini-3.8-flash',
    latencyMs: 4,
    cached: true,
    status: 'success',
    estimatedTokens: 0,
    estimatedCostUsd: 0,
  },
];

function loadState(): PersistedState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed.categories && parsed.subcategories && parsed.tools) {
        const existingIds = new Set(parsed.tools.map((t) => t.id));
        const missingDefaults = INITIAL_TOOLS.filter((t) => !existingIds.has(t.id));
        if (missingDefaults.length > 0) {
          parsed.tools = [...parsed.tools, ...missingDefaults];
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read persisted state, using defaults:', err);
  }
  return {
    categories: INITIAL_CATEGORIES,
    subcategories: INITIAL_SUBCATEGORIES,
    tools: INITIAL_TOOLS,
    rateLimitConfig: DEFAULT_RATE_LIMIT_CONFIG,
    metrics: INITIAL_METRICS,
  };
}

function saveState(state: PersistedState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write persisted state:', err);
  }
}

const state: PersistedState = loadState();

// In-memory Response Cache (Upstash Redis equivalent in local runtime)
interface CacheEntry {
  data: unknown;
  expiresAt: number;
  createdAt: number;
}
const responseCache = new Map<string, CacheEntry>();

// Sliding Window Rate Limiter per IP
const requestTimestampsByIp = new Map<string, number[]>();

function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
} {
  const now = Date.now();
  const windowMs = state.rateLimitConfig.windowSeconds * 1000;
  const maxReq = state.rateLimitConfig.maxRequestsPerWindow;

  const history = (requestTimestampsByIp.get(ip) || []).filter(
    (ts) => now - ts < windowMs
  );

  if (history.length >= maxReq) {
    const oldest = history[0] || now;
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    requestTimestampsByIp.set(ip, history);
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  history.push(now);
  requestTimestampsByIp.set(ip, history);
  return {
    allowed: true,
    remaining: Math.max(0, maxReq - history.length),
    resetInSeconds: state.rateLimitConfig.windowSeconds,
  };
}

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function recordMetric(log: Omit<ApiMetricLog, 'id' | 'timestamp'>) {
  const entry: ApiMetricLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...log,
  };
  state.metrics = [entry, ...state.metrics.slice(0, 99)];

  // Also update rolling average latency on the tool if uncached success
  if (!log.cached && log.status === 'success') {
    const tool = state.tools.find((t) => t.slug === log.toolSlug);
    if (tool) {
      tool.avgLatencyMs = Math.round((tool.avgLatencyMs + log.latencyMs) / 2);
    }
  }
  saveState(state);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // --- ADMIN & TAXONOMY ROUTES ---
  app.get('/api/admin/state', (_req, res) => {
    const now = Date.now();
    let validCacheEntries = 0;
    responseCache.forEach((value, key) => {
      if (value.expiresAt > now) {
        validCacheEntries++;
      } else {
        responseCache.delete(key);
      }
    });

    res.json({
      categories: state.categories,
      subcategories: state.subcategories,
      tools: state.tools,
      rateLimitConfig: state.rateLimitConfig,
      metrics: state.metrics,
      cacheStats: {
        activeKeys: validCacheEntries,
      },
    });
  });

  app.put('/api/admin/taxonomy', (req, res) => {
    const { categories, subcategories, tools } = req.body;
    if (Array.isArray(categories)) state.categories = categories;
    if (Array.isArray(subcategories)) state.subcategories = subcategories;
    if (Array.isArray(tools)) state.tools = tools;
    saveState(state);
    res.json({
      categories: state.categories,
      subcategories: state.subcategories,
      tools: state.tools,
    });
  });

  app.put('/api/admin/ratelimit', (req, res) => {
    const nextConfig: Partial<RateLimitConfig> = req.body;
    state.rateLimitConfig = {
      ...state.rateLimitConfig,
      ...nextConfig,
    };
    saveState(state);
    res.json({ rateLimitConfig: state.rateLimitConfig });
  });

  app.post('/api/admin/cache/clear', (_req, res) => {
    const clearedCount = responseCache.size;
    responseCache.clear();
    res.json({ clearedCount, activeKeys: 0 });
  });

  app.post('/api/admin/taxonomy/reset', (_req, res) => {
    state.categories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
    state.subcategories = JSON.parse(JSON.stringify(INITIAL_SUBCATEGORIES));
    state.tools = JSON.parse(JSON.stringify(INITIAL_TOOLS));
    saveState(state);
    res.json({
      categories: state.categories,
      subcategories: state.subcategories,
      tools: state.tools,
    });
  });

  // Helper wrapper for Gemini AI execution with Rate Limiting, Caching, and Schema enforcement
  async function executeGeminiTool(
    req: express.Request,
    res: express.Response,
    options: {
      toolSlug: string;
      toolName: string;
      cachePayload: unknown;
      temperature?: number;
      runModel: (ai: GoogleGenAI, model: string, temperature: number) => Promise<GenerateContentResponse>;
    }
  ) {
    const startTime = Date.now();
    const ip = req.ip || '127.0.0.1';
    const model = 'gemini-3.8-flash';
    const temperature =
      options.temperature ?? state.rateLimitConfig.defaultTemperature ?? 0.2;

    // 1. Check Cache first if enabled
    const cacheHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ slug: options.toolSlug, payload: options.cachePayload }))
      .digest('hex');

    if (state.rateLimitConfig.enableCaching) {
      const hit = responseCache.get(cacheHash);
      if (hit && hit.expiresAt > Date.now()) {
        const latencyMs = Math.max(1, Date.now() - startTime);
        res.setHeader('X-Cache-Status', 'HIT');
        recordMetric({
          toolSlug: options.toolSlug,
          toolName: options.toolName,
          model,
          latencyMs,
          cached: true,
          status: 'success',
          estimatedTokens: 0,
          estimatedCostUsd: 0,
        });
        return res.json({
          result: hit.data,
          meta: {
            cached: true,
            latencyMs,
            model,
            temperature,
          },
        });
      }
    }

    // 2. Check Sliding-Window Rate Limit
    const rl = checkRateLimit(ip);
    res.setHeader('X-RateLimit-Limit', String(state.rateLimitConfig.maxRequestsPerWindow));
    res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
    res.setHeader('X-RateLimit-Reset', String(rl.resetInSeconds));

    if (!rl.allowed) {
      recordMetric({
        toolSlug: options.toolSlug,
        toolName: options.toolName,
        model,
        latencyMs: Date.now() - startTime,
        cached: false,
        status: 'rate_limited',
        estimatedTokens: 0,
        estimatedCostUsd: 0,
      });
      return res.status(429).json({
        error: `Rate limit exceeded (${state.rateLimitConfig.maxRequestsPerWindow} requests per ${state.rateLimitConfig.windowSeconds}s window). Try again in ${rl.resetInSeconds}s or adjust limits in the Admin Suite.`,
      });
    }

    // 3. Execute Gemini API with strict responseSchema
    try {
      const ai = getGeminiClient();
      const response = await options.runModel(ai, model, temperature);
      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText.trim());
      const latencyMs = Date.now() - startTime;
      const estimatedTokens = Math.max(250, Math.round(rawText.length / 3.5));
      const estimatedCostUsd = Number((estimatedTokens * 0.0000002).toFixed(6));

      if (state.rateLimitConfig.enableCaching) {
        responseCache.set(cacheHash, {
          data: parsed,
          createdAt: Date.now(),
          expiresAt: Date.now() + state.rateLimitConfig.cacheTtlSeconds * 1000,
        });
      }

      res.setHeader('X-Cache-Status', 'MISS');
      recordMetric({
        toolSlug: options.toolSlug,
        toolName: options.toolName,
        model,
        latencyMs,
        cached: false,
        status: 'success',
        estimatedTokens,
        estimatedCostUsd,
      });

      return res.json({
        result: parsed,
        meta: {
          cached: false,
          latencyMs,
          model,
          temperature,
          remainingQuota: rl.remaining,
        },
      });
    } catch (error: unknown) {
      const latencyMs = Date.now() - startTime;
      const message =
        error instanceof Error ? error.message : 'Unexpected Gemini API error';
      recordMetric({
        toolSlug: options.toolSlug,
        toolName: options.toolName,
        model,
        latencyMs,
        cached: false,
        status: 'error',
        estimatedTokens: 0,
        estimatedCostUsd: 0,
      });
      return res.status(500).json({ error: message });
    }
  }

  // --- 1. AI OVERVIEW & GEO OPTIMIZER ---
  app.post('/api/ai/geo-optimize', async (req, res) => {
    const { targetQuery, draftContent, targetUrl } = req.body;
    if (!targetQuery || !draftContent) {
      return res
        .status(400)
        .json({ error: 'Both targetQuery and draftContent are required.' });
    }

    await executeGeminiTool(req, res, {
      toolSlug: 'ai-overview-geo-optimizer',
      toolName: 'AI Overview (GEO) Citation & Entity Optimizer',
      cachePayload: { targetQuery, draftContent, targetUrl },
      temperature: 0.2,
      runModel: async (ai, model, temperature) => {
        return ai.models.generateContent({
          model,
          contents: `Analyze the following content draft for Google AI Overviews (Generative Engine Optimization / GEO) and LLM citation readiness.
Target Search Query: "${targetQuery}"
Target URL Context: "${targetUrl || 'https://example.com/guide'}"
Draft Content:
"""
${draftContent}
"""
Provide:
1. A readinessScore (0-100) based on factual density, direct answer clarity, and entity completeness.
2. A directAnswerSnippet (strictly 40-55 words) written in an objective, encyclopedic style optimized to be quoted directly at the top of an AI Overview.
3. SnippetWordCount (exact integer word count of directAnswerSnippet).
4. citationWorthinessAnalysis explaining why LLMs will or will not cite the original draft.
5. missingEntities: 4-6 specific Knowledge Graph entities, standards, metrics, or technical concepts missing from the draft.
6. structuredKeyTakeaways: 4-5 high-signal bullet points with concrete metrics/mechanisms.
7. faqPairsForAiOverviews: 3 conversational follow-up Q&A pairs matching People Also Ask & AI Overview follow-up intents.
8. technicalGeoRecommendations: 3-4 technical markup or formatting actions.`,
          config: {
            systemInstruction:
              'You are a Principal Technical SEO & Generative Engine Optimization (GEO) Architect. Output strictly deterministic JSON matching the schema.',
            temperature,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                readinessScore: {
                  type: Type.NUMBER,
                  description: 'GEO citation readiness score from 0 to 100.',
                },
                directAnswerSnippet: {
                  type: Type.STRING,
                  description:
                    '40 to 55 word direct citation block engineered for Google AI Overviews.',
                },
                SnippetWordCount: {
                  type: Type.INTEGER,
                  description: 'Word count of the directAnswerSnippet.',
                },
                citationWorthinessAnalysis: {
                  type: Type.STRING,
                  description: 'Diagnostic critique of factual density and authority.',
                },
                missingEntities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      entity: { type: Type.STRING },
                      category: { type: Type.STRING },
                      reasonToInclude: { type: Type.STRING },
                    },
                    required: ['entity', 'category', 'reasonToInclude'],
                  },
                },
                structuredKeyTakeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                faqPairsForAiOverviews: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      conciseAnswer: { type: Type.STRING },
                    },
                    required: ['question', 'conciseAnswer'],
                  },
                },
                technicalGeoRecommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'readinessScore',
                'directAnswerSnippet',
                'SnippetWordCount',
                'citationWorthinessAnalysis',
                'missingEntities',
                'structuredKeyTakeaways',
                'faqPairsForAiOverviews',
                'technicalGeoRecommendations',
              ],
            },
          },
        });
      },
    });
  });

  // --- 2. MISSING KEYWORD DISCOVERY & SEMANTIC CLUSTERS ---
  app.post('/api/ai/keyword-clusters', async (req, res) => {
    const { seedTopic, audienceContext, existingKeywords } = req.body;
    if (!seedTopic) {
      return res.status(400).json({ error: 'seedTopic is required.' });
    }

    await executeGeminiTool(req, res, {
      toolSlug: 'ai-keyword-intent-clusters',
      toolName: 'Missing Keyword Discovery & Intent Cluster Engine',
      cachePayload: { seedTopic, audienceContext, existingKeywords },
      temperature: 0.2,
      runModel: async (ai, model, temperature) => {
        return ai.models.generateContent({
          model,
          contents: `Perform deep semantic keyword clustering and missing topic gap discovery for:
Seed Topic: "${seedTopic}"
Target Audience / Niche: "${audienceContext || 'B2B & Technical Practitioners'}"
Already Covered Keywords (to find gaps around): "${existingKeywords || 'None specified'}"

Generate 4 distinct semantic clusters covering Informational, Commercial, Transactional, and Navigational/Comparison search intents, with 4 specific high-intent keywords per cluster, plus semantic content gaps and internal linking anchor text suggestions.`,
          config: {
            systemInstruction:
              'You are an Enterprise Search Intent & Semantic Taxonomy Strategist. Return strictly valid JSON.',
            temperature,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                primaryTopic: { type: Type.STRING },
                overallSearchIntentSummary: { type: Type.STRING },
                clusters: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      clusterName: { type: Type.STRING },
                      dominantIntent: {
                        type: Type.STRING,
                        description:
                          'One of: Informational, Commercial, Transactional, Navigational',
                      },
                      difficultyEstimate: {
                        type: Type.STRING,
                        description: 'One of: Low, Medium, High',
                      },
                      targetSerpFeature: {
                        type: Type.STRING,
                        description:
                          'e.g., AI Overview, Featured Snippet, Comparison Table, FAQ Rich Result',
                      },
                      recommendedContentFormat: { type: Type.STRING },
                      keywords: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            term: { type: Type.STRING },
                            intentNuance: { type: Type.STRING },
                            suggestedTitleAngle: { type: Type.STRING },
                          },
                          required: ['term', 'intentNuance', 'suggestedTitleAngle'],
                        },
                      },
                    },
                    required: [
                      'clusterName',
                      'dominantIntent',
                      'difficultyEstimate',
                      'targetSerpFeature',
                      'recommendedContentFormat',
                      'keywords',
                    ],
                  },
                },
                semanticContentGaps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                internalLinkingAnchorSuggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'primaryTopic',
                'overallSearchIntentSummary',
                'clusters',
                'semanticContentGaps',
                'internalLinkingAnchorSuggestions',
              ],
            },
          },
        });
      },
    });
  });

  // --- 3. MULTIMODAL VISUAL SITE AUDIT & CWV ANALYZER ---
  app.post('/api/ai/visual-audit', async (req, res) => {
    const { pageContext, htmlSnippet, imageBase64, imageMimeType } = req.body;
    if (!pageContext && !htmlSnippet && !imageBase64) {
      return res.status(400).json({
        error: 'Provide pageContext, htmlSnippet, or a screenshot image for audit.',
      });
    }

    await executeGeminiTool(req, res, {
      toolSlug: 'ai-multimodal-site-audit',
      toolName: 'Multimodal Visual Site Audit & CWV Analyzer',
      cachePayload: {
        pageContext,
        htmlSnippet,
        imageHash: imageBase64 ? imageBase64.slice(0, 128) : null,
      },
      temperature: 0.15,
      runModel: async (ai, model, temperature) => {
        const parts: Array<
          | { text: string }
          | { inlineData: { mimeType: string; data: string } }
        > = [];

        if (imageBase64 && imageMimeType) {
          parts.push({
            inlineData: {
              mimeType: imageMimeType,
              data: imageBase64,
            },
          });
        }

        parts.push({
          text: `Perform a rigorous Technical SEO, Core Web Vitals (LCP, CLS, INP), and Visual Hierarchy audit on this webpage.
Page / URL Context: "${pageContext || 'Landing Page Audit'}"
HTML / DOM Snippet (if provided):
"""
${htmlSnippet || 'Analyze based on the visual screenshot and context provided.'}
"""
Evaluate:
1. overallTechnicalHealthScore (0-100)
2. lcpCandidateAnalysis: Identify the likely Largest Contentful Paint element and how to optimize its resource load (fetchpriority="high", preload, sizing).
3. clsRiskAssessment: Identify potential Cumulative Layout Shift triggers (un-sized media, dynamic banners, webfont FOUT).
4. aboveTheFoldClarity: Critique value proposition visibility, CTA contrast, and search intent match.
5. headingHierarchyEvaluation: Assess H1-H3 semantic structure.
6. detectedIssues: 4-6 prioritized engineering findings with concrete code or architectural remediation.
7. semanticHtmlChecklist: 5 key HTML/SEO checks with Pass/Warn/Fail status.`,
        });

        return ai.models.generateContent({
          model,
          contents: { parts },
          config: {
            systemInstruction:
              'You are a Senior Core Web Vitals & Technical SEO Auditor. Return strictly structured JSON.',
            temperature,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallTechnicalHealthScore: { type: Type.NUMBER },
                lcpCandidateAnalysis: { type: Type.STRING },
                clsRiskAssessment: { type: Type.STRING },
                aboveTheFoldClarity: { type: Type.STRING },
                headingHierarchyEvaluation: { type: Type.STRING },
                detectedIssues: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      severity: {
                        type: Type.STRING,
                        description: 'Critical, High, Medium, or Low',
                      },
                      category: {
                        type: Type.STRING,
                        description:
                          'Core Web Vitals, On-Page SEO, Accessibility, or CRO & UX',
                      },
                      finding: { type: Type.STRING },
                      remediationCodeOrAction: { type: Type.STRING },
                    },
                    required: [
                      'severity',
                      'category',
                      'finding',
                      'remediationCodeOrAction',
                    ],
                  },
                },
                semanticHtmlChecklist: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      element: { type: Type.STRING },
                      status: {
                        type: Type.STRING,
                        description: 'Pass, Warn, or Fail',
                      },
                      recommendation: { type: Type.STRING },
                    },
                    required: ['element', 'status', 'recommendation'],
                  },
                },
              },
              required: [
                'overallTechnicalHealthScore',
                'lcpCandidateAnalysis',
                'clsRiskAssessment',
                'aboveTheFoldClarity',
                'headingHierarchyEvaluation',
                'detectedIssues',
                'semanticHtmlChecklist',
              ],
            },
          },
        });
      },
    });
  });

  // --- 4. AUTOMATED AI JSON-LD & NEXT.JS METADATA ARCHITECT ---
  app.post('/api/ai/schema-architect', async (req, res) => {
    const { rawPageContent, pageUrl, preferredSchemaType } = req.body;
    if (!rawPageContent) {
      return res.status(400).json({ error: 'rawPageContent is required.' });
    }

    await executeGeminiTool(req, res, {
      toolSlug: 'ai-schema-metadata-architect',
      toolName: 'Automated AI JSON-LD & Next.js Metadata Architect',
      cachePayload: { rawPageContent, pageUrl, preferredSchemaType },
      temperature: 0.1,
      runModel: async (ai, model, temperature) => {
        return ai.models.generateContent({
          model,
          contents: `Extract structured entities from the following unstructured webpage content and synthesize:
1. A rich, nested Schema.org JSON-LD (@graph or primary type) string formatted with 2-space indentation.
2. Production-ready Next.js 15 App Router TypeScript code using generateMetadata() with canonical URLs, OpenGraph, Twitter Cards, and robots directives.

Page URL: "${pageUrl || 'https://indexpulse.dev/tools/seo-audit'}"
Preferred Schema Type: "${preferredSchemaType || 'Auto-Detect (@graph with WebPage + SoftwareApplication/Article + FAQPage)'}"
Raw Page Content:
"""
${rawPageContent}
"""`,
          config: {
            systemInstruction:
              'You are a Technical SEO Schema.org & Next.js 15 Architect. Output strictly valid JSON matching the responseSchema.',
            temperature,
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedPrimarySchemaType: { type: Type.STRING },
                entityExtractionSummary: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                jsonLdString: {
                  type: Type.STRING,
                  description:
                    'Complete formatted JSON-LD string ready to embed inside <script type="application/ld+json">',
                },
                nextJsGenerateMetadataCode: {
                  type: Type.STRING,
                  description:
                    'Complete TypeScript code for Next.js 15 generateMetadata() and JSON-LD script injection.',
                },
                seoValidationNotes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'detectedPrimarySchemaType',
                'entityExtractionSummary',
                'jsonLdString',
                'nextJsGenerateMetadataCode',
                'seoValidationNotes',
              ],
            },
          },
        });
      },
    });
  });

  // --- 5. AUTONOMOUS MULTI-STEP SEO & NEXT.JS 15 ARCHITECT (thinkingLevel: HIGH) ---
  app.post('/api/ai/autonomous-agent', async (req, res) => {
    const { projectBrief, domainScale, techConstraints } = req.body;
    if (!projectBrief) {
      return res.status(400).json({ error: 'projectBrief is required.' });
    }

    await executeGeminiTool(req, res, {
      toolSlug: 'autonomous-seo-nextjs-architect',
      toolName: 'Autonomous Multi-Step SEO & Next.js 15 Architect',
      cachePayload: { projectBrief, domainScale, techConstraints },
      temperature: 0.2,
      runModel: async (ai, model, temperature) => {
        return ai.models.generateContent({
          model,
          contents: `Execute a multi-step autonomous technical SEO architecture & Next.js 15 App Router implementation plan for:
Project / Migration Objective: "${projectBrief}"
Target Scale & Indexation Scope: "${domainScale || '10,000+ Programmatic Dynamic Routes'}"
Technical Constraints & Stack: "${techConstraints || 'Next.js 15 App Router, TypeScript, Prisma ORM, Upstash Redis ISR'}"

Provide:
1. architectureSummary: Executive technical synthesis of the programmatic SEO and rendering strategy.
2. multiStepReasoningPlan: 4-5 sequential architectural steps detailing phase, technicalDecision, and expectedSeoImpact.
3. programmaticUrlTaxonomy: 3-4 URL route patterns with targetSearchIntent, dynamicSchemaTypes, and isrRevalidationSeconds.
4. nextJs15AppRouterCode: Complete, production-ready Next.js 15 TypeScript route module including generateStaticParams(), generateMetadata(), and Server Component JSON-LD injection.
5. coreWebVitalsGuardrails: 4 concrete engineering assertions for LCP, INP, and zero CLS.`,
          config: {
            systemInstruction:
              'You are an Advanced Autonomous AI SEO Agent & Technical Full-Stack Architect specializing in Next.js 15 App Router, TypeScript, and programmatic SEO. Use deep multi-step reasoning and output strictly valid JSON matching responseSchema.',
            temperature,
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                architectureSummary: { type: Type.STRING },
                multiStepReasoningPlan: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.INTEGER },
                      phase: { type: Type.STRING },
                      technicalDecision: { type: Type.STRING },
                      expectedSeoImpact: { type: Type.STRING },
                    },
                    required: [
                      'stepNumber',
                      'phase',
                      'technicalDecision',
                      'expectedSeoImpact',
                    ],
                  },
                },
                programmaticUrlTaxonomy: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      routePattern: { type: Type.STRING },
                      targetSearchIntent: { type: Type.STRING },
                      dynamicSchemaTypes: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      isrRevalidationSeconds: { type: Type.INTEGER },
                    },
                    required: [
                      'routePattern',
                      'targetSearchIntent',
                      'dynamicSchemaTypes',
                      'isrRevalidationSeconds',
                    ],
                  },
                },
                nextJs15AppRouterCode: {
                  type: Type.STRING,
                  description:
                    'Complete runnable Next.js 15 App Router TypeScript file with generateStaticParams, generateMetadata, and JSON-LD.',
                },
                coreWebVitalsGuardrails: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'architectureSummary',
                'multiStepReasoningPlan',
                'programmaticUrlTaxonomy',
                'nextJs15AppRouterCode',
                'coreWebVitalsGuardrails',
              ],
            },
          },
        });
      },
    });
  });

  // Mount Vite dev server or static build
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IndexPulse SEO Platform & Admin Suite listening on http://localhost:${PORT}`);
  });
}

startServer();

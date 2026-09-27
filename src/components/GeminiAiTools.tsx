import React, { useState } from 'react';
import {
  Play,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Code2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import {
  GeoOptimizationResult,
  KeywordClusterResult,
  VisualAuditResult,
  AiSchemaArchitectResult,
  AiAutonomousAgentResult,
} from '../types/seo';

interface AiToolProps {
  onCompleted?: () => void;
}

interface ExecutionMeta {
  cached: boolean;
  latencyMs: number;
  model: string;
  temperature: number;
}

// ============================================================================
// 1. AI OVERVIEW (GEO) CITATION & ENTITY OPTIMIZER
// ============================================================================
export const AiGeoOptimizerTool: React.FC<AiToolProps> = ({ onCompleted }) => {
  const [targetQuery, setTargetQuery] = useState(
    'how to optimize next.js 15 core web vitals and programmatic seo'
  );
  const [targetUrl, setTargetUrl] = useState(
    'https://indexpulse.dev/guides/nextjs-15-core-web-vitals'
  );
  const [draftContent, setDraftContent] = useState(
    `Next.js 15 introduces improved caching semantics and React 19 server actions that help websites load faster. To improve SEO, developers should use generateMetadata to build dynamic titles and descriptions for each route. You should also optimize images with next/image so pages do not shift around while loading, and include structured data so search engines understand your pages better.`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeoOptimizationResult | null>(null);
  const [meta, setMeta] = useState<ExecutionMeta | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [showSchemaSpec, setShowSchemaSpec] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/geo-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetQuery, targetUrl, draftContent }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to run GEO analysis');
      }
      setResult(data.result);
      setMeta(data.meta);
      onCompleted?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Target Search Query / AI Overview Prompt
            </label>
            <input
              type="text"
              required
              value={targetQuery}
              onChange={(e) => setTargetQuery(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Canonical URL Context
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Existing Article / Landing Page Draft
            </label>
            <button
              type="button"
              onClick={() => setShowSchemaSpec(!showSchemaSpec)}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              {showSchemaSpec ? 'Hide responseSchema' : 'Inspect Gemini responseSchema'}
            </button>
          </div>
          <textarea
            rows={4}
            required
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            className="w-full p-3.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 leading-relaxed"
          />
        </div>

        {showSchemaSpec && (
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
            <code>{`// Server-Side @google/genai Configuration (Temperature: 0.2)
responseMimeType: "application/json",
responseSchema: {
  type: Type.OBJECT,
  properties: {
    readinessScore: { type: Type.NUMBER },
    directAnswerSnippet: { type: Type.STRING },
    SnippetWordCount: { type: Type.INTEGER },
    citationWorthinessAnalysis: { type: Type.STRING },
    missingEntities: { type: Type.ARRAY, items: { type: Type.OBJECT, ... } },
    structuredKeyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
    faqPairsForAiOverviews: { type: Type.ARRAY, items: { type: Type.OBJECT, ... } },
    technicalGeoRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
}`}</code>
          </pre>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            Model: gemini-3.8-flash · Temp: 0.2 · Strict JSON Schema
            {meta && (
              <span>
                {' '}
                · Last Run: {meta.latencyMs}ms ({meta.cached ? 'CACHE HIT' : 'LIVE API'})
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" />
            {loading ? 'Synthesizing GEO Audit...' : 'Run AI Overview (GEO) Optimizer'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 flex items-start gap-3 text-xs text-red-800 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-44 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          {/* Top Diagnostic Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
              <span className="text-xs text-slate-500">
                AI Overview Citation Readiness
              </span>
              <div className="my-3 flex items-baseline gap-2">
                <span className="text-4xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {result.readinessScore}
                </span>
                <span className="text-sm font-mono text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {result.citationWorthinessAnalysis}
              </p>
            </div>

            <div className="md:col-span-8 p-5 rounded-xl border border-emerald-600/30 bg-emerald-50/30 dark:bg-emerald-950/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  Engineered AI Overview Direct Answer Block ({result.SnippetWordCount} words)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(result.directAnswerSnippet);
                    setCopiedSnippet(true);
                    setTimeout(() => setCopiedSnippet(false), 1800);
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  {copiedSnippet ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedSnippet ? 'Copied Block' : 'Copy Citation Block'}
                </button>
              </div>
              <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                “{result.directAnswerSnippet}”
              </p>
              <div className="text-xs text-slate-500">
                Place this exact 40–55 word paragraph immediately below your primary H1 or H2 question heading for maximum passage indexing weight.
              </div>
            </div>
          </div>

          {/* Missing Knowledge Graph Entities Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Missing Knowledge Graph Entities & Technical Concepts
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500">
                    <th className="py-2.5 px-4 font-medium">Entity / Term</th>
                    <th className="py-2.5 px-4 font-medium">Semantic Category</th>
                    <th className="py-2.5 px-4 font-medium">Why LLMs Expect This Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {result.missingEntities.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                        {item.entity}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {item.category}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                        {item.reasonToInclude}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Takeaways & People Also Ask FAQs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                High-Signal Key Takeaways & Technical Actions
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4">
                {result.structuredKeyTakeaways.map((item, i) => (
                  <li key={i} className="leading-relaxed">
                    {item}
                  </li>
                ))}
                {result.technicalGeoRecommendations.map((rec, i) => (
                  <li key={`rec-${i}`} className="leading-relaxed text-emerald-700 dark:text-emerald-400">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Conversational Follow-Up Q&A Pairs (AI Overview Grounding)
              </h4>
              <div className="space-y-3">
                {result.faqPairsForAiOverviews.map((faq, i) => (
                  <div
                    key={i}
                    className="pb-3 border-b border-slate-100 dark:border-slate-800 last:border-none last:pb-0"
                  >
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      Q: {faq.question}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.conciseAnswer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. MISSING KEYWORD DISCOVERY & SEMANTIC CLUSTERS
// ============================================================================
export const AiKeywordClustersTool: React.FC<AiToolProps> = ({ onCompleted }) => {
  const [seedTopic, setSeedTopic] = useState(
    'Programmatic SEO with Next.js 15 and AI Structured Data'
  );
  const [audienceContext, setAudienceContext] = useState(
    'Full-stack engineers, SaaS founders, and technical SEO leads'
  );
  const [existingKeywords, setExistingKeywords] = useState(
    'nextjs seo, nextjs metadata, react server components seo'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<KeywordClusterResult | null>(null);
  const [meta, setMeta] = useState<ExecutionMeta | null>(null);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/keyword-clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedTopic, audienceContext, existingKeywords }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate clusters');
      setResult(data.result);
      setMeta(data.meta);
      onCompleted?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleRun} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Primary Seed Topic / Pillar
            </label>
            <input
              type="text"
              required
              value={seedTopic}
              onChange={(e) => setSeedTopic(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Target Buyer / Audience Persona
            </label>
            <input
              type="text"
              value={audienceContext}
              onChange={(e) => setAudienceContext(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Existing Ranked Terms (To Exclude/Expand)
            </label>
            <input
              type="text"
              value={existingKeywords}
              onChange={(e) => setExistingKeywords(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Model: gemini-3.8-flash · Temp: 0.2
            {meta && (
              <span>
                {' '}
                · {meta.latencyMs}ms ({meta.cached ? 'CACHE HIT' : 'LIVE API'})
              </span>
            )}
          </span>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" />
            {loading ? 'Mapping Topic Taxonomy...' : 'Discover Missing Keyword Clusters'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 text-xs text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-52 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-52 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 mb-1">
              Taxonomy Strategy Summary · {result.primaryTopic}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {result.overallSearchIntentSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.clusters.map((cluster, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
              >
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    {cluster.dominantIntent} Intent · Difficulty: {cluster.difficultyEstimate} · SERP Target: {cluster.targetSerpFeature}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {cluster.clusterName}
                  </h4>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Recommended Asset: {cluster.recommendedContentFormat}
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800 pt-2">
                  {cluster.keywords.map((kw, kIdx) => (
                    <div key={kIdx} className="py-2 space-y-0.5">
                      <div className="text-xs font-mono font-medium text-slate-900 dark:text-slate-100">
                        {kw.term}
                      </div>
                      <div className="text-xs text-slate-500">
                        {kw.intentNuance} · Title: <span className="text-slate-700 dark:text-slate-300">{kw.suggestedTitleAngle}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Unaddressed Semantic Content Gaps
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                {result.semanticContentGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Recommended Internal Link Anchor Texts
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-xs font-mono text-slate-600 dark:text-slate-400">
                {result.internalLinkingAnchorSuggestions.map((anchor, i) => (
                  <li key={i}>{anchor}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. MULTIMODAL VISUAL SITE AUDIT & CWV ANALYZER
// ============================================================================
export const AiVisualAuditTool: React.FC<AiToolProps> = ({ onCompleted }) => {
  const [pageContext, setPageContext] = useState(
    'SaaS Pricing & Product Landing Page (Desktop 1440px Viewport)'
  );
  const [htmlSnippet, setHtmlSnippet] = useState(
    `<header><div class="logo">Brand</div></header>
<section class="hero">
  <img src="/hero-unoptimized-4mb.png" />
  <div class="heading">Welcome to Our Platform</div>
  <h1>Best AI Tool</h1>
  <h3>Sub-feature without H2</h3>
  <button>Click Here</button>
</section>`
  );
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VisualAuditResult | null>(null);
  const [meta, setMeta] = useState<ExecutionMeta | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Part = dataUrl.split(',')[1];
      setImageBase64(base64Part);
      setImageMimeType(file.type || 'image/png');
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/visual-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageContext,
          htmlSnippet,
          imageBase64,
          imageMimeType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      setResult(data.result);
      setMeta(data.meta);
      onCompleted?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Audit request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAudit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Page Type & Target Viewport Context
              </label>
              <input
                type="text"
                value={pageContext}
                onChange={(e) => setPageContext(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                DOM / HTML Markup Snippet (Optional with Screenshot)
              </label>
              <textarea
                rows={5}
                value={htmlSnippet}
                onChange={(e) => setHtmlSnippet(e.target.value)}
                className="w-full mt-1 p-3 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Multimodal Vision Input (Upload Above-the-Fold Screenshot)
              </label>
              <label className="flex flex-col items-center justify-center h-44 px-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-emerald-600 dark:hover:border-emerald-500 bg-white dark:bg-slate-900 transition-colors">
                {imageBase64 ? (
                  <div className="text-center space-y-2">
                    <ImageIcon className="w-6 h-6 mx-auto text-emerald-600" />
                    <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                      {imageName}
                    </div>
                    <div className="text-xs text-emerald-600">
                      Multimodal inlineData attached — Click to replace
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-1.5">
                    <Upload className="w-6 h-6 mx-auto text-slate-400" />
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Upload Page Screenshot (PNG, JPG, WebP)
                    </div>
                    <div className="text-xs text-slate-500">
                      Gemini Vision analyzes LCP hero elements, CLS layout shifts & CTA contrast
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Model: gemini-3.8-flash (Multimodal Vision + DOM) · Temp: 0.15
            {meta && (
              <span>
                {' '}
                · {meta.latencyMs}ms ({meta.cached ? 'CACHE HIT' : 'LIVE API'})
              </span>
            )}
          </span>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" />
            {loading ? 'Running Multimodal Audit...' : 'Run Visual & Core Web Vitals Audit'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 text-xs text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs text-slate-500">Technical & CWV Score</div>
              <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 my-1">
                {result.overallTechnicalHealthScore} / 100
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {result.headingHierarchyEvaluation}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                LCP (Largest Contentful Paint) Diagnosis
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {result.lcpCandidateAnalysis}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                CLS (Cumulative Layout Shift) Diagnosis
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {result.clsRiskAssessment}
              </p>
            </div>
          </div>

          {/* Prioritized Findings Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500">
                  <th className="py-2.5 px-4 font-medium">Severity</th>
                  <th className="py-2.5 px-4 font-medium">Subsystem</th>
                  <th className="py-2.5 px-4 font-medium">Diagnostic Finding</th>
                  <th className="py-2.5 px-4 font-medium">Engineering Fix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {result.detectedIssues.map((issue, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4 font-mono font-semibold">
                      <span
                        className={
                          issue.severity === 'Critical' || issue.severity === 'High'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {issue.category}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                      {issue.finding}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 dark:text-emerald-400">
                      {issue.remediationCodeOrAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. AUTOMATED AI JSON-LD & NEXT.JS 15 METADATA ARCHITECT
// ============================================================================
export const AiSchemaArchitectTool: React.FC<AiToolProps> = ({ onCompleted }) => {
  const [pageUrl, setPageUrl] = useState(
    'https://indexpulse.dev/tools/ai-overview-geo-optimizer'
  );
  const [preferredSchemaType, setPreferredSchemaType] = useState(
    '@graph combining SoftwareApplication + FAQPage + BreadcrumbList'
  );
  const [rawPageContent, setRawPageContent] = useState(
    `IndexPulse AI Overview Optimizer is a 100% free web application for technical SEO teams. Rated 4.9/5 by 148 search engineers. Built for Web browsers. Key FAQ: Does IndexPulse store my proprietary draft content? No, responses are cached ephemerally via SHA-256 hashes and rate-limited per IP. How do I export structured data? Copy the generated Next.js 15 generateMetadata TypeScript function directly into your app/layout.tsx or page.tsx.`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiSchemaArchitectResult | null>(null);
  const [meta, setMeta] = useState<ExecutionMeta | null>(null);
  const [activeTab, setActiveTab] = useState<'jsonld' | 'nextjs'>('jsonld');
  const [copied, setCopied] = useState(false);

  const handleSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/schema-architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPageContent,
          pageUrl,
          preferredSchemaType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Schema synthesis failed');
      setResult(data.result);
      setMeta(data.meta);
      onCompleted?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSynthesize} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Target Canonical URL
            </label>
            <input
              type="text"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Target Schema.org Graph Architecture
            </label>
            <input
              type="text"
              value={preferredSchemaType}
              onChange={(e) => setPreferredSchemaType(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Unstructured Page Copy, Product Specs, or Article Text
          </label>
          <textarea
            rows={4}
            required
            value={rawPageContent}
            onChange={(e) => setRawPageContent(e.target.value)}
            className="w-full p-3.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Model: gemini-3.8-flash · Temp: 0.1 (Strict Deterministic JSON-LD)
            {meta && (
              <span>
                {' '}
                · {meta.latencyMs}ms ({meta.cached ? 'CACHE HIT' : 'LIVE API'})
              </span>
            )}
          </span>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            {loading ? 'Generating Schema Graph...' : 'Synthesize JSON-LD & Next.js Metadata'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 text-xs text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Primary Graph Type:{' '}
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                {result.detectedPrimarySchemaType}
              </span>{' '}
              · Extracted {result.entityExtractionSummary.length} Entities
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('jsonld')}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    activeTab === 'jsonld'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  JSON-LD @graph
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('nextjs')}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    activeTab === 'nextjs'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Next.js 15 generateMetadata()
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  const textToCopy =
                    activeTab === 'jsonld'
                      ? result.jsonLdString
                      : result.nextJsGenerateMetadataCode;
                  navigator.clipboard.writeText(textToCopy);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[420px]">
            <code>
              {activeTab === 'jsonld'
                ? result.jsonLdString
                : result.nextJsGenerateMetadataCode}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. AUTONOMOUS MULTI-STEP SEO & NEXT.JS 15 ARCHITECT (thinkingLevel: HIGH)
// ============================================================================
export const AiAutonomousSeoAgentTool: React.FC<AiToolProps> = ({ onCompleted }) => {
  const [projectBrief, setProjectBrief] = useState(
    'Architect a Programmatic SEO hub for 25,000 B2B software integration comparison pages with zero CLS and sub-second LCP.'
  );
  const [domainScale, setDomainScale] = useState(
    '25,000 Dynamic Routes (/integrations/[source]/[target])'
  );
  const [techConstraints, setTechConstraints] = useState(
    'Next.js 15 App Router, TypeScript, Prisma PostgreSQL, Upstash Redis ISR, Schema.org @graph'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiAutonomousAgentResult | null>(null);
  const [meta, setMeta] = useState<ExecutionMeta | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/autonomous-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectBrief,
          domainScale,
          techConstraints,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Autonomous agent execution failed');
      setResult(data.result);
      setMeta(data.meta);
      onCompleted?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleRun} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Programmatic SEO Architecture / Migration Objective
          </label>
          <textarea
            rows={3}
            required
            value={projectBrief}
            onChange={(e) => setProjectBrief(e.target.value)}
            className="w-full p-3.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Route Scale & URL Pattern Scope
            </label>
            <input
              type="text"
              value={domainScale}
              onChange={(e) => setDomainScale(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Stack & Caching Constraints
            </label>
            <input
              type="text"
              value={techConstraints}
              onChange={(e) => setTechConstraints(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Model: gemini-3.8-flash · thinkingConfig: &#123; thinkingLevel: &apos;HIGH&apos; &#125; · Strict responseSchema
            {meta && (
              <span>
                {' '}
                · {meta.latencyMs}ms ({meta.cached ? 'CACHE HIT' : 'LIVE API'})
              </span>
            )}
          </span>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" />
            {loading ? 'Executing Multi-Step Reasoning...' : 'Run Autonomous SEO Architect'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 text-xs text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500 mb-1">
              Autonomous Multi-Step Architectural Synthesis
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {result.architectureSummary}
            </p>
          </div>

          {/* Multi-Step Reasoning Plan */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Multi-Step Reasoning Execution Plan (`thinkingLevel: HIGH`)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.multiStepReasoningPlan.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5"
                >
                  <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                    Step 0{step.stepNumber} · {step.phase}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {step.technicalDecision}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Impact: {step.expectedSeoImpact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Programmatic URL Taxonomy Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500">
                  <th className="py-2.5 px-4 font-medium">Next.js 15 Route Pattern</th>
                  <th className="py-2.5 px-4 font-medium">Search Intent</th>
                  <th className="py-2.5 px-4 font-medium">JSON-LD Graph Entities</th>
                  <th className="py-2.5 px-4 font-medium text-right">ISR Revalidate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {result.programmaticUrlTaxonomy.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {row.routePattern}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {row.targetSearchIntent}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-emerald-700 dark:text-emerald-400">
                      {row.dynamicSchemaTypes.join(' + ')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {row.isrRevalidationSeconds}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Generated Next.js 15 App Router Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Generated Next.js 15 App Router Implementation (`generateStaticParams` + `generateMetadata` + JSON-LD)
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(result.nextJs15AppRouterCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 1800);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied TypeScript' : 'Copy Next.js 15 Code'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[420px]">
              <code>{result.nextJs15AppRouterCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

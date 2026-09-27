import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Monitor,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

// Exact pixel measurement helper using offscreen canvas
function measureTextPixels(text: string, font: string): number {
  if (typeof document === 'undefined' || !text) return 0;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return text.length * 9;
  context.font = font;
  return Math.round(context.measureText(text).width);
}

// ============================================================================
// 1. SERP PIXEL-WIDTH SIMULATOR & SNIPPET COUNTER
// ============================================================================
export const SerpSimulatorTool: React.FC = () => {
  const [title, setTitle] = useState(
    'Next.js 15 Technical SEO Guide: Core Web Vitals & Programmatic Metadata'
  );
  const [description, setDescription] = useState(
    'Learn how to engineer sub-second LCP, zero CLS, dynamic generateMetadata() routes, and automated JSON-LD schema markup in Next.js 15 App Router.'
  );
  const [url, setUrl] = useState('https://indexpulse.dev/guides/nextjs-15-technical-seo');
  const [siteName, setSiteName] = useState('IndexPulse Engineering');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [showRating, setShowRating] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [showFaq, setShowFaq] = useState(false);

  const titlePx = useMemo(
    () => measureTextPixels(title, '20px Arial, sans-serif'),
    [title]
  );
  const descPx = useMemo(
    () => measureTextPixels(description, '14px Arial, sans-serif'),
    [description]
  );

  const maxTitlePx = 580;
  const maxDescPx = viewport === 'desktop' ? 960 : 680;

  const titleStatus =
    titlePx === 0
      ? 'Empty'
      : titlePx > maxTitlePx
      ? 'Truncated (>580px)'
      : titlePx < 260
      ? 'Too Short (<260px)'
      : 'Optimal Width';

  const descStatus =
    descPx === 0
      ? 'Empty'
      : descPx > maxDescPx
      ? `Truncated (>${maxDescPx}px)`
      : descPx < 400
      ? 'Underutilized (<400px)'
      : 'Optimal Width';

  const formattedBreadcrumb = useMemo(() => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const segments = parsed.pathname.split('/').filter(Boolean);
      return `${parsed.hostname}${segments.length ? ' › ' + segments.join(' › ') : ''}`;
    } catch {
      return url;
    }
  }, [url]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Controls */}
      <div className="lg:col-span-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Snippet Parameters & Pixel Telemetry
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setTitle(
                  'Free AI SEO Tools Suite: Zero-Latency SERP & Schema Generators'
                );
                setDescription(
                  'Test title pixel widths, build valid JSON-LD structured data, and optimize content for Google AI Overviews with zero serverless latency.'
                );
                setUrl('https://indexpulse.dev/tools/serp-pixel-simulator');
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium whitespace-nowrap"
            >
              Load SaaS Preset
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="serp-title-input"
              className="font-medium text-slate-700 dark:text-slate-300"
            >
              SEO Title Tag (`20px Arial` Canvas Metric)
            </label>
            <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
              {titlePx}px / {maxTitlePx}px · {title.length} chars · {titleStatus}
            </span>
          </div>
          <input
            id="serp-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter page title..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                titlePx > maxTitlePx
                  ? 'bg-red-600'
                  : titlePx < 260
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, Math.round((titlePx / maxTitlePx) * 100))}%` }}
            />
          </div>
        </div>

        {/* Meta Description Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="serp-desc-input"
              className="font-medium text-slate-700 dark:text-slate-300"
            >
              Meta Description (`14px Arial` Canvas Metric)
            </label>
            <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
              {descPx}px / {maxDescPx}px · {description.length} chars · {descStatus}
            </span>
          </div>
          <textarea
            id="serp-desc-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter meta description..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                descPx > maxDescPx
                  ? 'bg-red-600'
                  : descPx < 400
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, Math.round((descPx / maxDescPx) * 100))}%` }}
            />
          </div>
        </div>

        {/* URL & Site Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Canonical URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Brand / Site Name
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Rich Snippet Enhancers */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showRating}
              onChange={(e) => setShowRating(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>AggregateRating Stars</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showDate}
              onChange={(e) => setShowDate(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Published Date Prefix</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showFaq}
              onChange={(e) => setShowFaq(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>FAQ Rich Result Accordion</span>
          </label>
        </div>
      </div>

      {/* Right Column: Live Google SERP Preview */}
      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Live Google SERP Rendering
          </span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                viewport === 'desktop'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop (600px)
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                viewport === 'mobile'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile (380px)
            </button>
          </div>
        </div>

        {/* SERP Preview Container */}
        <div
          className={`p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all ${
            viewport === 'mobile' ? 'max-w-[400px]' : 'w-full'
          }`}
        >
          {/* Site Header */}
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {siteName.slice(0, 1).toUpperCase() || 'I'}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-slate-900 dark:text-slate-100 leading-tight truncate">
                {siteName || 'Example Site'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {formattedBreadcrumb}
              </div>
            </div>
          </div>

          {/* Clickable Blue Title */}
          <h4 className="text-[20px] leading-[1.3] font-normal text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-1 break-words">
            {titlePx > maxTitlePx ? `${title.slice(0, 58)}...` : title || 'Untitled Page'}
          </h4>

          {/* Description */}
          <p className="text-[14px] leading-[1.58] text-[#4d5156] dark:text-[#bdc1c6]">
            {showDate && (
              <span className="text-[#70757a] dark:text-[#9aa0a6]">
                Sep 27, 2026 —{' '}
              </span>
            )}
            {descPx > maxDescPx
              ? `${description.slice(0, viewport === 'desktop' ? 156 : 115)}...`
              : description || 'Provide a meta description to preview snippet output.'}
          </p>

          {/* Rating Rich Snippet */}
          {showRating && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#70757a] dark:text-[#9aa0a6]">
              <span className="text-amber-500 tracking-tighter">★★★★★</span>
              <span>Rating: 4.9 · ‎148 reviews · ‎Free</span>
            </div>
          )}

          {/* FAQ Rich Result Preview */}
          {showFaq && (
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="py-1 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60">
                <span>How does Google measure title tag truncation?</span>
                <span className="text-slate-400">▾</span>
              </div>
              <div className="py-1 flex justify-between items-center">
                <span>Does Next.js 15 generateMetadata() run on the server?</span>
                <span className="text-slate-400">▾</span>
              </div>
            </div>
          )}
        </div>

        {/* Diagnostic Summary */}
        <div className="p-4 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
            {titlePx <= maxTitlePx && descPx <= maxDescPx ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Truncation Detected Across Selected Viewport</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Pixel Overflow Warning — Adjust Copy to Prevent Ellipsis (...)</span>
              </>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Google truncates title links by rendered pixel width (`~580px–600px` in 20px Arial), not strictly by character count. Capital letters like `W`, `M`, and `G` consume up to 3x the pixel width of `i` or `l`.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. META TAG, OPENGRAPH & NEXT.JS 15 METADATA GENERATOR
// ============================================================================
export const MetaTagGeneratorTool: React.FC = () => {
  const [title, setTitle] = useState('IndexPulse — Enterprise AI SEO Platform');
  const [description, setDescription] = useState(
    'Zero-latency client SEO utilities and deterministic Gemini AI engines for technical search teams.'
  );
  const [canonicalUrl, setCanonicalUrl] = useState('https://indexpulse.dev/tools');
  const [ogImage, setOgImage] = useState('https://indexpulse.dev/og-cover.png');
  const [siteName, setSiteName] = useState('IndexPulse');
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsFollow, setRobotsFollow] = useState(true);
  const [outputMode, setOutputMode] = useState<'nextjs' | 'html'>('nextjs');
  const [copied, setCopied] = useState(false);

  const generatedCode = useMemo(() => {
    if (outputMode === 'nextjs') {
      return `import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify(description)},
    alternates: {
      canonical: ${JSON.stringify(canonicalUrl)},
    },
    robots: {
      index: ${robotsIndex},
      follow: ${robotsFollow},
      googleBot: {
        index: ${robotsIndex},
        follow: ${robotsFollow},
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: ${JSON.stringify(title)},
      description: ${JSON.stringify(description)},
      url: ${JSON.stringify(canonicalUrl)},
      siteName: ${JSON.stringify(siteName)},
      images: [
        {
          url: ${JSON.stringify(ogImage)},
          width: 1200,
          height: 630,
          alt: ${JSON.stringify(title)},
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ${JSON.stringify(title)},
      description: ${JSON.stringify(description)},
      images: [${JSON.stringify(ogImage)}],
    },
  };
}`;
    }

    const robotsValue = `${robotsIndex ? 'index' : 'noindex'}, ${
      robotsFollow ? 'follow' : 'nofollow'
    }, max-snippet:-1, max-image-preview:large`;

    return `<!-- Primary SEO Meta Tags -->
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${canonicalUrl}" />
<meta name="robots" content="${robotsValue}" />

<!-- OpenGraph / Facebook / LinkedIn -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:site_name" content="${siteName}" />
<meta property="og:image" content="${ogImage}" />

<!-- X / Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${ogImage}" />`;
  }, [title, description, canonicalUrl, ogImage, siteName, robotsIndex, robotsFollow, outputMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Page Title (`title` & `og:title`)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Meta Description (`description` & `og:description`)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Canonical URL
            </label>
            <input
              type="text"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              OpenGraph Image URL (1200×630)
            </label>
            <input
              type="text"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Site Name (`og:site_name`)
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="flex items-center gap-4 pb-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={robotsIndex}
                onChange={(e) => setRobotsIndex(e.target.checked)}
              />
              <span>Allow Indexing (`index`)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={robotsFollow}
                onChange={(e) => setRobotsFollow(e.target.checked)}
              />
              <span>Follow Links (`follow`)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setOutputMode('nextjs')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                outputMode === 'nextjs'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Next.js 15 App Router (TS)
            </button>
            <button
              type="button"
              onClick={() => setOutputMode('html')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                outputMode === 'html'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Standard HTML &lt;head&gt;
            </button>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[380px]">
          <code>{generatedCode}</code>
        </pre>
      </div>
    </div>
  );
};

// ============================================================================
// 3. N-GRAM KEYWORD DENSITY & READABILITY ANALYZER
// ============================================================================
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'your', 'are', 'was',
  'were', 'have', 'has', 'had', 'not', 'but', 'what', 'all', 'can', 'when',
  'there', 'use', 'each', 'which', 'how', 'their', 'will', 'other', 'about',
  'out', 'many', 'then', 'them', 'these', 'some', 'her', 'would', 'make',
  'like', 'him', 'into', 'time', 'look', 'two', 'more', 'write', 'see', 'number',
  'way', 'could', 'people', 'than', 'first', 'water', 'been', 'call', 'who',
  'oil', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come',
]);

export const KeywordDensityTool: React.FC = () => {
  const [content, setContent] = useState(
    `Technical SEO in Next.js 15 requires server-side rendering discipline, deterministic structured data, and Core Web Vitals optimization. When engineering programmatic SEO pages, use generateMetadata to inject canonical URLs and OpenGraph tags dynamically. Pair technical SEO architecture with semantic keyword clustering and JSON-LD schema markup so search engines and AI Overviews parse entity relationships accurately without layout shift.`
  );
  const [ngramSize, setNgramSize] = useState<1 | 2 | 3>(2);

  const analysis = useMemo(() => {
    const cleanText = content
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = cleanText ? cleanText.split(' ') : [];
    const totalWords = words.length;
    const sentences = content
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter(Boolean).length || 1;

    const counts = new Map<string, number>();

    for (let i = 0; i <= words.length - ngramSize; i++) {
      const slice = words.slice(i, i + ngramSize);
      if (ngramSize === 1 && (STOP_WORDS.has(slice[0]) || slice[0].length < 3)) {
        continue;
      }
      if (
        ngramSize > 1 &&
        slice.every((w) => STOP_WORDS.has(w) || w.length < 2)
      ) {
        continue;
      }
      const phrase = slice.join(' ');
      counts.set(phrase, (counts.get(phrase) || 0) + 1);
    }

    const sorted = Array.from(counts.entries())
      .map(([phrase, count]) => ({
        phrase,
        count,
        density: totalWords > 0 ? Number(((count * ngramSize) / totalWords * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    const avgWordsPerSentence = totalWords / sentences;
    const readingTimeSec = Math.ceil((totalWords / 220) * 60);

    return {
      totalWords,
      sentences,
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      readingTimeSec,
      sorted,
    };
  }, [content, ngramSize]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Source Copy / Article Draft
          </label>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {analysis.totalWords} words · {analysis.sentences} sentences · ~{analysis.readingTimeSec}s read
          </span>
        </div>
        <textarea
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste article copy or landing page text to analyze N-Gram frequency..."
          className="w-full p-3.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Extracted N-Gram Frequency & Stuffing Guardrails
          </span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNgramSize(n)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  ngramSize === n
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {n}-Gram
              </button>
            ))}
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500">
                <th className="py-2.5 px-4 font-medium">Term / Phrase</th>
                <th className="py-2.5 px-4 font-medium text-right">Occurrences</th>
                <th className="py-2.5 px-4 font-medium text-right">Density %</th>
                <th className="py-2.5 px-4 font-medium text-right">Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono tabular-nums">
              {analysis.sorted.map((item) => (
                <tr
                  key={item.phrase}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-2 px-4 font-sans font-medium text-slate-900 dark:text-slate-100">
                    {item.phrase}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-600 dark:text-slate-400">
                    {item.count}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-900 dark:text-slate-100">
                    {item.density}%
                  </td>
                  <td className="py-2 px-4 text-right font-sans">
                    {item.density > 4.5 ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        High Density
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Balanced
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {analysis.sorted.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-sans">
                    Enter text on the left to compute N-Gram distribution.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. INTERACTIVE JSON-LD SCHEMA MARKUP BUILDER
// ============================================================================
export const SchemaBuilderTool: React.FC = () => {
  const [schemaKind, setSchemaKind] = useState<'FAQPage' | 'SoftwareApplication' | 'Article'>('FAQPage');
  const [appName, setAppName] = useState('IndexPulse SEO Suite');
  const [appCategory, setAppCategory] = useState('BusinessApplication');
  const [appPrice, setAppPrice] = useState('0');
  const [articleHeadline, setArticleHeadline] = useState(
    'Programmatic SEO Architecture in Next.js 15'
  );
  const [articleAuthor, setArticleAuthor] = useState('IndexPulse Search Engineering');
  const [faqs, setFaqs] = useState([
    {
      question: 'How does client-side SEO tool execution reduce hosting costs?',
      answer:
        'By running pixel counters, regex parsers, and schema builders directly in the browser DOM, serverless compute invocations drop to zero.',
    },
    {
      question: 'Why enforce responseSchema in Gemini SEO pipelines?',
      answer:
        'Strict JSON schemas with temperature 0.2 guarantee deterministic keys and types that hydrate UI components without markdown parsing failures.',
    },
  ]);
  const [copied, setCopied] = useState(false);

  const jsonLdOutput = useMemo(() => {
    if (schemaKind === 'FAQPage') {
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        },
        null,
        2
      );
    }

    if (schemaKind === 'SoftwareApplication') {
      return JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: appName,
          applicationCategory: appCategory,
          operatingSystem: 'Web, All',
          offers: {
            '@type': 'Offer',
            price: appPrice,
            priceCurrency: 'USD',
          },
        },
        null,
        2
      );
    }

    return JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: articleHeadline,
        author: {
          '@type': 'Organization',
          name: articleAuthor,
        },
        datePublished: '2026-09-27',
        publisher: {
          '@type': 'Organization',
          name: 'IndexPulse',
        },
      },
      null,
      2
    );
  }, [schemaKind, faqs, appName, appCategory, appPrice, articleHeadline, articleAuthor]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
          {(['FAQPage', 'SoftwareApplication', 'Article'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSchemaKind(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                schemaKind === type
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {schemaKind === 'FAQPage' && (
          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Question #{idx + 1}
                  </span>
                  {faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                      className="text-xs text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => {
                    const next = [...faqs];
                    next[idx].question = e.target.value;
                    setFaqs(next);
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="Question..."
                />
                <textarea
                  rows={2}
                  value={item.answer}
                  onChange={(e) => {
                    const next = [...faqs];
                    next[idx].answer = e.target.value;
                    setFaqs(next);
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="Accepted Answer..."
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFaqs([
                  ...faqs,
                  {
                    question: 'What is Generative Engine Optimization (GEO)?',
                    answer:
                      'GEO structures factual claims, citations, and schema entities so AI Overviews surface your domain as a primary source.',
                  },
                ])
              }
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-600/30 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              <Plus className="w-3.5 h-3.5" />
              Add FAQ Pair
            </button>
          </div>
        )}

        {schemaKind === 'SoftwareApplication' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Application Name
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Application Category
                </label>
                <input
                  type="text"
                  value={appCategory}
                  onChange={(e) => setAppCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Price (USD)
                </label>
                <input
                  type="text"
                  value={appPrice}
                  onChange={(e) => setAppPrice(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {schemaKind === 'Article' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Article Headline (Max 110 chars recommended)
              </label>
              <input
                type="text"
                value={articleHeadline}
                onChange={(e) => setArticleHeadline(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Author / Organization Name
              </label>
              <input
                type="text"
                value={articleAuthor}
                onChange={(e) => setArticleAuthor(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Validated JSON-LD Script Output
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(
                `<script type="application/ld+json">\n${jsonLdOutput}\n</script>`
              );
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied <script>' : 'Copy JSON-LD Script'}
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[380px]">
          <code>{`<script type="application/ld+json">\n${jsonLdOutput}\n</script>`}</code>
        </pre>
      </div>
    </div>
  );
};

// ============================================================================
// 5. ROBOTS.TXT & AI CRAWLER GOVERNANCE GENERATOR
// ============================================================================
export const RobotsGeneratorTool: React.FC = () => {
  const [sitemapUrl, setSitemapUrl] = useState('https://indexpulse.dev/sitemap.xml');
  const [disallowPaths, setDisallowPaths] = useState('/api/\n/admin/\n/_next/');
  const [botRules, setBotRules] = useState<Record<string, 'allow' | 'disallow'>>({
    Googlebot: 'allow',
    Bingbot: 'allow',
    'OAI-SearchBot': 'allow',
    GPTBot: 'disallow',
    'Google-Extended': 'allow',
    ClaudeBot: 'disallow',
    CCBot: 'disallow',
  });
  const [copied, setCopied] = useState(false);

  const robotsTxt = useMemo(() => {
    const lines: string[] = [
      '# Generated by IndexPulse Technical SEO Suite',
      'User-agent: *',
      'Allow: /',
    ];
    disallowPaths
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((p) => lines.push(`Disallow: ${p}`));

    lines.push('');

    Object.entries(botRules).forEach(([bot, policy]) => {
      lines.push(`User-agent: ${bot}`);
      lines.push(policy === 'allow' ? 'Allow: /' : 'Disallow: /');
      lines.push('');
    });

    if (sitemapUrl.trim()) {
      lines.push(`Sitemap: ${sitemapUrl.trim()}`);
    }

    return lines.join('\n');
  }, [sitemapUrl, disallowPaths, botRules]);

  const handleDownload = () => {
    const blob = new Blob([robotsTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Search & AI User-Agent Access Matrix
          </span>
          <button
            type="button"
            onClick={() =>
              setBotRules({
                Googlebot: 'allow',
                Bingbot: 'allow',
                'OAI-SearchBot': 'allow',
                GPTBot: 'allow',
                'Google-Extended': 'allow',
                ClaudeBot: 'allow',
                CCBot: 'allow',
              })
            }
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Allow All AI Search Bots
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
          {Object.entries(botRules).map(([bot, status]) => (
            <div key={bot} className="flex items-center justify-between px-4 py-2.5 text-xs">
              <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                {bot}
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => setBotRules({ ...botRules, [bot]: 'allow' })}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    status === 'allow'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Allow
                </button>
                <button
                  type="button"
                  onClick={() => setBotRules({ ...botRules, [bot]: 'disallow' })}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    status === 'disallow'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Disallow
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Global Disallow Paths (One per line)
            </label>
            <textarea
              rows={3}
              value={disallowPaths}
              onChange={(e) => setDisallowPaths(e.target.value)}
              className="w-full mt-1 p-2.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              XML Sitemap URL
            </label>
            <input
              type="text"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              className="w-full mt-1 p-2.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Compiled `robots.txt` File
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(robotsTxt);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            >
              <Download className="w-3.5 h-3.5" />
              Download robots.txt
            </button>
          </div>
        </div>
        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[380px]">
          <code>{robotsTxt}</code>
        </pre>
      </div>
    </div>
  );
};

// ============================================================================
// 6. XML SITEMAP & HREFLANG MATRIX GENERATOR
// ============================================================================
export const SitemapHreflangGeneratorTool: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState('https://indexpulse.dev');
  const [routesInput, setRoutesInput] = useState(
    '/\n/tools/serp-pixel-simulator\n/tools/ai-overview-geo-optimizer\n/guides/nextjs-15-technical-seo'
  );
  const [locales, setLocales] = useState<string[]>(['en-US', 'en-GB', 'de-DE', 'ja-JP']);
  const [newLocale, setNewLocale] = useState('');
  const [changeFreq, setChangeFreq] = useState('weekly');
  const [priority, setPriority] = useState('0.8');
  const [format, setFormat] = useState<'xml' | 'nextjs'>('xml');
  const [copied, setCopied] = useState(false);

  const outputCode = useMemo(() => {
    const cleanBase = baseUrl.replace(/\/$/, '');
    const routes = routesInput
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => (r.startsWith('/') ? r : `/${r}`));

    if (format === 'nextjs') {
      return `// app/sitemap.ts — Next.js 15 App Router Programmatic Sitemap + Hreflang
import type { MetadataRoute } from 'next';

const BASE_URL = ${JSON.stringify(cleanBase)};
const LOCALES = ${JSON.stringify(locales)};
const ROUTES = ${JSON.stringify(routes, null, 2)};

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => {
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) {
      languages[locale] = \`\${BASE_URL}/\${locale.toLowerCase()}\${route === '/' ? '' : route}\`;
    }
    languages['x-default'] = \`\${BASE_URL}\${route}\`;

    return {
      url: \`\${BASE_URL}\${route}\`,
      lastModified: new Date(),
      changeFrequency: '${changeFreq}',
      priority: ${routePriority(priority)},
      alternates: {
        languages,
      },
    };
  });
}`;
    }

    const urlEntries = routes
      .map((route) => {
        const fullUrl = `${cleanBase}${route === '/' ? '' : route}`;
        const hreflangLinks = [
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${fullUrl}" />`,
          ...locales.map(
            (loc) =>
              `    <xhtml:link rel="alternate" hreflang="${loc}" href="${cleanBase}/${loc.toLowerCase()}${
                route === '/' ? '' : route
              }" />`
          ),
        ].join('\n');

        return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>2026-09-27</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${route === '/' ? '1.0' : priority}</priority>
${hreflangLinks}
  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
  }, [baseUrl, routesInput, locales, changeFreq, priority, format]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Canonical Root Domain
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Default Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="1.0">1.0 (Root)</option>
              <option value="0.9">0.9 (Pillar)</option>
              <option value="0.8">0.8 (Core Tool)</option>
              <option value="0.6">0.6 (Article)</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Route Paths (One per line)
            </label>
            <select
              value={changeFreq}
              onChange={(e) => setChangeFreq(e.target.value)}
              className="text-xs bg-transparent font-mono text-slate-600 dark:text-slate-400"
            >
              <option value="daily">changefreq: daily</option>
              <option value="weekly">changefreq: weekly</option>
              <option value="monthly">changefreq: monthly</option>
            </select>
          </div>
          <textarea
            rows={5}
            value={routesInput}
            onChange={(e) => setRoutesInput(e.target.value)}
            className="w-full mt-1 p-3 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Active Hreflang Locales (ISO 639-1 / ISO 3166-1) + automatic `x-default`
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {locales.map((loc) => (
              <div
                key={loc}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <span>{loc}</span>
                <button
                  type="button"
                  onClick={() => setLocales(locales.filter((l) => l !== loc))}
                  className="text-slate-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newLocale}
                onChange={(e) => setNewLocale(e.target.value)}
                placeholder="e.g., fr-FR"
                className="w-24 px-2.5 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => {
                  if (newLocale.trim() && !locales.includes(newLocale.trim())) {
                    setLocales([...locales, newLocale.trim()]);
                    setNewLocale('');
                  }
                }}
                className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-600 text-white"
              >
                + Locale
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setFormat('xml')}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                format === 'xml'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              XML Sitemap (`xhtml:link`)
            </button>
            <button
              type="button"
              onClick={() => setFormat('nextjs')}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                format === 'nextjs'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Next.js 15 `app/sitemap.ts`
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(outputCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[380px]">
          <code>{outputCode}</code>
        </pre>
      </div>
    </div>
  );
};

function routePriority(p: string): number {
  const parsed = parseFloat(p);
  return Number.isNaN(parsed) ? 0.8 : parsed;
}

// ============================================================================
// 7. NEXT.JS 15 & EDGE 301/308 REDIRECT RULE BUILDER
// ============================================================================
export const RedirectRuleBuilderTool: React.FC = () => {
  const [rulesInput, setRulesInput] = useState(
    `/blog/old-seo-checklist /guides/nextjs-15-technical-seo\n/tools/meta-generator /tools/meta-opengraph-generator\n/legacy/:slug* /guides/:slug*`
  );
  const [permanent, setPermanent] = useState(true);
  const [targetPlatform, setTargetPlatform] = useState<'nextjs' | 'vercel' | 'apache'>(
    'nextjs'
  );
  const [copied, setCopied] = useState(false);

  const parsedPairs = useMemo(() => {
    const rows = rulesInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\s+/);
        return {
          source: parts[0] || '/old',
          destination: parts[1] || '/new',
        };
      });

    const loopWarnings = rows.filter((r) => r.source === r.destination);
    return { rows, loopWarnings };
  }, [rulesInput]);

  const compiledOutput = useMemo(() => {
    const { rows } = parsedPairs;
    if (targetPlatform === 'nextjs') {
      const items = rows
        .map(
          (r) => `      {
        source: ${JSON.stringify(r.source)},
        destination: ${JSON.stringify(r.destination)},
        permanent: ${permanent}, // ${permanent ? '308 Permanent Redirect' : '307 Temporary Redirect'}
      }`
        )
        .join(',\n');

      return `// next.config.ts — Next.js 15 App Router Redirects Configuration
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
${items}
    ];
  },
};

export default nextConfig;`;
    }

    if (targetPlatform === 'vercel') {
      return JSON.stringify(
        {
          redirects: rows.map((r) => ({
            source: r.source,
            destination: r.destination,
            permanent,
          })),
        },
        null,
        2
      );
    }

    const code = permanent ? '301' : '302';
    return [
      '# Apache .htaccess SEO Migration Rules',
      'RewriteEngine On',
      ...rows.map((r) => `Redirect ${code} ${r.source} ${r.destination}`),
    ].join('\n');
  }, [parsedPairs, permanent, targetPlatform]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Redirect Mappings (`source_path destination_path` per line)
          </label>
          <span className="text-xs font-mono text-slate-500">
            {parsedPairs.rows.length} rules
          </span>
        </div>
        <textarea
          rows={7}
          value={rulesInput}
          onChange={(e) => setRulesInput(e.target.value)}
          className="w-full p-3.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={permanent}
              onChange={(e) => setPermanent(e.target.checked)}
            />
            <span>
              Pass Link Equity (`permanent: true` / Status 308 & 301)
            </span>
          </label>

          {parsedPairs.loopWarnings.length > 0 ? (
            <span className="text-red-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {parsedPairs.loopWarnings.length} Self-Redirect Loop Detected!
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Zero Redirect Loops
            </span>
          )}
        </div>
      </div>

      <div className="lg:col-span-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            {(['nextjs', 'vercel', 'apache'] as const).map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => setTargetPlatform(plat)}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  targetPlatform === plat
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {plat === 'nextjs'
                  ? 'next.config.ts'
                  : plat === 'vercel'
                  ? 'vercel.json'
                  : '.htaccess'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(compiledOutput);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Config'}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[380px]">
          <code>{compiledOutput}</code>
        </pre>
      </div>
    </div>
  );
};

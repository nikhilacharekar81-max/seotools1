import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  MainCategory,
  Subcategory,
  SeoTool,
  RateLimitConfig,
  ApiMetricLog,
  ToolComponentKey,
} from '../types/seo';

interface AdminSuiteProps {
  categories: MainCategory[];
  subcategories: Subcategory[];
  tools: SeoTool[];
  rateLimitConfig: RateLimitConfig;
  metrics: ApiMetricLog[];
  activeCacheKeys: number;
  onUpdateTaxonomy: (
    nextCategories: MainCategory[],
    nextSubcategories: Subcategory[],
    nextTools: SeoTool[]
  ) => Promise<void>;
  onUpdateRateLimit: (nextConfig: Partial<RateLimitConfig>) => Promise<void>;
  onClearCache: () => Promise<void>;
  onResetTaxonomy: () => Promise<void>;
}

export const AdminSuite: React.FC<AdminSuiteProps> = ({
  categories,
  subcategories,
  tools,
  rateLimitConfig,
  metrics,
  activeCacheKeys,
  onUpdateTaxonomy,
  onUpdateRateLimit,
  onClearCache,
  onResetTaxonomy,
}) => {
  const [activeSection, setActiveSection] = useState<
    'tools' | 'categories' | 'ratelimit' | 'blueprints'
  >('tools');

  // New Category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // New Subcategory form state
  const [newSubName, setNewSubName] = useState('');
  const [newSubParentId, setNewSubParentId] = useState(categories[0]?.id || '');
  const [newSubDesc, setNewSubDesc] = useState('');

  // New Tool form state
  const [showNewToolForm, setShowNewToolForm] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [newToolSlug, setNewToolSlug] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [newToolCatId, setNewToolCatId] = useState(categories[0]?.id || '');
  const [newToolSubId, setNewToolSubId] = useState(subcategories[0]?.id || '');
  const [newToolMode, setNewToolMode] = useState<'client' | 'gemini-ai'>('client');
  const [newToolComponent, setNewToolComponent] =
    useState<ToolComponentKey>('serp-simulator');

  // Rate limit local form state
  const [maxReq, setMaxReq] = useState(rateLimitConfig.maxRequestsPerWindow);
  const [windowSec, setWindowSec] = useState(rateLimitConfig.windowSeconds);
  const [cacheTtl, setCacheTtl] = useState(rateLimitConfig.cacheTtlSeconds);
  const [enableCache, setEnableCache] = useState(rateLimitConfig.enableCaching);
  const [defaultTemp, setDefaultTemp] = useState(rateLimitConfig.defaultTemperature);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);

  const triggerSavedNotice = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 2200);
  };

  // --- Tool Operations ---
  const handleToggleToolActive = async (toolId: string) => {
    const nextTools = tools.map((t) =>
      t.id === toolId ? { ...t, isActive: !t.isActive } : t
    );
    await onUpdateTaxonomy(categories, subcategories, nextTools);
    triggerSavedNotice('Tool visibility updated');
  };

  const handleRerouteToolCategory = async (toolId: string, nextCategoryId: string) => {
    const validSubs = subcategories.filter(
      (s) => s.parentCategoryId === nextCategoryId
    );
    const fallbackSubId = validSubs[0]?.id || subcategories[0]?.id || '';
    const nextTools = tools.map((t) =>
      t.id === toolId
        ? { ...t, categoryId: nextCategoryId, subcategoryId: fallbackSubId }
        : t
    );
    await onUpdateTaxonomy(categories, subcategories, nextTools);
    triggerSavedNotice('Tool re-routed to new Main Category');
  };

  const handleRerouteToolSubcategory = async (
    toolId: string,
    nextSubcategoryId: string
  ) => {
    const sub = subcategories.find((s) => s.id === nextSubcategoryId);
    const nextTools = tools.map((t) =>
      t.id === toolId
        ? {
            ...t,
            subcategoryId: nextSubcategoryId,
            categoryId: sub ? sub.parentCategoryId : t.categoryId,
          }
        : t
    );
    await onUpdateTaxonomy(categories, subcategories, nextTools);
    triggerSavedNotice('Tool re-routed to new Subcategory');
  };

  const handleMoveToolPosition = async (index: number, direction: -1 | 1) => {
    const sorted = [...tools].sort((a, b) => a.position - b.position);
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const temp = sorted[index];
    sorted[index] = sorted[targetIdx];
    sorted[targetIdx] = temp;
    const normalized = sorted.map((item, idx) => ({ ...item, position: idx + 1 }));
    await onUpdateTaxonomy(categories, subcategories, normalized);
    triggerSavedNotice('Tool order updated');
  };

  const handleCreateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName.trim()) return;
    const cleanSlug =
      newToolSlug.trim() ||
      newToolName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const created: SeoTool = {
      id: `tool-${Date.now()}`,
      name: newToolName.trim(),
      slug: cleanSlug,
      componentKey: newToolComponent,
      shortDescription:
        newToolDesc.trim() ||
        'Custom SEO diagnostic utility configured via Taxonomy Admin Suite.',
      fullDescription:
        newToolDesc.trim() ||
        'Custom SEO diagnostic utility configured via Taxonomy Admin Suite.',
      categoryId: newToolCatId,
      subcategoryId: newToolSubId,
      executionMode: newToolMode,
      position: tools.length + 1,
      isActive: true,
      schemaType: newToolMode === 'client' ? 'SoftwareApplication' : 'WebApplication',
      canonicalPath: `/tools/${cleanSlug}`,
      avgLatencyMs: newToolMode === 'client' ? 0 : 1200,
      costPerRunUsd: newToolMode === 'client' ? 0 : 0.00018,
      temperature: newToolMode === 'gemini-ai' ? 0.2 : undefined,
      modelName: newToolMode === 'gemini-ai' ? 'gemini-3.8-flash' : undefined,
    };

    await onUpdateTaxonomy(categories, subcategories, [...tools, created]);
    setNewToolName('');
    setNewToolSlug('');
    setNewToolDesc('');
    setShowNewToolForm(false);
    triggerSavedNotice(`Added "${created.name}" to taxonomy`);
  };

  const handleDeleteTool = async (toolId: string) => {
    const nextTools = tools.filter((t) => t.id !== toolId);
    await onUpdateTaxonomy(categories, subcategories, nextTools);
    triggerSavedNotice('Tool removed from taxonomy');
  };

  // --- Category & Subcategory Operations ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const created: MainCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug,
      description: newCatDesc.trim() || 'Custom SEO category group.',
      position: categories.length + 1,
      isActive: true,
    };
    await onUpdateTaxonomy([...categories, created], subcategories, tools);
    setNewCatName('');
    setNewCatDesc('');
    triggerSavedNotice(`Created category "${created.name}"`);
  };

  const handleToggleCategory = async (catId: string) => {
    const next = categories.map((c) =>
      c.id === catId ? { ...c, isActive: !c.isActive } : c
    );
    await onUpdateTaxonomy(next, subcategories, tools);
    triggerSavedNotice('Category state updated');
  };

  const handleMoveCategory = async (index: number, direction: -1 | 1) => {
    const sorted = [...categories].sort((a, b) => a.position - b.position);
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const temp = sorted[index];
    sorted[index] = sorted[targetIdx];
    sorted[targetIdx] = temp;
    const normalized = sorted.map((c, idx) => ({ ...c, position: idx + 1 }));
    await onUpdateTaxonomy(normalized, subcategories, tools);
    triggerSavedNotice('Category order updated');
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubParentId) return;
    const slug = newSubName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const created: Subcategory = {
      id: `sub-${Date.now()}`,
      parentCategoryId: newSubParentId,
      name: newSubName.trim(),
      slug,
      description: newSubDesc.trim() || 'Custom SEO subcategory.',
      position: subcategories.length + 1,
      isActive: true,
    };
    await onUpdateTaxonomy(categories, [...subcategories, created], tools);
    setNewSubName('');
    setNewSubDesc('');
    triggerSavedNotice(`Created subcategory "${created.name}"`);
  };

  const handleMoveSubcategoryParent = async (
    subId: string,
    nextParentCatId: string
  ) => {
    const nextSubs = subcategories.map((s) =>
      s.id === subId ? { ...s, parentCategoryId: nextParentCatId } : s
    );
    // Also update any tools inside this subcategory so their parent categoryId stays consistent
    const nextTools = tools.map((t) =>
      t.subcategoryId === subId ? { ...t, categoryId: nextParentCatId } : t
    );
    await onUpdateTaxonomy(categories, nextSubs, nextTools);
    triggerSavedNotice('Subcategory and child tools moved to new parent category');
  };

  const handleToggleSubcategory = async (subId: string) => {
    const nextSubs = subcategories.map((s) =>
      s.id === subId ? { ...s, isActive: !s.isActive } : s
    );
    await onUpdateTaxonomy(categories, nextSubs, tools);
    triggerSavedNotice('Subcategory state updated');
  };

  // Computed metrics
  const sortedTools = [...tools].sort((a, b) => a.position - b.position);
  const sortedCategories = [...categories].sort((a, b) => a.position - b.position);
  const totalCostUsd = metrics
    .reduce((acc, m) => acc + m.estimatedCostUsd, 0)
    .toFixed(5);
  const cacheHitCount = metrics.filter((m) => m.cached).length;
  const cacheHitRate =
    metrics.length > 0 ? Math.round((cacheHitCount / metrics.length) * 100) : 0;

  const prismaBlueprint = `// prisma/schema.prisma — Dynamic SEO Taxonomy & Tool Routing
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model MainCategory {
  id            String        @id @default(cuid())
  name          String
  slug          String        @unique
  description   String
  position      Int           @default(0)
  isActive      Boolean       @default(true)
  subcategories Subcategory[]
  tools         SeoTool[]
  updatedAt     DateTime      @updatedAt
}

model Subcategory {
  id               String       @id @default(cuid())
  parentCategoryId String
  parentCategory   MainCategory @relation(fields: [parentCategoryId], references: [id], onDelete: Cascade)
  name             String
  slug             String       @unique
  position         Int          @default(0)
  isActive         Boolean      @default(true)
  tools            SeoTool[]
}

model SeoTool {
  id             String       @id @default(cuid())
  name           String
  slug           String       @unique
  executionMode  String       @default("client") // "client" | "gemini-ai"
  categoryId     String
  category       MainCategory @relation(fields: [categoryId], references: [id])
  subcategoryId  String
  subcategory    Subcategory  @relation(fields: [subcategoryId], references: [id])
  position       Int          @default(0)
  isActive       Boolean      @default(true)
  temperature    Float        @default(0.2)
  canonicalPath  String
}`;

  return (
    <div className="space-y-8">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Taxonomy & Platform Governance Suite
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Re-route tools across categories, move subcategories between parents, adjust rate limits, and audit API telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40">
              {savedNotice}
            </span>
          )}
          <button
            type="button"
            onClick={onResetTaxonomy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Defaults
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500">Active Tools / Total</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {tools.filter((t) => t.isActive).length} / {tools.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {tools.filter((t) => t.executionMode === 'client').length} Zero-Cost Client ·{' '}
            {tools.filter((t) => t.executionMode === 'gemini-ai').length} Gemini AI
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500">Taxonomy Hierarchy</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {categories.length} Cats · {subcategories.length} Subs
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Dynamic Parent-Child Routing
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500">Cache Hit Ratio</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {cacheHitRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            {activeCacheKeys} cached SHA-256 keys
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500">Cumulative AI Spend</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            ${totalCostUsd}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Client utilities: $0.00000
          </div>
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveSection('tools')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeSection === 'tools'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          1. SEO Tools & Re-Routing ({tools.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('categories')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeSection === 'categories'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          2. Categories & Subcategory Hierarchy
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('ratelimit')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeSection === 'ratelimit'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          3. Rate Limiter, Cache & API Telemetry
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('blueprints')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeSection === 'blueprints'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          4. Prisma & Upstash Architecture Code
        </button>
      </div>

      {/* SECTION 1: TOOLS CRUD & CATEGORY/SUBCATEGORY RE-ROUTING */}
      {activeSection === 'tools' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              SEO Tools Matrix — Reorder, Toggle Active State, or Re-Route Category/Subcategory
            </h3>
            <button
              type="button"
              onClick={() => setShowNewToolForm(!showNewToolForm)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              {showNewToolForm ? 'Close Form' : 'Register New SEO Tool'}
            </button>
          </div>

          {showNewToolForm && (
            <form
              onSubmit={handleCreateTool}
              className="p-5 rounded-xl border border-emerald-600/40 bg-white dark:bg-slate-900 space-y-4"
            >
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Create & Route New SEO Tool
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-500">Tool Title</label>
                  <input
                    type="text"
                    required
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    placeholder="e.g., Hreflang Matrix Validator"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">URL Slug</label>
                  <input
                    type="text"
                    value={newToolSlug}
                    onChange={(e) => setNewToolSlug(e.target.value)}
                    placeholder="hreflang-matrix-validator"
                    className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Execution Engine</label>
                  <select
                    value={newToolMode}
                    onChange={(e) =>
                      setNewToolMode(e.target.value as 'client' | 'gemini-ai')
                    }
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="client">Client-Side Browser ($0.00 / 0ms)</option>
                    <option value="gemini-ai">
                      Gemini AI Server Route (responseSchema)
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-500">Assign Main Category</label>
                  <select
                    value={newToolCatId}
                    onChange={(e) => setNewToolCatId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Assign Subcategory</label>
                  <select
                    value={newToolSubId}
                    onChange={(e) => setNewToolSubId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  >
                    {subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Interactive UI Module</label>
                  <select
                    value={newToolComponent}
                    onChange={(e) =>
                      setNewToolComponent(e.target.value as ToolComponentKey)
                    }
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="serp-simulator">SERP Pixel Simulator</option>
                    <option value="meta-tag-generator">Meta & OpenGraph Builder</option>
                    <option value="keyword-density-Readability">
                      N-Gram Density Analyzer
                    </option>
                    <option value="schema-builder">JSON-LD Schema Builder</option>
                    <option value="robots-generator">Robots.txt Matrix</option>
                    <option value="sitemap-hreflang-generator">
                      XML Sitemap & Hreflang Matrix
                    </option>
                    <option value="redirect-rule-builder">
                      Next.js & Edge Redirect Builder
                    </option>
                    <option value="ai-geo-optimizer">
                      Gemini GEO Citation Optimizer
                    </option>
                    <option value="ai-keyword-clusters">
                      Gemini Keyword Cluster Engine
                    </option>
                    <option value="ai-visual-audit">
                      Gemini Multimodal Visual Audit
                    </option>
                    <option value="ai-schema-architect">
                      Gemini JSON-LD Architect
                    </option>
                    <option value="ai-autonomous-agent">
                      Autonomous Multi-Step SEO & Next.js 15 Architect (HIGH Thinking)
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  value={newToolDesc}
                  onChange={(e) => setNewToolDesc(e.target.value)}
                  placeholder="Short SEO meta description for programmatic generateMetadata()..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 whitespace-nowrap"
                >
                  Save & Publish Tool
                </button>
              </div>
            </form>
          )}

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto bg-white dark:bg-slate-900">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500">
                  <th className="py-2.5 px-3 font-medium">Order</th>
                  <th className="py-2.5 px-3 font-medium">Tool Name & Canonical Path</th>
                  <th className="py-2.5 px-3 font-medium">Main Category Route</th>
                  <th className="py-2.5 px-3 font-medium">Subcategory Route</th>
                  <th className="py-2.5 px-3 font-medium">Runtime</th>
                  <th className="py-2.5 px-3 font-medium text-right">Avg Latency</th>
                  <th className="py-2.5 px-3 font-medium text-center">Status</th>
                  <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {sortedTools.map((tool, index) => (
                  <tr
                    key={tool.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-2.5 px-3 font-mono tabular-nums">
                      <div className="flex items-center gap-1">
                        <span className="w-5 text-slate-400">#{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleMoveToolPosition(index, -1)}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveToolPosition(index, 1)}
                          disabled={index === sortedTools.length - 1}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {tool.name}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {tool.canonicalPath}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={tool.categoryId}
                        onChange={(e) =>
                          handleRerouteToolCategory(tool.id, e.target.value)
                        }
                        className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={tool.subcategoryId}
                        onChange={(e) =>
                          handleRerouteToolSubcategory(tool.id, e.target.value)
                        }
                        className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                      >
                        {subcategories.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {tool.executionMode === 'client' ? 'Client DOM' : 'Gemini AI'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {tool.avgLatencyMs}ms
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleToolActive(tool.id)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          tool.isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {tool.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteTool(tool.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                        title="Delete Tool"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: CATEGORIES & SUBCATEGORIES CRUD + RE-PARENTING */}
      {activeSection === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Main Categories */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Main Categories (Order & Active State)
            </h3>

            <form
              onSubmit={handleAddCategory}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
            >
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Create Main Category
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category Name (e.g., Local & Maps SEO)"
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short description..."
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                + Add Main Category
              </button>
            </form>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
              {sortedCategories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      #{idx + 1} · {cat.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      /{cat.slug} ·{' '}
                      {
                        subcategories.filter((s) => s.parentCategoryId === cat.id)
                          .length
                      }{' '}
                      subcategories
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveCategory(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveCategory(idx, 1)}
                      disabled={idx === sortedCategories.length - 1}
                      className="p-1 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        cat.isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Subcategories & Parent Re-Routing */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Subcategories (Move Subcategories Between Parent Categories)
            </h3>

            <form
              onSubmit={handleAddSubcategory}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
            >
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Create Subcategory
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Subcategory Name"
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
                <select
                  value={newSubParentId}
                  onChange={(e) => setNewSubParentId(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      Parent: {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                + Add Subcategory
              </button>
            </form>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
              {subcategories.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {sub.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      /{sub.slug}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={sub.parentCategoryId}
                      onChange={(e) =>
                        handleMoveSubcategoryParent(sub.id, e.target.value)
                      }
                      className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          Parent: {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleToggleSubcategory(sub.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        sub.isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {sub.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: RATE LIMITER, CACHE & API TELEMETRY */}
      {activeSection === 'ratelimit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Sliding-Window Rate Limit & Cache Controls
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500">
                    Max Requests / Window
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={maxReq}
                    onChange={(e) => setMaxReq(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">
                    Window Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={3600}
                    value={windowSec}
                    onChange={(e) => setWindowSec(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500">
                    Cache TTL (Seconds)
                  </label>
                  <input
                    type="number"
                    min={60}
                    max={86400}
                    value={cacheTtl}
                    onChange={(e) => setCacheTtl(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">
                    Default Gemini Temp (0.1–0.4)
                  </label>
                  <input
                    type="number"
                    step={0.05}
                    min={0.0}
                    max={1.0}
                    value={defaultTemp}
                    onChange={(e) => setDefaultTemp(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCache}
                  onChange={(e) => setEnableCache(e.target.checked)}
                />
                <span>Enable SHA-256 Deterministic Response Caching</span>
              </label>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await onUpdateRateLimit({
                      maxRequestsPerWindow: maxReq,
                      windowSeconds: windowSec,
                      cacheTtlSeconds: cacheTtl,
                      enableCaching: enableCache,
                      defaultTemperature: defaultTemp,
                    });
                    triggerSavedNotice('Rate limit & cache policy updated');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Save className="w-3.5 h-3.5" />
                  Apply Rate Limit Policy
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await onClearCache();
                    triggerSavedNotice('Response cache purged');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Purge Cache ({activeCacheKeys})
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Real-Time Serverless API Latency & Cost Log
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500">
                    <th className="py-2.5 px-3 font-medium">Tool Engine</th>
                    <th className="py-2.5 px-3 font-medium">Source</th>
                    <th className="py-2.5 px-3 font-medium text-right">Latency</th>
                    <th className="py-2.5 px-3 font-medium text-right">Tokens</th>
                    <th className="py-2.5 px-3 font-medium text-right">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono tabular-nums">
                  {metrics.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                        {m.toolName}
                      </td>
                      <td className="py-2 px-3">
                        {m.cached ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            CACHE HIT
                          </span>
                        ) : m.status === 'rate_limited' ? (
                          <span className="text-red-600">429 LIMIT</span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400">
                            GEMINI API
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">{m.latencyMs}ms</td>
                      <td className="py-2 px-3 text-right">{m.estimatedTokens}</td>
                      <td className="py-2 px-3 text-right">
                        ${m.estimatedCostUsd.toFixed(5)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PRISMA + UPSTASH + NEXT.JS BLUEPRINTS */}
      {activeSection === 'blueprints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Production PostgreSQL + Prisma ORM Taxonomy Schema (`prisma/schema.prisma`)
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(prismaBlueprint);
                setCopiedBlueprint(true);
                setTimeout(() => setCopiedBlueprint(false), 1800);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            >
              {copiedBlueprint ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedBlueprint ? 'Copied Schema' : 'Copy Prisma Schema'}
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            <code>{prismaBlueprint}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

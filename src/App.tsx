import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Sun,
  Moon,
  Monitor,
  SlidersHorizontal,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  INITIAL_CATEGORIES,
  INITIAL_SUBCATEGORIES,
  INITIAL_TOOLS,
  MainCategory,
  Subcategory,
  SeoTool,
  RateLimitConfig,
  ApiMetricLog,
} from './types/seo';
import {
  SerpSimulatorTool,
  MetaTagGeneratorTool,
  KeywordDensityTool,
  SchemaBuilderTool,
  RobotsGeneratorTool,
  SitemapHreflangGeneratorTool,
  RedirectRuleBuilderTool,
} from './components/ClientTools';
import {
  AiGeoOptimizerTool,
  AiKeywordClustersTool,
  AiVisualAuditTool,
  AiSchemaArchitectTool,
  AiAutonomousSeoAgentTool,
} from './components/GeminiAiTools';
import { AdminSuite } from './components/AdminSuite';
import { ProgrammaticSeoInspector } from './components/ProgrammaticSeoInspector';

type ThemeMode = 'light' | 'dark' | 'system';
type MainView = 'directory' | 'workbench' | 'admin';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [view, setView] = useState<MainView>('workbench');
  const [filterMode, setFilterMode] = useState<'all' | 'client' | 'gemini-ai'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Platform State synced with Express Backend
  const [categories, setCategories] = useState<MainCategory[]>(INITIAL_CATEGORIES);
  const [subcategories, setSubcategories] =
    useState<Subcategory[]>(INITIAL_SUBCATEGORIES);
  const [tools, setTools] = useState<SeoTool[]>(INITIAL_TOOLS);
  const [rateLimitConfig, setRateLimitConfig] = useState<RateLimitConfig>({
    maxRequestsPerWindow: 20,
    windowSeconds: 60,
    cacheTtlSeconds: 3600,
    enableCaching: true,
    modelSelection: 'gemini-3.8-flash',
    defaultTemperature: 0.2,
  });
  const [metrics, setMetrics] = useState<ApiMetricLog[]>([]);
  const [activeCacheKeys, setActiveCacheKeys] = useState(0);
  const [selectedToolId, setSelectedToolId] = useState<string>(
    INITIAL_TOOLS[0].id
  );

  // Apply Dark / Light / System theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    const apply = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'dark') {
      apply(true);
    } else if (theme === 'light') {
      apply(false);
    } else {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      apply(media.matches);
    }
  }, [theme]);

  const fetchPlatformState = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/state');
      if (!res.ok) return;
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
      if (data.subcategories) setSubcategories(data.subcategories);
      if (data.tools) setTools(data.tools);
      if (data.rateLimitConfig) setRateLimitConfig(data.rateLimitConfig);
      if (data.metrics) setMetrics(data.metrics);
      if (data.cacheStats) setActiveCacheKeys(data.cacheStats.activeKeys);
    } catch {
      // Fallback to initial state if offline
    }
  }, []);

  useEffect(() => {
    fetchPlatformState();
  }, [fetchPlatformState]);

  const handleUpdateTaxonomy = async (
    nextCategories: MainCategory[],
    nextSubcategories: Subcategory[],
    nextTools: SeoTool[]
  ) => {
    setCategories(nextCategories);
    setSubcategories(nextSubcategories);
    setTools(nextTools);
    await fetch('/api/admin/taxonomy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categories: nextCategories,
        subcategories: nextSubcategories,
        tools: nextTools,
      }),
    });
  };

  const handleUpdateRateLimit = async (nextConfig: Partial<RateLimitConfig>) => {
    const res = await fetch('/api/admin/ratelimit', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextConfig),
    });
    if (res.ok) {
      const data = await res.json();
      setRateLimitConfig(data.rateLimitConfig);
    }
  };

  const handleClearCache = async () => {
    const res = await fetch('/api/admin/cache/clear', { method: 'POST' });
    if (res.ok) {
      setActiveCacheKeys(0);
    }
  };

  const handleResetTaxonomy = async () => {
    const res = await fetch('/api/admin/taxonomy/reset', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
      setSubcategories(data.subcategories);
      setTools(data.tools);
    }
  };

  // Filtered active taxonomy for navigation & directory
  const activeCategories = useMemo(
    () =>
      [...categories]
        .filter((c) => c.isActive)
        .sort((a, b) => a.position - b.position),
    [categories]
  );

  const activeSubcategories = useMemo(
    () =>
      [...subcategories]
        .filter((s) => s.isActive)
        .sort((a, b) => a.position - b.position),
    [subcategories]
  );

  const visibleTools = useMemo(() => {
    return [...tools]
      .filter((t) => {
        if (!t.isActive) return false;
        const parentCat = categories.find((c) => c.id === t.categoryId);
        const parentSub = subcategories.find((s) => s.id === t.subcategoryId);
        if (parentCat && !parentCat.isActive) return false;
        if (parentSub && !parentSub.isActive) return false;
        if (filterMode !== 'all' && t.executionMode !== filterMode) return false;
        if (
          searchQuery.trim() &&
          !`${t.name} ${t.shortDescription} ${t.slug}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.position - b.position);
  }, [tools, categories, subcategories, filterMode, searchQuery]);

  const activeTool = useMemo(
    () =>
      tools.find((t) => t.id === selectedToolId) ||
      visibleTools[0] ||
      tools[0],
    [tools, selectedToolId, visibleTools]
  );

  const activeToolCategory = useMemo(
    () => categories.find((c) => c.id === activeTool?.categoryId),
    [categories, activeTool]
  );

  const activeToolSubcategory = useMemo(
    () => subcategories.find((s) => s.id === activeTool?.subcategoryId),
    [subcategories, activeTool]
  );

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const renderActiveToolComponent = (tool: SeoTool) => {
    switch (tool.componentKey) {
      case 'serp-simulator':
        return <SerpSimulatorTool />;
      case 'meta-tag-generator':
        return <MetaTagGeneratorTool />;
      case 'keyword-density-Readability':
        return <KeywordDensityTool />;
      case 'schema-builder':
        return <SchemaBuilderTool />;
      case 'robots-generator':
        return <RobotsGeneratorTool />;
      case 'sitemap-hreflang-generator':
        return <SitemapHreflangGeneratorTool />;
      case 'redirect-rule-builder':
        return <RedirectRuleBuilderTool />;
      case 'ai-geo-optimizer':
        return <AiGeoOptimizerTool onCompleted={fetchPlatformState} />;
      case 'ai-keyword-clusters':
        return <AiKeywordClustersTool onCompleted={fetchPlatformState} />;
      case 'ai-visual-audit':
        return <AiVisualAuditTool onCompleted={fetchPlatformState} />;
      case 'ai-schema-architect':
        return <AiSchemaArchitectTool onCompleted={fetchPlatformState} />;
      case 'ai-autonomous-agent':
        return <AiAutonomousSeoAgentTool onCompleted={fetchPlatformState} />;
      default:
        return <SerpSimulatorTool />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs">
        {/* Zone 1: Single Text Element Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setView('directory');
            setFilterMode('all');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap"
        >
          IndexPulse
        </a>

        {/* Zone 2: 4 Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => {
              setFilterMode('all');
              setView('directory');
            }}
            className={`hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap ${
              view === 'directory' && filterMode === 'all'
                ? 'text-slate-900 dark:text-slate-100 font-semibold underline'
                : ''
            }`}
          >
            All Tools
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterMode('client');
              setView('directory');
            }}
            className={`hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap ${
              view === 'directory' && filterMode === 'client'
                ? 'text-slate-900 dark:text-slate-100 font-semibold underline'
                : ''
            }`}
          >
            Client Utilities
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterMode('gemini-ai');
              setView('directory');
            }}
            className={`hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap ${
              view === 'directory' && filterMode === 'gemini-ai'
                ? 'text-slate-900 dark:text-slate-100 font-semibold underline'
                : ''
            }`}
          >
            Gemini AI Engines
          </button>
          <button
            type="button"
            onClick={() => setView('workbench')}
            className={`hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap ${
              view === 'workbench'
                ? 'text-slate-900 dark:text-slate-100 font-semibold underline'
                : ''
            }`}
          >
            Active Workbench
          </button>
        </nav>

        {/* Zone 3: 2 Primary Actions (Theme Toggle + Admin Suite) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={cycleTheme}
            aria-label="Toggle color theme"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors whitespace-nowrap"
          >
            {theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5" />
            ) : theme === 'light' ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Monitor className="w-3.5 h-3.5" />
            )}
            <span className="capitalize">{theme}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setView(view === 'admin' ? 'workbench' : 'admin')
            }
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              view === 'admin'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {view === 'admin' ? 'Exit Admin Suite' : 'Taxonomy Admin'}
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE CANVAS (Sidebar + Main Content Viewport) */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] w-full mx-auto">
        {/* Left Taxonomy Sidebar */}
        <aside className="w-full lg:w-[272px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 p-4 space-y-5">
          {/* Quick Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter SEO tools..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Segmented Runtime Filter */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            {(['all', 'client', 'gemini-ai'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
                className={`py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                  filterMode === mode
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {mode === 'all'
                  ? 'All'
                  : mode === 'client'
                  ? 'Client 0ms'
                  : 'Gemini AI'}
              </button>
            ))}
          </div>

          {/* Dynamic Category -> Subcategory -> Tools Tree */}
          <div className="space-y-5">
            {activeCategories.map((category) => {
              const catSubs = activeSubcategories.filter(
                (s) => s.parentCategoryId === category.id
              );
              const catTools = visibleTools.filter(
                (t) => t.categoryId === category.id
              );
              if (catTools.length === 0) return null;

              return (
                <div key={category.id} className="space-y-2">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 px-1">
                    {category.name}
                  </div>

                  {catSubs.map((sub) => {
                    const subTools = catTools.filter(
                      (t) => t.subcategoryId === sub.id
                    );
                    if (subTools.length === 0) return null;

                    return (
                      <div key={sub.id} className="space-y-1 pl-2">
                        <div className="text-[11px] text-slate-500 px-2 py-0.5">
                          {sub.name}
                        </div>
                        {subTools.map((tool) => {
                          const isSelected =
                            view === 'workbench' && activeTool?.id === tool.id;
                          return (
                            <button
                              key={tool.id}
                              type="button"
                              onClick={() => {
                                setSelectedToolId(tool.id);
                                setView('workbench');
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                              }`}
                            >
                              <span className="truncate">{tool.name}</span>
                              <span className="text-[10px] font-mono tabular-nums text-slate-400 shrink-0">
                                {tool.executionMode === 'client' ? '0ms' : 'AI'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 min-w-0 p-6 lg:p-8">
          {/* VIEW 1: ADMIN SUITE */}
          {view === 'admin' && (
            <AdminSuite
              categories={categories}
              subcategories={subcategories}
              tools={tools}
              rateLimitConfig={rateLimitConfig}
              metrics={metrics}
              activeCacheKeys={activeCacheKeys}
              onUpdateTaxonomy={handleUpdateTaxonomy}
              onUpdateRateLimit={handleUpdateRateLimit}
              onClearCache={handleClearCache}
              onResetTaxonomy={handleResetTaxonomy}
            />
          )}

          {/* VIEW 2: ALL TOOLS DIRECTORY GRID */}
          {view === 'directory' && (
            <div className="space-y-8">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    100% Free Technical SEO & Generative Engine Optimization Platform
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-balance">
                    AI-Powered SEO Tools & Zero-Latency Client Utilities
                  </h1>
                </div>
                <div className="text-xs font-mono tabular-nums text-slate-500">
                  Showing {visibleTools.length} Active Tools · Rate Limit:{' '}
                  {rateLimitConfig.maxRequestsPerWindow} req/{rateLimitConfig.windowSeconds}s
                </div>
              </div>

              {activeCategories.map((cat) => {
                const catTools = visibleTools.filter(
                  (t) => t.categoryId === cat.id
                );
                if (catTools.length === 0) return null;

                return (
                  <section key={cat.id} className="space-y-4">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {cat.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cat.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {catTools.map((tool) => {
                        const sub = subcategories.find(
                          (s) => s.id === tool.subcategoryId
                        );
                        return (
                          <div
                            key={tool.id}
                            onClick={() => {
                              setSelectedToolId(tool.id);
                              setView('workbench');
                            }}
                            className="group p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-600/60 dark:hover:border-emerald-500/60 transition-colors cursor-pointer flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-2">
                              {/* Clean unboxed static metadata with typographic separators (Zero-Pill Discipline) */}
                              <div className="text-xs text-slate-500 font-mono tabular-nums">
                                <span>
                                  {tool.executionMode === 'client'
                                    ? 'Client Browser'
                                    : 'Gemini AI Schema'}
                                </span>
                                <span aria-hidden="true"> · </span>
                                <span>{sub?.name || 'Utility'}</span>
                                <span aria-hidden="true"> · </span>
                                <span>
                                  {tool.executionMode === 'client'
                                    ? '0ms ($0.00)'
                                    : `~${tool.avgLatencyMs}ms`}
                                </span>
                              </div>

                              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {tool.name}
                              </h3>

                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {tool.shortDescription}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                              <span className="font-mono text-slate-400 truncate max-w-[190px]">
                                {tool.canonicalPath}
                              </span>
                              <span className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1 whitespace-nowrap">
                                Open Tool
                                <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* VIEW 3: ACTIVE TOOL WORKBENCH */}
          {view === 'workbench' && activeTool && (
            <div className="space-y-6">
              {/* Contextual Breadcrumb & Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => setView('directory')}
                      className="hover:text-slate-900 dark:hover:text-slate-200 hover:underline"
                    >
                      {activeToolCategory?.name || 'SEO Suite'}
                    </button>
                    <span>/</span>
                    <span>{activeToolSubcategory?.name || 'Tools'}</span>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                      {activeTool.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-500">
                    <span>
                      Mode:{' '}
                      {activeTool.executionMode === 'client'
                        ? 'Zero-Latency Browser Execution ($0.00)'
                        : `Serverless ${activeTool.modelName || 'gemini-3.8-flash'}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setView('directory')}
                      className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-sans font-medium"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Browse All ({visibleTools.length})
                    </button>
                  </div>
                </div>

                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 text-balance">
                  {activeTool.name}
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                  {activeTool.fullDescription}
                </p>
              </div>

              {/* Active Tool Interactive Surface */}
              <div>{renderActiveToolComponent(activeTool)}</div>

              {/* Programmatic SEO & Live Schema.org JSON-LD Inspector */}
              <ProgrammaticSeoInspector
                tool={activeTool}
                category={activeToolCategory}
                subcategory={activeToolSubcategory}
              />
            </div>
          )}
        </main>
      </div>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1440px] w-full mx-auto">
        <div>
          IndexPulse — 100% Free AI-Powered SEO Tools Platform & Taxonomy Admin Suite
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setView('directory')}
            className="hover:underline"
          >
            Tool Directory
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => setView('admin')}
            className="hover:underline"
          >
            Taxonomy & Rate Limit Admin
          </button>
        </div>
      </footer>
    </div>
  );
}

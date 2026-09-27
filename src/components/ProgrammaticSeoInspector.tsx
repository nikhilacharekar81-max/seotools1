import React, { useEffect, useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';
import { SeoTool, MainCategory, Subcategory } from '../types/seo';

interface ProgrammaticSeoInspectorProps {
  tool: SeoTool;
  category?: MainCategory;
  subcategory?: Subcategory;
}

export const ProgrammaticSeoInspector: React.FC<ProgrammaticSeoInspectorProps> = ({
  tool,
  category,
  subcategory,
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://indexpulse.dev';
  const canonicalUrl = `${origin}${tool.canonicalPath}`;

  const schemaLdObject = {
    '@context': 'https://schema.org',
    '@type': tool.schemaType || 'SoftwareApplication',
    name: `${tool.name} — IndexPulse`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    url: canonicalUrl,
    description: tool.fullDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: category?.name || 'SEO Tools',
          item: `${origin}/${category?.slug || 'tools'}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: subcategory?.name || 'Utilities',
          item: `${origin}/${category?.slug || 'tools'}/${subcategory?.slug || 'all'}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: tool.name,
          item: canonicalUrl,
        },
      ],
    },
  };

  // Sync live DOM head tags for authentic Technical SEO
  useEffect(() => {
    document.title = `${tool.name} | IndexPulse Free AI SEO Platform`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', tool.fullDescription);
    }
    const schemaScript = document.getElementById('dynamic-schema-ld');
    if (schemaScript) {
      schemaScript.textContent = JSON.stringify(schemaLdObject, null, 2);
    }
  }, [tool.id, tool.name, tool.fullDescription, canonicalUrl]);

  const programmaticCode = `// app/tools/[slug]/page.tsx — Programmatic SEO Metadata & JSON-LD
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: ${JSON.stringify(`${tool.name} | IndexPulse SEO Suite`)},
    description: ${JSON.stringify(tool.fullDescription)},
    alternates: {
      canonical: ${JSON.stringify(canonicalUrl)},
    },
    openGraph: {
      title: ${JSON.stringify(tool.name)},
      description: ${JSON.stringify(tool.shortDescription)},
      url: ${JSON.stringify(canonicalUrl)},
      type: 'website',
    },
  };
}

// Embedded Schema.org Structured Data
const jsonLd = ${JSON.stringify(schemaLdObject, null, 2)};`;

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-8">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Canonical: <span className="font-mono text-slate-700 dark:text-slate-300">{tool.canonicalPath}</span> · Schema: <span className="font-mono text-slate-700 dark:text-slate-300">{tool.schemaType}</span> · Execution: <span className="font-mono text-slate-700 dark:text-slate-300">{tool.executionMode === 'client' ? '0ms Browser DOM' : `${tool.modelName} (temp ${tool.temperature ?? 0.2})`}</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline whitespace-nowrap"
        >
          <Code2 className="w-3.5 h-3.5" />
          {open ? 'Hide Programmatic SEO Inspector' : 'Inspect Route Metadata & JSON-LD'}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Live Synced `generateMetadata()` & Schema.org `BreadcrumbList` + `{tool.schemaType}`
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(programmaticCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy Route Code'}
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[320px]">
            <code>{programmaticCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

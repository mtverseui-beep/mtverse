import { createWriteStream } from 'node:fs'
import { mkdir, readFile, readdir, stat } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = resolve(process.argv[2] || join(projectRoot, '..', 'mtverse-ui-library'))
const archivePath = resolve(process.argv[3] || join(projectRoot, 'data', 'mtverse-ui-library-source.zip'))
const packageRoot = 'mtverse-ui-library'

const excludedDirectories = new Set([
  '.git', '.next', '.netlify', '.turbo', '.vercel', '.vscode',
  'build', 'coverage', 'node_modules', 'out',
])
const excludedFiles = new Set([
  '.codex-preview.log', '.codex-preview.stderr.log', '.codex-preview.stdout.log',
  '.env', 'dev.log', 'dev.out.log', 'next-env.d.ts', 'server.log',
  'tsconfig.tsbuildinfo', 'worklog.md', 'src/lib/ui-access-token.ts',
])

function normalizePath(value) {
  return value.split(sep).join('/')
}

function shouldExclude(relativePath, directory) {
  const normalized = normalizePath(relativePath)
  const segments = normalized.split('/')
  if (directory && excludedDirectories.has(segments.at(-1))) return true
  if (segments.some((segment) => excludedDirectories.has(segment))) return true
  if (excludedFiles.has(normalized) || excludedFiles.has(segments.at(-1))) return true
  if (segments.at(-1)?.startsWith('.env.')) return true
  if (segments.at(-1)?.endsWith('.log') || segments.at(-1)?.endsWith('.tsbuildinfo')) return true
  return false
}

async function collectFiles(directory, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name)
    const relativePath = relative(sourceRoot, absolutePath)
    if (shouldExclude(relativePath, entry.isDirectory())) continue
    if (entry.isDirectory()) await collectFiles(absolutePath, files)
    else if (entry.isFile()) files.push({ absolutePath, relativePath: normalizePath(relativePath) })
  }
  return files
}

const unlockedCodeLoader = `"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import type { CodeEntryResponse } from "./code-types";

const LazyCodePanel = dynamic(
  () => import("./CodePanel").then((module) => module.CodePanel),
  { ssr: false, loading: () => <CodePanelSkeleton /> },
);

export function CodePanelLoader({ slug }: { slug: string }) {
  const [result, setResult] = useState<CodeEntryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(\`/api/components/\${encodeURIComponent(slug)}/code\`, {
      method: "GET",
      cache: "force-cache",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as CodeEntryResponse & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Unable to load component code.");
        return payload;
      })
      .then(setResult)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Unable to load component code.");
        }
      });
    return () => controller.abort();
  }, [attempt, slug]);

  const retry = useCallback(() => {
    setResult(null);
    setError(null);
    setAttempt((value) => value + 1);
  }, []);

  if (!result && !error) return <CodePanelSkeleton />;
  if (!result) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border cs-border p-8 text-center">
        <AlertCircle className="mb-3 h-6 w-6 text-rose-500" aria-hidden="true" />
        <p className="text-sm font-semibold cs-text">Code could not be loaded</p>
        <p className="mt-1 max-w-sm text-xs cs-muted">{error}</p>
        <button type="button" onClick={retry} className="mt-4 inline-flex items-center gap-2 rounded-lg border cs-border px-3 py-2 text-xs font-semibold cs-text">
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" /> Retry
        </button>
      </div>
    );
  }

  return <LazyCodePanel entry={result.entry} sharedCssNotes={result.sharedCssNotes} />;
}

function CodePanelSkeleton() {
  return <div className="h-80 animate-pulse rounded-xl bg-[var(--card-input-bg)]" role="status" aria-label="Loading component code" />;
}
`

const unlockedDocsLoader = `"use client";

import { useEffect, useState } from "react";
import { ComponentDocs } from "./ComponentDocs";
import type { CodeEntryMetadata, CodeEntryResponse } from "./code-types";

export function DocsPanelLoader({ slug }: { slug: string }) {
  const [metadata, setMetadata] = useState<CodeEntryMetadata | undefined>();

  useEffect(() => {
    const controller = new AbortController();
    fetch(\`/api/components/\${encodeURIComponent(slug)}/code\`, {
      method: "GET",
      cache: "force-cache",
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((payload: CodeEntryResponse) => {
        setMetadata({
          componentName: payload.entry.componentName,
          mainFile: payload.entry.mainFile,
          npmPackages: payload.entry.npmPackages,
          dependencies: payload.entry.dependencies,
          installCommand: payload.entry.installCommand,
        });
      });
    return () => controller.abort();
  }, [slug]);

  return <ComponentDocs slug={slug} initialMetadata={metadata} />;
}
`

const unlockedCodeRoute = `import { NextResponse } from "next/server";
import { codeRegistry, sharedCssNotes } from "@/components/library/code-registry";
import type { CodeEntryResponse, PublicCodeEntry } from "@/components/library/code-types";

export const runtime = "nodejs";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!SLUG_PATTERN.test(slug)) return NextResponse.json({ error: "Invalid component slug." }, { status: 400 });
  const source = codeRegistry[slug];
  if (!source) return NextResponse.json({ error: "Component code was not found." }, { status: 404 });

  const entry: PublicCodeEntry = {
    componentName: source.componentName,
    mainFile: source.mainFile,
    dependencies: source.dependencies,
    npmPackages: source.npmPackages,
    installCommand: source.installCommand,
  };
  const payload: CodeEntryResponse = { entry, sharedCssNotes };
  return NextResponse.json(payload, { headers: { "Cache-Control": "private, max-age=3600" } });
}
`

const customerReadme = `# mtverse UI Library - Customer Source Package

This package contains the complete mtverse UI dashboard and more than 360 responsive React components.

## Included

- Full TypeScript and React source
- Raw code and implementation documentation unlocked locally
- Component previews, dependencies, shared CSS, and generated route metadata
- Light and dark themes
- Future-ready Next.js App Router project structure

## Run locally

\`\`\`bash
bun install
bun run gen:all
bun run dev
\`\`\`

Open http://localhost:3000. Raw code and Docs are available directly in this customer package and do not require an mtverse account.

You can also use npm if preferred:

\`\`\`bash
npm install
npm run dev
\`\`\`

## License

The source is licensed under LICENSE.md. Redistribution, resale, public mirroring, and use in competing template or component libraries are prohibited.
`

const customerEnv = `NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_MAIN_SITE_URL=https://www.mtverse.dev
`

function transformFile(relativePath, source) {
  if (relativePath === 'src/components/library/CodePanelLoader.tsx') return unlockedCodeLoader
  if (relativePath === 'src/components/library/DocsPanelLoader.tsx') return unlockedDocsLoader
  if (relativePath === 'src/app/api/components/[slug]/code/route.ts') return unlockedCodeRoute
  if (relativePath === 'README.md') return customerReadme
  if (relativePath === '.env.example') return customerEnv
  if (relativePath === 'src/components/shell/DashboardShell.tsx') {
    let output = source.replace('  LockKeyhole,\n', '').replace('  LockKeyhole,\r\n', '')
    output = output.replace(/const PRICING_URL = .*?;?\r?\n/, '')
    const ctaPattern = /\s*<a\s+href=\{PRICING_URL\}[\s\S]*?<\/a>\s*\r?\n\s*<AdvancedComponentSearch \/>/
    if (!ctaPattern.test(output)) throw new Error('Unable to remove the deployed Unlock CTA from the customer package.')
    return output.replace(ctaPattern, '\n\n          <AdvancedComponentSearch />')
  }
  return source
}

await stat(sourceRoot)
const files = await collectFiles(sourceRoot)
if (files.length < 700) throw new Error(`UI library source looks incomplete: only ${files.length} files found.`)

const zip = new JSZip()
for (const file of files) {
  const raw = await readFile(file.absolutePath)
  const isText = /\.(?:cjs|css|html|js|json|md|mjs|ts|tsx|txt|yaml|yml)$/i.test(file.relativePath) || !file.relativePath.includes('.')
  const content = isText ? transformFile(file.relativePath, raw.toString('utf8')) : raw
  zip.file(`${packageRoot}/${file.relativePath}`, content)
}

zip.file(`${packageRoot}/.env.example`, customerEnv)
zip.file(`${packageRoot}/PACKAGE-MANIFEST.json`, JSON.stringify({
  package: 'mtverse-ui-library',
  delivery: 'customer-unlocked-source',
  generatedAt: new Date().toISOString(),
  fileCount: files.length,
}, null, 2))

await mkdir(dirname(archivePath), { recursive: true })
await new Promise((resolveStream, rejectStream) => {
  const output = createWriteStream(archivePath)
  output.on('close', resolveStream)
  output.on('error', rejectStream)
  zip.generateNodeStream({
    type: 'nodebuffer',
    streamFiles: true,
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  }).pipe(output)
})

const archive = await readFile(archivePath)
const verified = await JSZip.loadAsync(archive)
const requiredEntries = [
  `${packageRoot}/src/components/library/code-registry.ts`,
  `${packageRoot}/src/components/library/CodePanelLoader.tsx`,
  `${packageRoot}/src/components/library/DocsPanelLoader.tsx`,
  `${packageRoot}/src/app/api/components/[slug]/code/route.ts`,
  `${packageRoot}/README.md`,
  `${packageRoot}/LICENSE.md`,
]
for (const entry of requiredEntries) {
  if (!verified.file(entry)) throw new Error(`Archive verification failed: ${entry} is missing.`)
}

const verificationText = await Promise.all(requiredEntries.slice(1, 4).map((entry) => verified.file(entry).async('string')))
if (verificationText.some((value) => value.includes('UI_LIBRARY_ACCESS_SECRET') || value.includes('/api/ui-library/access-token'))) {
  throw new Error('Archive verification failed: deployed entitlement gates remain in the customer package.')
}

const details = await stat(archivePath)
console.log(`Built unlocked UI library package with ${files.length} files: ${archivePath} (${details.size} bytes).`)
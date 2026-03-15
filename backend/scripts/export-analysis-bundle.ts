/**
 * Run from backend/: npx tsx scripts/export-analysis-bundle.ts
 * Reads frontend mock and writes src/data/analysisBundle.json
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');

// Dynamic import of frontend mock (TypeScript)
const { getMockCompanyAnalysis } = await import(join(root, 'src/mock/data.ts'));

const tickers = ['AAPL', 'MU', 'MSFT', 'NVDA'] as const;
const bundle: Record<string, ReturnType<typeof getMockCompanyAnalysis>> = {};
for (const t of tickers) bundle[t] = getMockCompanyAnalysis(t);

const outDir = join(__dirname, '../src/data');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'analysisBundle.json');
writeFileSync(outFile, JSON.stringify(bundle));
console.log('Wrote', outFile);

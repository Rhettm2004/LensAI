/**
 * Builds the branded PDF strictly from Workspace analysis output.
 * ONLY reads: narrative fields via getNarrativeBlocks(analysis), kpiRows, kpiSnapshotCaption.
 * Does not use reportSections — no hidden report-only content.
 */

import type { AnalysisOutput, Company } from '../types';
import { getNarrativeBlocks } from '../utils/analysisNarrative';
import type { ReportTypeId } from '../types/app';

// LensAI brand (aligned with README / styles)
const PRIMARY = { r: 91 / 255, g: 108 / 255, b: 255 / 255 }; // #5B6CFF
const BG_HEADER = { r: 15 / 255, g: 18 / 255, b: 38 / 255 }; // #0F1226
const CARD_BG = { r: 0.96, g: 0.96, b: 0.98 };
const TEXT = { r: 0.12, g: 0.13, b: 0.18 };
const TEXT_MUTED = { r: 0.45, g: 0.46, b: 0.55 };

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 44;
const CONTENT_W = PAGE_W - 2 * MARGIN;

function wrapWords(text: string, maxWidthPt: number, fontSize: number, charWidthRatio = 0.5): string[] {
  const maxChars = Math.floor(maxWidthPt / (fontSize * charWidthRatio));
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (test.length <= maxChars) line = test;
    else {
      if (line) lines.push(line);
      line = w.length > maxChars ? w.slice(0, maxChars) : w;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

/**
 * Produce PDF bytes from workspace outputs only.
 */
export async function buildBrandedPdfFromWorkspace(params: {
  analysis: AnalysisOutput;
  company: Company;
  reportTypeId: ReportTypeId;
  title: string;
  generatedAtIso: string;
}): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

  const sections = getNarrativeBlocks(params.analysis);
  const kpiRows = params.analysis.kpiRows ?? [];
  const kpiCaption = params.analysis.kpiSnapshotCaption?.trim() ?? '';

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - 36;

  // --- Branded header band ---
  page.drawRectangle({
    x: 0,
    y: PAGE_H - 72,
    width: PAGE_W,
    height: 72,
    color: rgb(BG_HEADER.r, BG_HEADER.g, BG_HEADER.b),
  });
  page.drawText('LensAI', { x: MARGIN, y: PAGE_H - 42, size: 20, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('AI-Driven Market Analysis', {
    x: MARGIN,
    y: PAGE_H - 58,
    size: 9,
    font,
    color: rgb(0.65, 0.67, 0.8),
  });

  y = PAGE_H - 88;
  page.drawText(params.title, {
    x: MARGIN,
    y,
    size: 16,
    font: fontBold,
    color: rgb(PRIMARY.r, PRIMARY.g, PRIMARY.b),
  });
  y -= 22;

  // Metadata block (company only + timestamp)
  const metaLines = [
    `${params.company.name}  ·  ${params.company.ticker}`,
    `${params.company.exchange}  ·  ${params.company.marketCap}  ·  ${params.company.sector}`,
    `Generated ${new Date(params.generatedAtIso).toLocaleString()}`,
  ];
  for (const ml of metaLines) {
    page.drawText(ml, { x: MARGIN, y, size: 9, font, color: rgb(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b) });
    y -= 12;
  }
  y -= 14;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN + 40) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  // --- Sections: same blocks as expanded Product Report widget ---
  for (const section of sections) {
    ensureSpace(80);
    // Section card background
    const blockTop = y + 6;
    const titleLines = wrapWords(section.title, CONTENT_W, 11);
    const contentLines: string[] = [];
    const raw = section.content.trim();
    if (raw.includes('\n')) {
      for (const chunk of raw.split('\n')) {
        if (!chunk.trim()) continue;
        const wrapped = wrapWords(chunk.trim().startsWith('•') ? chunk.trim() : `• ${chunk.trim()}`, CONTENT_W - 12, 9);
        contentLines.push(...wrapped);
      }
    } else {
      contentLines.push(...wrapWords(raw, CONTENT_W - 12, 9));
    }
    const blockHeight = 12 + titleLines.length * 12 + 8 + contentLines.length * 11 + 14;
    page.drawRectangle({
      x: MARGIN - 4,
      y: y - blockHeight + 12,
      width: CONTENT_W + 8,
      height: blockHeight,
      color: rgb(CARD_BG.r, CARD_BG.g, CARD_BG.b),
      borderColor: rgb(PRIMARY.r, PRIMARY.g, PRIMARY.b),
      borderWidth: 0.5,
    });
    // Accent bar
    page.drawRectangle({
      x: MARGIN - 4,
      y: y - blockHeight + 12,
      width: 3,
      height: blockHeight,
      color: rgb(PRIMARY.r, PRIMARY.g, PRIMARY.b),
    });

    y -= 4;
    for (const tl of titleLines) {
      page.drawText(tl, { x: MARGIN + 6, y, size: 11, font: fontBold, color: rgb(TEXT.r, TEXT.g, TEXT.b) });
      y -= 12;
    }
    y -= 6;
    for (const cl of contentLines) {
      ensureSpace(14);
      page.drawText(cl, { x: MARGIN + 10, y, size: 9, font, color: rgb(TEXT.r, TEXT.g, TEXT.b) });
      y -= 11;
    }
    y -= 18;
  }

  // --- KPI: caption from widget + rows from analysis.kpiRows only ---
  if (kpiRows.length > 0) {
    ensureSpace(80);
    page.drawText('Financials (KPI snapshot)', {
      x: MARGIN,
      y,
      size: 12,
      font: fontBold,
      color: rgb(PRIMARY.r, PRIMARY.g, PRIMARY.b),
    });
    y -= 18;
    if (kpiCaption) {
      for (const line of wrapWords(kpiCaption, CONTENT_W, 8)) {
        ensureSpace(12);
        page.drawText(line, { x: MARGIN, y, size: 8, font, color: rgb(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b) });
        y -= 10;
      }
      y -= 8;
    }

    const colMetric = MARGIN;
    const colValue = MARGIN + 200;
    const rowH = 16;
    const headerY = y;
    page.drawRectangle({
      x: MARGIN - 4,
      y: y - kpiRows.length * rowH - 22,
      width: CONTENT_W + 8,
      height: kpiRows.length * rowH + 26,
      color: rgb(CARD_BG.r, CARD_BG.g, CARD_BG.b),
      borderWidth: 0.5,
      borderColor: rgb(PRIMARY.r, PRIMARY.g, PRIMARY.b),
    });
    page.drawRectangle({
      x: MARGIN - 4,
      y: headerY - 14,
      width: CONTENT_W + 8,
      height: 14,
      color: rgb(PRIMARY.r, PRIMARY.g, PRIMARY.b),
    });
    page.drawText('Metric', { x: colMetric, y: headerY - 10, size: 8, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Value', { x: colValue, y: headerY - 10, size: 8, font: fontBold, color: rgb(1, 1, 1) });
    y = headerY - 20;
    for (const row of kpiRows) {
      ensureSpace(rowH + 4);
      page.drawText(row.metric.substring(0, 45), { x: colMetric, y, size: 9, font, color: rgb(TEXT.r, TEXT.g, TEXT.b) });
      page.drawText(row.value.substring(0, 30), { x: colValue, y, size: 9, font, color: rgb(TEXT.r, TEXT.g, TEXT.b) });
      y -= rowH;
    }
  }

  return pdfDoc.save();
}

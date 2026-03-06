# LensAI V0 – Project README

## Project Overview

LensAI is an AI-driven market analysis platform designed to help investors interpret financial markets through structured AI analysis.

Instead of traditional dashboards or static research reports, LensAI introduces **AI Analysts** that perform structured research and generate analytical outputs.

These outputs appear inside a workspace interface, allowing users to quickly understand a company's business model, key performance metrics, and investment profile.

Users can then generate structured research reports derived from the analysis.

This repository contains the **V0 prototype implementation** of LensAI.

The purpose of V0 is not to build the full product, but to demonstrate the core workflow and interface concept.

---

## V0 Product Goal

LensAI V0 should demonstrate the following workflow:

**Select a company → Select an AI analyst → Run analysis → View analytical outputs → Generate a report.**

The goal is to show how AI-driven structured research could replace manual investment analysis workflows.

V0 should feel like a professional fintech research interface, even if the backend logic is simple or uses placeholder data.

---

## Core Concept

LensAI introduces the concept of **AI Analysts**.

Each AI analyst represents a specialised research perspective and produces structured analytical outputs.

Future versions of LensAI may include multiple analysts such as:

- Fundamental Analyst
- Valuation Analyst
- Industry Analyst
- Risk Analyst
- News Analyst
- Macro Analyst

However, **V0 includes only one analyst.**

### Fundamental Analyst AI

This analyst performs fundamental company analysis and produces two analytical outputs:

- **Product Report**
- **KPI Table**

These outputs represent the initial LensAI widget system.

---

## Analytical Outputs (V0 Widgets)

V0 contains only two widgets.

### Product Report

A concise written analysis explaining:

- what the company does
- its business model
- revenue drivers
- positioning within its industry

The purpose of this report is to give the user immediate context for the business.

The report should read like a professional analyst explaining the company to an investment committee.

### KPI Table

A structured table showing the most relevant performance metrics for the company.

KPIs should be selected dynamically based on the company's business model.

Examples may include:

- Revenue
- ARR
- EBITDA
- Free Cash Flow
- Net Income
- Customer Growth
- Margin Metrics

The KPI table should display historical trends across multiple periods.

Example:

| KPI     | FY21   | FY22   | FY23   | FY24   |
|---------|--------|--------|--------|--------|
| Revenue | $120m  | $145m  | $171m  | $210m  |
| EBITDA  | $18m   | $23m   | $30m   | $42m   |
| FCF     | $12m   | $15m   | $21m   | $29m   |

This table represents the core quantitative view of the company.

---

## Product Flow

The LensAI V0 interface contains four primary screens.

### Screen 1 — Select Company

**Purpose:** Allow the user to choose a company to analyse.

**Layout:** Centered layout.

**Title:** *Select Company*

Below the title is a search bar where the user enters a ticker symbol.

Example: **AAPL**

Once a ticker is entered, a company card appears below the search bar.

The company card should contain:

- Company logo
- Company name
- Ticker
- Exchange
- Market cap
- Sector
- Industry

Example layout:

**Apple Inc.**  
**AAPL**

*NASDAQ | $2.72T | Technology | Consumer Electronics*

The card should be styled like a premium fintech UI card with rounded corners, subtle gradients, and soft shadows.

Clicking the card moves the user to the next screen.

---

### Screen 2 — Choose AI Analyst

**Purpose:** Allow the user to select which AI analyst will perform the research.

**Title:** *Choose Analysis Setup*

**Subtitle:** *Select an AI analyst to run structured research on the company.*

Two cards should appear.

#### Fundamental Analyst (Active)

This is the only available analyst in V0.

**Description:** Performs structured fundamental analysis including:

- business model analysis
- financial performance
- KPI trend reconstruction
- investment-relevant metrics

**Outputs:**

- Product Report
- KPI Table

**Button:** *Run Analysis*

This card should be visually emphasised.

#### Additional Analysts (Coming Soon)

A second card appears but is disabled.

This communicates the future architecture of LensAI.

Examples of future analysts:

- Valuation Analyst
- Industry Analyst
- Risk Analyst
- News Impact Analyst

**Button:** *Coming Soon*

This card should appear visually muted.

---

### Screen 3 — Processed Outputs (Workspace)

This is the main LensAI workspace.

**Title:** *Processed Outputs*

Below the title display company information.

Example: **Micron Technology — NASDAQ — $126B Market Cap**

Below this display: **Analysis By: Fundamental Analyst AI**

#### Workspace Layout

The workspace contains two widgets.

**Product Report Widget**  
Displays the AI-generated business analysis.

Content includes:

- business model overview
- revenue drivers
- industry positioning

This section should resemble a professional research summary card.

**KPI Table Widget**  
Displays a structured financial KPI trend table.

Example:

| KPI     | FY21  | FY22  | FY23  | FY24  |
|---------|-------|-------|-------|-------|
| Revenue | $120m | $145m | $171m | $210m |
| EBITDA  | $18m  | $23m  | $30m  | $42m  |

#### Widget Behaviour

Widgets should simulate AI analysis running.

They should initially appear in a loading state such as: *Processing...*

Once analysis completes they display results.

#### Model Progress Indicator

At the bottom of the page show a progress indicator.

Example: **2 of 2 widgets complete**

---

### Screen 4 — Evaluation & Reporting Engine

**Purpose:** Convert the structured outputs into a formal research report.

**Title:** *Evaluation & Reporting Engine*

Tabs may include:

- Overview Report
- Valuation Analysis
- Industry Comparison
- News Impact

**For V0 only the Overview Report must be implemented.**

---

## Overview Report

The report should resemble a professional initiation report.

Sections should include:

- Company name
- Key positives
- Key negatives
- Investment thesis
- Company summary
- Financials
- Credit ratings
- ESG

The **Financials** section should contain the KPI table.

The entire report should fit within one A4 page.

The tone should resemble a professional investment analyst writing for an investment committee.

---

## Design System

The UI should follow a clean premium SaaS design system.

**Color palette:**

| Role            | Value    |
|-----------------|----------|
| Primary Accent  | `#5B6CFF` |
| Background      | `#0F1226` |
| Light Neutral   | `#F5F6FA` |
| Subtle Accent   | `#6772E5` |
| Card Background | `#2A2940` |

**Optional gradient accents:** `#8A7DFF` → `#5B6CFF`

---

## Visual Style

The interface should resemble a modern fintech research platform.

**Design principles:**

- dark UI
- soft purple accents
- rounded cards
- minimal borders
- strong typography hierarchy

The aesthetic should resemble Bloomberg Terminal combined with modern fintech SaaS dashboards.

---

## Interaction Principles

The system should feel analytical and dynamic.

**Key behaviours:**

- widgets load progressively
- cards animate slightly on hover
- analysis feels modular
- UI communicates that the AI analyst is performing research

---

## V0 Constraints

V0 must remain tightly scoped.

**Include only:**

- company selection
- AI analyst selection
- product report widget
- KPI table widget
- overview report

**Do not include:**

- chat interfaces
- trading tools
- portfolio tracking
- alerts
- notifications
- user accounts

These features belong in later versions.

---

## Purpose of V0

The purpose of V0 is to demonstrate:

- the LensAI concept
- AI analyst workflow
- structured analysis outputs
- automated research report generation

LensAI V0 should function as a **visual and conceptual prototype** that can later evolve into a full AI-powered research platform.

# ODS → XLSX Converter

Browser-based converter for ODS files to XLSX format. Files never leave your device — all processing happens client-side using SheetJS.

**Live demo:** https://kestgalax.github.io/ods-xlsx/

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Card, Button, Badge, Table, Tabs, Progress, Alert, ScrollArea, Separator)
- [SheetJS (xlsx)](https://sheetjs.com/) — reads ODS, writes XLSX

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Production Build

```bash
npm run build
npm run preview
```

## Deployment

Push to main branch — GitHub Actions will deploy automatically.

## Project Structure

```
src/
├── App.tsx              # root, wraps with ThemeProvider
├── OdsConverter.tsx     # main component
├── theme.tsx            # light/dark theme provider
├── index.css            # Tailwind + shadcn CSS variables
└── components/ui/       # shadcn UI components
```

## Features

- Drag & drop or file picker
- Supports `.ods` and `.xlsx` files
- Preview all sheets with tabbed interface
- File metadata: size, sheet count, row count
- Download converted `.xlsx`
- Light / dark theme (auto-detected from system, persisted in localStorage)
- Multi-language support (English, Russian)

## Embedding in Your Project

The `OdsConverter.tsx` component is self-contained. To embed in an existing project:

```bash
npm install xlsx
npx shadcn@latest add card button badge table tabs progress alert scroll-area separator
```

Copy `OdsConverter.tsx` and `theme.tsx`, wrap with `<ThemeProvider>`.

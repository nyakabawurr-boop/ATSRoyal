# ATS Resume Tool (MVP)

An ATS-safe resume utility with three modules: format checking, resume tailoring, and cover letter generation. All parsing and exports run server-side, with local autosave and transparent scoring.

## Features
- ATS format checker with rubric-based scoring and parsed preview
- Resume tailoring with section control, match scoring, and change log
- Cover letter generation with tone and length options
- DOCX + PDF export and JSON import/export
- Fact-lock guardrails to prevent fabricated facts

## Tech Stack
- Next.js App Router + TypeScript + Tailwind
- Zustand + localStorage autosave
- Parsing: `mammoth` (DOCX), `pdfjs-dist` (PDF)
- Exports: `docx`, `pdfkit`
- Tests: Vitest

## Setup
```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment Variables
Create a `.env.local` file if you want AI-assisted rewrites:
```
OPENAI_API_KEY=your_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

If the key is missing, the app falls back to deterministic heuristics.

## Architecture
- `src/app/*` pages and API routes
- `src/lib/*` core parsing, scoring, tailoring, and export logic
- `src/store/useResumeStore.ts` Zustand state + autosave
- `samples/*` demo resume and job description

## Scripts
```bash
npm run dev
npm run build
npm run test
```

## Sample Files
- `samples/demo-resume.docx`
- `samples/demo-jd.txt`

## Notes
- Files are processed server-side and not stored permanently.
- Rate limiting is applied to AI-backed endpoints.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

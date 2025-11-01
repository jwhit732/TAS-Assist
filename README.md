# TAS Assistant - Unit Plan Builder

AI-powered intake system that converts plain-English briefs into structured TAS-style unit plans for Australian RTOs.

**Stage 0 MVP**: Public, no-auth web app with intake form → Claude API → JSON → preview → export workflow.

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm
- Anthropic API key

### Installation

```bash
# Clone/navigate to project
cd tas-assistant

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

### Development

```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

###Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Project Structure

```
tas-assistant/
├── app/
│   ├── api/
│   │   ├── generate/route.ts     # Main generation endpoint
│   │   └── health/route.ts       # Health check
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main application page
│   └── globals.css              # Global styles + print CSS
│
├── components/
│   ├── intake-form.tsx           # Input form with validation
│   ├── results-view.tsx          # Tabbed results display
│   ├── ui/                       # shadcn/ui components
│   └── mock-data.ts              # Test data
│
├── lib/
│   ├── aprv.ts                   # APRV loop implementation
│   ├── claude-client.ts          # Anthropic API wrapper
│   ├── schema-validator.ts       # Zod validation
│   ├── export-handlers.ts        # DOCX/PDF/MD export
│   └── storage.ts                # localStorage utilities
│
├── prompts/
│   ├── schema.json               # JSON schema definition
│   ├── schema.md                 # Schema documentation
│   └── system.md                 # APRV system prompt
│
├── types/
│   ├── unit-plan.ts              # Core TypeScript types
│   └── schema-types.ts           # Extended schema types
│
├── config/
│   └── env.ts                    # Environment configuration
│
├── TESTING.md                    # Testing guide
└── CLAUDE.md                     # Project instructions
```

---

## Core Features

### ✅ Intake Form
- Qualification details (name, code, level)
- Delivery mode (F2F, online, blended)
- Duration and hours
- Cohort profile
- Resources and assessment preferences
- Optional unit list

### ✅ APRV Generation Loop
- **Analyze**: Internal requirement review
- **Plan**: Generate complete JSON
- **Reflect**: Self-assess quality
- **Verify**: Schema validation + auto-repair

### ✅ Results Display
- **Overview**: Summary metrics, confidence score
- **Weekly Plan**: Timeline with activities/assessments
- **Units**: Detailed unit breakdown
- **Risks & Assumptions**: Identified issues
- **Compliance**: ASQA notes (if present)

### ✅ Export Formats
- **DOCX**: Editable Word document
- **PDF**: Browser print dialog
- **Markdown**: Git-friendly plain text

### ✅ Persistence
- localStorage for client-side storage
- Plan history (up to 10 plans)
- No server-side database required

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **AI**: Claude 3.5 Sonnet via Anthropic SDK
- **Validation**: Zod 3.23
- **Forms**: React Hook Form
- **Exports**: docx, file-saver

---

## Environment Variables

Create `.env.local` with:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Optional
NEXT_PUBLIC_API_MODEL=claude-3-5-sonnet-20241022
NEXT_PUBLIC_FEATURE_AUTH=false
NEXT_PUBLIC_FEATURE_TELEMETRY=true
```

---

## Usage

1. **Fill Intake Form**: Provide qualification, duration, and cohort details
2. **Generate**: Click "Generate Unit Plan" (takes 1-3 minutes)
3. **Review**: Browse results in tabbed interface
4. **Export**: Download as DOCX, PDF, or Markdown
5. **Iterate**: Start over or refine

---

## Testing

See `TESTING.md` for comprehensive testing guide.

**Three Test Scenarios**:
1. **Short Course** (2 weeks, F2F, single trainer)
2. **Blended Program** (8 weeks, mixed mode, multiple units)
3. **Multi-trainer Complex** (16+ weeks, all resources)

### Quick Test

```bash
# Start dev server
npm run dev

# In browser, test with:
Qualification: Certificate III in Customer Engagement
Code: SIR30216
Mode: Face to Face
Weeks: 2
Hours: 80
Cohort: "12 learners, ages 25-45, LLN Level 3"
```

---

## API Endpoints

### POST /api/generate
Generates a unit plan from intake data.

**Request**:
```json
{
  "qualification": "Cert IV in Training",
  "deliveryMode": "blended",
  "durationWeeks": 8,
  "totalHours": 240,
  "cohortProfile": "Working professionals..."
}
```

**Response**:
```json
{
  "success": true,
  "plan": { /* GeneratedPlan object */ },
  "metadata": {
    "duration_ms": 45000,
    "logs": [...]
  }
}
```

### GET /api/health
Health check endpoint.

---

## Key Design Decisions

### Schema-First Approach
All AI output validated against `prompts/schema.json`. Ensures consistency and reliability.

### APRV Loop Pattern
Multi-phase generation with self-repair:
1. Internal planning (no output)
2. JSON generation
3. Self-assessment
4. Validation + repair (up to 2 retries)

### File-Based Prompts
System prompts loaded from `prompts/` directory at runtime. Enables prompt tuning without deployment.

### localStorage Only
Stage 0 MVP has no database. All persistence is client-side. Privacy-friendly, simple deployment.

### Australian RTO Context
- ASQA Standards 2015 compliance
- training.gov.au unit code formats
- AQF qualification levels
- TAE trainer requirements

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Generation time | < 3 minutes | ✅ |
| First-draft usability | > 80% | ⏳ Testing |
| Schema validation rate | 100% | ✅ |
| Export success rate | 100% | ✅ |
| Server-side PII storage | Zero | ✅ |

---

## Troubleshooting

### "API Key Error"
- Check `.env.local` has `ANTHROPIC_API_KEY`
- Verify key starts with `sk-ant-api03-`

### "Generation Failed"
- Check network connection
- Verify API key is valid
- Check browser console for errors
- Review generation logs (expand details)

### "Export Not Working"
- **DOCX**: Ensure `docx` and `file-saver` installed
- **PDF**: Check print CSS in `globals.css`
- **Markdown**: Check browser download permissions

### Type Errors
- Run `npm install` to ensure all dependencies installed
- Check TypeScript version: `npx tsc --version`
- Rebuild: `rm -rf .next && npm run dev`

---

## Development

### Code Style
- TypeScript strict mode
- ESLint configured
- Prettier (recommended)
- No emojis in code (per project requirements)

### Adding Features
- Update JSON schema first (`prompts/schema.json`)
- Regenerate TypeScript types if needed
- Update system prompt (`prompts/system.md`)
- Add validation in `schema-validator.ts`
- Update components as needed

### Testing Locally
```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Dev server
npm run dev
```

---

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable in Vercel dashboard
ANTHROPIC_API_KEY=your-key-here
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Roadmap

### Stage 1 (Future)
- [ ] User authentication
- [ ] Database persistence (PostgreSQL)
- [ ] Collaboration features
- [ ] Plan versioning
- [ ] Templates library

### Stage 2 (Future)
- [ ] Multi-RTO support
- [ ] Advanced scheduling
- [ ] Resource booking integration
- [ ] Compliance checking automation
- [ ] Bulk generation

---

## Contributing

This is a Stage 0 MVP. Contributions welcome after initial testing phase.

---

## License

Proprietary - Australian RTO use only.

---

## Support

For issues:
1. Check `TESTING.md`
2. Review browser console logs
3. Check generation logs in UI
4. Verify environment configuration

---

## Acknowledgments

- **Claude AI** (Anthropic) for generation
- **Australian RTO Community** for domain expertise
- **ASQA** for compliance standards
- **training.gov.au** for unit code formats

---

**Remember**: Generated plans are drafts. Always review and customize before use in compliance with ASQA standards.

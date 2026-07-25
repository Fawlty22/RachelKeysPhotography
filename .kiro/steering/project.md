# Project: Rachel Keys Photography Portfolio

## Overview
A photography portfolio website for Rachel Keys — a new photographer looking to display her work and offer herself for hire for events.

This project contains **two sites**:
1. **Portfolio site** — the public-facing site clients visit to browse work and make contact
2. **CMS / Admin hub** — a private site Rachel uses to manage portfolio content (photos, copy, categories) without requiring developer involvement

## Goals
- Showcase Rachel's photography in a visually compelling way
- Enable potential clients to browse her portfolio by category/event type
- Provide a clear path for clients to contact/hire her
- Give Rachel full control over content updates without needing code changes or deployments

## Status
Infra deployed. CMS is built. Portfolio has been migrated from Vite + React SPA to Next.js (App Router) with static generation for SEO.

**What's built and live:**
- Portfolio: Next.js static site deployed to S3 + CloudFront at rachelkeysphotography.com
- CMS: Vite + React SPA deployed at admin.rachelkeysphotography.com — Photos and Content pages are fully functional
- Build pipeline: Lambda + CodeBuild CDK constructs are written and deployed to AWS

**What's a stub (exists but not implemented):**
- CMS Dashboard page — renders a heading only
- CMS Categories page — renders a heading only; no category management logic

**What's missing / not yet built:**
- Portfolio Experience section — nav links to `#experience` but the Testimonial section there has only static hardcoded copy
- Portfolio Investment/pricing section — nav links to `#investment` but the photo Carousel currently occupies that id
- Full browseable gallery/portfolio page — only a 5-photo Highlights strip exists
- Pipeline end-to-end test — the source zip has not been uploaded to the source bucket; the triggered rebuild flow has not been verified

## SEO
The portfolio is fully indexable by search engines.

- Built with Next.js App Router using static generation (`next build` outputs pre-rendered HTML)
- Every page renders full HTML at build time — crawlers see real content on first load
- `<head>` metadata on every page: `<title>`, `<meta name="description">`, Open Graph tags, Twitter card tags
- Structured data (JSON-LD) with `LocalBusiness` + `Person` schema on the home page
- Canonical URLs set on all pages via `alternates.canonical` in metadata exports
- `sitemap.xml` generated via `app/sitemap.ts`
- `robots.txt` generated via `app/robots.ts`

## Deployment Architecture
**Decision: fully static Next.js deployed to S3 + CloudFront, with automated rebuilds triggered by CMS publish actions.**

Do not use ISR, OpenNext, SST, or any server runtime for the portfolio. The site is pre-rendered at build time and served as static files.

**Automated rebuild pipeline (to be implemented):**
```
CMS Publish
    ↓
Trigger Lambda (Function URL or API Gateway)
    ↓
AWS CodeBuild
    ↓
npm run build (next build → static output)
    ↓
Upload static output to S3
    ↓
CloudFront invalidation
```

**Rationale:**
- Content updates are infrequent (new galleries, pricing edits, about page changes) — build time is an acceptable tradeoff
- Fully static hosting on S3 + CloudFront is simpler, cheaper, and already deployed
- No server runtime to manage, secure, or pay for
- Deployment stays entirely within AWS using IAM roles — no external CI/CD credentials needed
- Rachel never performs manual deployments; publishing in the CMS automatically triggers a rebuild

## Infrastructure (AWS)
- **Deployment**: S3 + CloudFront (deployed)
- **Domain**: `rachelkeysphotography.com` registered and live
- **Portfolio**: `rachelkeysphotography.com` → CloudFront → S3
- **CMS hub**: `admin.rachelkeysphotography.com` → CloudFront → S3
- **Asset/Photo storage**: S3 (separate photos bucket)
- **Auth**: AWS Cognito User Pool — username/password, Cognito Hosted UI
- **Backend/Database**: None — static/serverless only

## Authentication (CMS hub only)
- Provider: AWS Cognito User Pool
- Flow: username + password (no social/federated login)
- Login UI: Cognito Hosted UI (no custom login page needed)
- Users: 1–2 accounts max (Rachel + Matt if needed)
- The portfolio site has no auth — fully public
- Cognito resources to be added to the CDK infra stack

## Tone & Style
- Elegant, minimal, photography-first design
- Let the images speak; UI should not compete with the work
- Mobile-friendly is a must — clients will browse on their phones

## Key Sections — Portfolio Site (anticipated)
- Hero / landing
- Portfolio gallery (filterable by category: weddings, portraits, events, etc.)
- About Rachel
- Services & pricing
- Contact / booking

## Key Sections — CMS Hub (anticipated)
- Photo/gallery management (upload, organize, reorder, delete)
- Category/tag management
- Copy editing (about, services, pricing)
- Simple, approachable UI — Rachel is not technical

## Mockup
A visual mockup of the portfolio site is at `.kiro/mockups/portfolio-mockup.jpg`. Photos in it are stock placeholders — the design intent is what matters. Reference it when making UI/layout decisions.

## Notes
- Rachel is a new photographer, so copy should feel approachable, not overly corporate
- The CMS exists so Rachel never has to ask Matt to push a deploy for content changes
- Hiring/booking flow is important — make it easy for people to reach out

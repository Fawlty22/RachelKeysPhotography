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
Infra deployed. CMS is built. Portfolio is built as a React SPA but needs to be migrated to Next.js with SSR for SEO.

## SEO Requirements
The portfolio is a public-facing site that needs to be discoverable by search engines. The current React SPA renders entirely in the browser, which means search engine crawlers see an empty HTML shell — no content is indexable. This must be fixed.

**Planned migration: React → Next.js (App Router, SSR)**
- Replace the current Vite + React SPA (`portfolio/`) with a Next.js app using server-side rendering
- Every page must render full HTML on the server so crawlers can index content
- Implement `<head>` metadata per page: `<title>`, `<meta name="description">`, Open Graph tags (`og:title`, `og:description`, `og:image`), and Twitter card tags
- Use Next.js `generateMetadata()` for dynamic/per-page metadata
- Structured data (JSON-LD) should be added for the photographer's business (LocalBusiness or Person schema)
- Canonical URLs must be set on all pages
- A `sitemap.xml` should be generated (Next.js supports this natively via `app/sitemap.ts`)
- A `robots.txt` should allow crawling of the portfolio and block the CMS

**Infrastructure note**: Migrating to Next.js with SSR means the portfolio can no longer be hosted as a static site on S3 + CloudFront alone. A server runtime is required (e.g., AWS Lambda via OpenNext/SST, or a container). The infra stack will need to be updated as part of this migration.

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

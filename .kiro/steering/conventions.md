# Conventions

## General
- Keep it simple — this is a portfolio + content management site, not a SaaS product
- Prefer well-supported, low-maintenance dependencies
- Accessibility matters: images need alt text, contrast ratios should pass WCAG AA

## Project Structure
- Two sites live in this repo: `portfolio/` (public) and `cms/` (admin hub)
- The portfolio is a **Next.js (App Router) static site** — `next build` outputs pre-rendered HTML, deployed to S3 + CloudFront
- The CMS remains a Vite + React SPA (no SSR needed; it's behind auth and not crawled)
- Shared code/utilities should live in a common package if the project warrants it

## Code Style
- Consistent formatting enforced by the project's linter/formatter (TBD when stack is chosen)
- Component/file names: TBD based on chosen framework conventions

## SEO (Portfolio Site)
The portfolio must be fully indexable by search engines. The CMS has no SEO requirements.

- **Framework**: Next.js (App Router) with **static generation** — do not use ISR (`revalidate`), SSR (`dynamic = 'force-dynamic'`), or any server runtime. Pages are pre-rendered at build time.
- **Data fetching**: fetch CMS content at build time using `cache: 'force-cache'` (or no cache option). Content is baked into the static HTML. Updates go live when the automated rebuild pipeline runs after a CMS publish.
- **Metadata**: every page must export `generateMetadata()` (or a static `metadata` object) with at minimum `title`, `description`, `openGraph` (title, description, image, url), and `twitter` card tags
- **Structured data**: include JSON-LD on the home page using `Person` or `LocalBusiness` schema for Rachel's photography business
- **Canonical URLs**: set `alternates.canonical` in metadata for every page to avoid duplicate-content penalties
- **Sitemap**: generate via `app/sitemap.ts` (Next.js native); include all public routes
- **robots.txt**: generate via `app/robots.ts`; allow all crawlers on the portfolio
- **Image SEO**: all `<Image>` components must have descriptive `alt` text — never empty string for content images
- **Performance**: Core Web Vitals directly affect search ranking — maintain fast LCP, low CLS, low INP
  - Use `next/image` for all photos (automatic WebP/AVIF conversion, lazy loading, size optimization)
  - Avoid layout shift: always provide `width`/`height` or use `fill` with a sized container
- **Heading hierarchy**: each page should have exactly one `<h1>`; use `<h2>`/`<h3>` for subsections

## Images & Assets
- Never commit full-resolution source photos to git — store in S3
- Always include width/height attributes or aspect-ratio CSS to prevent layout shift
- Use modern formats (WebP/AVIF) with fallbacks where supported
- S3 bucket structure should separate originals from web-optimized versions

## AWS & Infrastructure
- IaC: AWS CDK TypeScript, located in `/infra`
- All stacks deploy to `us-east-1` (required for CloudFront ACM certificates)
- Prefer serverless/static hosting (S3 + CloudFront) over running servers
- No database unless a clear need emerges — start static/serverless
- Keep AWS costs minimal; this is a personal portfolio, not a commercial product

### Deployed resources
| Resource | Value |
|---|---|
| Portfolio bucket | `rachelkeysphotographystac-portfoliositebucket53fae-do3ngwn5zvv8` |
| CMS bucket | `rachelkeysphotographystack-cmshubbucket56fd7dea-wwtjgn9bu0ig` |
| Photos bucket | `rachelkeysphotographystack-photosbucket0a0467f9-fvaw0fcrd6ih` |
| Photos CDN | `https://photos.rachelkeysphotography.com` |
| Portfolio CloudFront | `https://d1wtwqee7v5syi.cloudfront.net` |
| CMS CloudFront | `https://d22v6dpfs2idgf.cloudfront.net` |
| Hosted Zone ID | `Z00223002OWW3IJX21IC9` |
| CMS Identity Pool ID | `us-east-1:1375fd5e-7b0c-4a0e-b8e9-6a7195c5a413` |

### CDK commands (run from `/infra`)
```
npx cdk synth          # preview CloudFormation template
npx cdk diff           # diff against deployed stack
npx cdk deploy         # deploy to AWS (must be bootstrapped in us-east-1)
```

## Authentication
- CMS hub is protected by AWS Cognito — portfolio site is fully public
- User Pool: username + password, Cognito Hosted UI
- Callback URL: `https://admin.rachelkeysphotography.com`
- Logout URL: `https://admin.rachelkeysphotography.com`
- Cognito resources live in the CDK infra stack (`/infra`)
- Token validation happens client-side in the CMS React app (check for valid Cognito JWT on load, redirect to Hosted UI if missing/expired)

### Deployed Cognito values
| | |
|---|---|
| User Pool ID | `us-east-1_xEoOg1QOx` |
| Client ID | `4v0vdluscbkqjubd1mcoq64bum` |
| Hosted UI base URL | `https://rachelkeys-cms.auth.us-east-1.amazoncognito.com` |

## Deployment Pipeline
The portfolio is deployed as a fully static site. **Do not introduce ISR, OpenNext, SST, or any server runtime.**

**How it works:**
- The CMS triggers a Lambda (via Function URL or API Gateway) when content is published
- That Lambda starts an AWS CodeBuild job
- CodeBuild checks out the repo, runs `npm run build` in `portfolio/`, and uploads the output to S3
- A CloudFront invalidation clears the CDN cache so the updated site goes live immediately

**Key constraints for the portfolio codebase:**
- All data fetching must happen at build time — use `cache: 'force-cache'` on fetch calls (or omit the cache option, which defaults to force-cache in Next.js static builds)
- Never use `next: { revalidate: N }` — ISR requires a server runtime
- Never use `export const dynamic = 'force-dynamic'` on any page
- The `next build` output must be fully static (`○` in the build summary, no server functions)

**The pipeline itself (Lambda + CodeBuild) is part of the CDK infra stack in `/infra` and has been implemented and deployed — but the source zip has not yet been uploaded to the source bucket and the end-to-end flow has not been verified.**

## Git
- Conventional commit prefixes: `feat:`, `fix:`, `chore:`, `style:`, `docs:`, `infra:`
- Do not push directly to main

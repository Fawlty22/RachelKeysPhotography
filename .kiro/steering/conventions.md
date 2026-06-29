# Conventions

## General
- Keep it simple — this is a portfolio + content management site, not a SaaS product
- Prefer well-supported, low-maintenance dependencies
- Accessibility matters: images need alt text, contrast ratios should pass WCAG AA

## Project Structure
- Two sites live in this repo: `portfolio/` (public) and `cms/` (admin hub)
- Shared code/utilities should live in a common package if the project warrants it

## Code Style
- Consistent formatting enforced by the project's linter/formatter (TBD when stack is chosen)
- Component/file names: TBD based on chosen framework conventions

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

## Git
- Conventional commit prefixes: `feat:`, `fix:`, `chore:`, `style:`, `docs:`, `infra:`
- Do not push directly to main

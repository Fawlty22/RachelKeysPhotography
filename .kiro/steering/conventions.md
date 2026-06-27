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

### CDK commands (run from `/infra`)
```
npx cdk synth          # preview CloudFormation template
npx cdk diff           # diff against deployed stack
npx cdk deploy         # deploy to AWS (must be bootstrapped in us-east-1)
```

### Domain registration
`rachelkeysphotography.com` must be registered separately — CDK does not handle it.
Use the AWS Console (Route 53 > Domains > Register) or:
```
aws route53domains register-domain --domain-name rachelkeysphotography.com \
  --duration-in-years 1 --auto-renew \
  --admin-contact file://contact.json \
  --registrant-contact file://contact.json \
  --tech-contact file://contact.json \
  --region us-east-1
```
After registration, update the domain's nameservers to match the hosted zone NS records output by `cdk deploy`.

## Git
- Conventional commit prefixes: `feat:`, `fix:`, `chore:`, `style:`, `docs:`, `infra:`
- Do not push directly to main

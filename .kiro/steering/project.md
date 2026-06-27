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
Early-stage — frontend framework and CMS approach still TBD.

## Infrastructure (AWS)
- **Deployment**: AWS (specific services TBD — likely S3 + CloudFront for the public site)
- **Asset/Photo storage**: S3
- **Backend/Database**: None planned — keep it serverless and static where possible
- This may evolve, but start with the simplest viable AWS-hosted architecture

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

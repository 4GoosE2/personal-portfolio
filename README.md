# Mårten Wikman — Portfolio

Professional portfolio site: valuation, due diligence, and BI case studies.
Built with [Astro](https://astro.build) and [Decap CMS](https://decapcms.org),
deployed on Netlify.

## Run locally

```sh
npm install
npm run dev          # site at http://localhost:4321
```

To use the CMS locally, run the Decap proxy in a second terminal:

```sh
npx decap-server     # then open http://localhost:4321/admin/
```

With the proxy running, the CMS edits files in your local working copy
directly — no login required (`local_backend: true` in `public/admin/config.yml`).

Other commands: `npm run build` (production build to `dist/`), `npm run preview`
(serve the built site).

## Adding a new project

### Via the CMS (`/admin`)

1. Open `/admin` (locally with `npx decap-server` running, or on the deployed
   site after OAuth setup — see Deployment below).
2. Click **Projects → New Projects**, fill in the fields (title, category,
   subcategory, tags, date, key metrics, body), and publish.
3. The CMS commits a Markdown file to `src/content/projects/` (and any images
   to `public/uploads/`). On the deployed site this pushes to GitHub, which
   triggers a Netlify rebuild automatically.

### Manually

Create `src/content/projects/<your-slug>.md`. The filename becomes the URL slug
(`/portfolio/<category-slug>/<your-slug>/`). Frontmatter:

```markdown
---
title: "Project Title"
category: "Valuation & Financial Modeling"   # must match one of the 6 fixed categories
subcategory: "Growth Equity"                  # optional, free text
tags: [SaaS, Series B]
date: "Mid-2025"
metrics:
  - label: "ARR"
    value: "€XXm"
cover: "/uploads/cover.png"                   # optional
images: ["/uploads/extra.png"]                # optional
---

## Executive Summary

Body text in Markdown…
```

The six valid categories are defined in `src/lib/categories.ts` and mirrored in
`public/admin/config.yml` — if you ever change them, update both files.

The first metric in the list is rendered as the page's single standout figure
(clay/`--alert` color), so put the headline number first.

## Deployment (Netlify)

The site deploys continuously from GitHub: every push to `main` triggers
`npm run build` on Netlify (config in `netlify.toml`) and publishes `dist/`.

One-time setup:

1. Push this repo to GitHub.
2. In [Netlify](https://app.netlify.com): **Add new site → Import an existing
   project → GitHub**, pick the repo. Build settings are read from
   `netlify.toml` automatically.
3. For the CMS on the live site, set up GitHub OAuth:
   - In `public/admin/config.yml`, replace `OWNER/REPO` with your actual
     GitHub repository path.
   - Create a GitHub OAuth app (GitHub → Settings → Developer settings →
     OAuth Apps → New): Homepage URL = your Netlify site URL, Authorization
     callback URL = `https://api.netlify.com/auth/done`.
   - In Netlify: **Site configuration → Access & security → OAuth → Install
     provider → GitHub**, paste the OAuth app's Client ID and Secret.
   - `/admin` on the live site now logs in with GitHub; anyone with write
     access to the repo can edit content.

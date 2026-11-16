# Kenneth's Portfolio - The Mint Coder

A portfolio and journal built with Jekyll, designed as a quiet product studio: warm paper, ink, a single emerald accent, and self-hosted typography. The interface stays calm and the work does the talking.

## Features

- **Editorial design system** - Zodiak display type, General Sans body and UI copy, JetBrains Mono for code, all self-hosted from `assets/fonts`.
- **Light and dark themes** - persisted in `localStorage`, with a `themechange` event so dynamic pieces can recolor.
- **Responsive layout** - fluid type and spacing, a dedicated mobile navigation panel, and no horizontal overflow.
- **Home folio** - client-focused hero, services with deliverables, featured work with outcomes, process, engagement types, and FAQ.
- **Project archive** - live search with hover-safe links.
- **Journal** - topic filters that update a live result count without a reload.
- **Contact** - async form feedback, honeypot spam protection, and one-click email copying.
- **Article layout** - reading time, styled tables and blockquotes, and copy buttons on code blocks.
- **Accessibility** - skip link, visible focus rings, ARIA state on navigation and filters, and reduced-motion support.
- **SEO** - meta descriptions, Open Graph, Twitter Cards, and JSON-LD structured data.

## Tech Stack

- **Jekyll** - static site generation, collections, and data files
- **SCSS** - modular partials and CSS custom properties
- **Vanilla JavaScript** - no runtime dependencies
- **Playwright** - used locally for visual and interaction checks, not shipped

## Design System

### Palette

| Token | Light | Dark |
| --- | --- | --- |
| Paper | `#FAFAF7` | `#0B0F0D` |
| Ink | `#111614` | `#EDF2EE` |
| Mint | `#0F6B4F` | `#6FE0AF` |

Surface, line, and shadow colors are all derived from these tokens in `_sass/_base.scss`.

### Typography

- **Display** - Zodiak (Fontshare)
- **Body and UI** - General Sans (Fontshare)
- **Code** - JetBrains Mono (Google Fonts, OFL)

Fonts are self-hosted as `woff2` in `assets/fonts` and declared in `_sass/_fonts.scss`, so there are no third-party font requests at runtime.

### Layout language

- Hairline rules, small uppercase section labels, and restrained shadows
- Soft rounded cards on warm paper, with a single emerald accent
- Generous whitespace and an editorial two-column measure

## Project Structure

```
kennethkenn.github.io/
├── _includes/
│   ├── head.html
│   ├── header.html
│   ├── footer.html
│   └── structured-data.html
├── _layouts/
│   ├── default.html
│   └── post.html
├── _sass/
│   ├── _fonts.scss       # Self-hosted @font-face declarations
│   ├── _base.scss        # Tokens, reset, typography, motion
│   ├── _chrome.scss      # Header, footer, page heroes
│   ├── _home.scss        # Hero, services, work, process, engagements, FAQ, CTA
│   ├── _pages.scss       # Archive, about, contact, blog, 404
│   └── _post.scss        # Article typography and code blocks
├── _data/
│   ├── projects.yml
│   └── blog_topics.yml
├── _posts/               # Journal entries
├── assets/
│   ├── css/main.scss
│   ├── js/main.js        # Reveals, previews, filters, canvas, copy buttons
│   ├── js/dark-mode.js   # Theme toggle and persistence
│   ├── js/form-handler.js
│   └── images/
├── _config.yml
├── index.md
├── projects.md
├── about.md
├── blog.md
├── contacts.md
└── 404.md
```

## Running Locally

### Prerequisites

- Ruby 2.5+
- Jekyll 4.0+
- Bundler

```bash
bundle install
bundle exec jekyll serve
```

Visit `http://localhost:4000`.

### Production build

```bash
bundle exec jekyll build
```

The generated site is written to `_site/`.

## Customization

### Site details

Edit `_config.yml` for the title, email, description, and canonical URL.

### Projects

Add entries to `_data/projects.yml`:

```yaml
- title: Project Name
  description: Project description
  tech: Technology stack
  github: https://github.com/...
  demo: https://example.com
  image: /assets/images/projects/cover.webp
```

For the home-page hover preview, the work rows read `data-image` from each featured project.

### Journal topics

Edit `_data/blog_topics.yml` to change the filter chips. Each topic maps a slug and label to post categories:

```yaml
- slug: systems
  label: Systems
  categories: [systems, linux, cpp]
```

### Theme tokens

All colors, type stacks, spacing, easing curves, and shadows live at the top of `_sass/_base.scss`. Override the custom properties there rather than adding page-specific colors.

### Motion

Entrance reveals use `[data-reveal]` plus the `is-inview` class. The hero drafting canvas, work previews, magnetic controls, and header progress are initialized in `assets/js/main.js`. The canvas stops when the hero leaves the viewport and draws a single static frame when `prefers-reduced-motion: reduce` is set.

## License

Open source under the [MIT License](LICENSE).

## Contact

Kenneth - [kenneth@themintcoder.org](mailto:kenneth@themintcoder.org)

Repository: [github.com/kennethkenn/kennethkenn.github.io](https://github.com/kennethkenn/kennethkenn.github.io)

---
layout: post
title: "SCSS Architecture for Scalable Projects"
date: 2025-07-27
categories: [Frontend, CSS]
description: "How to structure your SCSS using the 7-1 pattern to keep your styles maintainable, including the use of mixins and variables."
tags: [scss, css, architecture, frontend, web-design]
---

CSS is easy to write but hard to maintain. On day one, your `style.css` is 50 lines. On day 100, it's 5000 lines of spaghetti code with `!important` scattered everywhere like landmines.

For my portfolio and larger projects, I strictly follow the **7-1 Pattern**. It breaks your SCSS into 7 folders and 1 main file.

## The 7-1 Pattern Structure

Here is how I structure my `_sass` directory:

```text
sass/
|
|– abstracts/    # Variables, Mixins, Functions
|   |– _variables.scss  # Colors, fonts, grid width
|   |– _mixins.scss     # Media queries, flexbox helpers
|
|– base/         # Reset, Typography, Boilerplate
|   |– _reset.scss
|   |– _typography.scss
|
|– components/   # Buttons, Cards, Navbar, Alerts
|   |– _buttons.scss
|   |– _card.scss
|
|– layout/       # Header, Footer, Sidebar, Grid
|   |– _header.scss
|   |– _grid.scss
|
|– pages/        # Page-specific styles
|   |– _home.scss
|
|– themes/       # Dark mode, Light mode
|   |– _dark-theme.scss
|
|– vendors/      # Third-party CSS (Bootstrap, jQueryUI)
|   |– _bootstrap.scss
|
`– main.scss     # The main import file
```

## The Power of Abstracts

The `abstracts` folder is the most important. It compiles to nothing (no CSS output) but provides tools for your other files.

### Variables (`_variables.scss`)

Define your design system here. If you change a color here, it updates everywhere.

```scss
$color-primary: #2C3E50;
$color-secondary: #C5A059;
$font-stack-main: 'Inter', sans-serif;
```

### Mixins (`_mixins.scss`)

I write mixins for responsiveness to avoid writing raw `@media` queries everywhere.

```scss
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'phone' {
    @media (max-width: 600px) { @content; }
  }
  @else if $breakpoint == 'tablet' {
    @media (max-width: 900px) { @content; }
  }
}

// Usage in specific files
.card {
  width: 50%;
  @include respond-to('phone') {
    width: 100%;
  }
}
```

## Why This Matters

This architecture separates concerns.
*   Need to fix the font size? Go to `base/_typography.scss`.
*   Need to change the button radius? Go to `components/_buttons.scss`.
*   Need to adjust the mobile layout? Go to `layout/_grid.scss`.

It turns CSS from a guessing game into a structured engineering discipline.

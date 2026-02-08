---
layout: post
title: "SCSS Architecture for Scalable Projects"
date: 2025-07-27
categories: [Frontend, CSS]
description: "How to structure your SCSS using the 7-1 pattern to keep your styles maintainable, including the use of mixins and variables."
tags: [scss, css, architecture, frontend, web-design]
---

CSS is easy to write but hard to maintain. On day one, your `style.css` is 50 lines. On day 100, it's 5000 lines of spaghetti code with `!important` scattered everywhere like landmines.

For my portfolio and larger projects, I follow the **7-1 Pattern**. It breaks your SCSS into 7 folders and 1 main file.

## The 7-1 Pattern Structure

Here is how I structure my `_sass` directory:

```text
sass/
|
|-- abstracts/    # Variables, Mixins, Functions
|   |-- _variables.scss  # Colors, fonts, grid width
|   |-- _mixins.scss     # Media queries, flexbox helpers
|
|-- base/         # Reset, Typography, Boilerplate
|   |-- _reset.scss
|   |-- _typography.scss
|
|-- components/   # Buttons, Cards, Navbar, Alerts
|   |-- _buttons.scss
|   |-- _card.scss
|
|-- layout/       # Header, Footer, Sidebar, Grid
|   |-- _header.scss
|   |-- _grid.scss
|
|-- pages/        # Page-specific styles
|   |-- _home.scss
|
|-- themes/       # Dark mode, Light mode
|   |-- _dark-theme.scss
|
|-- vendors/      # Third-party CSS (Bootstrap, jQueryUI)
|   |-- _bootstrap.scss
|
`-- main.scss     # The main import file
```

## Use Sass Modules (`@use` and `@forward`)

The old `@import` is deprecated. Prefer `@use` for namespacing and `@forward` to re-export shared tokens.

```scss
// abstracts/_index.scss
@forward 'variables';
@forward 'mixins';

// main.scss
@use 'abstracts';
@use 'base/reset';
@use 'base/typography';
@use 'components/buttons';
```

## The Power of Abstracts

The `abstracts` folder compiles to nothing (no CSS output) but provides tools for your other files.

### Variables (`_variables.scss`)

Define your design system here. If you change a color here, it updates everywhere.

```scss
$color-primary: #2c3e50;
$color-secondary: #c5a059;
$font-stack-main: 'Inter', sans-serif;
```

### Mixins (`_mixins.scss`)

Write mixins for responsiveness to avoid repeating raw `@media` queries.

```scss
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'phone' {
    @media (max-width: 600px) { @content; }
  }
  @else if $breakpoint == 'tablet' {
    @media (max-width: 900px) { @content; }
  }
}

// Usage
.card {
  width: 50%;
  @include respond-to('phone') {
    width: 100%;
  }
}
```

## Naming Conventions

Pick a convention and stick to it. BEM works well for large teams:

```scss
.card {}
.card__title {}
.card--featured {}
```

## Why This Matters

This architecture separates concerns.

1.  Need to fix the font size? Go to `base/_typography.scss`.
2.  Need to change the button radius? Go to `components/_buttons.scss`.
3.  Need to adjust the mobile layout? Go to `layout/_grid.scss`.

It turns CSS from a guessing game into a structured engineering discipline.

---
layout: default
title: Projects
description: Explore Kenneth's portfolio of projects including enterprise systems, high-performance engines, and fullstack applications.
---

<section class="archive">
  <header class="page-hero">
    <div class="container page-hero-inner">
      <span class="section-plate">Archive / Work</span>
      <h1 class="display">Selected work.</h1>
      <p class="hero-tagline">Systems, full-stack applications, and performance-focused tooling. Each plate is a shipped experiment in making software feel considered.</p>
      <div class="page-hero-meta">
        <span>{{ site.data.projects.size }} projects</span>
        <span>Systems · Web · Mobile</span>
        <span>Ongoing archive</span>
      </div>
    </div>
  </header>

  <div class="container archive-layout">
    <aside class="archive-side">
      <label class="search-field">
        <span class="search-label">Search the archive</span>
        <input type="search" placeholder="Try “kernel”, “React”, “SQL”…" data-project-search
          aria-controls="project-grid" autocomplete="off">
      </label>

      <p class="archive-note">Every project here is a real build: source available where possible, with an emphasis on systems, product engineering, and the occasional deep dive into the machine.</p>
      <p class="archive-status" data-project-status aria-live="polite"></p>
    </aside>

    <div class="archive-main">
      <div class="projects-grid" id="project-grid" data-project-grid>
        {% for project in site.data.projects %}
        <article class="project-card" data-project-card data-reveal style="--i:{{ forloop.index0 }}"
          data-search="{{ project.title | append: ' ' | append: project.tech | append: ' ' | append: project.description | downcase | escape }}">
          <div class="project-media card-media">
            {% if project.image %}
            <img src="{{ project.image | relative_url }}" alt="{{ project.title }}" loading="lazy" decoding="async">
            {% else %}
            <div class="project-media-fallback" aria-hidden="true"></div>
            {% endif %}
          </div>

          <div class="project-content">
            <h3>{{ project.title }}</h3>
            <p>{{ project.description }}</p>

            <div class="tech-stack">
              {% assign techs = project.tech | split: ", " %}
              {% for tech in techs %}
              <span class="tech-badge">{{ tech }}</span>
              {% endfor %}
            </div>

            <div class="card-actions">
              {% if project.github and project.github != "#" %}
              <a href="{{ project.github }}" target="_blank" rel="noopener" class="card-link"
                aria-label="View the {{ project.title }} source code on GitHub">
                GitHub <span aria-hidden="true">↗</span>
              </a>
              {% endif %}
              {% if project.demo and project.demo != "#" %}
              <a href="{{ project.demo }}" target="_blank" rel="noopener" class="card-link card-link--primary"
                aria-label="Open the {{ project.title }} live demo">
                Live demo <span aria-hidden="true">↗</span>
              </a>
              {% endif %}
            </div>
          </div>
        </article>
        {% endfor %}
      </div>
    </div>
  </div>
</section>

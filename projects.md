---
layout: default
title: Projects
description: Explore Kenneth's portfolio of projects including enterprise systems, high-performance engines, and fullstack applications.
---

<section class="projects">
  <div class="projects-header page-hero">
    <div class="container hero-inner">
      <span class="hero-kicker">Portfolio</span>
      <h1>Selected Projects</h1>
      <p class="hero-tagline">Systems, full-stack applications, and performance-focused tooling.</p>
    </div>
  </div>

  <div class="projects-grid">
  {% for project in site.data.projects %}
    <article class="project-card card-base">
      <div class="project-media card-media">
        {% if project.image %}
        <img src="{{ project.image }}" alt="{{ project.title }}" loading="lazy" decoding="async">
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
          <a href="{{ project.github }}" target="_blank" class="btn-link">GitHub</a>
          {% endif %}
          {% if project.demo and project.demo != "#" %}
          <a href="{{ project.demo }}" target="_blank" class="btn-link btn-primary">Live Demo</a>
          {% endif %}
        </div>
      </div>
    </article>
  {% endfor %}
  </div>
</section>

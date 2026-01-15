---
layout: default
title: Projects
description: Explore Kenneth's portfolio of projects including enterprise systems, high-performance engines, and fullstack applications.
---

<section class="projects">
  <div class="projects-grid">
  {% for project in site.data.projects %}
    <div class="project-card">
      {% if project.image %}
      <img src="{{ project.image }}" alt="{{ project.title }}">
      {% endif %}
      <h3>{{ project.title }}</h3>
      <p>{{ project.description }}</p>
      
      <div class="tech-stack">
        {% assign techs = project.tech | split: ", " %}
        {% for tech in techs %}
          <span class="tech-badge">{{ tech }}</span>
        {% endfor %}
      </div>
      
      <div class="card-actions">
        {% if project.github %}
        <a href="{{ project.github }}" target="_blank">GitHub</a>
        {% endif %}
        {% if project.demo %}
        <a href="{{ project.demo }}" target="_blank">Live Demo</a>
        {% endif %}
      </div>
    </div>
  {% endfor %}
  </div>
</section>

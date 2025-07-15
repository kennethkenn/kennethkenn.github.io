---
layout: default
title: Projects
---

<section class="projects">
  {% for project in site.data.projects %}
    <div class="project-card">
      <img src="{{ project.image }}" alt="{{ project.title }}">
      <h3>{{ project.title }}</h3>
      <p>{{ project.description }}</p>
      <p><strong>Tech:</strong> {{ project.tech }}</p>
      <a href="{{ project.github }}">GitHub</a>
      <a href="{{ project.demo }}">Live Demo</a>
    </div>
  {% endfor %}
</section>

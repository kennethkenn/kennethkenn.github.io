---
layout: default
title: Home
description: Kenneth - Fullstack Developer & Designer specializing in C/C++, Java, Spring Boot, and building exceptional digital products.
---
<section class="hero">
  <img src="https://ui-avatars.com/api/?name=Kenneth&size=200&background=C5A059&color=fff&bold=true"
       alt="Kenneth - Portfolio"
       class="profile-img">
  <h1>Kenneth Buchunju</h1>
  <h2>Crafting Digital Experiences with <br> Elegance & Precision</h2>
  <p>Fullstack Developer & Designer specializing in building exceptional digital products.</p>
<br>
  <a href="/projects" class="btn-primary">View My Work</a>
</section>

<section class="home-section services-section">
  <div class="container">
    <h2 class="section-title">What I Do</h2>
    <div class="services-grid">
      <div class="service-card">
        <span class="service-icon">💻</span>
        <h3>Fullstack Development</h3>
        <p>Building comprehensive web solutions from the database to the user interface using modern frameworks.</p>
      </div>
      <div class="service-card">
        <span class="service-icon">🏗️</span>
        <h3>System Architecture</h3>
        <p>Designing scalable, maintainable, and efficient software architectures for complex enterprise needs.</p>
      </div>
      <div class="service-card">
        <span class="service-icon">⚡</span>
        <h3>Performance Optimization</h3>
        <p>Analyzing and tuning applications for maximum speed, efficiency, and resource utilization.</p>
      </div>
    </div>
  </div>
</section>

<section class="home-section tech-stack-section">
  <div class="container">
    <h2 class="section-title">Tech Stack</h2>
    <div class="tech-stack-grid">
      <span class="tech-item">C/C++</span>
      <span class="tech-item">Java</span>
      <span class="tech-item">Python</span>
      <span class="tech-item">Spring Boot</span>
      <span class="tech-item">Flask</span>
      <span class="tech-item">AngularJS</span>
      <span class="tech-item">SQL</span>
      <span class="tech-item">Git</span>
      <span class="tech-item">Docker</span>
      <span class="tech-item">x86 Assembly</span>
    </div>
  </div>
</section>

<section class="home-section featured-projects">
  <div class="container">
    <h2 class="section-title">Featured Projects</h2>
    <div class="featured-projects-grid">
      {% for project in site.data.projects limit:2 %}
      <div class="project-card featured-card">
        <div class="project-image">
           <img src="{{ project.image }}" alt="{{ project.title }}">
        </div>
        <div class="project-info">
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <div class="tech-stack">
            {% assign techs = project.tech | split: ", " %}
            {% for tech in techs %}
              <span class="tech-badge">{{ tech }}</span>
            {% endfor %}
          </div>
          <a href="{{ project.demo }}" class="btn-text">View Project →</a>
        </div>
      </div>
      {% endfor %}
    </div>
    <div class="center-btn">
       <a href="/projects" class="btn-secondary">View All Projects</a>
    </div>
  </div>
</section>

<section class="home-section cta-section">
  <div class="container">
    <h2>Let's Work Together</h2>
    <p>Have a project in mind? Let's build something exceptional.</p>
    <a href="/contacts" class="btn-primary btn-cta">Get In Touch</a>
  </div>
</section>

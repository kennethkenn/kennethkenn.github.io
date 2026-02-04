---
layout: default
title: Home
description: Kenneth - Fullstack Developer & Designer specializing in C/C++, Java, Spring Boot, and building exceptional digital products.
---
<section class="hero">
  <div class="hero-inner container">
    <div class="hero-content">
      <h1>Kenneth Buchunju</h1>
      <h2>Crafting Digital Experiences with <br> Elegance & Precision</h2>
      <p>Building thoughtful software across systems, web, and product design with a focus on performance, clarity, and polish.</p>
      <div class="hero-actions">
        <a href="/projects" class="btn-primary">View My Work</a>
        <a href="/contacts" class="btn-secondary">Let&#39;s Talk</a>
      </div>
      <div class="hero-meta">
        <div class="meta-item">
          <span class="meta-label">Specialties</span>
          <span class="meta-value">C/C++, Java, Spring Boot</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Focus</span>
          <span class="meta-value">Performance, UX, Scalability</span>
        </div>
      </div>
    </div>
    <div class="hero-media">
      <div class="hero-image-wrap">
        <img src="assets/images/profile.png"
             alt="Kenneth - Portfolio"
             class="profile-img">
        <div class="hero-badge">
          <span class="badge-title">Open to</span>
          <span class="badge-value">Collaborate on an interesting project.</span>
        </div>
      </div>
      <div class="hero-card">
        <h3>What I Build</h3>
        <ul>
          <li>Enterprise-grade backends</li>
          <li>High-performance desktop apps</li>
          <li>Modern, conversion-focused web</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="home-section services-section">
  <div class="container">
    <h2 class="section-title">What I Do</h2>
    <div class="services-grid">
      <div class="service-card">
        <span class="service-icon" aria-hidden="true">&#128187;</span>
        <h3>Fullstack Development</h3>
        <p>Building comprehensive web solutions from the database to the user interface using modern frameworks.</p>
      </div>
      <div class="service-card">
        <span class="service-icon" aria-hidden="true">&#127959;</span>
        <h3>System Architecture</h3>
        <p>Designing scalable, maintainable, and efficient software architectures for complex enterprise needs.</p>
      </div>
      <div class="service-card">
        <span class="service-icon" aria-hidden="true">&#9889;</span>
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
      <span class="tech-item">Qt</span>
      <span class="tech-item">wxWidgets</span>
      <span class="tech-item">Android</span>
      <span class="tech-item">Node.js</span>
      <span class="tech-item">TypeScript</span>
      <span class="tech-item">React</span>
      <span class="tech-item">Kotlin</span>
      <span class="tech-item">Angular</span>
      <span class="tech-item">PostgreSQL</span>
      <span class="tech-item">Linux</span>
      <span class="tech-item">Docker</span>
      <span class="tech-item">Git</span>
      <span class="tech-item">CMake</span>
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
          <a href="{{ project.github }}" class="btn-text">View Project &rarr;</a>
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

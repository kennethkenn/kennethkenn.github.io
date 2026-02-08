---
layout: default
description: Kenneth - Fullstack Developer & Designer specializing in C/C++, Java, Spring Boot, and building exceptional digital products.
---

<section class="home-section information-section">
  <div class="container">
    <div class="information-content">
      <span class="hero-kicker">Digital Artisan & Engineer</span>
      <h1>Kenneth Buchunju</h1>
      <h2>Crafting Elegant Digital Experiences with Precision</h2>
      <p>Building thoughtful software across systems, web, and product design with a focus on performance, clarity, and polish.</p>
      <div class="hero-actions">
        <a href="/projects" class="btn-primary">View My Work</a>
      </div>
    </div>
    <div class="information-media">
      <div class="information-image-wrap">
        <img src="assets/images/profile.png"
             alt="Kenneth - Portfolio"
             class="profile-img">
      </div>
    </div>
  </div>
</section>

<!-- Section: Expertise -->
<section class="home-section expertise-section">

  <div class="container">
    <span class="section-kicker">Capability</span>
    <h2 class="section-title">Core Expertise</h2>
    <div class="expertise-grid">
      <div class="expertise-card">
        <div class="expertise-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </div>
        <h3>Fullstack Development</h3>
        <p>Comprehensive web solutions from architecting robust databases to crafting intuitive user interfaces with modern engineering practices.</p>
      </div>
      <div class="expertise-card">
        <div class="expertise-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <h3>System Architecture</h3>
        <p>Designing scalable, high-performance software systems that prioritize maintainability and structural elegance.</p>
      </div>
      <div class="expertise-card">
        <div class="expertise-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        <h3>Digital Craftsmanship</h3>
        <p>Meticulous attention to detail in every line of code and every pixel, ensuring a professional and premium final product.</p>
      </div>
    </div>
  </div>
</section>

<!-- Section: Featured Projects -->
<section class="home-section featured-projects contrast-bg">
  <div class="container">
    <span class="section-kicker">Portfolio</span>
    <h2 class="section-title">Latest Work</h2>
    <div class="featured-projects-grid">
      {% for project in site.data.projects limit:3 %}
      <div class="project-card featured-card">
        <div class="project-image">
           <img src="{{ project.image }}" alt="{{ project.title }}" loading="lazy">
        </div>
        <div class="project-info">
          <h3>{{ project.title }}</h3>
          <p>{{ project.description | truncate: 120 }}</p>
          <div class="tech-stack">
            {% assign techs = project.tech | split: ", " %}
            {% for tech in techs limit:3 %}
              <span class="tech-badge">{{ tech }}</span>
            {% endfor %}
          </div>
          <a href="{{ project.github }}" class="btn-text">Case Study &rarr;</a>
        </div>
      </div>
      {% endfor %}
    </div>
    <div class="center-btn">
       <a href="/projects" class="btn-secondary">Explore All Projects</a>
    </div>
  </div>
</section>

<!-- Section: Latest Writing -->
<section class="home-section blog-highlight">
  <div class="container">
    <span class="section-kicker">Journal</span>
    <h2 class="section-title">Latest Insights</h2>
    <div class="blog-highlight-grid">
      {% for post in site.posts limit:3 %}
      <article class="blog-mini-card">
        <div class="mini-meta">{{ post.date | date: "%B %-d %Y" }}</div>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        <p>{{ post.excerpt | strip_html | truncatewords: 15 }}</p>
        <a href="{{ post.url | relative_url }}" class="read-more-link">Read insight &rarr;</a>
      </article>
      {% endfor %}
    </div>
    <div class="center-btn">
       <a href="/blog" class="btn-secondary">Visit The Blog</a>
    </div>
  </div>
</section>

<!-- Section: CTA -->
<section class="home-section cta-section contrast-bg">
  <div class="container">
    <div class="cta-inner">
      <h2>Let's build something <br> exceptional together.</h2>
      <p>Available for select collaborations and digital consulting.</p>
      <a href="/contacts" class="btn-primary">Get In Touch</a>
    </div>
  </div>
</section>

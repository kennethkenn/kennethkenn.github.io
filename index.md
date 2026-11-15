---
layout: default
title: The Mint Coder
description: Kenneth - Fullstack Developer & Designer specializing in C/C++, Java, Spring Boot, and building exceptional digital products.
---

<div class="home-page">

  <!-- Hero -->
  <section class="hero" data-hero>
    <canvas class="hero-canvas" data-hero-canvas aria-hidden="true"></canvas>

    <div class="container hero-inner">
      <div class="hero-main">
        <p class="hero-status"><span class="status-dot"></span>Open for select work - 2026</p>

        <h1 class="hero-title">
          <span class="hero-line" style="--i:0"><span>Kenneth</span></span>
          <span class="hero-line" style="--i:1"><span>Buchunju<span class="hero-dot">.</span></span></span>
        </h1>

        <p class="hero-role">Full-stack engineer &amp; digital artisan</p>
        <p class="hero-desc">I build software with the patience of a craftsman - systems that are fast, products that feel considered, and interfaces with a little poetry in them.</p>

        <div class="hero-actions">
          <a href="{{ '/projects' | relative_url }}" class="btn-primary" data-magnetic>
            <span>View selected work</span><span class="btn-ico" aria-hidden="true">↗</span>
          </a>
          <a href="{{ '/about' | relative_url }}" class="btn-ghost">
            <span>The story</span><span class="btn-ghost-arrow" aria-hidden="true">→</span>
          </a>
        </div>

        <div class="hero-specs">
          <div class="hero-spec">
            <span class="spec-k">Focus</span>
            <span class="spec-v">Systems &amp; product</span>
          </div>
          <div class="hero-spec">
            <span class="spec-k">Core</span>
            <span class="spec-v">C++ · Java · TS</span>
          </div>
        </div>
      </div>

      <div class="hero-aside">
        <div class="seal" aria-hidden="true">
          <div class="seal-core">
            <img src="{{ '/assets/images/profile-mark.png' | relative_url }}" alt="" width="675" height="1049"
              aria-hidden="true">
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Capabilities -->
  <section class="section disciplines" id="capabilities">
    <div class="container">
      <div class="section-head" data-reveal>
        <div>
          <span class="section-plate">Capabilities</span>
          <h2 class="display">Three obsessions, one practice.</h2>
        </div>
        <p class="section-lede">The work moves between the metal and the interface: architectural decisions, performance budgets, and the small details that make software feel inevitable.</p>
      </div>

      <div class="ledger">
        <article class="ledger-row" data-reveal style="--i:0">
          <div class="ledger-main">
            <h3>Full-stack engineering</h3>
            <div class="ledger-tags">
              <span>Architecture</span><span>APIs</span><span>UI</span>
            </div>
          </div>
          <p>From data models and REST boundaries to the last pixel of the interface - complete products designed as one coherent system.</p>
        </article>

        <article class="ledger-row" data-reveal style="--i:1">
          <div class="ledger-main">
            <h3>Systems &amp; performance</h3>
            <div class="ledger-tags">
              <span>C / C++</span><span>Linux</span><span>Memory</span>
            </div>
          </div>
          <p>Low-level work where microseconds matter: concurrent data structures, custom allocators, kernels, and the discipline of measuring before optimising.</p>
        </article>

        <article class="ledger-row" data-reveal style="--i:2">
          <div class="ledger-main">
            <h3>Digital craftsmanship</h3>
            <div class="ledger-tags">
              <span>Design systems</span><span>Motion</span><span>Details</span>
            </div>
          </div>
          <p>Typography, rhythm, and motion treated as engineering materials - because a product that is pleasant to use is a product with fewer sharp edges.</p>
        </article>
      </div>
    </div>
  </section>

  <!-- Selected work -->
  <section class="section work" id="work">
    <div class="container">
      <div class="section-head section-head--split" data-reveal>
        <div>
          <span class="section-plate">Selected work</span>
          <h2 class="display">Things I've made.</h2>
        </div>
        <a href="{{ '/projects' | relative_url }}" class="link-arrow">Full archive <span aria-hidden="true">→</span></a>
      </div>

      <div class="work-list" data-work-list>
        <div class="work-preview" data-work-preview aria-hidden="true">
          <img src="" alt="">
        </div>

        {% for project in site.data.projects limit:4 %}
        <a class="work-row"
          href="{% if project.github %}{{ project.github }}{% else %}{{ '/projects' | relative_url }}{% endif %}"
          {% if project.github %}target="_blank" rel="noopener"{% endif %}
          data-work-row
          data-image="{{ project.image | relative_url }}"
          data-reveal
          style="--i:{{ forloop.index0 }}">
          <h3>{{ project.title }}</h3>
          <span class="work-tech">{{ project.tech }}</span>
          <span class="work-arrow" aria-hidden="true">↗</span>
        </a>
        {% endfor %}
      </div>
    </div>
  </section>

  <!-- Journal -->
  <section class="section journal" id="journal">
    <div class="container">
      <div class="section-head section-head--split" data-reveal>
        <div>
          <span class="section-plate">Journal</span>
          <h2 class="display">Notes from the workbench.</h2>
        </div>
        <a href="{{ '/blog' | relative_url }}" class="link-arrow">All entries <span aria-hidden="true">→</span></a>
      </div>

      <div class="journal-list">
        {% for post in site.posts limit:5 %}
        {% assign words = post.content | number_of_words %}
        {% assign mins = words | divided_by: 220 | plus: 1 %}
        <a class="journal-row" href="{{ post.url | relative_url }}" data-reveal style="--i:{{ forloop.index0 }}">
          <span class="journal-date">{{ post.date | date: "%b %-d, %Y" }}</span>
          <h3>{{ post.title }}</h3>
          <span class="journal-read">{{ mins }} min</span>
          <span class="journal-arrow" aria-hidden="true">→</span>
        </a>
        {% endfor %}
      </div>
    </div>
  </section>

  <!-- Manifesto -->
  <section class="manifesto">
    <div class="container manifesto-grid">
      <div class="manifesto-body" data-reveal>
        <span class="section-plate section-plate--light">The atelier</span>
        <p class="manifesto-statement">I treat code as a material - something to be shaped, tested, and finished with care.</p>
        <p class="manifesto-text">The work lives in the seam between engineering and design: low-level systems that reward precision, web products that reward empathy, and interfaces that make complexity feel quiet. No black boxes, no decoration without a job.</p>
        <a href="{{ '/about' | relative_url }}" class="link-arrow link-arrow--light">Read the full story <span aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta" id="contact-cta">
    <div class="container cta-inner" data-reveal>
      <span class="section-plate section-plate--cta">Next chapter</span>
      <h2>Have a problem worth solving?</h2>
      <a class="cta-email" href="mailto:{{ site.email }}" data-magnetic>
        {{ site.email }} <span aria-hidden="true">↗</span>
      </a>
      <p class="cta-note">Open for collaborations, consulting, and ambitious side quests. Usually replies within 48 hours.</p>
    </div>
  </section>

</div>

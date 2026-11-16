---
layout: default
title: The Mint Coder
description: Kenneth Buchunju - independent full-stack engineer and designer building fast, reliable web products for founders and small teams.
---

<div class="home-page">

  <!-- Hero -->
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-main">
        <p class="hero-status"><span class="status-dot" aria-hidden="true"></span>Available for new projects</p>

        <p class="hero-kicker">Full-stack engineer &amp; designer</p>

        <h1 class="hero-title">
          <span class="hero-line" style="--i:0"><span>Web products that</span></span>
          <span class="hero-line" style="--i:1"><span>feel <em>effortless.</em></span></span>
        </h1>

        <p class="hero-desc">
          I'm Kenneth. I help founders and small teams turn rough ideas into fast, reliable
          applications - the database, the API, the interface, and the details in between.
        </p>

        <div class="hero-actions">
          <a href="{{ '/contacts' | relative_url }}" class="btn-primary">
            <span>Start a project</span><span class="btn-ico" aria-hidden="true">→</span>
          </a>
          <a href="{{ '/projects' | relative_url }}" class="btn-ghost">
            <span>See selected work</span><span class="btn-ghost-arrow" aria-hidden="true">→</span>
          </a>
        </div>

        <ul class="hero-facts">
          <li>One senior partner, end to end</li>
          <li>Remote · working worldwide</li>
          <li>Replies within 48 hours</li>
        </ul>
      </div>

      <div class="hero-visual">
        <figure class="hero-shot">
          <div class="shot-bar" aria-hidden="true">
            <span></span><span></span><span></span>
            <span class="shot-url">shophub / storefront</span>
          </div>
          <img src="{{ '/assets/images/projects/e-commerce-storefront.webp' | relative_url }}"
            alt="Preview of the ShopHub e-commerce storefront" width="1200" height="750" fetchpriority="high">
        </figure>
        <p class="hero-caption">ShopHub - TypeScript, Next.js, Stripe</p>
      </div>
    </div>
  </section>

  <!-- Services -->
  <section class="section" id="services">
    <div class="container">
      <div class="section-head" data-reveal>
        <div>
          <span class="section-plate">What I do</span>
          <h2 class="display">Help across the whole product,<br>not just the ticket.</h2>
        </div>
        <p class="section-lede">
          Most clients arrive with a rough idea, a stalled build, or a product that has outgrown
          its first version. I can step in at any point and own the path to launch.
        </p>
      </div>

      <div class="services-grid">
        <article class="service-card" data-reveal style="--i:0">
          <span class="service-index">01</span>
          <h3>Web app development</h3>
          <p>New products, MVPs, and internal tools - designed and built as one coherent system.</p>
          <ul class="service-list">
            <li>Product scoping and UX flows</li>
            <li>Responsive front end in React, Next.js, or Angular</li>
            <li>Backend, database, and deployment</li>
            <li>Documentation and a clean handover</li>
          </ul>
          <p class="service-best"><strong>Best for</strong> founders shipping a first or second version.</p>
        </article>

        <article class="service-card" data-reveal style="--i:1">
          <span class="service-index">02</span>
          <h3>Backend &amp; APIs</h3>
          <p>Services that stay fast and predictable as usage grows - and stay easy to change.</p>
          <ul class="service-list">
            <li>Data modelling and SQL design</li>
            <li>REST APIs and third-party integrations</li>
            <li>Authentication and access control</li>
            <li>Tests, logging, and observability</li>
          </ul>
          <p class="service-best"><strong>Best for</strong> products with real data and real users.</p>
        </article>

        <article class="service-card" data-reveal style="--i:2">
          <span class="service-index">03</span>
          <h3>Performance &amp; reliability</h3>
          <p>Find out why it's slow, fragile, or expensive - then fix the cause, not the symptom.</p>
          <ul class="service-list">
            <li>Profiling and load testing</li>
            <li>Refactoring and caching strategies</li>
            <li>Database query tuning</li>
            <li>Monitoring and alerting</li>
          </ul>
          <p class="service-best"><strong>Best for</strong> a product that has outgrown its first build.</p>
        </article>

        <article class="service-card" data-reveal style="--i:3">
          <span class="service-index">04</span>
          <h3>Product design &amp; UI</h3>
          <p>Interfaces that explain themselves - clear, consistent, and comfortable to use.</p>
          <ul class="service-list">
            <li>UX audits and wireframes</li>
            <li>Design systems and reusable components</li>
            <li>Accessible, responsive interfaces</li>
            <li>Interaction and motion detail</li>
          </ul>
          <p class="service-best"><strong>Best for</strong> teams who care how the product feels.</p>
        </article>
      </div>
    </div>
  </section>

  <!-- Selected work -->
  {% assign featured = site.data.projects | where: "featured", true %}
  <section class="section section--tint" id="work">
    <div class="container">
      <div class="section-head section-head--split" data-reveal>
        <div>
          <span class="section-plate">Selected work</span>
          <h2 class="display">Built, shipped, and in use.</h2>
        </div>
        <a href="{{ '/projects' | relative_url }}" class="link-arrow">Full project archive <span aria-hidden="true">→</span></a>
      </div>

      <div class="featured-spotlight">
        {% assign spotlight = featured.first %}
        {% assign techs = spotlight.tech | split: ", " %}
        <a class="project-feature project-feature--wide"
          href="{% if spotlight.demo and spotlight.demo != '#' %}{{ spotlight.demo }}{% elsif spotlight.github and spotlight.github != '#' %}{{ spotlight.github }}{% else %}{{ '/projects' | relative_url }}{% endif %}"
          {% if spotlight.github and spotlight.github != '#' %}target="_blank" rel="noopener"{% endif %}
          data-reveal>
          <div class="project-feature-media">
            <img src="{{ spotlight.image | relative_url }}" alt="{{ spotlight.title }}" loading="lazy" decoding="async">
          </div>
          <div class="project-feature-body">
            <span class="project-feature-kicker">{{ techs | join: ' · ' }}</span>
            <h3>{{ spotlight.title }}</h3>
            <p>{{ spotlight.outcome | default: spotlight.description }}</p>
            <span class="project-feature-link">View project <span aria-hidden="true">↗</span></span>
          </div>
        </a>
      </div>

      <div class="featured-grid featured-grid--three">
        {% for project in featured offset:1 limit:3 %}
        {% assign techs = project.tech | split: ", " %}
        <a class="project-feature"
          href="{% if project.demo and project.demo != '#' %}{{ project.demo }}{% elsif project.github and project.github != '#' %}{{ project.github }}{% else %}{{ '/projects' | relative_url }}{% endif %}"
          {% if project.github and project.github != '#' %}target="_blank" rel="noopener"{% endif %}
          data-reveal style="--i:{{ forloop.index0 }}">
          <div class="project-feature-media">
            <img src="{{ project.image | relative_url }}" alt="{{ project.title }}" loading="lazy" decoding="async">
          </div>
          <div class="project-feature-body">
            <span class="project-feature-kicker">{{ techs | join: ' · ' }}</span>
            <h3>{{ project.title }}</h3>
            <p>{{ project.outcome | default: project.description }}</p>
            <span class="project-feature-link">View project <span aria-hidden="true">↗</span></span>
          </div>
        </a>
        {% endfor %}
      </div>
    </div>
  </section>

  <!-- Process -->
  <section class="section" id="process">
    <div class="container">
      <div class="section-head" data-reveal>
        <div>
          <span class="section-plate">How it works</span>
          <h2 class="display">A clear path from idea<br>to launch.</h2>
        </div>
        <p class="section-lede">
          No black boxes and no surprise invoices. You always know what's happening,
          what's next, and what it costs.
        </p>
      </div>

      <div class="process-grid">
        <article class="step" data-reveal style="--i:0">
          <span class="step-num">01</span>
          <h3>Intro call</h3>
          <p>A 30-minute conversation about the goal, the constraints, and what success looks like. You'll leave with an honest recommendation - even if we don't work together.</p>
        </article>
        <article class="step" data-reveal style="--i:1">
          <span class="step-num">02</span>
          <h3>Written proposal</h3>
          <p>Scope, timeline, milestones, and a fixed price. Nothing starts until the plan is clear and you're comfortable with it.</p>
        </article>
        <article class="step" data-reveal style="--i:2">
          <span class="step-num">03</span>
          <h3>Build in the open</h3>
          <p>A shared board, a staging link, and a demo every week. You watch the product take shape instead of waiting for a reveal.</p>
        </article>
        <article class="step" data-reveal style="--i:3">
          <span class="step-num">04</span>
          <h3>Launch &amp; handover</h3>
          <p>Deployment, documentation, and clean handover. The code is yours, and I stay available for 30 days after launch.</p>
        </article>
      </div>
    </div>
  </section>

  <!-- Why work with me -->
  <section class="value-band">
    <div class="container value-grid">
      <div class="value-intro" data-reveal>
        <span class="section-plate section-plate--light">Why work with me</span>
        <h2 class="display">Senior work, without the agency overhead.</h2>
        <p>You work directly with the person designing and building the product - not an account manager, and not a handoff between three teams.</p>
        <a href="{{ '/about' | relative_url }}" class="link-arrow link-arrow--light">More about how I work <span aria-hidden="true">→</span></a>
      </div>

      <ul class="value-list">
        <li data-reveal style="--i:0">
          <div>
            <h3>Design and engineering in one head</h3>
            <p>The interface and the system behind it are decided together, so nothing gets lost in translation.</p>
          </div>
        </li>
        <li data-reveal style="--i:1">
          <div>
            <h3>One partner, start to finish</h3>
            <p>The person you meet on the first call is the person shipping the last commit.</p>
          </div>
        </li>
        <li data-reveal style="--i:2">
          <div>
            <h3>Communication you don't have to chase</h3>
            <p>Weekly demos, a shared board, and replies within 48 hours. You'll never wonder where things stand.</p>
          </div>
        </li>
        <li data-reveal style="--i:3">
          <div>
            <h3>Code you can keep building on</h3>
            <p>Readable, tested, and documented. No lock-in, no black boxes, and no mystery dependencies.</p>
          </div>
        </li>
      </ul>
    </div>
  </section>

  <!-- Engagements -->
  <section class="section section--tint" id="engagements">
    <div class="container">
      <div class="section-head-center" data-reveal>
        <span class="section-plate">Ways to work together</span>
        <h2 class="display">Pick the shape that fits the problem.</h2>
        <p>Every engagement starts with a short call and a written proposal, so you know the scope, timeline, and cost before any work begins.</p>
      </div>

      <div class="engage-grid">
        <article class="engage-card" data-reveal style="--i:0">
          <span class="engage-tag">Fixed scope</span>
          <h3>Project build</h3>
          <p>A defined product, from first sketch to launch.</p>
          <ul class="engage-list">
            <li>Discovery and UX</li>
            <li>Design and development</li>
            <li>Weekly demos</li>
            <li>30 days of post-launch support</li>
          </ul>
          <a href="{{ '/contacts' | relative_url }}" class="link-arrow">Discuss a project <span aria-hidden="true">→</span></a>
        </article>

        <article class="engage-card engage-card--featured" data-reveal style="--i:1">
          <span class="engage-tag">Ongoing</span>
          <h3>Product partnership</h3>
          <p>A senior engineer on call for the long haul.</p>
          <ul class="engage-list">
            <li>Continuous improvements</li>
            <li>New features and fixes</li>
            <li>Performance and reliability</li>
            <li>Flexible monthly scope</li>
          </ul>
          <a href="{{ '/contacts' | relative_url }}" class="link-arrow">Talk about a retainer <span aria-hidden="true">→</span></a>
        </article>

        <article class="engage-card" data-reveal style="--i:2">
          <span class="engage-tag">Short engagement</span>
          <h3>Technical audit</h3>
          <p>A clear diagnosis of what's slowing you down.</p>
          <ul class="engage-list">
            <li>Code and architecture review</li>
            <li>Performance profiling</li>
            <li>Prioritised fixes</li>
            <li>A written report</li>
          </ul>
          <a href="{{ '/contacts' | relative_url }}" class="link-arrow">Request an audit <span aria-hidden="true">→</span></a>
        </article>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section" id="faq">
    <div class="container faq-layout">
      <div class="faq-intro" data-reveal>
        <span class="section-plate">FAQ</span>
        <h2 class="display">Good questions, straight answers.</h2>
        <p>If yours isn't here, send a note - I answer every message personally.</p>
        <a href="{{ '/contacts' | relative_url }}" class="link-arrow">Ask a question <span aria-hidden="true">→</span></a>
      </div>

      <div class="faq-list" data-reveal>
        <details class="faq-item">
          <summary>How do we start?</summary>
          <p>Send a short note about what you're building and where you're stuck. I'll reply within 48 hours with a few questions and, if it looks like a fit, a link to book a 30-minute call.</p>
        </details>
        <details class="faq-item">
          <summary>How long does a project take?</summary>
          <p>A focused MVP usually takes four to eight weeks; a larger product build runs eight to sixteen. After the first call you'll get a written timeline with milestones, so there are no vague estimates.</p>
        </details>
        <details class="faq-item">
          <summary>How do you price work?</summary>
          <p>Fixed-scope projects are quoted as a single price per milestone. Ongoing work is billed monthly against an agreed scope. You'll always see the cost before work begins, and there are no surprise line items.</p>
        </details>
        <details class="faq-item">
          <summary>Do I own the code?</summary>
          <p>Yes. On final payment, the code, the repository, and the deployment belong to you. I don't use lock-in platforms or hold pieces back.</p>
        </details>
        <details class="faq-item">
          <summary>Can you work with an existing codebase or team?</summary>
          <p>Often, yes. I can join an existing team, pick up a stalled codebase, or work alongside your developers. The first step is a short technical review so we can agree on the safest path.</p>
        </details>
        <details class="faq-item">
          <summary>What if I only need a small fix?</summary>
          <p>Small, well-defined jobs are welcome when the schedule allows. If it's a quick win, I'll tell you - and if it's too small to be worth a project, I'll point you to the right resource.</p>
        </details>
      </div>
    </div>
  </section>

  <!-- About band -->
  <section class="section section--tight" id="about">
    <div class="container about-band-inner" data-reveal>
      <div class="about-band-mark" aria-hidden="true">
        <img src="{{ '/assets/images/profile-mark.png' | relative_url }}" alt="" width="675" height="1049">
      </div>
      <div>
        <span class="section-plate">The person behind the work</span>
        <h2 class="display">You'll be working with Kenneth.</h2>
        <p>I'm a full-stack engineer and designer with a soft spot for systems, clean interfaces, and software that lasts. The Mint Coder is my independent practice - small by design, so the work stays personal.</p>
      </div>
      <a href="{{ '/about' | relative_url }}" class="link-arrow">Read the full story <span aria-hidden="true">→</span></a>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta" id="contact-cta">
    <div class="container cta-inner" data-reveal>
      <span class="section-plate section-plate--cta">Start here</span>
      <h2>Have a product worth building?</h2>
      <p class="cta-lede">Tell me what you're working on. I'll reply within 48 hours with honest thoughts on scope, timing, and whether I'm the right fit.</p>
      <div class="cta-actions">
        <a href="{{ '/contacts' | relative_url }}" class="btn-light">
          <span>Send a project brief</span><span class="btn-ico" aria-hidden="true">→</span>
        </a>
        <a href="mailto:{{ site.email }}" class="cta-email">{{ site.email }} <span aria-hidden="true">↗</span></a>
      </div>
      <p class="cta-note">Remote · working with teams worldwide · Replies within 48 hours.</p>
    </div>
  </section>

</div>

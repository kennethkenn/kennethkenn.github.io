---
layout: default
title: Contact
description: Start a project with Kenneth Buchunju. Share what you're building and get a reply within 48 hours.
---

<section class="contact-section">
  <header class="page-hero">
    <div class="container page-hero-inner">
      <span class="section-plate">Contact / Start a project</span>
      <h1 class="display">Tell me what<br>you're building.</h1>
      <p class="hero-tagline">A rough idea is enough. Send a short note about the product, the timeline, and where you're stuck — I'll reply within two working days.</p>
      <div class="page-hero-meta">
        <span>Available for projects</span>
        <span>Replies within 48 hours</span>
        <span>Remote / worldwide</span>
      </div>
    </div>
  </header>

  <div class="container contact-layout">
    <aside class="contact-aside" data-reveal>
      <span class="section-plate">Direct line</span>
      <a class="contact-email" href="mailto:{{ site.email }}">{{ site.email }}</a>
      <button type="button" class="copy-email" data-copy-email data-email="{{ site.email }}">
        <span data-copy-label>Copy address</span>
      </button>

      <div class="contact-availability">
        <span class="status-dot" aria-hidden="true"></span>
        Available for select projects
      </div>

      <ul class="contact-links">
        <li>
          <a href="https://github.com/kennethkenn" rel="me noopener" target="_blank">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </li>
        <li>
          <a href="https://linkedin.com/in/kenneth-buchunju" rel="me noopener" target="_blank">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </li>
        <li>
          <a href="{{ '/feed.xml' | relative_url }}">
            RSS feed <span aria-hidden="true">→</span>
          </a>
        </li>
      </ul>

      <div class="contact-prep">
        <h3>Helpful to include</h3>
        <ul>
          <li>The outcome you're after</li>
          <li>Any timeline or budget range</li>
          <li>Links to the current product, if there is one</li>
        </ul>
      </div>

      <p class="contact-note">Nothing here is a commitment. The first call is a chance to compare notes and decide whether I'm the right fit.</p>
    </aside>

    <div class="contact-form-container" data-reveal>
      <div class="form-head">
        <span class="section-plate">Project brief</span>
        <span class="form-ref">Reply within 48h</span>
      </div>

      <form action="https://formspree.io/f/mbdlnwzw" method="POST">
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" placeholder="Your name" autocomplete="name" required>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="you@company.com" autocomplete="email" required>
          </div>
        </div>

        <div class="form-group">
          <label for="message">What are you building?</label>
          <textarea id="message" name="message" rows="6" placeholder="The product, the problem, and what a good outcome would look like…" required></textarea>
        </div>

        <!-- Honeypot: hidden from people, tempting to bots -->
        <div class="hp-field" aria-hidden="true">
          <label for="company-website">Leave this field empty</label>
          <input type="text" id="company-website" name="_gotcha" tabindex="-1" autocomplete="off">
        </div>

        <p class="form-status" data-form-status role="status" aria-live="polite" tabindex="-1" hidden></p>

        <button type="submit" class="btn-submit" id="contact-submit">
          <span class="btn-text">Send project brief</span>
          <span class="btn-loader" hidden>Sending…</span>
        </button>
      </form>
    </div>
  </div>
</section>

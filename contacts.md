---
layout: default
title: Contact
description: Get in touch with Kenneth for project collaborations, consultations, or just to say hello.
---

<section class="contact-section">
  <header class="page-hero">
    <div class="container page-hero-inner">
      <span class="section-plate">Collaboration / Dispatch</span>
      <h1 class="display">Say hello.</h1>
      <p class="hero-tagline">Have a project in mind, a hard problem, or just want to compare notes? I'd love to hear from you.</p>
      <div class="page-hero-meta">
        <span>Open for 2026</span>
        <span>Replies within 48 hours</span>
        <span>Remote / Worldwide</span>
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
        Available for select work - 2026
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

      <p class="contact-note">For longer briefs, the form is the better place to start. For everything else, a plain email works perfectly.</p>
    </aside>

    <div class="contact-form-container" data-reveal>
      <div class="form-head">
        <span class="section-plate">Dispatch form</span>
        <span class="form-ref">Ref. 2026 / 01</span>
      </div>

      <form action="https://formspree.io/f/mbdlnwzw" method="POST">
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" placeholder="John Doe" autocomplete="name" required>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="john@example.com" autocomplete="email" required>
          </div>
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="5" placeholder="What are you building?" required></textarea>
        </div>

        <!-- Honeypot: hidden from people, tempting to bots -->
        <div class="hp-field" aria-hidden="true">
          <label for="company-website">Leave this field empty</label>
          <input type="text" id="company-website" name="_gotcha" tabindex="-1" autocomplete="off">
        </div>

        <p class="form-status" data-form-status role="status" aria-live="polite" tabindex="-1" hidden></p>

        <button type="submit" class="btn-submit" id="contact-submit">
          <span class="btn-text">Send message</span>
          <span class="btn-loader" hidden>Sending…</span>
        </button>
      </form>
    </div>
  </div>
</section>

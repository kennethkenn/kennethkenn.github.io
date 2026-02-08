---
layout: default
title: Contact
description: Get in touch with Kenneth for project collaborations, consultations, or just to say hello.
---

<section class="contact-section">
  <div class="contact-intro page-hero">
    <div class="container hero-inner">
      <span class="hero-kicker">Collaboration</span>
      <h1>Get in Touch</h1>
      <p class="hero-tagline">Have a project in mind or just want to say hello? I'd love to hear from you.</p>
    </div>
  </div>

  <div class="contact-form-container">
    <form action="https://formspree.io/f/mbdlnwzw" method="POST">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" placeholder="John Doe" required>
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="john@example.com" required>
      </div>
      
      <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message" name="message" rows="5" placeholder="Your message here..." required></textarea>
      </div>
      
      <button type="submit" class="btn-submit" id="contact-submit">
        <span class="btn-text">Send Message</span>
        <span class="btn-loader" style="display: none;">Sending...</span>
      </button>
    </form>
    
    <div class="contact-info">
      <p>Or email me directly at <a href="mailto:kenneth@themintcoder.org">kenneth@themintcoder.org</a></p>
    </div>
  </div>
</section>

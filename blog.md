---
layout: default
title: Blog
---

<section class="container" style="padding: 4rem 1rem;">

  <div class="blog-grid" style="display: grid; gap: 3rem; max-width: 800px; margin: 0 auto;">
    {% for post in site.posts %}
      <article class="blog-post" style="border-bottom: 1px solid var(--color-border); padding-bottom: 2rem;">
        <h2 style="margin-bottom: 0.5rem;">
          <a href="{{ post.url | relative_url }}" style="text-decoration: none; color: var(--color-text);">{{ post.title }}</a>
        </h2>
        <div class="post-meta" style="color: var(--color-text-light); font-size: 0.9rem; margin-bottom: 1rem;">
          {{ post.date | date: "%B %-d, %Y" }}
        </div>
        <p style="color: var(--color-text-light);">{{ post.excerpt }}</p>
        <a href="{{ post.url | relative_url }}" class="btn-text" style="color: var(--color-primary); font-weight: 700; text-decoration: none;">Read More →</a>
      </article>
    {% else %}
      <p>No posts found.</p>
    {% endfor %}
  </div>
</section>

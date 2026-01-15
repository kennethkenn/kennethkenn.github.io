---
layout: default
title: Blog
---


<section class="blog-section">
  <div class="blog-header">
    <h1>Blog</h1>
    <p>Thoughts, tutorials, and insights on software development.</p>
  </div>

  <div class="blog-grid">
    {% for post in site.posts %}
      <article class="blog-card">
        <a href="{{ post.url | relative_url }}" class="stretched-link" aria-label="{{ post.title }}"></a>
        <div class="blog-card-content">
          <div class="post-meta">
            {{ post.date | date: "%B %-d, %Y" }}
          </div>
          <h2>
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          </h2>
          <p class="post-excerpt">
            {% if post.description %}
              {{ post.description }}
            {% else %}
              {{ post.excerpt | strip_html | truncatewords: 20 }}
            {% endif %}
          </p>
        </div>
        <div class="blog-card-footer">
            <div class="post-categories">
            {% if post.categories %}
                {% for category in post.categories limit:1 %}
                <span class="category-badge">{{ category }}</span>
                {% endfor %}
            {% endif %}
            </div>
            <span class="read-more-link">Read More &rarr;</span>
        </div>
      </article>
    {% else %}
      <p>No posts found.</p>
    {% endfor %}
  </div>
</section>

---
layout: default
title: Blog
description: Notes on systems, backend architecture, performance, and the craft of building software.
---

<section class="blog-section">
  <header class="page-hero">
    <div class="container page-hero-inner">
      <span class="section-plate">Journal / Writing</span>
      <h1 class="display">Notes from the<br>workbench.</h1>
      <p class="hero-tagline">Thoughts on software development, systems, and the daily challenge of writing clearly about complicated things.</p>
      <div class="page-hero-meta">
        <span>{{ site.posts.size }} entries</span>
        <span>Systems · Backend · Craft</span>
        <span>Daily challenge active</span>
      </div>
    </div>
  </header>

  <div class="container blog-body">
    <div class="blog-toolbar">
      <div class="blog-filters" data-blog-filters role="group" aria-label="Filter posts by topic">
        <button type="button" class="filter-chip is-active" data-filter="all" aria-pressed="true">All</button>
        {%- for topic in site.data.blog_topics %}
        <button type="button" class="filter-chip" data-filter="{{ topic.slug }}" aria-pressed="false">{{ topic.label }}</button>
        {%- endfor %}
      </div>
      <p class="filter-status" data-filter-status aria-live="polite"></p>
    </div>

    <div class="blog-grid" data-blog-grid>
      {% for post in site.posts %}
        {%- assign post_topics = "" -%}
        {%- for category in post.categories -%}
          {%- assign category_key = category | downcase -%}
          {%- for topic in site.data.blog_topics -%}
            {%- if topic.categories contains category_key -%}
              {%- unless post_topics contains topic.slug -%}
                {%- assign post_topics = post_topics | append: topic.slug | append: "|" -%}
              {%- endunless -%}
            {%- endif -%}
          {%- endfor -%}
        {%- endfor -%}
        {%- assign words = post.content | number_of_words -%}
        {%- assign mins = words | divided_by: 220 | plus: 1 -%}
        <article class="blog-card" data-topics="{{ post_topics | escape }}" data-reveal style="--i:0">
          <a href="{{ post.url | relative_url }}" class="stretched-link" aria-label="{{ post.title }}"></a>
          <div class="blog-card-content">
            <div class="post-meta">
              {{ post.date | date: "%b %-d, %Y" }}
            </div>
            <div>
              <h2>
                <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
              </h2>
              <p class="post-excerpt">
                {% if post.description %}
                  {{ post.description }}
                {% else %}
                  {{ post.excerpt | strip_html | truncatewords: 24 }}
                {% endif %}
              </p>
            </div>
          </div>
          <div class="blog-card-footer">
            <div class="post-categories">
              {% if post.categories %}
                {% for category in post.categories limit:1 %}
                <span class="category-badge">{{ category }}</span>
                {% endfor %}
              {% endif %}
            </div>
            <span class="blog-read">{{ mins }} min read</span>
            <span class="read-more-link">Read <span aria-hidden="true">→</span></span>
          </div>
        </article>
      {% else %}
        <p>No posts found.</p>
      {% endfor %}
    </div>
  </div>
</section>

---
layout: default
title: Blog
---


<section class="blog-section">
  <div class="blog-header page-hero">
    <div class="container hero-inner">
      <span class="hero-kicker">Writing & Insights</span>
      <h1>The Blog</h1>
      <p class="hero-tagline">Thoughts on software development and the daily challenge of writing.</p>
      <div class="hero-meta-badge">Daily Challenge Active</div>
    </div>
  </div>

  <div class="blog-filters" data-blog-filters role="group" aria-label="Filter posts by topic">
    <button type="button" class="filter-chip is-active" data-filter="all" aria-pressed="true">All</button>
    {%- for topic in site.data.blog_topics %}
    <button type="button" class="filter-chip" data-filter="{{ topic.slug }}" aria-pressed="false">{{ topic.label }}</button>
    {%- endfor %}
  </div>
  <p class="filter-status" data-filter-status aria-live="polite"></p>

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
      <article class="blog-card card-base" data-topics="{{ post_topics | escape }}">
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

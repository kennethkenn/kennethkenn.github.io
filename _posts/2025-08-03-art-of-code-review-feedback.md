---
layout: post
title: "The Art of the Code Review: How to Give and Receive Feedback"
date: 2025-08-03
categories: [General, Soft Skills]
description: "Best practices for maintaining code quality without hurting feelings or slowing down the team."
tags: [code-review, soft-skills, team-building, career, agile]
---

Code review is where culture is built. It can be a place of learning and mentorship, or a place of ego battles and passive-aggression. The fastest way to improve reviews is to make expectations explicit: what needs to be checked, what is optional, and how to disagree.

## Set the Frame First

Before anyone comments, reviewers should have enough context:

1.  **What is the goal?** A one-paragraph PR description explaining the problem and approach.
2.  **What changed?** A short list of files or features with the intent behind the changes.
3.  **How to test?** Minimum steps or automated checks to validate the behavior.

Clear framing turns reviews from guesswork into validation.

## For the Reviewer: Critique Code, Not People

**Bad**: "You broke the build. Why didn't you use a loop here?"
**Good**: "This logic seems to duplicate lines 40-50. Would a loop work better here to reduce repetition?"

1.  **Be specific**: Don't just say "Fix this." Explain *why*.
2.  **Label severity**: Prefix comments with "blocking", "suggestion", or "question" so the author knows what must change.
3.  **Nitpick offline**: If you are arguing about variable naming conventions for 20 comments, get on a call. Or better yet, install a linter and let the robot be the bad guy.
3.  **Praise good code**: If you see a clever solution, say "Nice implementation!"

## Use a Lightweight Checklist

Reviewing with a mental checklist helps you be consistent:

1.  **Correctness**: Does this work for edge cases?
2.  **Clarity**: Would a new teammate understand this in six months?
3.  **Risk**: Are there failure modes or missing error handling?
4.  **Tests**: Are the tests meaningful and minimal?
5.  **Performance**: Any obvious hotspots or slow paths?

If your team struggles with consistency, write a shared checklist and link it in your PR template. The less reviewers have to remember, the better the feedback quality.

## For the Author: You Are Not Your Code

It hurts when someone tears apart a PR you spent 3 days on. But:

1.  **Don't take it personally**. They are finding bugs in the logic, not flaws in your soul.
2.  **Context is king**. If you did something weird for a reason, add a comment explaining it *before* they ask.
3.  **Gratitude**: "Thanks for catching that edge case."

## Keep PRs Small and Focused

If a PR is doing three unrelated things, it will get a shallow review. Smaller PRs:

1.  Are easier to reason about.
2.  Get reviewed faster.
3.  Reduce merge conflicts.

If you must ship a large change, include a short architecture note and recommended review order.

## Keep Review Latency Low

Feedback that arrives days later is less useful. A simple expectation like "first response within 24 hours" can improve collaboration and reduce merge conflicts.

If you're a reviewer and you can't finish soon, leave a quick note: "I can fully review tomorrow, but I skimmed and saw no blockers so far." That reduces anxiety and helps the author plan.

## The Goal

The goal of a code review isn't to prove who is smarter. It's to ensure that the code merging into `main` is maintainable, bug-free, and understood by more than just one person. A good review saves you from waking up at 3 AM for a production outage.

## Example Response Template

When responding to feedback, you can keep it simple:

1.  "Fixed in commit X, updated test Y."
2.  "I kept this approach because Z; open to alternatives."
3.  "Good catch, added a guard for the edge case."

Treat reviews as collaboration, not combat. Good feedback isn't about winning a debate. It's about shipping code that future you won't hate.

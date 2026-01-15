---
layout: post
title: "The Art of the Code Review: How to Give and Receive Feedback"
date: 2025-08-03
categories: [General, Soft Skills]
description: "Best practices for maintaining code quality without hurting feelings or slowing down the team."
tags: [code-review, soft-skills, team-building, career, agile]
---

Code review is where culture is built. It can be a place of learning and mentorship, or a place of ego battles and passive-aggression.

## For the Reviewer: Critique Code, Not People

**Bad**: "You broke the build. Why didn't you use a loop here?"
**Good**: "This logic seems to duplicate lines 40-50. Would a loop work better here to reduce repetition?"

1.  **Be specific**: Don't just say "Fix this." Explain *why*.
2.  **Nitpick offline**: If you are arguing about variable naming conventions for 20 comments, get on a call. Or better yet, install a Linter and let the robot be the bad guy.
3.  **Praise good code**: If you see a clever solution, say "Nice implementation!"

## For the Author: You Are Not Your Code

It hurts when someone tears apart a PR you spent 3 days on. But:

1.  **Don't take it personally**. They are finding bugs in the logic, not flaws in your soul.
2.  **Context is king**. If you did something weird for a reason, add a comment explaining it *before* they ask.
3.  **Gratitude**: "Thanks for catching that edge case."

## The Goal

The goal of a code review isn't to prove who is smarter. It's to ensure that the code merging into `main` is maintainable, bug-free, and understood by more than just one person. A good review saves you from waking up at 3 AM for a production outage.

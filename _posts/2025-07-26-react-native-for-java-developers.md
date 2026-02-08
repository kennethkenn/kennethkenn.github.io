---
layout: post
title: "Building Your First React Native App: A Java Developer's Perspective"
date: 2025-07-26
categories: [Mobile, React Native]
description: "Transitioning from strict Java/Kotlin Android development to the JavaScript-based React Native interaction. Lessons learned and pitfalls to avoid."
tags: [react-native, java, android, mobile-dev, javascript]
---

As someone coming from a strong Java and Spring Boot background, diving into React Native felt like entering the Wild West. Where were my types? Why is CSS inside my JavaScript? But after building my "Inventory Scanner" app, I've come to appreciate the bridge between these two worlds.

## The Mental Shift

### 1. View vs. Component
In native Android (pre-Jetpack Compose), you think in XML layouts and Java/Kotlin Activities. In React Native, everything is a component.

- **Android**: `TextView`, `LinearLayout`, `RecyclerView`
- **React Native**: `<Text>`, `<View>`, `<FlatList>`

The mapping is surprisingly 1:1, but the "layouting" logic moves from static XML to dynamic Flexbox.

### 2. The Build Process
Gradle is still there. React Native is just a layer on top.

- **Java**: You control the `MainActivity.java`.
- **RN**: You live in `index.js`, but your standard native files (`AndroidManifest.xml`, `build.gradle`) still exist in the `/android` folder. You will need to touch them for permissions or native module dependencies.

## Expo vs React Native CLI

If you want speed, start with Expo. If you need deep native control, use the React Native CLI.

- **Expo**: Fast setup, fewer native headaches, great for prototypes.
- **CLI**: Full control, but more configuration and build complexity.

## Bridges and Native Modules

The most fascinating part is the bridge. JavaScript runs on one thread, native UI on another. They communicate via serialized messages.

One challenge I faced was the Camera API. I needed high-performance scanning. The pure JS solutions were lagging. I had to understand how native modules work to link a high-performance native library.

```java
// MyNativeModule.java
@ReactMethod
public void showToast(String message) {
    Toast.makeText(getReactApplicationContext(), message, Toast.LENGTH_SHORT).show();
}
```

This ability to drop down into Java when JS isn't enough is React Native's greatest strength. You are not "stuck" in a web view.

## Navigation and State

Navigation is not built-in. Most teams use `react-navigation`.

For state, start simple:

1.  Local component state for UI.
2.  Context for shared state.
3.  Redux or Zustand when things get complex.

## State of the Art: TypeScript

If you miss Java's strict typing (and you should), **use TypeScript**. It brings sanity to the chaotic JS ecosystem. Define interfaces for your props and state, and suddenly your mobile app feels as robust as your Spring Boot backend.

```typescript
interface UserProps {
  id: number;
  username: string;
  isVerified?: boolean;
}
```

## Debugging Tips

1.  Use Flipper for inspecting network calls and logs.
2.  Prefer real devices for performance testing.
3.  Turn on Hermes for better JS performance.

## Assessment

Is it worth it? For 90% of CRUD-style apps (like e-commerce or chat apps), absolutely. The speed of hot reloading vs waiting 2 minutes for Gradle to build is a productivity boost that cannot be overstated. Just keep Android Studio open - you will still need it.

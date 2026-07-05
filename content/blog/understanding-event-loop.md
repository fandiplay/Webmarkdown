---
title: "Understanding the Event Loop"
description: "Deep dive into how Node.js event loop works under the hood with phases and examples."
slug: "understanding-event-loop"
tags: ["nodejs", "javascript", "async", "event-loop"]
createdAt: "2025-07-01"
updatedAt: "2025-07-05"
written: "Ardhian"
pinned: false
draft: false
cover: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80"
---

The event loop is what makes Node.js tick. Let's explore how it works.

## The Six Phases

The event loop operates in phases, each with its own queue:

```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

### 1. Timers
Executes callbacks scheduled by `setTimeout()` and `setInterval()`.

### 2. Pending Callbacks
Executes I/O callbacks deferred to the next loop iteration.

::: warning
Be careful with blocking the event loop! Long-running synchronous operations can starve other phases.
:::

## Microtasks

Microtasks (Promises, `queueMicrotask`) are processed between each phase:

```js title="microtask-example.js"
console.log('1');
Promise.resolve().then(() => console.log('2'));
setTimeout(() => console.log('3'), 0);
console.log('4');
// Output: 1, 4, 2, 3
```

## Best Practices

::: caution
Avoid `process.nextTick()` in large quantities — it can delay the poll phase indefinitely.
:::

[[toc]]

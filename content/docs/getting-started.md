---
title: "Getting Started"
description: "Learn how to use this knowledge base and all its features."
slug: "getting-started"
tags: ["guide", "basics"]
createdAt: "2025-06-01"
updatedAt: "2025-07-01"
---

# Getting Started

Welcome! This knowledge base uses custom Markdown extensions. Here's a quick tour.

[[toc]]

## Text Formatting

You can use `inline code` for commands and code references.

## Code Blocks with macOS Style

```js title="hello.js"
console.log('Hello, World!');
```

```bash title="Run the script"
node hello.js
```

## Admonitions

:::note This is a note
Additional information that might be helpful.
:::

:::info FYI
This is an info block with general information.
:::

:::tip Pro Tip
Always use version control for your projects.
:::

:::warning Be Careful
This operation might have side effects.
:::

:::caution Double Check
Review your changes before deploying to production.
:::

:::danger Critical
This action cannot be undone!
:::

## Tabs

;;tabs

## npm

```bash
npm install express
```

## yarn

```bash
yarn add express
```

## pnpm

```bash
pnpm add express
```

;;

## Media Embedding

![Sample Image](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80)

## API Documentation Example

& route GET /api/users List all users &

& route POST /api/users Create a new user &

< response 200 User list retrieved successfully <

< response 201 User created successfully <

## Reusable References

# define-reference api-base
Base URL: `https://api.example.com/v1`
...

Use the base URL: @ api-base @

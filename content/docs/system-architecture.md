---
title: "System Architecture"
description: "Overview of the system architecture, design decisions, and data flow."
slug: "system-architecture"
tags: ["architecture", "design", "backend"]
createdAt: "2025-06-10"
updatedAt: "2025-07-02"
---

# System Architecture

This document describes the architecture of our Zero-Database content management system.

[[toc]]

## High-Level Design

The system follows a simple flow:

```
Markdown Files → Content Loader → In-Memory Cache → Express Routes → EJS Templates → HTML
```

## Core Components

### 1. Content Loader

The `contentLoader.js` service reads all Markdown files and JSON data at startup:

```js title="services/contentLoader.js"
import { readFileSync } from 'node:fs';
import { glob } from 'glob';

export async function initializeApplicationData() {
  // Load all content files in parallel
  const [blogFiles, docFiles] = await Promise.all([
    glob('content/blog/**/*.md'),
    glob('content/docs/**/*.md')
  ]);
  // ... parse and cache
}
```

### 2. In-Memory Cache

All data is stored in a singleton cache object:

```js title="services/cache.js"
export const cache = {
  blogs: [],
  docs: [],
  projects: [],
  socials: [],
  navigation: [],
  config: {}
};
```

### 3. Markdown Processing Pipeline

::: note
The pipeline processes Markdown through multiple custom plugins in a specific order for correct rendering.
:::

1. Inline code highlighting
2. Media player (images/audio/video detection)
3. GitHub-style anchors
4. Table of Contents
5. Multimd-table
6. Admonitions
7. macOS code blocks with syntax highlighting
8. Figure plugin
9. Image lazy loading
10. Tab plugin
11. Dokapi (API documentation)
12. Custom tabs

## Data Flow

```
Request → Middleware → Controller → Service (cache) → View (EJS) → Response
```

## Deployment

The app runs on Vercel's serverless infrastructure with cold-start handling:

- **Cold start**: Initializes cache from disk
- **Warm start**: Reuses existing in-memory cache
- **Guard middleware**: Holds requests until initialization completes

[[toc]]

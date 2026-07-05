---
title: "Getting Started with Node.js in 2025"
description: "A comprehensive guide to starting your Node.js journey with modern tooling and best practices."
slug: "getting-started-nodejs"
tags: ["nodejs", "javascript", "tutorial", "backend"]
createdAt: "2025-06-15"
updatedAt: "2025-06-20"
written: "Ardhian"
pinned: true
draft: false
cover: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80"
---

Node.js has evolved significantly over the years. Here's what you need to know to get started in 2025.

## Why Node.js?

Node.js allows you to run JavaScript on the server. It's fast, scalable, and has one of the largest ecosystems of any programming language.

### Key Features

- **Non-blocking I/O**: Handle thousands of concurrent connections with a single thread
- **NPM ecosystem**: Over 2 million packages available
- **Cross-platform**: Works on Windows, macOS, and Linux

## Setting Up Your Environment

First, install Node.js from the official website or use a version manager like `nvm`:

```bash title="Install Node.js with nvm"
nvm install 22
nvm use 22
node --version
```

## Your First Server

```js title="server.js"
import http from 'node:http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
```

## Next Steps

::: tip
Start with the official Node.js documentation and build small projects to reinforce your learning.
:::

[[toc]]

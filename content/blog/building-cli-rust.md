---
title: "Building CLI Tools with Rust"
description: "Learn how to build fast and reliable command-line tools using Rust programming language."
slug: "building-cli-rust"
tags: ["rust", "cli", "tutorial"]
createdAt: "2025-06-28"
updatedAt: "2025-06-28"
written: "Ardhian"
pinned: false
draft: false
cover: "https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=800&q=80"
---

Rust is perfect for building CLI tools — fast, safe, and cross-platform.

## Why Rust for CLI?

- Zero-cost abstractions
- Memory safety without garbage collection
- Excellent package manager (Cargo)
- Cross-compilation to any platform

## Setting Up

```bash title="Install Rust"
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## A Simple Grep Clone

```rust title="src/main.rs"
use std::env;
use std::fs;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        eprintln!("Usage: {} <pattern> <file>", args[0]);
        process::exit(1);
    }
    let pattern = &args[1];
    let filename = &args[2];
    let contents = fs::read_to_string(filename)
        .expect("Something went wrong reading the file");
    for (i, line) in contents.lines().enumerate() {
        if line.contains(pattern) {
            println!("{}: {}", i + 1, line);
        }
    }
}
```

::: tip
Use the `clap` crate for advanced argument parsing with auto-generated help text!
:::

[[toc]]

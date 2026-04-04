#!/usr/bin/env node

/**
 * Blog Post Scaffolding Tool
 *
 * Usage:
 *   npm run post "My Post Title"
 *   npm run post -- --draft "My Draft Title"
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const isDraft = args.includes("--draft");
const title = args.filter((a) => a !== "--draft").join(" ");

if (!title) {
  console.error("Usage: npm run post \"My Post Title\"");
  console.error("       npm run post -- --draft \"My Draft Title\"");
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const dir = isDraft ? "drafts" : "content";
const dirPath = path.join(process.cwd(), dir);
const filePath = path.join(dirPath, `${slug}.mdx`);
const imageDir = path.join(process.cwd(), "public", "images", "posts", slug);

// Create directories
if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

// Check for existing file
if (fs.existsSync(filePath)) {
  console.error(`File already exists: ${filePath}`);
  process.exit(1);
}

const date = new Date().toISOString().split("T")[0];
const template = `---
title: "${title}"
description: ""
date: "${date}"
tags: []
image: ""
published: ${!isDraft}
author: "Rajiv Nayan Choubey"
---

Write your post here...
`;

fs.writeFileSync(filePath, template, "utf-8");

console.log(`\n✅ Created: ${filePath}`);
console.log(`📁 Image folder: ${imageDir}`);
console.log(`\nHappy writing! 🚀\n`);

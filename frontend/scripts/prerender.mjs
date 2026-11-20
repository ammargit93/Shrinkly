import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');

const routes = [
  {
    path: '/',
    title: 'Shrinkly — Compress Images to a Target File Size Online (Free & Private)',
    description: 'Compress JPG, PNG, WebP, and animated GIF images to exact target file sizes online. 100% private, client-side browser compression with instant ZIP downloads.',
  },
  ...[20, 50, 100, 200, 500].map((size) => ({
    path: `/compress-image-to-${size}kb`,
    title: `Compress Image to ${size}KB Online (Free & Fast) — Shrinkly`,
    description: `Reduce JPG, PNG, WebP, or GIF image size to ${size}KB or less. Free, private client-side photo compressor for passport, visa, exam forms, and portals.`,
  })),
  {
    path: '/about',
    title: 'About Shrinkly — Fast, Lightweight & Privacy-First Image Compressor',
    description: 'Learn about Shrinkly, our minimalist philosophy, and how we build fast, privacy-first client-side image compression tools for web users worldwide.',
  },
  {
    path: '/faq',
    title: 'Frequently Asked Questions (FAQ) — Shrinkly Image Compressor',
    description: 'Find answers to common questions about Shrinkly image compression, supported formats, privacy, batch downloads, and target size accuracy.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy — Shrinkly Image Compressor',
    description: 'Read the Shrinkly privacy policy. We prioritize privacy with 100% client-side, in-browser image compression and zero server-side storage.',
  },
  {
    path: '/terms',
    title: 'Terms of Service — Shrinkly Image Compressor',
    description: 'Read the Shrinkly Terms of Service for our free, fast, client-side online image compression utility.',
  },
];

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const setMetaContent = (html, attribute, name, content) => {
  const escapedContent = escapeHtml(content);
  const pattern = new RegExp(`<meta[^>]+${attribute}=["']${name}["'][^>]*>`, 'i');
  if (pattern.test(html)) {
    return html.replace(pattern, (tag) =>
      /\scontent=["'][^"']*["']/.test(tag)
        ? tag.replace(/\scontent=["'][^"']*["']/, ` content="${escapedContent}"`)
        : tag.replace(/\/?>$/, ` content="${escapedContent}" />`),
    );
  }
  return html.replace('</head>', `<meta ${attribute}="${name}" content="${escapedContent}" />\n</head>`);
};

const vite = await createServer({
  root,
  appType: 'custom',
  server: { middlewareMode: true },
});

try {
  const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
  let template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

  for (const route of routes) {
    globalThis.window = { location: { pathname: route.path }, history: { pushState() {} }, scrollTo() {} };
    globalThis.document = undefined;

    const appHtml = renderToString(React.createElement(App));
    let html = template
      .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    const canonicalUrl = `https://shrinkly-livid.vercel.app${route.path}`;
    html = html
      .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(route.title)}</title>`)
      .replace(/<link rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
    html = setMetaContent(html, 'name', 'title', route.title);
    html = setMetaContent(html, 'name', 'description', route.description);
    html = setMetaContent(html, 'property', 'og:url', canonicalUrl);
    html = setMetaContent(html, 'property', 'og:title', route.title);
    html = setMetaContent(html, 'property', 'og:description', route.description);
    html = setMetaContent(html, 'name', 'twitter:url', canonicalUrl);
    html = setMetaContent(html, 'name', 'twitter:title', route.title);
    html = setMetaContent(html, 'name', 'twitter:description', route.description);

    const routeDir = route.path === '/' ? distDir : path.join(distDir, route.path.slice(1));
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, 'index.html'), html);
  }
} finally {
  await vite.close();
}

import { useEffect } from 'react';

export interface SeoProps {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  schema?: Record<string, any> | Array<Record<string, any>>;
  robots?: string;
}

const BASE_URL = 'https://shrinkly-livid.vercel.app';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const DEFAULT_OG_IMAGE_ALT = 'Shrinkly — Fast, Private Online Image Compressor';

export function useSeo({
  title,
  description,
  canonicalPath,
  keywords,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = DEFAULT_OG_IMAGE_ALT,
  schema,
  robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
}: SeoProps) {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper to set or create meta tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', robots);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    // 3. Canonical URL
    const canonicalUrl = `${BASE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 4. Open Graph Tags
    const fullOgImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'Shrinkly');
    setMetaTag('property', 'og:locale', 'en_US');
    setMetaTag('property', 'og:image', fullOgImage);
    setMetaTag('property', 'og:image:secure_url', fullOgImage);
    setMetaTag('property', 'og:image:alt', ogImageAlt);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:url', canonicalUrl);
    setMetaTag('name', 'twitter:image', fullOgImage);
    setMetaTag('name', 'twitter:image:alt', ogImageAlt);
    setMetaTag('name', 'twitter:site', '@shrinkly');
    setMetaTag('name', 'twitter:creator', '@shrinkly');

    // 6. Dynamic Structured Data (Schema.org JSON-LD)
    const schemaId = 'seo-schema-jsonld';
    let schemaScript = document.getElementById(schemaId) as HTMLScriptElement | null;

    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.id = schemaId;
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }
  }, [title, description, canonicalPath, keywords, ogType, ogImage, ogImageAlt, schema, robots]);
}

export default useSeo;

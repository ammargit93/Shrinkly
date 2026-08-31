import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: 'website' | 'article';
  schema?: Record<string, any>;
}

export function useSeo({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  schema,
}: SeoProps) {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // 2. Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Canonical URL
    const baseUrl = 'https://shrinkly-livid.vercel.app'; // Standard base domain for canonical mapping
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 4. Open Graph & Twitter Card tags
    const metaTags: Record<string, string> = {
      'og:title': title,
      'og:description': description,
      'og:url': canonicalUrl,
      'og:type': ogType,
      'og:site_name': 'Shrinkly',
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:site': '@shrinkly',
    };

    Object.entries(metaTags).forEach(([key, value]) => {
      const isTwitter = key.startsWith('twitter:');
      const attrName = isTwitter ? 'name' : 'property';
      const selector = `meta[${attrName}="${key}"]`;
      
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    });

    // 5. Structured Data (Schema.org JSON-LD)
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
    } else {
      if (schemaScript) {
        schemaScript.remove();
      }
    }
  }, [title, description, canonicalPath, ogType, schema]);
}

export default useSeo;

import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  schema?: object | object[];
}

export default function SEO({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogTitle,
  ogDescription,
  ogImage = 'https://www.strikin.tech/strikin-logo.png',
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage = 'https://www.strikin.tech/strikin-logo.png',
  schema,
}: SEOProps) {
  useEffect(() => {
    const originalTitle = document.title;
    if (title) {
      document.title = title;
    }

    const setMeta = (nameOrProperty: string, value: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      const selector = `meta[${attr}="${nameOrProperty}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    const setLink = (rel: string, href: string) => {
      const selector = `link[rel="${rel}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    if (description) setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);

    const currentUrl = ogUrl || window.location.href;
    setLink('canonical', canonical || currentUrl);

    setMeta('og:type', ogType, true);
    setMeta('og:title', ogTitle || title || originalTitle, true);
    setMeta('og:description', ogDescription || description || '', true);
    setMeta('og:url', canonical || currentUrl, true);
    if (ogImage) setMeta('og:image', ogImage, true);

    setMeta('twitter:card', twitterCard);
    setMeta('twitter:title', twitterTitle || title || originalTitle);
    setMeta('twitter:description', twitterDescription || description || '');
    if (twitterImage) setMeta('twitter:image', twitterImage);

    let schemaScript = document.getElementById('seo-jsonld-schema') as HTMLScriptElement;
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'seo-jsonld-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else {
      if (schemaScript) {
        schemaScript.remove();
      }
    }

    return () => {
      const schemaScriptOnUnmount = document.getElementById('seo-jsonld-schema');
      if (schemaScriptOnUnmount) {
        schemaScriptOnUnmount.remove();
      }
    };
  }, [
    title,
    description,
    keywords,
    canonical,
    ogType,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    schema,
  ]);

  return null;
}

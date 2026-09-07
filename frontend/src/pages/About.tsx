import { useSeo } from '../hooks/useSeo';
import { Link } from '../components/Router';

export function About() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://shrinkly-livid.vercel.app/about#breadcrumbs',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://shrinkly-livid.vercel.app/'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'About',
            'item': 'https://shrinkly-livid.vercel.app/about'
          }
        ]
      },
      {
        '@type': 'AboutPage',
        '@id': 'https://shrinkly-livid.vercel.app/about#aboutpage',
        'name': 'About Shrinkly',
        'description': 'Shrinkly is a high-speed, privacy-first image compression utility built to run entirely inside the web browser.',
        'url': 'https://shrinkly-livid.vercel.app/about'
      }
    ]
  };

  useSeo({
    title: 'About Shrinkly — Fast, Lightweight & Privacy-First Image Compressor',
    description: 'Learn about Shrinkly, our minimalist philosophy, and how we build fast, privacy-first client-side image compression tools for web users worldwide.',
    canonicalPath: '/about',
    keywords: 'about shrinkly, fast image compressor, client side photo optimizer, browser image utility',
    schema,
  });

  return (
    <div className="max-w-[750px] mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-6 text-neutral-800 dark:text-neutral-350">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-emerald-600 dark:text-emerald-450 font-medium">About</span>
      </nav>

      <header className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          About Shrinkly
        </h1>
      </header>

      <div className="space-y-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        <p>
          Shrinkly was born out of frustration with modern web utilities. Many online image compressors are filled with intrusive ads, paywalls, confusing layouts, and multi-step registration forms.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Our Philosophy
          </h2>
          <p>
            We believe everyday utilities should do one thing, do it exceptionally fast, and get out of your way. No newsletters, no subscriptions, no tracking cookies, and no unnecessary complexity.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Technology & Privacy
          </h2>
          <p>
            Shrinkly leverages client-side HTML5 canvas rendering, adaptive binary search algorithms, and frame-aware palette quantization to compress JPG, PNG, WebP, and animated GIF files directly on your local device. This ensures zero network latency, immediate feedback, and complete data privacy.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;

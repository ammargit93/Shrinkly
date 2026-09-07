import { useSeo } from '../hooks/useSeo';
import { Link } from '../components/Router';

export function Terms() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://shrinkly-livid.vercel.app/terms#breadcrumbs',
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
            'name': 'Terms of Service',
            'item': 'https://shrinkly-livid.vercel.app/terms'
          }
        ]
      },
      {
        '@type': 'WebPage',
        '@id': 'https://shrinkly-livid.vercel.app/terms#webpage',
        'name': 'Shrinkly Terms of Service',
        'description': 'Clear, simple guidelines for using the Shrinkly online image compressor utility.',
        'url': 'https://shrinkly-livid.vercel.app/terms'
      }
    ]
  };

  useSeo({
    title: 'Terms of Service — Shrinkly Image Compressor',
    description: 'Read the Shrinkly Terms of Service. Clear, transparent guidelines for using our free, fast, client-side online image compression utility.',
    canonicalPath: '/terms',
    keywords: 'shrinkly terms, image compressor terms of service, free utility license',
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
        <span className="text-emerald-600 dark:text-emerald-450 font-medium">Terms</span>
      </nav>

      <header className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Terms of Service
        </h1>
      </header>

      <div className="space-y-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        <p>
          Welcome to Shrinkly. By accessing and using our web utility, you agree to these simple terms.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            1. Usage License
          </h2>
          <p>
            Shrinkly is provided free of charge for both personal and commercial use. You may use this tool as much as needed to optimize and compress your files.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            2. Fair Use & Warranty
          </h2>
          <p>
            This software is provided "as is", without warranty of any kind. If you require bulk automated batch processing via an API, please self-host the open-source server on your own infrastructure.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Terms;

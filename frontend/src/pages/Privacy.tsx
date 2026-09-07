import { useSeo } from '../hooks/useSeo';
import { Link } from '../components/Router';

export function Privacy() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://shrinkly-livid.vercel.app/privacy#breadcrumbs',
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
            'name': 'Privacy Policy',
            'item': 'https://shrinkly-livid.vercel.app/privacy'
          }
        ]
      },
      {
        '@type': 'WebPage',
        '@id': 'https://shrinkly-livid.vercel.app/privacy#webpage',
        'name': 'Shrinkly Privacy Policy',
        'description': 'Shrinkly processes images 100% locally in your web browser with zero server uploads and zero data retention.',
        'url': 'https://shrinkly-livid.vercel.app/privacy'
      }
    ]
  };

  useSeo({
    title: 'Privacy Policy — Shrinkly Image Compressor',
    description: 'Read the Shrinkly privacy policy. We prioritize your privacy with 100% client-side, in-browser image compression and zero server-side storage.',
    canonicalPath: '/privacy',
    keywords: 'shrinkly privacy, private image compression, no upload photo compressor, client side privacy',
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
        <span className="text-emerald-600 dark:text-emerald-450 font-medium">Privacy</span>
      </nav>

      <header className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Privacy Policy
        </h1>
      </header>

      <div className="space-y-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        <p>
          At Shrinkly, privacy is our top priority. We believe you shouldn't have to sacrifice your personal data or privacy to optimize your images.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Zero Server Retention
          </h2>
          <p>
            By default, all compression is performed 100% locally in your web browser. Your images, photos, and signatures never leave your device and are never transmitted to any third-party server.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            No Tracking Cookies
          </h2>
          <p>
            Shrinkly does not set tracking cookies or engage in third-party behavioral advertising networks. We do not track your activity across other sites.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Privacy;

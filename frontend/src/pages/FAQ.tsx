import { useSeo } from '../hooks/useSeo';

export function FAQ() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Is Shrinkly free to use?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes. Shrinkly is 100% free with no quotas, subscriptions, or hidden charges.',
        },
      },
      {
        '@type': 'Question',
        'name': 'What formats are supported?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'You can compress standard JPG/JPEG, PNG, WebP, and animated/static GIF images.',
        },
      },
      {
        '@type': 'Question',
        'name': 'How does client-side compression work?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'When you select a file, Shrinkly decodes and draws the image onto an offscreen canvas or frame buffer and optimizes quality, dimensions, and color palettes. This happens entirely within your browser sandboxed environment, ensuring complete privacy.',
        },
      },
      {
        '@type': 'Question',
        'name': 'Can I host this tool myself?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Absolutely. Shrinkly is designed with a separate frontend (React) and backend (Go), making it easy to package as a standalone Docker image or run locally on your own machine.',
        },
      },
    ],
  };

  useSeo({
    title: 'Frequently Asked Questions — Shrinkly Help Center',
    description: 'Find answers to common questions about Shrinkly image compression, supported formats (JPG, PNG, WebP, GIF), client-side security, and hosting options.',
    canonicalPath: '/faq',
    schema,
  });

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-5 sm:space-y-6 text-neutral-800 dark:text-neutral-350">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        Frequently Asked Questions
      </h1>

      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
            Is Shrinkly free to use?
          </h2>
          <p className="text-sm leading-relaxed text-neutral-605 dark:text-neutral-400">
            Yes. Shrinkly is 100% free with no quotas, subscriptions, or hidden charges.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
            What formats are supported?
          </h2>
          <p className="text-sm leading-relaxed text-neutral-605 dark:text-neutral-400">
            You can compress standard JPG/JPEG, PNG, WebP, and animated/static GIF images.
          </p>
        </section>


        <section className="space-y-2">
          <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
            How does client-side compression work?
          </h2>
          <p className="text-sm leading-relaxed text-neutral-605 dark:text-neutral-400">
            When you select a file, Shrinkly draws it onto an offscreen canvas and exports it to a blob at variable quality settings. This happens entirely within your browser sandboxed environment, ensuring complete security.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
            Can I host this tool myself?
          </h2>
          <p className="text-sm leading-relaxed text-neutral-605 dark:text-neutral-400">
            Absolutely. Shrinkly is designed with a separate frontend (React) and backend (Go), making it easy to package as a standalone Docker image or run locally on your own machine.
          </p>
        </section>
      </div>
    </div>
  );
}

export default FAQ;

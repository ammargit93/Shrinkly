import { useSeo } from '../hooks/useSeo';
import { Link } from '../components/Router';

export function FAQ() {
  const faqs = [
    {
      question: 'Is Shrinkly free to use?',
      answer:
        'Yes, Shrinkly is 100% free with no quotas, watermarks, registrations, or hidden subscriptions.',
    },
    {
      question: 'What image formats can I compress?',
      answer:
        'Shrinkly supports standard JPG/JPEG, PNG (including transparency), modern WebP, and multi-frame animated or static GIF files.',
    },
    {
      question: 'How does client-side compression work?',
      answer:
        'When you select an image, Shrinkly decodes and renders it directly inside an offscreen HTML5 canvas or frame buffer in your web browser. An adaptive binary search algorithm tunes quality and dimension parameters to reach your exact target size without sending your data to any remote server.',
    },
    {
      question: 'Will compressing my image reduce visible quality?',
      answer:
        'Shrinkly uses perceptual optimization algorithms to reduce file size while preserving high visual fidelity. Quality loss is minimized, and your output image will remain sharp and legible for documents, portals, and websites.',
    },
    {
      question: 'Can I compress multiple images at the same time?',
      answer:
        'Yes! You can select or drag and drop up to 10 images at once. Shrinkly will compress all images in parallel and package them into a single, convenient ZIP archive for instant download.',
    },
    {
      question: 'Are my images stored or logged anywhere?',
      answer:
        'No. Because all compression happens locally inside your browser sandbox, your photos, signatures, and sensitive documents never leave your computer.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://shrinkly-livid.vercel.app/faq#breadcrumbs',
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
            'name': 'FAQ',
            'item': 'https://shrinkly-livid.vercel.app/faq'
          }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://shrinkly-livid.vercel.app/faq#faq',
        'mainEntity': faqs.map((faq) => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer,
          },
        })),
      }
    ]
  };

  useSeo({
    title: 'Frequently Asked Questions (FAQ) — Shrinkly Image Compressor',
    description: 'Find answers to common questions about Shrinkly image compression, supported formats (JPG, PNG, WebP, GIF), 100% in-browser privacy, batch ZIP downloads, and target size accuracy.',
    canonicalPath: '/faq',
    keywords: 'shrinkly faq, image compression faq, free image compressor questions, client-side photo privacy, bulk zip photo compressor',
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
        <span className="text-emerald-600 dark:text-emerald-450 font-medium">FAQ</span>
      </nav>

      <header className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Everything you need to know about Shrinkly and in-browser image compression.
        </p>
      </header>

      <div className="space-y-6 pt-2">
        {faqs.map((faq, index) => (
          <section key={index} className="space-y-2 border-b border-neutral-200/60 dark:border-neutral-800/60 pb-5 last:border-b-0">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {faq.question}
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {faq.answer}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

export default FAQ;

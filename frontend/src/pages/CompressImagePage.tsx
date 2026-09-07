import { useSeo } from '../hooks/useSeo';
import { Compressor } from '../components/Compressor';
import { Link } from '../components/Router';
import { ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react';

interface CompressImagePageProps {
  targetSizeKb: 20 | 50 | 100 | 200 | 500;
}

const USE_CASE_MAP: Record<20 | 50 | 100 | 200 | 500, {
  summary: string;
  useCases: string[];
  tips: string;
}> = {
  20: {
    summary: 'Government job applications, SSC, UPSC, and online exam portals commonly require scanned signatures or small avatar photos under 20KB.',
    useCases: ['Candidate signature uploads', 'Online entrance exam application forms', 'Low-bandwidth avatar thumbnails'],
    tips: 'For 20KB targets, Shrinkly automatically reduces dimensions to maintain high contrast and clarity without text blurriness.'
  },
  50: {
    summary: 'Passport photo forms, student ID portals, and national identification databases typically enforce a strict 50KB maximum file size.',
    useCases: ['Passport size photo submissions', 'University student portal IDs', 'State and federal identity document uploads'],
    tips: 'Selecting 50KB gives ample headroom for sharp facial features while guaranteeing submission approval.'
  },
  100: {
    summary: 'Visa applications, embassy uploads, job resume attachments, and professional portals frequently demand image files under 100KB.',
    useCases: ['Schengen & US Visa photo uploads', 'LinkedIn profile avatars & email signatures', 'Banking and KYC verification photos'],
    tips: 'At 100KB, JPEG and WebP photos preserve excellent color balance and resolution for documents and headshots.'
  },
  200: {
    summary: 'Online classifieds, e-commerce listings, and property portals often cap image attachments at 200KB to ensure fast mobile page loads.',
    useCases: ['Real estate and property photos', 'E-commerce product catalog listings', 'PDF attachments and presentation slides'],
    tips: '200KB provides near-lossless clarity for high-resolution images while cutting file weight by up to 80%.'
  },
  500: {
    summary: 'Web publishers, blog post covers, and marketing portfolios need crisp visuals under 500KB for optimal Core Web Vitals and Google SEO speed.',
    useCases: ['Hero banner images for websites and blogs', 'Social media landscape graphics', 'Design portfolio screenshots'],
    tips: 'Compressing to 500KB eliminates page load lag on mobile networks without visible pixelation.'
  }
};

export function CompressImagePage({ targetSizeKb }: CompressImagePageProps) {
  const details = USE_CASE_MAP[targetSizeKb];
  const allSizes: Array<20 | 50 | 100 | 200 | 500> = [20, 50, 100, 200, 500];
  const siblingSizes = allSizes.filter((size) => size !== targetSizeKb);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `https://shrinkly-livid.vercel.app/compress-image-to-${targetSizeKb}kb#webapp`,
        'name': `Shrinkly — Compress Image to ${targetSizeKb}KB`,
        'description': `Compress JPG, PNG, WebP, and GIF images under ${targetSizeKb}KB online. 100% private, client-side, instant download.`,
        'url': `https://shrinkly-livid.vercel.app/compress-image-to-${targetSizeKb}kb`,
        'applicationCategory': 'MultimediaApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires HTML5 Canvas and modern browser support.',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `https://shrinkly-livid.vercel.app/compress-image-to-${targetSizeKb}kb#breadcrumbs`,
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
            'name': `Compress Image to ${targetSizeKb}KB`,
            'item': `https://shrinkly-livid.vercel.app/compress-image-to-${targetSizeKb}kb`
          }
        ]
      },
      {
        '@type': 'HowTo',
        '@id': `https://shrinkly-livid.vercel.app/compress-image-to-${targetSizeKb}kb#howto`,
        'name': `How to Compress an Image to ${targetSizeKb}KB Online`,
        'description': `Reduce your image file size to exactly ${targetSizeKb}KB or less in four easy steps.`,
        'totalTime': 'PT5S',
        'step': [
          {
            '@type': 'HowToStep',
            'position': 1,
            'name': 'Upload Your Image',
            'text': 'Drag and drop or select your photo into the Shrinkly compression zone.'
          },
          {
            '@type': 'HowToStep',
            'position': 2,
            'name': 'Confirm Target Preset',
            'text': `Ensure the ${targetSizeKb}KB preset is selected.`
          },
          {
            '@type': 'HowToStep',
            'position': 3,
            'name': 'Run In-Browser Compression',
            'text': 'Click "Compress image" to optimize dimensions and file size locally in your browser.'
          },
          {
            '@type': 'HowToStep',
            'position': 4,
            'name': 'Download Optimized Photo',
            'text': `Download your compressed file (guaranteed under ${targetSizeKb}KB) instantly.`
          }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': `https://shrinkly-livid.vercel.app/compress-image-to-${targetSizeKb}kb#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': `How do I compress an image to under ${targetSizeKb}KB?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `Upload your JPG, PNG, WebP, or GIF file, verify that the ${targetSizeKb}KB preset is highlighted, and click "Compress image". Shrinkly optimizes the quality and dimensions directly in your web browser so you can download the result immediately.`
            }
          },
          {
            '@type': 'Question',
            'name': `Will the compressed photo be accepted by online application portals?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `Yes. Shrinkly guarantees that the output file size is close to but strictly within ${targetSizeKb}KB, making it compliant with portal upload limits for passports, exams, visas, and government portals.`
            }
          },
          {
            '@type': 'Question',
            'name': `Is my photo uploaded to an external server?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'No. Shrinkly processes 100% of your images locally in your web browser using HTML5 Canvas and memory. Your private documents, signatures, and photos never leave your device.'
            }
          }
        ]
      }
    ]
  };

  useSeo({
    title: `Compress Image to ${targetSizeKb}KB Online (Free & Fast) — Shrinkly`,
    description: `Reduce JPG, PNG, WebP, or GIF image size to ${targetSizeKb}KB or less. Free, private client-side photo compressor for passport, visa, exam forms, and portals.`,
    canonicalPath: `/compress-image-to-${targetSizeKb}kb`,
    keywords: `compress image to ${targetSizeKb}kb, reduce photo to ${targetSizeKb}kb, compress photo to ${targetSizeKb}kb online, ${targetSizeKb}kb image converter, passport photo ${targetSizeKb}kb, signature photo ${targetSizeKb}kb, jpg compressor ${targetSizeKb}kb, online photo reducer`,
    schema,
  });

  return (
    <div className="max-w-[850px] mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12">
      {/* Title */}
      <section className="text-center space-y-2.5 sm:space-y-4">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
          <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-emerald-600 dark:text-emerald-450 font-medium">
            Compress to {targetSizeKb}KB
          </span>
        </nav>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          Compress image to {targetSizeKb}KB
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-[560px] mx-auto px-1 sm:px-0 leading-relaxed">
          Quickly shrink JPG, PNG, WebP, or GIF images to {targetSizeKb}KB or less directly in your browser.
        </p>
      </section>

      {/* Compressor Tool */}
      <section aria-label="Image Compression Tool">
        <Compressor defaultPreset={targetSizeKb} />
      </section>

      {/* SEO Copy & Target Size Guide */}
      <hr className="border-neutral-200 dark:border-neutral-800" />

      <article className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-neutral-700 dark:text-neutral-350">
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Common uses for {targetSizeKb}KB images
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {details.summary}
          </p>

          <ul className="space-y-2 text-neutral-600 dark:text-neutral-400 leading-relaxed list-none pl-0">
            {details.useCases.map((uc, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
                <span>{uc}</span>
              </li>
            ))}
          </ul>

          <div className="p-3.5 rounded-lg bg-neutral-100/70 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900 dark:text-neutral-200 block mb-0.5">Privacy Guaranteed</strong>
              {details.tips}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            How to compress an image to {targetSizeKb}KB
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <li>Drop or select your photo in the upload box above.</li>
            <li>Confirm the <strong>{targetSizeKb}KB</strong> preset is active.</li>
            <li>Click <strong>Compress image</strong> to run local optimization.</li>
            <li>Download your ready-to-upload compressed image.</li>
          </ol>

          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 pt-2 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
            Other target size tools
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs">
            Need a different file size limit? Jump directly to our other dedicated preset tools:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1 text-xs">
            {siblingSizes.map((size) => (
              <Link
                key={size}
                href={`/compress-image-to-${size}kb`}
                className="py-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-400 underline decoration-emerald-500/20 hover:decoration-emerald-500 transition-colors inline-block"
              >
                Compress image to {size}KB
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}

export default CompressImagePage;

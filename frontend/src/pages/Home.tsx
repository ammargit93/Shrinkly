import { useSeo } from '../hooks/useSeo';
import { Compressor } from '../components/Compressor';
import { Link } from '../components/Router';
import { ShieldCheck, Zap, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export function Home() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://shrinkly-livid.vercel.app/#website',
        'url': 'https://shrinkly-livid.vercel.app/',
        'name': 'Shrinkly',
        'alternateName': 'Shrinkly Image Compressor',
        'description': 'Compress JPG, PNG, WebP, and animated GIF images to exact target file sizes online.'
      },
      {
        '@type': 'WebApplication',
        '@id': 'https://shrinkly-livid.vercel.app/#webapp',
        'name': 'Shrinkly — Online Image Compressor',
        'description': 'Compress JPG, PNG, WebP, and GIF images to a specific target file size (20KB, 50KB, 100KB, 200KB, 500KB) online. 100% private, client-side, instant download.',
        'url': 'https://shrinkly-livid.vercel.app/',
        'applicationCategory': 'MultimediaApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires HTML5 Canvas and modern browser support.',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'Target file size compression (20KB, 50KB, 100KB, 200KB, 500KB)',
          '100% Client-side privacy (no server uploads)',
          'Batch image compression up to 10 files',
          'Animated GIF frame-aware optimization',
          'Direct ZIP archive downloads'
        ]
      },
      {
        '@type': 'HowTo',
        '@id': 'https://shrinkly-livid.vercel.app/#howto',
        'name': 'How to Compress Images to a Target File Size Online',
        'description': 'Follow these simple steps to reduce any JPG, PNG, WebP, or GIF image to your desired file size without installing software.',
        'totalTime': 'PT10S',
        'step': [
          {
            '@type': 'HowToStep',
            'position': 1,
            'name': 'Select or Drop Images',
            'text': 'Drag and drop your JPG, PNG, WebP, or GIF images into the dropzone or paste from your clipboard.'
          },
          {
            '@type': 'HowToStep',
            'position': 2,
            'name': 'Select Target File Size',
            'text': 'Choose a preset like 20KB, 50KB, 100KB, 200KB, 500KB or enter a custom target size in KB or MB.'
          },
          {
            '@type': 'HowToStep',
            'position': 3,
            'name': 'Compress Instantly',
            'text': 'Click "Compress image" to run adaptive binary search optimization locally in your browser.'
          },
          {
            '@type': 'HowToStep',
            'position': 4,
            'name': 'Download Output',
            'text': 'Inspect the compressed preview, compare file sizes, and download your optimized image or bulk ZIP archive.'
          }
        ]
      }
    ]
  };

  useSeo({
    title: 'Shrinkly — Compress Images to a Target File Size Online (Free & Private)',
    description:
      'Compress JPG, PNG, WebP, and animated GIF images to exact target file sizes (20KB, 50KB, 100KB, 200KB, 500KB) online. 100% client-side privacy, instant download.',
    canonicalPath: '/',
    keywords:
      'image compressor, compress image to 20kb, compress image to 50kb, compress image to 100kb, compress image to 200kb, compress image to 500kb, reduce photo size in kb, passport photo compressor, visa image size reducer, client-side image compression, webp converter, gif optimizer',
    schema,
  });

  return (
    <div className="max-w-[850px] mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12">
      {/* Title / Main Headings */}
      <section className="text-center space-y-2.5 sm:space-y-4">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          Compress images to the size you need.
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-[580px] mx-auto px-1 sm:px-0 leading-relaxed">
          Compress JPG, PNG, WebP, and animated GIF images to strict target limits (20KB, 50KB, 100KB, etc.) or batch compress multiple files into a single ZIP archive.
        </p>
      </section>

      {/* Compressor Tool */}
      <section aria-label="Image Compression Tool">
        <Compressor defaultPreset="auto" />
      </section>

      {/* Feature Highlights Banner */}
      <section aria-label="Key Features" className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/50 dark:bg-neutral-900/50 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Private</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            All images are processed locally in your browser. Your files never get uploaded to any third-party server.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/50 dark:bg-neutral-900/50 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 font-semibold text-sm">
            <Zap className="w-4 h-4" />
            <span>Target Size Precision</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Adaptive multi-pass optimization dials in exact file size limits for job portals, visa applications, and web publishing.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/50 dark:bg-neutral-900/50 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 font-semibold text-sm">
            <Layers className="w-4 h-4" />
            <span>Batch & Animated GIF</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Compress up to 10 photos simultaneously or optimize animated GIFs with frame-aware palette quantization.
          </p>
        </div>
      </section>

      {/* SEO Copy & Educational Content */}
      <hr className="border-neutral-200 dark:border-neutral-800" />

      <article className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-neutral-700 dark:text-neutral-350">
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
            Why choose target-size compression?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Unlike generic tools that only offer vague percentage sliders (e.g. 50% or 70%), Shrinkly lets you specify the exact file size you need. This is essential when submitting documents to government portals, visa platforms, academic portals, and job applications that strictly reject images over 20KB, 50KB, or 100KB.
          </p>

          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            How Shrinkly compresses images
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Shrinkly runs an adaptive binary search algorithm across quality, dimensions, and palette depth. By decoding and processing pixels directly in HTML5 Canvas and memory, it achieves the best possible visual clarity while strictly respecting your target file size ceiling.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Supported image formats
          </h2>
          <ul className="space-y-2 text-neutral-600 dark:text-neutral-400 leading-relaxed list-none pl-0">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
              <span><strong>JPEG / JPG:</strong> Ideal for photography and complex gradients with high compression ratio.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
              <span><strong>PNG:</strong> Preserves transparency and sharp lines with smart dimensional downsampling.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
              <span><strong>WebP:</strong> Next-generation web format combining compact size and crystal-clear quality.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
              <span><strong>GIF:</strong> Full support for multi-frame animated GIFs using color quantization.</span>
            </li>
          </ul>

          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Popular target size shortcuts
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs">
            Directly open pre-configured compression tools for your specific requirement:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1 text-xs">
            <Link
              href="/compress-image-to-20kb"
              className="py-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-400 underline decoration-emerald-500/20 hover:decoration-emerald-500 transition-colors inline-block"
            >
              Compress image to 20KB
            </Link>
            <Link
              href="/compress-image-to-50kb"
              className="py-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-400 underline decoration-emerald-500/20 hover:decoration-emerald-500 transition-colors inline-block"
            >
              Compress image to 50KB
            </Link>
            <Link
              href="/compress-image-to-100kb"
              className="py-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-400 underline decoration-emerald-500/20 hover:decoration-emerald-500 transition-colors inline-block"
            >
              Compress image to 100KB
            </Link>
            <Link
              href="/compress-image-to-200kb"
              className="py-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-400 underline decoration-emerald-500/20 hover:decoration-emerald-500 transition-colors inline-block"
            >
              Compress image to 200KB
            </Link>
            <Link
              href="/compress-image-to-500kb"
              className="py-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-400 underline decoration-emerald-500/20 hover:decoration-emerald-500 transition-colors inline-block"
            >
              Compress image to 500KB
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}

export default Home;

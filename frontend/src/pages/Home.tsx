import { useSeo } from '../hooks/useSeo';
import { Compressor } from '../components/Compressor';
import { Link } from '../components/Router';

export function Home() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Shrinkly — Online Image Compressor',
    'description': 'Compress JPG, PNG, and WebP images to a target file size (20KB, 50KB, 100KB, etc.) online. Fast, secure, and client-side.',
    'url': 'https://shrinkly.vercel.app',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires HTML5 Canvas and modern browser support.',
  };

  useSeo({
    title: 'Shrinkly — Compress Images to a Target File Size Online',
    description:
      'Compress JPG, PNG, and WebP images to a specific target file size (e.g. 20KB, 50KB, 100KB) online. Secure client-side processing, instant download.',
    canonicalPath: '/',
    schema,
  });

  return (
    <div className="max-w-[850px] mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-12">
      {/* Title / Main Headings */}
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          Compress images to the size you need.
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-[540px] mx-auto">
          Compress JPG, PNG, and WebP images to a target file size. No installation required.
        </p>
      </div>

      {/* Compressor Tool */}
      <Compressor defaultPreset={100} />

      {/* SEO copy & internal links */}
      <hr className="border-neutral-200 dark:border-neutral-800" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-neutral-700 dark:text-neutral-350">
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
            What is Shrinkly?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Shrinkly is a high-performance image compressor utility designed to help you reduce image size to a specific target file size (like 100KB, 50KB, or 20KB) online. It provides an instant, secure way to compress JPG, PNG, and WebP photos directly in your web browser.
          </p>

          <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
            How image compression works
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            When you select an image, Shrinkly analyzes its dimensions and format. It draws the image onto an HTML5 canvas and uses a binary search algorithm to adjust exports to the best quality factor. This ensures your compressed image is close to or under your target size with minimal loss in visual quality.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
            JPG vs PNG vs WebP formats
          </h2>
          <ul className="space-y-2 text-neutral-600 dark:text-neutral-400 leading-relaxed list-disc list-inside">
            <li>
              <strong>JPEG / JPG:</strong> Best for photos and complex gradients. Great compression potential.
            </li>
            <li>
              <strong>PNG:</strong> Lossless format with transparency. Often heavy; transparency is converted to JPEG when targeting strict file sizes.
            </li>
            <li>
              <strong>WebP:</strong> Modern web format providing superior compression quality and transparency features in small bundles.
            </li>
          </ul>

          <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
            Compress to other sizes
          </h2>
          <p className="text-neutral-605 dark:text-neutral-450 text-xs">
            Need to compress your image to a specific limit? Use our dedicated target size tools:
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1 text-xs">
            <Link
              href="/compress-image-to-20kb"
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-400 underline decoration-emerald-500/20 hover:decoration-emerald-500 transition-colors"
            >
              Compress image to 20KB
            </Link>
            <Link
              href="/compress-image-to-50kb"
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-400 underline decoration-emerald-500/20 hover:decoration-emerald-500 transition-colors"
            >
              Compress image to 50KB
            </Link>
            <Link
              href="/compress-image-to-100kb"
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-400 underline decoration-emerald-500/20 hover:decoration-emerald-500 transition-colors"
            >
              Compress image to 100KB
            </Link>
            <Link
              href="/compress-image-to-200kb"
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-400 underline decoration-emerald-500/20 hover:decoration-emerald-500 transition-colors"
            >
              Compress image to 200KB
            </Link>
            <Link
              href="/compress-image-to-500kb"
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-400 underline decoration-emerald-500/20 hover:decoration-emerald-500 transition-colors"
            >
              Compress image to 500KB
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

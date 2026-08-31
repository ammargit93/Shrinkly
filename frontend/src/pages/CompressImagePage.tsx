import { useSeo } from '../hooks/useSeo';
import { Compressor } from '../components/Compressor';
import { Link } from '../components/Router';

interface CompressImagePageProps {
  targetSizeKb: 20 | 50 | 100 | 200 | 500;
}

export function CompressImagePage({ targetSizeKb }: CompressImagePageProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `https://shrinkly.vercel.app/compress-image-to-${targetSizeKb}kb#webapp`,
        'name': `Shrinkly — Compress Image to ${targetSizeKb}KB`,
        'description': `Compress images under ${targetSizeKb}KB online. Secure and fast client-side image compressor utility for JPEG, PNG, and WebP.`,
        'url': `https://shrinkly.vercel.app/compress-image-to-${targetSizeKb}kb`,
        'applicationCategory': 'MultimediaApplication',
        'operatingSystem': 'All',
      },
      {
        '@type': 'FAQPage',
        '@id': `https://shrinkly.vercel.app/compress-image-to-${targetSizeKb}kb#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': `How do I compress an image to ${targetSizeKb}KB?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `Upload your JPG, PNG, or WebP file to Shrinkly, select the ${targetSizeKb}KB preset, and run the compressor. It optimizes the dimensions and quality client-side so you can download the result instantly.`,
            },
          },
          {
            '@type': 'Question',
            'name': `Will the compressed file be exactly ${targetSizeKb}KB?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `Shrinkly aims to compress the file to be as close to, but under ${targetSizeKb}KB. This guarantees it fits within upload requirements of job portals, visa applications, and forms.`,
            },
          },
        ],
      },
    ],
  };

  useSeo({
    title: `Compress Image to ${targetSizeKb}KB Online — JPG, PNG, WebP Optimizer`,
    description: `Reduce image size to ${targetSizeKb}KB or less. Secure, fast, and free client-side image compressor utility. Optimize JPG, PNG, and WebP formats instantly.`,
    canonicalPath: `/compress-image-to-${targetSizeKb}kb`,
    schema,
  });

  const allSizes = [20, 50, 100, 200, 500];
  const siblingSizes = allSizes.filter((size) => size !== targetSizeKb);

  return (
    <div className="max-w-[850px] mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-12">
      {/* Title */}
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          Compress image to {targetSizeKb}KB
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-[540px] mx-auto">
          Reduce JPEG, PNG, or WebP images to {targetSizeKb}KB or less without installing software.
        </p>
      </div>

      {/* Compressor Tool */}
      <Compressor defaultPreset={targetSizeKb} />

      {/* SEO copy & dynamic internal linking */}
      <hr className="border-neutral-200 dark:border-neutral-800" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-neutral-700 dark:text-neutral-350">
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
            How to compress an image to {targetSizeKb}KB
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <li>Select or drag and drop your photo into the compressor area.</li>
            <li>Make sure the {targetSizeKb}KB preset is highlighted.</li>
            <li>Click the "Compress image" button.</li>
            <li>Review the size reduction and download your compressed file.</li>
          </ol>

          <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
            Why compress files to under {targetSizeKb}KB?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Many government portals, visa application platforms, online job applications, and email clients impose strict upload restrictions (frequently limiting passport photos, signatures, or receipt images to {targetSizeKb}KB or less). Shrinkly ensures your file fits these limits without forcing you to buy premium subscriptions.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
            How compression affects image quality
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            To reach a specific target like {targetSizeKb}KB, lossy optimization algorithms are applied. Shrinkly runs multiple passes on quality parameters and scales image dimensions if necessary. This produces a file that fits your strict size guidelines while keeping the photo crisp and legible.
          </p>

          <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
            Other target sizes
          </h2>
          <p className="text-neutral-605 dark:text-neutral-450 text-xs">
            Looking for a different target file size? Select another size option:
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {siblingSizes.map((size) => (
              <Link
                key={size}
                href={`/compress-image-to-${size}kb`}
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-400 underline decoration-emerald-500/20 hover:decoration-emerald-500 transition-colors"
              >
                Compress image to {size}KB
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompressImagePage;

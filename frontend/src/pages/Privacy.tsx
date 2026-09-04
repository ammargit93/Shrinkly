import { useSeo } from '../hooks/useSeo';

export function Privacy() {
  useSeo({
    title: 'Privacy Policy — Shrinkly',
    description: 'Read the Shrinkly privacy policy. We prioritize your privacy with 100% client-side, local in-browser image compression and zero server-side storage.',
    canonicalPath: '/privacy',
  });

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-5 sm:space-y-6 text-neutral-800 dark:text-neutral-350">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        Privacy Policy
      </h1>
      
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        At Shrinkly, privacy is our top priority. We believe you shouldn't have to sacrifice your personal data or privacy to optimize your images.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
          Zero Server Retention
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          By default, all compression is performed 100% locally in your web browser. Your images never leave your computer. 
        </p>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          If a dedicated backend API server is configured, images are received purely to compress them in memory, and the results are immediately returned back to your browser. Your images are never stored, logged, or saved to any disk.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
          Local Storage & Cookies
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Shrinkly does not set tracking cookies or engage in third-party marketing trackers. We don't save your session details.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
          Open Source Utility
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Shrinkly is designed to be a high-performance utility that gets out of your way. If you have questions about this policy, please inspect the source code or host it locally.
        </p>
      </section>
    </div>
  );
}

export default Privacy;

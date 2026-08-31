import { useSeo } from '../hooks/useSeo';

export function Terms() {
  useSeo({
    title: 'Terms of Service — Shrinkly',
    description: 'Read the Shrinkly Terms of Service. Simple, clear guidelines for using our free, fast, client-side online image compression utility.',
    canonicalPath: '/terms',
  });

  return (
    <div className="max-w-[700px] mx-auto px-4 py-8 sm:py-12 space-y-6 text-neutral-800 dark:text-neutral-350">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        Terms of Service
      </h1>

      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        Welcome to Shrinkly. By accessing and using our web utility, you agree to these simple terms.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
          1. Usage License
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Shrinkly is provided free of charge for personal and commercial use. You may use this tool as much as needed to optimize your files.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
          2. No Warranties
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          This software is provided "as is", without warranty of any kind, express or implied. In no event shall the authors be liable for any claim, damages, or other liability arising from the use of this software.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
          3. Fair Use
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          You agree not to abuse the backend compression API with high-frequency automated scraping scripts. If you require bulk automated batch processing, please clone the project and host the API server on your own infrastructure.
        </p>
      </section>
    </div>
  );
}

export default Terms;

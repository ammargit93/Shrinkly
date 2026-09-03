import { useSeo } from '../hooks/useSeo';

export function About() {
  useSeo({
    title: 'About Shrinkly — Lightweight Online Image Compressor',
    description: 'Learn about Shrinkly, our minimalist philosophy, and how we build fast, privacy-first client-side image compression tools.',
    canonicalPath: '/about',
  });

  return (
    <div className="max-w-[700px] mx-auto px-4 py-8 sm:py-12 space-y-6 text-neutral-800 dark:text-neutral-350">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        About Shrinkly
      </h1>

      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        Shrinkly was born out of frustration with modern web utilities. Many online image compressors are filled with heavy ad networks, pop-up overlays, confusing layouts, and complex multi-step subscription flows.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
          Our Philosophy
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          We believe web utilities should do one thing, do it exceptionally fast, and get out of your way. No newsletters, no pricing structures, and no registration forms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-850 dark:text-neutral-200">
          How it Works
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Shrinkly leverages client-side HTML5 canvas rendering, adaptive binary search algorithms, and frame-aware palette quantization to compress JPG, PNG, WebP, and animated GIF files directly on your local device. This ensures zero network latency, immediate feedback, and complete privacy.
        </p>
      </section>
    </div>
  );
}

export default About;

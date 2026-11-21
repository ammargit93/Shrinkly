import { Link } from './Router';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 mt-auto py-6 sm:py-8 px-4 sm:px-6 pb-safe">
      <div className="max-w-[850px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 dark:text-neutral-500">
        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-1">
          <Link href="/about" className="py-1 px-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            About
          </Link>
          <Link href="/faq" className="py-1 px-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            FAQ
          </Link>
          <Link href="/privacy" className="py-1 px-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="py-1 px-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            Terms
          </Link>
        </nav>
        <p className="text-center sm:text-right">
          © {new Date().getFullYear()} Shrinkly. 100% Client-Side Image Optimizer.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

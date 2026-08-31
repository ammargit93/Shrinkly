import { Link } from './Router';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 mt-auto py-8 px-4 sm:px-6">
      <div className="max-w-[850px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 dark:text-neutral-500">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/about" className="hover:text-neutral-750 dark:hover:text-neutral-350 transition-colors">
            About
          </Link>
          <Link href="/faq" className="hover:text-neutral-750 dark:hover:text-neutral-350 transition-colors">
            FAQ
          </Link>
          <Link href="/privacy" className="hover:text-neutral-750 dark:hover:text-neutral-350 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-neutral-750 dark:hover:text-neutral-350 transition-colors">
            Terms
          </Link>
        </div>
        <p className="text-center sm:text-right">
          © {new Date().getFullYear()} Shrinkly. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
export default Footer;

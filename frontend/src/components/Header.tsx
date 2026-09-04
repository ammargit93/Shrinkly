import { Link } from './Router';

export function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xs py-3 sm:py-4 px-4 sm:px-6 sticky top-0 z-20">
      <div className="max-w-[850px] mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight hover:opacity-85 transition-opacity"
        >
          <img
            src="/logo.png"
            alt="Shrinkly Logo"
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-contain"
          />
          <span>Shrinkly</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/faq"
            className="py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-900/80 rounded-lg transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/privacy"
            className="py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-900/80 rounded-lg transition-colors"
          >
            Privacy
          </Link>
        </nav>
      </div>
    </header>
  );
}
export default Header;

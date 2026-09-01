import { Link } from './Router';

export function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-4 px-4 sm:px-6">
      <div className="max-w-[850px] mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight hover:opacity-85 transition-opacity"
        >
          <img
            src="/logo.png"
            alt="Shrinkly Logo"
            className="h-15 w-15 rounded-md object-contain"
          />
          <span>Shrinkly</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/faq"
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          >
            Privacy
          </Link>
        </nav>
      </div>
    </header>
  );
}
export default Header;

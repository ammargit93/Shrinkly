import { Link } from './Router';

const HEADER_CONFIG = {
  headerPadding: 'py-3 sm:py-3.5 px-4 sm:px-6',
  logoSize: 'h-9 w-9 sm:h-10 sm:w-10',
  logoSizePx: 42,
  brandTextSize: 'text-lg sm:text-xl font-bold tracking-tight',
  brandGap: 'gap-2 sm:gap-2.5',
  navLinkClasses: 'py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm font-medium',
  navGap: 'gap-1 sm:gap-2',
} as const;

export function Header() {
  return (
    <header
      className={`border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xs sticky top-0 z-20 ${HEADER_CONFIG.headerPadding}`}
    >
      <div className="max-w-[850px] mx-auto flex items-center justify-between">
        <Link
          href="/"
          className={`flex items-center text-neutral-900 dark:text-neutral-50 hover:opacity-85 transition-opacity ${HEADER_CONFIG.brandGap} ${HEADER_CONFIG.brandTextSize}`}
          aria-label="Shrinkly Homepage"
        >
          <img
            src="/logo.png"
            alt="Shrinkly Logo"
            width={HEADER_CONFIG.logoSizePx}
            height={HEADER_CONFIG.logoSizePx}
            className={`rounded-lg object-contain shrink-0 ${HEADER_CONFIG.logoSize}`}
          />
          <span>Shrinkly</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className={`flex items-center ${HEADER_CONFIG.navGap}`}
        >
          <Link
            href="/faq"
            className={`text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-900/80 rounded-lg transition-colors ${HEADER_CONFIG.navLinkClasses}`}
          >
            FAQ
          </Link>
          <Link
            href="/privacy"
            className={`text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-900/80 rounded-lg transition-colors ${HEADER_CONFIG.navLinkClasses}`}
          >
            Privacy
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;

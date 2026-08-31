import { RouterProvider, useRouter, Link } from './components/Router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { CompressImagePage } from './pages/CompressImagePage';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { About } from './pages/About';
import { FAQ } from './pages/FAQ';

function RouteDispatcher() {
  const { path } = useRouter();

  switch (path) {
    case '/':
      return <Home />;
    case '/compress-image-to-20kb':
      return <CompressImagePage targetSizeKb={20} />;
    case '/compress-image-to-50kb':
      return <CompressImagePage targetSizeKb={50} />;
    case '/compress-image-to-100kb':
      return <CompressImagePage targetSizeKb={100} />;
    case '/compress-image-to-200kb':
      return <CompressImagePage targetSizeKb={200} />;
    case '/compress-image-to-500kb':
      return <CompressImagePage targetSizeKb={500} />;
    case '/privacy':
      return <Privacy />;
    case '/terms':
      return <Terms />;
    case '/about':
      return <About />;
    case '/faq':
      return <FAQ />;
    default:
      return (
        <div className="max-w-[500px] mx-auto text-center py-16 px-4 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Page not found
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            The link might be broken or the page was moved.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      );
  }
}

export function App() {
  return (
    <RouterProvider>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-250">
        <Header />
        <main className="flex-grow w-full">
          <RouteDispatcher />
        </main>
        <Footer />
      </div>
    </RouterProvider>
  );
}

export default App;

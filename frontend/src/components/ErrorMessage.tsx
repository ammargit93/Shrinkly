import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="border border-red-200 dark:border-red-950 bg-red-50/50 dark:bg-red-950/10 rounded-md p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-650 dark:text-red-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-400">
            {message}
          </p>
        </div>
      </div>
      <div className="pl-8">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline underline-offset-4 decoration-1 decoration-red-400/40 hover:decoration-red-500/80 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Try again
        </button>
      </div>
    </div>
  );
}

export default ErrorMessage;

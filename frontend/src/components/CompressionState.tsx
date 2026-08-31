import { Loader2 } from 'lucide-react';

export function CompressionState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-md">
      <div className="flex items-center gap-3 text-sm font-medium text-neutral-850 dark:text-neutral-200">
        <Loader2 className="h-4.5 w-4.5 animate-spin text-emerald-600 dark:text-emerald-500" />
        <span>Compressing…</span>
      </div>
    </div>
  );
}

export default CompressionState;

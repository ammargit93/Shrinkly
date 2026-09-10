import { useState, useEffect, useCallback } from 'react';
import {
  formatLogsAsPlainText,
  downloadLogFile,
  clearLogs,
  getUsageStats,
  getLogEntries,
  type UsageStats,
} from '../services/usageLogger';
import { Link } from '../components/Router';
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ArrowLeft,
  Activity,
  FileText,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';

export function LogViewer() {
  const [logText, setLogText] = useState<string>(() => formatLogsAsPlainText());
  const [stats, setStats] = useState<UsageStats | null>(() => getUsageStats());
  const [entryCount, setEntryCount] = useState<number>(() => getLogEntries().length);
  const [copied, setCopied] = useState<boolean>(false);
  const [clearedNotice, setClearedNotice] = useState<boolean>(false);

  const refreshLogs = useCallback(() => {
    setLogText(formatLogsAsPlainText());
    setStats(getUsageStats());
    setEntryCount(getLogEntries().length);
  }, []);

  useEffect(() => {
    document.title = 'Shrinkly — Usage Log (log.txt)';
  }, []);


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all recorded activity logs? This cannot be undone.')) {
      clearLogs();
      refreshLogs();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const totalCompressions = (stats?.totalSingleCompressions || 0) + (stats?.totalBatchCompressions || 0);
  const totalDownloads = (stats?.totalSingleDownloads || 0) + (stats?.totalBatchDownloads || 0);
  const bytesSaved = Math.max(0, (stats?.totalOriginalBytes || 0) - (stats?.totalCompressedBytes || 0));

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 mb-1.5">
            <Activity className="h-3.5 w-3.5" />
            <span>Real-time Usage Tracker</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span>Usage & Activity Log</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              /log.txt
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Tracks client-side tool executions, compressions, downloads, and data savings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Tool</span>
          </Link>
        </div>
      </div>

      {/* Metrics Highlights Card Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center shadow-xs">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Tool Compressions
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {totalCompressions}
            </div>
            <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
              {stats.totalSingleCompressions} single · {stats.totalBatchCompressions} batch
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center shadow-xs">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Total Downloads
            </div>
            <div className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {totalDownloads}
            </div>
            <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
              {stats.totalSingleDownloads} files · {stats.totalBatchDownloads} ZIPs
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center shadow-xs">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Storage Saved
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatBytes(bytesSaved)}
            </div>
            <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
              from {formatBytes(stats.totalOriginalBytes)} processed
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center shadow-xs">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Page Visits
            </div>
            <div className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {stats.totalVisits}
            </div>
            <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
              {entryCount} total logged events
            </div>
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-neutral-100 dark:bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadLogFile}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Download full log.txt file"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download log.txt</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Copy log contents to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={refreshLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Reload latest logs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {clearedNotice && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Logs cleared
            </span>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-white dark:bg-neutral-800 border border-red-200 dark:border-red-950 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Clear all stored logs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Terminal / Plain Text Pre View */}
      <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-semibold text-neutral-300">shrinkly_log.txt</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <HardDrive className="h-3 w-3" />
            <span>LocalStorage</span>
          </div>
        </div>

        <pre
          tabIndex={0}
          className="p-4 sm:p-6 text-xs sm:text-[13px] font-mono leading-relaxed whitespace-pre overflow-x-auto max-h-[600px] overflow-y-auto text-emerald-300/90 selection:bg-emerald-900 selection:text-white"
        >
          {logText}
        </pre>
      </div>
    </div>
  );
}

export default LogViewer;

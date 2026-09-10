export type UsageEventType =
  | 'single_compress'
  | 'single_download'
  | 'single_copy'
  | 'batch_compress'
  | 'batch_download'
  | 'batch_item_save'
  | 'page_visit';

export interface UsageLogEntry {
  id: string;
  timestamp: string; // ISO 8601
  formattedTime: string; // UTC human-readable
  type: UsageEventType;
  summary: string;
  details?: Record<string, string | number | boolean | null | undefined>;
}

export interface UsageStats {
  totalVisits: number;
  totalSingleCompressions: number;
  totalBatchCompressions: number;
  totalSingleDownloads: number;
  totalBatchDownloads: number;
  totalCopies: number;
  totalOriginalBytes: number;
  totalCompressedBytes: number;
  firstActivity: string | null;
  lastActivity: string | null;
}

const STORAGE_KEYS = {
  LOGS: 'shrinkly_usage_log_entries',
  STATS: 'shrinkly_usage_stats',
};

const MAX_STORED_LOGS = 500;

function formatBytes(bytes: number): string {
  if (bytes <= 0 || isNaN(bytes)) return '0 B';
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function getInitialStats(): UsageStats {
  return {
    totalVisits: 0,
    totalSingleCompressions: 0,
    totalBatchCompressions: 0,
    totalSingleDownloads: 0,
    totalBatchDownloads: 0,
    totalCopies: 0,
    totalOriginalBytes: 0,
    totalCompressedBytes: 0,
    firstActivity: null,
    lastActivity: null,
  };
}

/**
 * Retrieves all stored usage logs from localStorage.
 */
export function getLogEntries(): UsageLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) return [];
    return JSON.parse(raw) as UsageLogEntry[];
  } catch (err) {
    console.warn('Failed to parse Shrinkly usage logs:', err);
    return [];
  }
}

/**
 * Retrieves aggregate usage statistics.
 */
export function getUsageStats(): UsageStats {
  if (typeof window === 'undefined') return getInitialStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return getInitialStats();
    return { ...getInitialStats(), ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to parse Shrinkly usage stats:', err);
    return getInitialStats();
  }
}

/**
 * Logs a tool usage event into localStorage and updates aggregate metrics.
 */
export function logUsageEvent(
  type: UsageEventType,
  details: Record<string, string | number | boolean | null | undefined> = {}
): void {
  if (typeof window === 'undefined') return;

  try {
    const now = new Date();
    const isoTime = now.toISOString();
    const formattedUtc = now.toUTCString();

    let summary = '';
    const stats = getUsageStats();

    if (!stats.firstActivity) {
      stats.firstActivity = isoTime;
    }
    stats.lastActivity = isoTime;

    switch (type) {
      case 'single_compress': {
        stats.totalSingleCompressions += 1;
        const origSize = Number(details.originalSize) || 0;
        const compSize = Number(details.compressedSize) || 0;
        stats.totalOriginalBytes += origSize;
        stats.totalCompressedBytes += compSize;

        const format = String(details.format || 'IMAGE').toUpperCase();
        const savedPercent = details.percentageReduction ?? Math.max(0, Math.round(((origSize - compSize) / (origSize || 1)) * 100));
        const target = details.targetSizeKb === 'auto' ? 'Auto' : `${details.targetSizeKb} KB`;
        const dur = details.durationMs ? ` (${details.durationMs}ms)` : '';

        summary = `[TOOL_USED: SINGLE_COMPRESS] Format: ${format} | ${formatBytes(origSize)} -> ${formatBytes(compSize)} (${savedPercent}% saved) | Target: ${target}${dur}`;
        break;
      }

      case 'single_download': {
        stats.totalSingleDownloads += 1;
        const compSize = Number(details.compressedSize) || 0;
        const format = String(details.format || 'IMAGE').toUpperCase();
        summary = `[TOOL_USED: SINGLE_DOWNLOAD] Format: ${format} | Size: ${formatBytes(compSize)}`;
        break;
      }

      case 'single_copy': {
        stats.totalCopies += 1;
        const format = String(details.format || 'IMAGE').toUpperCase();
        summary = `[TOOL_USED: SINGLE_COPY] Copied ${format} image to clipboard`;
        break;
      }

      case 'batch_compress': {
        stats.totalBatchCompressions += 1;
        const count = Number(details.fileCount) || 0;
        const origSize = Number(details.originalTotalSize) || 0;
        const compSize = Number(details.compressedSize) || 0;
        stats.totalOriginalBytes += origSize;
        stats.totalCompressedBytes += compSize;

        const savedPercent = details.percentageReduction ?? Math.max(0, Math.round(((origSize - compSize) / (origSize || 1)) * 100));
        const target = details.targetSizeKb === 'auto' ? 'Auto' : `${details.targetSizeKb} KB`;
        const dur = details.durationMs ? ` (${details.durationMs}ms)` : '';

        summary = `[TOOL_USED: BATCH_COMPRESS] ${count} images | Total: ${formatBytes(origSize)} -> ${formatBytes(compSize)} ZIP (${savedPercent}% saved) | Target: ${target}${dur}`;
        break;
      }

      case 'batch_download': {
        stats.totalBatchDownloads += 1;
        const count = Number(details.fileCount) || 0;
        const compSize = Number(details.compressedSize) || 0;
        summary = `[TOOL_USED: BATCH_DOWNLOAD] Downloaded ZIP archive (${count} files, ${formatBytes(compSize)})`;
        break;
      }

      case 'batch_item_save': {
        stats.totalSingleDownloads += 1;
        const name = String(details.name || 'file');
        const compSize = Number(details.compressedSize) || 0;
        summary = `[TOOL_USED: BATCH_ITEM_SAVE] Saved single item "${name}" (${formatBytes(compSize)})`;
        break;
      }

      case 'page_visit': {
        stats.totalVisits += 1;
        const path = String(details.path || window.location.pathname);
        summary = `[PAGE_VISIT] Path: ${path}`;
        break;
      }

      default:
        summary = `[EVENT: ${type}] ${JSON.stringify(details)}`;
    }

    const newEntry: UsageLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: isoTime,
      formattedTime: formattedUtc,
      type,
      summary,
      details: {
        ...details,
        path: details.path || window.location.pathname,
        userAgent: navigator.userAgent,
      },
    };

    // Update log list with limit
    const existingLogs = getLogEntries();
    const updatedLogs = [newEntry, ...existingLogs].slice(0, MAX_STORED_LOGS);

    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to record Shrinkly usage event:', err);
  }
}

/**
 * Formats all recorded usage logs into a clean, human-readable text document
 * that can be displayed on /log.txt or downloaded as a .txt file.
 */
export function formatLogsAsPlainText(): string {
  const stats = getUsageStats();
  const entries = getLogEntries();

  const totalCompressions = stats.totalSingleCompressions + stats.totalBatchCompressions;
  const totalDownloads = stats.totalSingleDownloads + stats.totalBatchDownloads;
  const bytesSaved = Math.max(0, stats.totalOriginalBytes - stats.totalCompressedBytes);
  const totalSavingsPct =
    stats.totalOriginalBytes > 0
      ? Math.round((bytesSaved / stats.totalOriginalBytes) * 100)
      : 0;

  const now = new Date().toUTCString();

  const lines: string[] = [
    '================================================================================',
    '                   SHRINKLY USAGE & ACTIVITY LOG (log.txt)                      ',
    '================================================================================',
    `Report Generated: ${now}`,
    `First Activity:   ${stats.firstActivity ? new Date(stats.firstActivity).toUTCString() : 'None'}`,
    `Last Activity:    ${stats.lastActivity ? new Date(stats.lastActivity).toUTCString() : 'None'}`,
    '',
    '--------------------------------------------------------------------------------',
    '                           AGGREGATE USAGE SUMMARY                              ',
    '--------------------------------------------------------------------------------',
    `  • Total Page Visits:               ${stats.totalVisits}`,
    `  • Total Compressions Performed:    ${totalCompressions} (${stats.totalSingleCompressions} single, ${stats.totalBatchCompressions} batch)`,
    `  • Total Downloads Completed:       ${totalDownloads} (${stats.totalSingleDownloads} single, ${stats.totalBatchDownloads} batch ZIPs)`,
    `  • Total Copies to Clipboard:       ${stats.totalCopies}`,
    `  • Total Original Data Processed:   ${formatBytes(stats.totalOriginalBytes)}`,
    `  • Total Compressed Output Size:    ${formatBytes(stats.totalCompressedBytes)}`,
    `  • Total Bandwidth/Storage Saved:   ${formatBytes(bytesSaved)} (${totalSavingsPct}% reduction)`,
    `  • Total Logged Events in History:  ${entries.length}`,
    '--------------------------------------------------------------------------------',
    '',
    '================================================================================',
    '                             CHRONOLOGICAL LOG ENTRIES                          ',
    '================================================================================',
  ];

  if (entries.length === 0) {
    lines.push('');
    lines.push('  [No activity recorded yet]');
    lines.push('  Compress or download an image in Shrinkly to see real-time log entries here.');
    lines.push('');
  } else {
    for (const entry of entries) {
      lines.push(`[${entry.formattedTime}]`);
      lines.push(`  ${entry.summary}`);
      if (entry.details?.path) {
        lines.push(`  Route: ${entry.details.path}`);
      }
      lines.push('--------------------------------------------------------------------------------');
    }
  }

  lines.push('================================================================================');
  lines.push('                              END OF LOG FILE                                   ');
  lines.push('================================================================================');

  return lines.join('\n');
}

/**
 * Downloads the current usage log as a "log.txt" text file directly in the browser.
 */
export function downloadLogFile(): void {
  const content = formatLogsAsPlainText();
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shrinkly_log_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Clears all recorded logs and resets stats.
 */
export function clearLogs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.LOGS);
  localStorage.removeItem(STORAGE_KEYS.STATS);
}

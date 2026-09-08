import type { TargetSizePreset } from '../types/compression';
import { Sparkles } from 'lucide-react';

interface TargetSizeProps {
  preset: TargetSizePreset;
  customSize: number;
  customUnit: 'KB' | 'MB';
  currentSizeBytes?: number;
  onPresetChange: (preset: TargetSizePreset) => void;
  onCustomSizeChange: (size: number) => void;
  onCustomUnitChange: (unit: 'KB' | 'MB') => void;
}

export function TargetSize({
  preset,
  customSize,
  customUnit,
  currentSizeBytes,
  onPresetChange,
  onCustomSizeChange,
  onCustomUnitChange,
}: TargetSizeProps) {
  const presets: { label: string; value: TargetSizePreset }[] = [
    { label: 'Auto', value: 'auto' },
    { label: '20 KB', value: 20 },
    { label: '50 KB', value: 50 },
    { label: '100 KB', value: 100 },
    { label: '200 KB', value: 200 },
    { label: '500 KB', value: 500 },
    { label: '1 MB', value: 1000 },
    { label: 'Custom', value: 'custom' },
  ];

  // Calculate target bytes for reduction hint
  let reductionPercentage = 0;
  if (preset === 'custom') {
    const targetBytes = (customUnit === 'MB' ? customSize * 1024 : customSize) * 1024;
    if (currentSizeBytes && currentSizeBytes > targetBytes) {
      reductionPercentage = Math.round(((currentSizeBytes - targetBytes) / currentSizeBytes) * 100);
    }
  } else if (preset !== 'auto') {
    const targetBytes = preset * 1024;
    if (currentSizeBytes && currentSizeBytes > targetBytes) {
      reductionPercentage = Math.round(((currentSizeBytes - targetBytes) / currentSizeBytes) * 100);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Target File Size
        </label>
        {preset === 'auto' ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-650 dark:text-emerald-400">
            <Sparkles className="h-3 w-3 flex-shrink-0" />
            <span>Auto · Retains 100% quality</span>
          </span>
        ) : reductionPercentage > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-650 dark:text-emerald-400">
            <Sparkles className="h-3 w-3 flex-shrink-0" />
            <span>Targeting ~{reductionPercentage}% reduction</span>
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {presets.map((p) => {
          const isActive = preset === p.value;
          return (
            <button
              key={p.value.toString()}
              type="button"
              onClick={() => onPresetChange(p.value)}
              className={`py-2.5 px-2 text-xs sm:text-sm font-medium border rounded-lg transition-all duration-150 cursor-pointer active:scale-[0.98] text-center
                ${isActive
                  ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350 shadow-xs font-semibold'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }
              `}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {preset === 'custom' && (
        <div className="flex items-center gap-2 w-full sm:max-w-[280px] pt-1">
          <div className="relative flex-grow">
            <input
              type="number"
              min="1"
              value={customSize || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onCustomSizeChange(isNaN(val) ? 0 : val);
              }}
              placeholder="e.g. 150"
              aria-label="Custom target size"
              className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-neutral-300 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <select
            value={customUnit}
            onChange={(e) => onCustomUnitChange(e.target.value as 'KB' | 'MB')}
            aria-label="Custom target unit"
            className="px-3.5 py-2.5 sm:py-2 text-base sm:text-sm font-medium border border-neutral-300 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
          >
            <option value="KB">KB</option>
            <option value="MB">MB</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default TargetSize;


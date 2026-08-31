import type { TargetSizePreset } from '../types/compression';

interface TargetSizeProps {
  preset: TargetSizePreset;
  customSize: number;
  customUnit: 'KB' | 'MB';
  onPresetChange: (preset: TargetSizePreset) => void;
  onCustomSizeChange: (size: number) => void;
  onCustomUnitChange: (unit: 'KB' | 'MB') => void;
}

export function TargetSize({
  preset,
  customSize,
  customUnit,
  onPresetChange,
  onCustomSizeChange,
  onCustomUnitChange,
}: TargetSizeProps) {
  const presets: { label: string; value: TargetSizePreset }[] = [
    { label: '20 KB', value: 20 },
    { label: '50 KB', value: 50 },
    { label: '100 KB', value: 100 },
    { label: '200 KB', value: 200 },
    { label: '500 KB', value: 500 },
    { label: 'Custom', value: 'custom' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider mb-2">
          Target Size
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {presets.map((p) => {
            const isActive = preset === p.value;
            return (
              <button
                key={p.value.toString()}
                type="button"
                onClick={() => onPresetChange(p.value)}
                className={`py-2.5 px-3 text-sm font-medium border rounded transition-all duration-150 cursor-pointer
                  ${
                    isActive
                      ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-350'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }
                `}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {preset === 'custom' && (
        <div className="flex items-center gap-2 max-w-[280px]">
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
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-850 rounded bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <select
            value={customUnit}
            onChange={(e) => onCustomUnitChange(e.target.value as 'KB' | 'MB')}
            aria-label="Custom target unit"
            className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-850 rounded bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
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

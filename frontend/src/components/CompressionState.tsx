import { Loader2, Layers, Palette, Sliders, CheckCircle2 } from 'lucide-react';
import type { CompressionStage } from '../types/compression';

interface CompressionStateProps {
  stage?: CompressionStage;
}

export function CompressionState({ stage = 'preparing' }: CompressionStateProps) {
  const getStageInfo = (currentStage: CompressionStage) => {
    switch (currentStage) {
      case 'decoding':
        return {
          icon: <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-450 animate-pulse" />,
          title: 'Deconstructing frames & structure…',
          subtitle: 'Reading pixel buffers and animation sequence',
          progress: '30%',
        };
      case 'quantizing':
        return {
          icon: <Palette className="h-5 w-5 text-emerald-600 dark:text-emerald-450 animate-pulse" />,
          title: 'Quantizing color palettes…',
          subtitle: 'Finding the optimal 256/128-color index map',
          progress: '60%',
        };
      case 'optimizing':
        return {
          icon: <Sliders className="h-5 w-5 text-emerald-600 dark:text-emerald-450 animate-pulse" />,
          title: 'Optimizing quality & dimensions…',
          subtitle: 'Running binary search passes to hit exact target size',
          progress: '85%',
        };
      case 'finalizing':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />,
          title: 'Finalizing compressed output…',
          subtitle: 'Wrapping clean binary blob',
          progress: '98%',
        };
      case 'preparing':
      default:
        return {
          icon: <Loader2 className="h-5 w-5 text-emerald-600 dark:text-emerald-450 animate-spin" />,
          title: 'Optimizing image to hit limit…',
          subtitle: 'Processing securely in your browser',
          progress: '15%',
        };
    }
  };

  const { icon, title, subtitle, progress } = getStageInfo(stage);

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl space-y-4 shadow-xs">
      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
        {icon}
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-sm font-semibold text-neutral-850 dark:text-neutral-100">
          {title}
        </h3>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          {subtitle}
        </p>
      </div>

      {/* Animated progress track */}
      <div className="w-full max-w-[240px] h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: progress }}
        />
      </div>
    </div>
  );
}

export default CompressionState;


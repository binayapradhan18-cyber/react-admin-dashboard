import { type Theme, useUiStore } from '@/shared/lib/uiStore';

export interface ChartTheme {
  series: [string, string, string, string, string];
  grid: string;
  axis: string;
}

/*
 * Mirrors the --chart-* tokens in tokens.css. SVG presentation attributes
 * can't reliably resolve CSS variables, and reading computed styles during
 * render races the theme attribute update, so the palette lives here too.
 */
const CHART_THEMES: Record<Theme, ChartTheme> = {
  light: {
    series: ['#4f46e5', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899'],
    grid: '#e8eaee',
    axis: '#8a93a3',
  },
  dark: {
    series: ['#818cf8', '#38bdf8', '#fbbf24', '#34d399', '#f472b6'],
    grid: '#262c36',
    axis: '#737d8c',
  },
};

export function useChartTheme(): ChartTheme {
  const theme = useUiStore((state) => state.theme);
  return CHART_THEMES[theme];
}

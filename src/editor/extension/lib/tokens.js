const REFERENCE_WIDTH = 1920;
const REFERENCE_HEIGHT = 1080;

export const COLORS = Object.freeze({
  ink: '#0B0E14',
  inkScrim: 'rgba(8,10,16,0.72)',
  inkPanel: 'rgba(16,20,30,0.82)',
  paper: '#F6F8FC',
  paperDim: 'rgba(246,248,252,0.66)',
  paperFaint: 'rgba(246,248,252,0.28)',
  accent: '#7C5CFF',
  accentSoft: 'rgba(124,92,255,0.22)',
  cyan: '#3BE3D0',
  amber: '#FFB020',
  danger: '#FF5470',
  good: '#34D399',
  line: 'rgba(246,248,252,0.16)',
});

export const GRADIENTS = Object.freeze({
  scrimBottom: 'linear-gradient(0deg, rgba(8,10,16,0.92) 0%, rgba(8,10,16,0.45) 38%, rgba(8,10,16,0) 70%)',
  scrimTop: 'linear-gradient(180deg, rgba(8,10,16,0.85) 0%, rgba(8,10,16,0) 60%)',
  accentSweep: 'linear-gradient(90deg, #7C5CFF 0%, #3BE3D0 100%)',
});

export const FONTS = Object.freeze({
  display: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  body: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: '"SFMono-Regular", "JetBrains Mono", ui-monospace, Menlo, monospace',
});

export const TYPE = Object.freeze({
  displayXl: 132,
  display: 92,
  h1: 64,
  h2: 48,
  title: 38,
  body: 30,
  label: 22,
  caption: 18,
});

export const WEIGHT = Object.freeze({
  black: 800,
  bold: 700,
  semibold: 600,
  medium: 500,
  regular: 400,
});

export const TRACKING = Object.freeze({
  tight: '-0.02em',
  normal: '0em',
  wide: '0.06em',
  caps: '0.16em',
});

export const LEADING = Object.freeze({
  tight: 1.04,
  snug: 1.18,
  normal: 1.4,
});

export const SPACE = Object.freeze({
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 64,
  xxl: 96,
  safe: 96,
});

export const RADIUS = Object.freeze({
  sm: 8,
  md: 16,
  lg: 28,
  pill: 999,
});

export const SHADOW = Object.freeze({
  soft: '0 8px 30px rgba(0,0,0,0.35)',
  card: '0 24px 60px rgba(0,0,0,0.5)',
  glow: '0 0 40px rgba(124,92,255,0.45)',
});

export const scaleForCanvas = (width, height) =>
  Math.min((width || REFERENCE_WIDTH) / REFERENCE_WIDTH, (height || REFERENCE_HEIGHT) / REFERENCE_HEIGHT);

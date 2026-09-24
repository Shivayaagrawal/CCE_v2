import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/design/**/*.{js,ts,jsx,tsx,mdx,css}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rail: {
          DEFAULT: 'var(--rail)',
          2: 'var(--rail-2)',
          active: 'var(--rail-active)',
          ink: 'var(--rail-ink)',
          'ink-muted': 'var(--rail-ink-muted)',
        },
        canvas: 'var(--canvas)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          sunken: 'var(--surface-sunken)',
        },
        rule: {
          DEFAULT: 'var(--rule)',
          strong: 'var(--rule-strong)',
        },
        grid: 'var(--grid)',
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          wash: 'var(--primary-wash)',
        },
        'focus-ring': 'var(--focus-ring)',
        assured: {
          DEFAULT: 'var(--assured)',
          ink: 'var(--assured-ink)',
          bg: 'var(--assured-bg)',
          border: 'var(--assured-border)',
        },
        limitation: {
          DEFAULT: 'var(--limitation)',
          ink: 'var(--limitation-ink)',
          bg: 'var(--limitation-bg)',
          border: 'var(--limitation-border)',
        },
        review: {
          DEFAULT: 'var(--review)',
          ink: 'var(--review-ink)',
          bg: 'var(--review-bg)',
          border: 'var(--review-border)',
        },
        escalate: {
          DEFAULT: 'var(--escalate)',
          ink: 'var(--escalate-ink)',
          bg: 'var(--escalate-bg)',
          border: 'var(--escalate-border)',
        },
        unmeasured: {
          DEFAULT: 'var(--unmeasured)',
          ink: 'var(--unmeasured-ink)',
          bg: 'var(--unmeasured-bg)',
          border: 'var(--unmeasured-border)',
        },
        series: {
          1: 'var(--series-1)',
          2: 'var(--series-2)',
          3: 'var(--series-3)',
          4: 'var(--series-4)',
          5: 'var(--series-5)',
        },
        seq: {
          100: 'var(--seq-100)',
          150: 'var(--seq-150)',
          200: 'var(--seq-200)',
          250: 'var(--seq-250)',
          300: 'var(--seq-300)',
          350: 'var(--seq-350)',
          400: 'var(--seq-400)',
          450: 'var(--seq-450)',
          500: 'var(--seq-500)',
          550: 'var(--seq-550)',
          600: 'var(--seq-600)',
          650: 'var(--seq-650)',
          700: 'var(--seq-700)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      spacing: {
        s1: 'var(--s1)',
        s2: 'var(--s2)',
        s3: 'var(--s3)',
        s4: 'var(--s4)',
        s5: 'var(--s5)',
        s6: 'var(--s6)',
        s8: 'var(--s8)',
      },
      borderRadius: {
        'r-sm': 'var(--r-sm)',
        'r-md': 'var(--r-md)',
        'r-lg': 'var(--r-lg)',
      },
      boxShadow: {
        e1: 'var(--e1)',
        e2: 'var(--e2)',
      },
    },
  },
  plugins: [],
};

export default config;

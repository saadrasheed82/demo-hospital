// Utilities resolve to the same values as tokens.css, so there is exactly one
// source of truth for every colour and font in the app.
module.exports = {
  content: ['./index.html', './src/**/*.{jsx,js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: 'oklch(98.5% 0.004 250)',
          2: 'oklch(96.4% 0.006 250)',
          3: 'oklch(93.6% 0.008 250)',
        },
        ink: {
          DEFAULT: 'oklch(24% 0.02 258)',
          2: 'oklch(34% 0.018 257)',
          3: 'oklch(52% 0.014 256)',
        },
        rule: {
          DEFAULT: 'oklch(90% 0.008 252)',
          2: 'oklch(83% 0.012 252)',
        },
        accent: {
          DEFAULT: 'oklch(58% 0.20 256)',
          ink: 'oklch(99% 0.002 250)',
          soft: 'oklch(96% 0.028 256)',
          line: 'oklch(74% 0.12 256)',
        },
        graphite: {
          DEFAULT: 'oklch(22% 0.016 260)',
          2: 'oklch(28% 0.018 260)',
          ink: 'oklch(94% 0.006 256)',
          dim: 'oklch(68% 0.014 256)',
        },
        ok: { DEFAULT: 'oklch(50% 0.10 158)', soft: 'oklch(96% 0.022 158)' },
        warn: { DEFAULT: 'oklch(55% 0.12 72)', soft: 'oklch(96.5% 0.03 84)' },
        danger: { DEFAULT: 'oklch(52% 0.17 26)', soft: 'oklch(96.5% 0.024 26)' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.4' }],
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.55' }],
        md: ['1.125rem', { lineHeight: '1.5' }],
        lg: ['1.375rem', { lineHeight: '1.3' }],
        xl: ['1.75rem', { lineHeight: '1.2' }],
        '2xl': ['2.25rem', { lineHeight: '1.15' }],
      },
      spacing: {
        '3xs': '0.25rem',
        '2xs': '0.5rem',
        xs: '0.75rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4.5rem',
        '3xl': '7rem',
      },
      borderRadius: {
        control: '6px',
        card: '10px',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        in: 'cubic-bezier(0.7, 0, 0.84, 0)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      boxShadow: {
        lift: '0 1px 2px oklch(24% 0.02 258 / 0.05)',
      },
    },
  },
  plugins: [],
}
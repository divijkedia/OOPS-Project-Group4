import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: 'var(--brand-dark)',
          deep: 'var(--brand-deep)',
          navy: 'var(--brand-navy)',
          azure: 'var(--brand-azure)',
          bright: 'var(--brand-bright)',
          cyan: 'var(--brand-cyan)',
          pink: 'var(--brand-pink)',
          'pink-hover': 'var(--brand-pink-hover)',
          'pink-deep': 'var(--brand-pink-deep)',
          'pink-soft': 'var(--brand-pink-soft)',
        },
        surface: {
          light: 'var(--surface-light)',
          card: 'var(--surface-card)',
          border: 'var(--border-soft)',
          'border-strong': 'var(--border-strong)',
        },
        content: {
          dark: 'var(--text-dark)',
          muted: 'var(--text-muted)',
          light: 'var(--text-light)',
        },
        status: {
          success: 'var(--color-success)',
          'success-soft': 'var(--color-success-soft)',
          warning: 'var(--color-warning)',
          'warning-soft': 'var(--color-warning-soft)',
          danger: 'var(--color-danger)',
          'danger-soft': 'var(--color-danger-soft)',
          info: 'var(--color-info)',
          'info-soft': 'var(--color-info-soft)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(9, 49, 141, 0.08), 0 2px 6px -1px rgba(9, 49, 141, 0.04)',
        float: '0 12px 32px -4px rgba(9, 49, 141, 0.16), 0 4px 12px -2px rgba(9, 49, 141, 0.08)',
        pink: '0 8px 24px -4px rgba(253, 145, 204, 0.45)',
        glow: '0 0 30px rgba(30, 96, 232, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config;

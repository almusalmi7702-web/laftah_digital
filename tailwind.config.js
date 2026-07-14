/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        // Semantic theme colors bound to CSS variables (RGB triplets).
        'theme-page': 'rgb(var(--color-page) / <alpha-value>)',
        'theme-surface': 'rgb(var(--color-surface) / <alpha-value>)',
        'theme-elevated': 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        'theme-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        'theme-text': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'theme-text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'theme-text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        'theme-border': 'rgb(var(--color-border) / <alpha-value>)',
        'theme-border-strong': 'rgb(var(--color-border-strong) / <alpha-value>)',
        'theme-primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'theme-primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
        'theme-primary-soft': 'rgb(var(--color-primary-soft) / <alpha-value>)',
        'theme-nav': 'rgb(var(--color-nav) / <alpha-value>)',
        'theme-footer': 'rgb(var(--color-footer) / <alpha-value>)',
        'theme-input': 'rgb(var(--color-input) / <alpha-value>)',
        'theme-input-border': 'rgb(var(--color-input-border) / <alpha-value>)',
        'theme-success': 'rgb(var(--color-success) / <alpha-value>)',
        'theme-success-soft': 'rgb(var(--color-success-soft) / <alpha-value>)',
        'theme-warning': 'rgb(var(--color-warning) / <alpha-value>)',
        'theme-warning-soft': 'rgb(var(--color-warning-soft) / <alpha-value>)',
        'theme-danger': 'rgb(var(--color-danger) / <alpha-value>)',
        'theme-danger-soft': 'rgb(var(--color-danger-soft) / <alpha-value>)',
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        navy: {
          500: '#1e4a7a',
          600: '#1a3f6b',
          700: '#1e3a5f',
          800: '#152a45',
          900: '#0f1f33',
        },
      },
      boxShadow: {
        'theme-card': 'var(--shadow-card)',
        'theme-elevated': 'var(--shadow-elevated)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

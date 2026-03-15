import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fff8f0',
          100: '#ffecd6',
          200: '#ffd4a8',
          400: '#f59240',
          500: '#e87722',
          600: '#c85f10',
          900: '#3d1a04',
        },
        gray: {
          0:   '#ffffff',
          25:  '#fdfcfb',
          50:  '#f8f6f3',
          100: '#f0ede8',
          200: '#e4e0d9',
          300: '#cbc6be',
          400: '#a8a29a',
          500: '#7c766e',
          600: '#5a554f',
          700: '#3d3a35',
          800: '#272420',
          900: '#161310',
        },
      },
      screens: {
        // iPhone 16 and up
        'xs':  '390px',
        // iPad
        'md':  '768px',
        // MacBook Air
        'lg':  '1024px',
        // Desktop
        'xl':  '1280px',
        '2xl': '1440px',
      },
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        full: '9999px',
      },
      boxShadow: {
        xs:  '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        sm:  '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        md:  '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        lg:  '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        xl:  '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
}

export default config
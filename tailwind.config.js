/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          50: '#eef8ff',
          100: '#d9f0ff',
          200: '#bce4ff',
          300: '#8ed2ff',
          400: '#56b8ff',
          500: '#2b97fc',
          600: '#1478f0',
          700: '#0d5fd9',
          800: '#114cb0',
          900: '#14418a',
          950: '#071836',
        },
        cyber: {
          bg: '#05070e',
          card: 'rgba(12, 19, 36, 0.75)',
          border: 'rgba(56, 189, 248, 0.15)',
          glow: 'rgba(56, 189, 248, 0.25)',
          neon: '#00f2fe',
          violet: '#8a2be2',
          emerald: '#10b981',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

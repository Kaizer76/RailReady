import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ============================================================
        // THÈME ROUGE FERROVIAIRE — primary #c62828 / dark #8e0000
        // La palette `blue` est volontairement remappée vers le rouge :
        // toute l'app (btn-primary, liens, badges...) bascule au rouge
        // sans modifier chaque composant. Rouge doux, non agressif.
        // ============================================================
        blue: {
          50:  '#fdf4f4',
          100: '#fae6e6',
          200: '#f3c9c9',
          300: '#e9a3a3',
          400: '#dc6f6f',
          500: '#d04848',
          600: '#c62828',  // --primary
          700: '#c62828',  // --primary (boutons)
          800: '#8e0000',  // --primary-dark (hover)
          900: '#6d0a0a',
        },
        rail: {
          50:  '#fdf4f4',
          100: '#fae6e6',
          200: '#f3c9c9',
          300: '#e9a3a3',
          400: '#dc6f6f',
          500: '#d04848',
          600: '#c62828',  // rouge ferroviaire
          700: '#a51d1d',
          800: '#8e0000',
          900: '#6d0a0a',
        },
        secondary: {
          DEFAULT: '#1f2937',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-dot': 'bounceDot 1.2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config

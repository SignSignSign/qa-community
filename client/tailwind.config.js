import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        drift: {
          '0%': { transform: 'translateX(-15vw)' },
          '100%': { transform: 'translateX(115vw)' }
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        }
      },
      animation: {
        drift: 'drift linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        'toast-in': 'toast-in 0.25s ease-out'
      }
    }
  },
  plugins: [typography]
};

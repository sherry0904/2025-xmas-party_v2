/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          base: '#F9F7F2', // Soft Cream
          accent: '#D4AF37', // Champagne Gold
          text: '#2F3E30', // Deep Forest Green
          sand: '#E6D5B8', // Warm Sand
          red: '#A63D40', // Muted Red (for errors/bombs)
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif TC"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        // Fallback for Chinese if needed, though system fonts usually suffice
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

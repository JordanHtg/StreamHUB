/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stream: {
          black: "#090909",
          dark: "#111111",
          darker: "#161616",
          card: "#1B1B1B",
          red: "#E50914",
          "red-hover": "#F6121D",
          white: "#FFFFFF",
          gray: {
            100: "#F3F4F6",
            200: "#E5E7EB",
            300: "#D1D5DB",
            400: "#9CA3AF",
            500: "#6B7280",
            600: "#4B5563",
            700: "#374151",
            800: "#1F2937",
            900: "#111827",
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', boxShadow: '0 0 25px rgba(229, 9, 20, 0.4)' },
          '50%': { opacity: '1', boxShadow: '0 0 40px rgba(229, 9, 20, 0.8)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        float: 'float 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.5s infinite',
        fadeIn: 'fadeIn 0.4s ease-out forwards',
      },
      backdropBlur: {
        xs: '2px',
        luxury: '16px',
      }
    },
  },
  plugins: [],
}

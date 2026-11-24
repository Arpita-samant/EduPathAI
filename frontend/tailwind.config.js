/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        workspace: {
          bg: '#F9F9FB',
          surface: '#FFFFFF',
          text: '#17191C',
          muted: '#6F7782',
          accent: '#536C8A',
          lavender: '#C7B5D9',
          lightblue: '#A8B9D0',
          border: '#E4E5E9',
          navy: '#193D50',
        },
        brand: {
          50: '#F9F9FB',
          100: '#EFEFF3',
          200: '#E4E5E9',
          300: '#CFD4DC',
          400: '#A8B9D0',
          500: '#758CA8',
          600: '#536C8A',
          700: '#3D526C',
          800: '#2A3C52',
          900: '#193D50',
          950: '#10222D',
        },
        slate: {
          900: '#17191C',
          800: '#282C32',
          700: '#434851',
          600: '#5A616D',
          500: '#6F7782',
          400: '#9CA3AF',
          300: '#CFD4DC',
          200: '#E4E5E9',
          100: '#EFEFF3',
          50: '#F9F9FB',
        },
        semantic: {
          success: '#348B68',
          warning: '#C98A2C',
          danger: '#C84C4C',
          info: '#536C8A',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'card': '24px',
        'card-sm': '20px',
        'card-lg': '26px',
        'btn': '14px',
        'btn-sm': '12px',
        'btn-lg': '16px',
        'input': '18px',
        'input-sm': '16px',
        'input-lg': '22px',
      },
      boxShadow: {
        'soft': '0 2px 16px rgba(23, 25, 28, 0.02)',
        'card': '0 4px 24px rgba(23, 25, 28, 0.03)',
        'card-hover': '0 8px 30px rgba(83, 108, 138, 0.08)',
        'ai-glow': '0 0 35px rgba(199, 181, 217, 0.4)',
        'ai-glow-blue': '0 0 35px rgba(168, 185, 208, 0.35)',
        'modal': '0 20px 60px rgba(23, 25, 28, 0.08)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.82', transform: 'scale(1.03)' },
        },
        orbGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(199,181,217,0.5))' },
          '50%': { filter: 'drop-shadow(0 0 28px rgba(168,185,208,0.75))' },
        },
        orbAnalyzing: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 20px rgba(199,181,217,0.65))' },
          '50%': { transform: 'scale(1.06)', filter: 'drop-shadow(0 0 38px rgba(168,185,208,0.9))' },
        }
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        'orb-glow': 'orbGlow 4s ease-in-out infinite',
        'orb-analyzing': 'orbAnalyzing 2.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

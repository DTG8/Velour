/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        // Deep Dark palette
        void:    '#080808',
        obsidian:'#0f0f0f',
        charcoal:'#161616',
        surface: '#1c1c1c',
        border:  '#2a2a2a',
        muted:   '#3d3d3d',
        // Accent — warm gold
        gold: {
          DEFAULT: '#c9a84c',
          light:   '#e8c76a',
          dim:     '#7a6028',
        },
        // Text
        ivory:  '#f0ece4',
        silver: '#a8a29e',
        ash:    '#6b6560',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9a84c 0%, #e8c76a 50%, #c9a84c 100%)',
        'card-shine':    'linear-gradient(135deg, rgba(201,168,76,0.05) 0%, transparent 60%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(201,168,76,0.15)',
        'card':      '0 4px 24px rgba(0,0,0,0.5)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.7)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        shimmer:      'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGold: {
          '0%,100%': { boxShadow: '0 0 0px rgba(201,168,76,0)' },
          '50%':     { boxShadow: '0 0 20px rgba(201,168,76,0.3)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

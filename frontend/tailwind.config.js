/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Custom animation durations
      transitionDuration: {
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '800': '800ms',
      },
      // Custom animation timing functions
      transitionTimingFunction: {
        'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      // Custom keyframes
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
          '50%': { boxShadow: '0 0 20px 5px rgba(59, 130, 246, 0.3)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        elastic: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.25)' },
          '50%': { transform: 'scale(0.9)' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'slide-right': {
          'from': { transform: 'translateX(-10px)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-left': {
          'from': { transform: 'translateX(10px)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'flip-x': {
          'from': { transform: 'perspective(400px) rotateX(-90deg)', opacity: '0' },
          'to': { transform: 'perspective(400px) rotateX(0)', opacity: '1' },
        },
        'flip-y': {
          'from': { transform: 'perspective(400px) rotateY(-90deg)', opacity: '0' },
          'to': { transform: 'perspective(400px) rotateY(0)', opacity: '1' },
        },
        'skew-x': {
          'from': { transform: 'skewX(-20deg)', opacity: '0' },
          'to': { transform: 'skewX(0)', opacity: '1' },
        },
        morph: {
          '0%, 100%': { borderRadius: '8px' },
          '50%': { borderRadius: '50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
      // Animation utilities
      animation: {
        'bounce-gentle': 'bounce 0.8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'elastic': 'elastic 0.6s ease-out',
        'float': 'float 2s ease-in-out infinite',
        'slide-right': 'slide-right 300ms ease-out both',
        'slide-left': 'slide-left 300ms ease-out both',
        'flip-x': 'flip-x 400ms ease-out both',
        'flip-y': 'flip-y 400ms ease-out both',
        'skew-x': 'skew-x 300ms ease-out both',
        'morph': 'morph 1s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'ripple': 'ripple 0.6s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}

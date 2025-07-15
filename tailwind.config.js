/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Refined 8-point grid system optimized for visual harmony
    spacing: {
      px: '1px',
      0: '0px',
      0.5: '2px',    // Micro spacing for borders/separators
      1: '4px',      // Tight spacing for badges, pills
      1.5: '6px',    // Extra tight spacing  
      2: '8px',      // Base unit - button padding, small gaps
      2.5: '10px',   // Slightly larger than base
      3: '12px',     // Standard padding - form inputs, small cards
      3.5: '14px',   // Medium-small spacing
      4: '16px',     // Medium spacing - card padding, button gaps
      5: '20px',     // Medium-large spacing
      6: '24px',     // Large spacing - section padding
      7: '28px',     // Extra large spacing
      8: '32px',     // Section breaks, large component gaps
      9: '36px',     // Extra large section spacing
      10: '40px',    // Large section padding
      11: '44px',    // Extra large section spacing
      12: '48px',    // Major section breaks
      14: '56px',    // Large component spacing
      16: '64px',    // Major layout spacing
      20: '80px',    // Page section spacing
      24: '96px',    // Large page spacing
      28: '112px',   // Extra large page spacing
      32: '128px',   // Major layout breaks
      36: '144px',   // Large layout spacing
      40: '160px',   // Extra large layout spacing
      44: '176px',   // Major spacing
      48: '192px',   // Large spacing
      52: '208px',   // Extra large spacing
      56: '224px',   // Major spacing
      60: '240px',   // Large spacing
      64: '256px',   // Extra large spacing
      72: '288px',   // Major layout spacing
      80: '320px',   // Large layout spacing
      96: '384px',   // Major layout spacing
    },
    extend: {
      colors: {
        // Custom grey palette for modern look
        'grey': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Yellow brand palette - strict branding
        'accent': '#ffdd00',
        'accent-dark': '#e6c600',
        'yellow': {
          50: '#fffbf0',   // Lightest yellow background
          100: '#fff3d3',  // Light yellow background
          200: '#ffe7a6',  // Medium-light yellow
          300: '#ffdb7a',  // Medium yellow
          400: '#ffcf4d',  // Medium-dark yellow
          500: '#ffdd00',  // Brand yellow (accent)
          600: '#e6c600',  // Darker yellow (accent-dark)
          700: '#ccb300',  // Dark yellow
          800: '#b3a000',  // Darker yellow
          900: '#998c00',  // Darkest yellow
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '2px',     // Micro radius for subtle elements
        DEFAULT: '4px',  // Standard radius for buttons, inputs
        'md': '6px',     // Medium radius for cards, panels
        'lg': '8px',     // Large radius for major components
        'xl': '12px',    // Extra large radius for containers
        '2xl': '16px',   // Major containers, modals
        '3xl': '24px',   // Large containers, hero sections
        'full': '9999px',
      },
    },
  },
  plugins: [],
} 
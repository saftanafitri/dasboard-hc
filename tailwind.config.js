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
        'green-900': 'var(--green-900)',
        'green-700': 'var(--green-700)',
        'green-500': 'var(--green-500)',
        'green-300': 'var(--green-300)',
        'bg-page': 'var(--bg-page)',
        'surface': 'var(--surface)',
        'text-heading': 'var(--text-heading)',
        'text-muted': 'var(--text-muted)',
        'border-custom': 'var(--border)',
        'accent-orange': 'var(--accent-orange)',
        'stat-blue': 'var(--stat-blue)',
        'stat-green': 'var(--stat-green)',
        'stat-orange': 'var(--stat-orange)',
        'stat-dark': 'var(--stat-dark)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(5, 71, 58, 0.05)',
        'card': '0 4px 20px -2px rgba(5, 71, 58, 0.08)',
        'card-hover': '0 12px 28px -4px rgba(5, 71, 58, 0.14)',
        'drawer': '-10px 0 30px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}

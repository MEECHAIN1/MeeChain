/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🔮 เพิ่มฟอนต์ภาษาไทยและอังกฤษที่อ่านง่ายและคมชัด
      fontFamily: {
        sans: ['Inter', 'Kanit', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      // 🎨 กำหนดชุดสีเฉพาะสำหรับระบบพลังงาน MeeBot
      colors: {
        meebot: {
          dark: '#050505',
          glass: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
      },
      // ✨ สร้างแอนิเมชันสำหรับระบบ Neural Sync
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.7s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      // 🌫️ เพิ่มระบบ Glassmorphism Backdrop
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
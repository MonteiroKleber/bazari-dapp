/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bazari: {
          // Paleta Oficial Bazari
          primary: '#8B0000',      // Vermelho terroso - resistência e povo
          secondary: '#FFB300',    // Dourado queimado - riqueza e esperança
          dark: '#1C1C1C',         // Preto fosco - descentralização e poder
          light: '#F5F1E0',        // Areia clara - simplicidade, papel e rua
          
          // Variações para UI
          'primary-hover': '#A50000',
          'primary-light': '#B71C1C',
          'secondary-hover': '#FFC107',
          'secondary-light': '#FFCA28',
          'dark-light': '#2C2C2C',
          'light-dark': '#E8E4D3'
        },
        
        // Estados e feedbacks
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3'
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif']
      },
      
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      
      boxShadow: {
        'bazari': '0 4px 20px rgba(139, 0, 0, 0.15)',
        'bazari-lg': '0 8px 30px rgba(139, 0, 0, 0.2)',
        'golden': '0 4px 20px rgba(255, 179, 0, 0.15)'
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite'
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
  // Força a geração de classes importantes
  important: false,
  // Evita purge de classes dinâmicas
  safelist: [
    'bg-bazari-primary',
    'bg-bazari-secondary', 
    'bg-bazari-light',
    'bg-bazari-dark',
    'text-bazari-primary',
    'text-bazari-secondary',
    'text-bazari-dark',
    'border-bazari-primary',
    'border-bazari-secondary',
    'hover:bg-bazari-primary-hover',
    'hover:bg-bazari-secondary-hover',
    'shadow-bazari',
    'shadow-bazari-lg',
    'shadow-golden',
    'animate-fade-in',
    'animate-slide-up',
    'animate-pulse-slow'
  ]
}
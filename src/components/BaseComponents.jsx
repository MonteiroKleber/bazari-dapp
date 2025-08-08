import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, Eye, EyeOff } from 'lucide-react'

// ===============================
// BUTTON COMPONENT
// ===============================
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-bazari-primary hover:bg-bazari-primary-hover text-white shadow-bazari hover:shadow-bazari-lg',
    secondary: 'bg-bazari-secondary hover:bg-bazari-secondary-hover text-bazari-dark shadow-golden',
    outline: 'border-2 border-bazari-primary text-bazari-primary hover:bg-bazari-primary hover:text-white',
    ghost: 'text-bazari-primary hover:bg-bazari-primary/10',
    danger: 'bg-error hover:bg-red-600 text-white',
    success: 'bg-success hover:bg-green-600 text-white'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  )
}

// ===============================
// INPUT COMPONENT
// ===============================
export const Input = ({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  showPasswordToggle = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [inputType, setInputType] = React.useState(type)

  React.useEffect(() => {
    if (type === 'password' && showPasswordToggle) {
      setInputType(showPassword ? 'text' : 'password')
    }
  }, [showPassword, type, showPasswordToggle])

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-bazari-dark mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
            ${error 
              ? 'border-error focus:border-error focus:ring-error/20' 
              : 'border-gray-300 focus:border-bazari-primary focus:ring-bazari-primary/20'
            }
            focus:ring-4 focus:outline-none
            bg-white text-bazari-dark placeholder-gray-500
            ${className}
          `}
          {...props}
        />
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-bazari-primary"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// ===============================
// CARD COMPONENT
// ===============================
export const Card = ({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  hover = false,
  ...props 
}) => {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: ''
  }
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-bazari',
    lg: 'shadow-bazari-lg'
  }
  
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.02 } : {}}
      className={`
        bg-white rounded-2xl border border-gray-100
        ${paddings[padding]} ${shadows[shadow]}
        ${hover ? 'transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ===============================
// LOADING COMPONENT
// ===============================
export const Loading = ({ size = 'md', text = 'Carregando...' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className={`animate-spin text-bazari-primary ${sizes[size]}`} />
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  )
}

// ===============================
// BADGE COMPONENT
// ===============================
export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-bazari-primary/10 text-bazari-primary',
    secondary: 'bg-bazari-secondary/10 text-bazari-secondary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error'
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {children}
    </span>
  )
}

// ===============================
// ALERT COMPONENT
// ===============================
export const Alert = ({ 
  children, 
  variant = 'info', 
  title,
  className = '',
  onClose 
}) => {
  const variants = {
    info: 'bg-info/10 border-info/20 text-info',
    success: 'bg-success/10 border-success/20 text-success',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    error: 'bg-error/10 border-error/20 text-error'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        relative p-4 rounded-xl border-2
        ${variants[variant]} ${className}
      `}
    >
      {title && (
        <h4 className="font-semibold mb-2">{title}</h4>
      )}
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-current hover:opacity-70"
        >
          ×
        </button>
      )}
    </motion.div>
  )
}

// ===============================
// AVATAR COMPONENT
// ===============================
export const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  fallback,
  className = '' 
}) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  }
  
  const [imageError, setImageError] = React.useState(false)
  
  return (
    <div className={`
      relative rounded-full overflow-hidden bg-bazari-primary/10 
      flex items-center justify-center
      ${sizes[size]} ${className}
    `}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-bazari-primary font-semibold">
          {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
        </span>
      )}
    </div>
  )
}

// ===============================
// MODAL COMPONENT
// ===============================
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }
  
  if (!isOpen) return null
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`
          relative w-full ${sizes[size]} bg-white rounded-2xl
          shadow-bazari-lg max-h-[90vh] overflow-hidden
          ${className}
        `}
      >
        {title && (
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-bazari-dark">{title}</h2>
          </div>
        )}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}
import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="min-h-screen bg-bazari-black flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="inline-block"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-16 h-16 border-4 border-bazari-gold border-t-bazari-red rounded-full" />
        </motion.div>
        <motion.p
          className="mt-4 text-bazari-sand text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Carregando...
        </motion.p>
      </div>
    </div>
  )
}
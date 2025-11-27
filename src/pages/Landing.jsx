import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Landing = ({ onEnter }) => {
  return (
    <div className="text-center space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="space-y-4"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-12 h-12 text-christmas-accent" />
          </motion.div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-serif text-christmas-text tracking-tight">
          Christmas<br />
          <span className="text-christmas-accent italic">Party</span>
        </h1>
        
        <p className="text-christmas-text/60 font-sans tracking-widest text-sm uppercase mt-4">
          2025 Exclusive Event
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEnter}
        className="glass-button text-lg font-serif tracking-wide px-12 py-4 group relative overflow-hidden"
      >
        <span className="relative z-10">Enter Lobby</span>
        <div className="absolute inset-0 bg-christmas-accent/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
      </motion.button>
    </div>
  );
};

export default Landing;

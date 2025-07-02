'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-amber-50 to-sky-100 text-center">
      <div className="space-y-6 p-6">
        <Image src="/logo.png" alt="logo" width={80} height={80} className="mx-auto animate-pulse" />
        
        <motion.h1
          className="text-2xl font-semibold text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
        >
          마음의 색을 담다, <span className="text-pink-400 font-bold">MAUM PRISM</span>
        </motion.h1>

        <div className="w-12 h-12 border-4 border-pink-300 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </main>
  );
} 
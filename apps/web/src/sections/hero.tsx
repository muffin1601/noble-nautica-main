"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          className="w-full h-full object-cover"
          src="/herovid.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-slate-900/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
        

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Engineering the Future of <br />
 Aquatic Infrastructure
          </h1>

          <p className="text-md md:text-lg text-white/90 max-w-3xl mx-auto">
          From Olympic-sized pools to wellness retreats, Noble Nautica delivers precision-engineered systems and exclusive products, defined by a legacy of craftsmanship and trusted by professionals across the globe 
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <Link href="/products/categories">
            <Button size="lg" className="bg-[#c7dae7] hover:bg-[#c7dae7] py-4  text-[#385786] px-8">
              Explore our Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
     
    </section>
  )
}

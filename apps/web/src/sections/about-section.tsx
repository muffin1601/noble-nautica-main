"use client"


import { Button } from "@/components/ui/button"
// import { Award } from "lucide-react"
import Image from "next/image"  
import Link from "next/link"

const stats = [
  { image: "/installed.svg", label: "Installed in 12,000+ sites", value: "25+" },
  { image: "/exported.svg", label: "Exporting to 80+ countries", value: "10,000+" },
  { image: "/worldwide.svg", label: "100+ worldwide distributors", value: "50+" },
]

export default function AboutSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div
           
            className="space-y-6"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-[#385785]">
              Crafting the Future of Water Spaces
              </h2>
              <p className="text-lg text-[#385785] leading-relaxed">
              We’re enabling a new era of swimming pool infrastructure - where design meets technology, and every solution is as functional as it is visually transparent. Our digital catalogue brings this vision to life: design-driven layouts, technically advanced details and crystal-clear product presentation. From precision specifications to stunning visuals, it’s everything you need to build with confidence, all in one place.

              </p>
            
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/about"> 
              <Button size="lg" className="bg-sky-600 hover:bg-sky-700">
                Learn More About Us
              </Button>  </Link>
              
            
            </div>
          </div>

          {/* Image */}
          <div
           
            className="relative"
          >
            <div className="aspect-square rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-600/20 to-slate-600/20" />
             <Image height={500} alt="" width={500} src="/nnimg.jpg" className="w-full h-full"/>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
         
          className="grid grid-cols-1 h-fit py-12 bg-[#385785] md:grid-cols-3 gap-6 rounded-xl mt-16"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
             
            >
              <div className="text-center ">
                <div className="p-6">
                  <div className="w-28 h-28 mx-auto flex items-center justify-center">
                    <Image src={stat.image} alt={stat.label} width={70} height={70} />
                  </div>
                  {/* <div className="text-2xl font-bold text-[#385785] mb-1">{stat.value}</div> */}
                  <div className="text-lg text-white font-bold ">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

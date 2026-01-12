"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi
} from "@/components/ui/carousel"
import Image from "next/image"
import Link from "next/link"

const categories = [
  {
    id: 1,
    image: "/filteration.svg",
    title: "Filters & Filtration Systems",
    description: "Advanced water filtration solutions",
    link: "/products/categories/filters-filtration-systems",
  },
  {
    id: 2,
    image: "/pumps.svg",
    title: "Pumps",
    description: "High-performance water pumps",
    link: "/products/categories/pumps",
  },
  {
    id: 3,
    image: "/airblower.svg",
    title: "Air Blower",
    description: "Efficient air circulation systems",
    link: "/products/categories/air-blower",
  },
  {
    id: 4,
    image: "/pce.png",
    title: "Pool Cleaning Equipment",
    description: "Professional cleaning tools",
    link: "/products/categories/pool-cleaning-equipment",
  },
  {
    id: 5,
    image: "/Robotic.svg",
    title: "Pool Cleaning Robots",
    description: "Automated cleaning solutions",
    link: "/products/categories/pool-cleaning-robots",
  },
  {
    id: 6,
    image: "/pd.png",
    title: "Pool Dis-Infection System",
    description: "Disinfection and sanitation systems",
    link: "/products/categories/pool-dis-infection-system",
  },
  {
    id: 7,
    image: "/pfc.png",
    title: "Pool Fittings and Cleaners",
    description: "Fittings and manual cleaners",
    link: "/products/categories/pool-fittings-and-cleaners",
  },
  {
    id: 8,
    image: "/Lighting.svg",
    title: "Lighting",
    description: "Underwater and poolside lighting",
    link: "/products/categories/lighting",
  },
  {
    id: 9,
    image: "/WaterChiller.svg",
    title: "Heat Pump & Chill Pump",
    description: "Heating and chilling solutions",
    link: "/products/categories/heat-pump-chill-pump",
  },
  {
    id: 10,
    image: "/Wellness.svg",
    title: "Wellness",
    description: "Wellness and spa equipment",
    link: "/products/categories/wellness",
  },
  {
    id: 11,
    image: "/poolcover.svg",
    title: "Pool Cover",
    description: "Safety and protection covers",
    link: "/products/categories/pool-cover",
  },
  {
    id: 12,
    image: "/ss.png",
    title: "Stainless Steel",
    description: "Stainless steel accessories",
    link: "/products/categories/stainless-steel",
  },
  {
    id: 13,
    image: "/acrylic.png",
    title: "Acrylic Pool",
    description: "Acrylic pool systems",
    link: "/products/categories/acrylic-pool",
  },
  {
    id: 14,
    image: "/Fountain.svg",
    title: "Fountain Nozzle",
    description: "Fountain nozzles and spouts",
    link: "/products/categories/fountain-nozzle",
  },
]

export default function ProductCategories() {
  const [api, setApi] = useState<CarouselApi>()

  // Auto-play functionality
  useEffect(() => {
    if (!api) {
      return
    }

    const interval = setInterval(() => {
      api.scrollNext()
    }, 4000)

    return () => clearInterval(interval)
  }, [api])

  return (
    <section className="">
      <div className="max-w-7xl -translate-y-1/3 bg-[#385785] rounded-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {categories.map((category) => (
                <CarouselItem
                  key={category.id}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <Link href={category.link}>
                    <Card className="h-full border-0 bg-transparent group transition-colors duration-300">
                      <CardContent className="p-4 sm:p-6 text-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 aspect-square rounded-xl mx-auto mb-3 sm:mb-4 bg-white p-3 sm:p-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md">
                          <Image unoptimized
                            className="w-full h-full object-contain"
                            src={category.image}
                            alt={category.title}
                            loading="lazy"
                            width={100}
                            height={100}
                          />
                        </div>
                        <h3 className="font-semibold text-white text-sm sm:text-base lg:text-lg mb-2 group-hover:text-blue-200 transition-colors duration-300">
                          {category.title}
                        </h3>

                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-2 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl" />
            <CarouselNext className="right-2 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl" />
          </Carousel>

        </div>
      </div>
    </section>
  )
}
"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
    {
        id: 1,
        name: "Daniel Wright",
        title: "Facility Manager, ClearHaven Wellness Spa (UK)",
        quote:
            "Noble Nautica's filtration systems are in a league of their own. The performance is consistent, the design is sleek, and the maintenance is minimal. For any large-scale aquatic project, their products are our first choice.",
        image: "https://images.pexels.com/photos/29304914/pexels-photo-29304914.jpeg",
    },
    {
        id: 2,
        name: "Lilly Nambiar",
        title: "Design Director, Indigo Spa",
        quote:
            "The colored stainless-steel finish added a distinctive finish to our spa. Beyond aesthetics, the durability is exactly what we needed for long-term, high-use environments.",
        image: "https://images.pexels.com/photos/29304914/pexels-photo-29304914.jpeg",
    },
    {
        id: 3,
        name: "Sarah Chen",
        title: "Operations Manager, Azure Resort",
        quote:
            "Working with Noble Nautica has been exceptional. Their attention to detail and commitment to quality shows in every aspect of their filtration systems.",
        image: "https://images.pexels.com/photos/29304914/pexels-photo-29304914.jpeg",
    },
]

export default function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    const nextTestimonial = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, [])

    const prevTestimonial = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }, [])

    // Auto-rotate testimonials every 5 seconds (increased for better UX)
    useEffect(() => {
        if (isHovered) return // Don't auto-rotate when user is hovering

        const interval = setInterval(() => {
            nextTestimonial()
        }, 5000)

        return () => clearInterval(interval)
    }, [currentIndex, isHovered, nextTestimonial])

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => setIsHovered(false)

    // Touch handlers for mobile swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe) {
            nextTestimonial()
        }
        if (isRightSwipe) {
            prevTestimonial()
        }

        setTouchStart(null)
        setTouchEnd(null)
    }

    return (
        <section className="lg:min-h-screen min-h-fit px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
                        <div className="space-y-2 sm:space-y-3">
                            <p className="text-[#6b7280] text-base sm:text-lg font-medium">Testimonials</p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#385785] leading-tight">
                                Clients
                              
                                Success
                                
                                Stories
                            </h2>
                        </div>
                        <p className="text-[#6b7280] text-sm sm:text-base lg:text-lg leading-relaxed max-w-md">
                            Manufactured with care, trusted by professionals across every stage of the project. From blueprint to
                            build, our partners rely on us for precision, performance, and peace of mind.
                        </p>
                    </div>

                    {/* Right Content - Testimonial Cards */}
                    <div
                        className="relative order-1 lg:order-2"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Navigation Buttons */}
                        <Button
                            onClick={prevTestimonial}
                            variant="default"
                            size="icon"
                            className="absolute lg:flex hidden left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 bg-[#385785] hover:bg-[#2c4a6b] shadow-lg transition-all duration-200 hover:scale-110"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                        </Button>

                        <Button
                            onClick={nextTestimonial}
                            variant="default"
                            size="icon"
                            className="absolute lg:flex hidden right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 bg-[#385785] hover:bg-[#2c4a6b] shadow-lg transition-all duration-200 hover:scale-110"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                        </Button>

                        {/* Cards Container */}
                        <div className="relative h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] p-4 sm:p-6 md:p-8 lg:p-12 overflow-hidden">
                            {testimonials.map((testimonial, index) => {
                                const isActive = index === currentIndex
                                const isNext = index === (currentIndex + 1) % testimonials.length
                                const isPrev = index === (currentIndex - 1 + testimonials.length) % testimonials.length

                                let translateX = "100%"
                                let opacity = 0
                                let zIndex = 0

                                if (isActive) {
                                    translateX = "0%"
                                    opacity = 1
                                    zIndex = 2
                                } else if (isNext) {
                                    translateX = "50%"
                                    opacity = 0
                                    zIndex = 1
                                } else if (isPrev) {
                                    translateX = "-100%"
                                    opacity = 0
                                    zIndex = 0
                                }

                                return (
                                    <div
                                        key={testimonial.id}
                                        className="absolute overflow-hidden inset-0 p-0 sm:p-6 md:p-8 lg:p-10 transition-all duration-700 ease-in-out"
                                        style={{
                                            transform: `translateX(${translateX})`,
                                            opacity,
                                            zIndex,
                                        }}
                                    >
                                        <div
                                            style={{
                                                backgroundImage: `url(${testimonial.image})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                            className="rounded-2xl sm:rounded-3xl inset-0 p-4 sm:p-6 md:p-8 h-full flex flex-col justify-end"
                                        >
                                            {/* Quote */}
                                            <div className="mb-4 sm:mb-6">
                                                <blockquote className="text-gray-700 bg-white/95 backdrop-blur-sm p-5 sm:p-4 rounded-xl sm:rounded-2xl text-sm sm:text-base leading-relaxed shadow-lg">
                                                    &quot;{testimonial.quote}&quot;
                                                </blockquote>
                                            </div>

                                            {/* Attribution */}
                                            <div className="border-t border-white/20 pt-3 sm:pt-4">
                                                <p className="font-semibold text-white mb-1 text-sm sm:text-base">– {testimonial.name}</p>
                                                <p className="text-xs sm:text-sm text-white/90">{testimonial.title}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Dots Indicator */}
                        <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors duration-300 ${index === currentIndex
                                            ? "bg-[#385785]"
                                            : "bg-gray-300 hover:bg-gray-400"
                                        }`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

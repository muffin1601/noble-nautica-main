import { Metadata } from "next"
import Navbar from "@/components/navbar"
import HeroSection from "@/sections/hero"
import ProductCategories from "@/components/product-categories"
import FeaturedProducts from "@/sections/featured-products"
import AboutSection from "@/sections/about-section"
// import ContactSection from "@/sections/contact-section"
import Footer from "@/sections/footer"
import Catelog from "@/sections/catelog"
import TestimonialsSection from "@/sections/TestimonialCarousel"
import CTA from "@/sections/CTA"

export const metadata: Metadata = {
  title: "Premium Pool & Spa Equipment | Aquatic Infrastructure Solutions",
  description:
    "Noble Nautica delivers premium aquatic and wellness infrastructure for the world's most ambitious projects. From Olympic-sized pools to wellness retreats, we provide precision-engineered systems and exclusive products trusted by professionals across Europe, USA, and growing markets.",
  keywords: [
    "pool equipment",
    "spa equipment",
    "aquatic infrastructure",
    "pool filtration systems",
    "pool lighting",
    "water treatment",
    "pool automation",
    "premium pool products",
    "pool contractors",
    "aquatic engineering",
    "wellness infrastructure",
    "pool accessories",
    "marine equipment",
    "pool pumps",
    "pool covers",
  ],
  openGraph: {
    title: "Premium Pool & Spa Equipment | Aquatic Infrastructure Solutions",
    description:
      "Noble Nautica delivers premium aquatic and wellness infrastructure for the world's most ambitious projects.",
    url: "https://noblenautica.com",
    images: [
      {
        url: "/herobg.svg",
        width: 1200,
        height: 630,
        alt: "Noble Nautica - Premium Pool & Spa Equipment",
      },
    ],
  },
  twitter: {
    title: "Premium Pool & Spa Equipment | Aquatic Infrastructure Solutions",
    description:
      "Premium aquatic and wellness infrastructure for ambitious projects worldwide.",
    images: ["/herobg.svg"],
  },
  alternates: {
    canonical: "https://noblenautica.com",
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProductCategories />
      <FeaturedProducts />
      <Catelog />
      <AboutSection />
      <TestimonialsSection />
      <CTA />
      <Footer />
    </main>
  )
}

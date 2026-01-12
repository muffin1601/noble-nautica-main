import { Metadata } from "next"
import Navbar from "@/components/navbar"

export const metadata: Metadata = {
  title: "About Noble Nautica | Premium Aquatic Infrastructure Company",
  description: "Learn about Noble Nautica's commitment to delivering premium aquatic and wellness infrastructure. With over 5,600 solutions from AI-enabled systems to seamless glass-edge pools, we empower contractors, architects and developers worldwide.",
  keywords: [
    "about noble nautica",
    "aquatic infrastructure company",
    "pool equipment manufacturer",
    "premium pool solutions",
    "aquatic engineering company",
    "pool contractor supplier",
    "wellness infrastructure",
    "pool innovation",
    "aquatic technology",
    "pool equipment quality"
  ],
  openGraph: {
    title: "About Noble Nautica | Premium Aquatic Infrastructure Company",
    description: "Learn about Noble Nautica's commitment to delivering premium aquatic and wellness infrastructure. With over 5,600 solutions from AI-enabled systems to seamless glass-edge pools, we empower contractors, architects and developers worldwide.",
    url: "https://noblenautica.com/about",
    images: [
      {
        url: "/aboutbg.svg",
        width: 1200,
        height: 630,
        alt: "About Noble Nautica - Premium Aquatic Infrastructure",
      },
    ],
  },
  twitter: {
    title: "About Noble Nautica | Premium Aquatic Infrastructure Company",
    description: "Learn about Noble Nautica's commitment to delivering premium aquatic and wellness infrastructure worldwide.",
    images: ["/aboutbg.svg"],
  },
  alternates: {
    canonical: "https://noblenautica.com/about",
  },
}
import Footer from "@/sections/footer"
import { Award, Globe, Target, Heart } from "lucide-react"
import Image from "next/image"
import CTA from "@/sections/CTA"
import ContactForm from "@/components/ContactForm"


const values = [
  {
    icon: Target,
    title: "Quality",
    image: "/quality.svg",
  },
  {
    icon: Award,
    title: "Innovation",
    image: "/Innovation.svg",
  },
  {
    icon: Heart,
    title: "Reliability",
    image: "/Reliability.svg",
  },
  {
    icon: Globe,
    title: "Partnership",
    image: "/Partnership.svg",
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="h-[50vh] w-full flex justify-center items-center bg-cover bg-center" style={{ backgroundImage: `url("/aboutbg.svg")` }}>

        <h1 className="text-4xl md:text-5xl font-semibold text-white text-center mb-12">About Us</h1>

      </div>
      {/* Our Story */}
      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div

            className="space-y-6 flex flex-col items-center justify-center max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Brand Story</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Noble Nautica delivers premium aquatic and wellness infrastructure for the world’s most ambitious projects. With a portfolio of over 5,600 solutions from AI enabled systems to seamless glass-edge pools we empower contractors, architects and developers with precision-engineered, visually striking and future-ready equipment. Trusted across Europe, the USA and growing markets such as the Indian subcontinent, China and Southeast Asia, we bring proven expertise and a commitment to simplifying complexity, ensuring every project performs beautifully for years to come.
              </p>
            </div>
          </div>


        </div>

      </section>

      <div className="flex px-4 sm:px-6 lg:px-0 items-center justify-center py-24">
        <div className="bg-[#6384AA] max-w-7xl gap-8 mx-auto text-white p-4 md:p-6 lg:p-8 rounded-xl shadow-lg flex flex-col lg:flex-row items-center w-full">
          <div className="w-full lg:w-1/2 p-2 md:p-4">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">Vision</h2>
            <p className="mb-4 text-sm md:text-base">
              To set the global standard in premium pool infrastructure - where innovation shapes possibility, elegance defines experience and excellence is simply the baseline.
            </p>

          </div>
          <div className="w-full lg:w-1/2 p-2 md:p-4  rounded-xl flex justify-center">
            <Image unoptimized
              src="/Catalogue.png"
              width={500}
              height={400}
              alt="Catalogue Preview"
              className="object-contain w-full h-auto max-w-sm md:max-w-md lg:max-w-lg"
            />
          </div>
        </div>
      </div>

      <section className="py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-[#385785] text-center mb-12">Values</h1>
        <section className="max-w-7xl mx-auto p-20 px-4 sm:px-6 lg:px-0 rounded-2xl flex justify-center items-center bg-[#385785]">
          <div className="grid grid-cols-1 w-full p-4 max-w-6xl mx-auto md:grid-cols-2 lg:grid-cols-4 gap-4">

            {values.map((value) => (

              <div key={value.title} className="  flex flex-col items-center justify-center">
                <div className="w-full bg-[#C7DAE7] rounded-2xl h-52 p-4 mx-auto flex items-center justify-center">
                  <Image unoptimized src={value.image} alt={value.title} width={100} height={100} />
                </div>

                <h3 className="text-lg font-bold text-[#FCF6E5] my-2">{value.title}</h3>
              </div>


            ))}
          </div>
        </section>
      </section>

      <ContactForm />

      <CTA />
      <Footer />
    </main>
  )
}

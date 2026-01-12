import { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/sections/footer"
import { FAQStructuredData } from "@/components/seo-content"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
    title: "Frequently Asked Questions | Noble Nautica Pool & Spa Equipment",
    description: "Find answers to common questions about Noble Nautica's premium pool and spa equipment, installation, maintenance, and support. Get expert guidance for your aquatic infrastructure projects.",
    keywords: [
        "pool equipment faq",
        "spa equipment questions",
        "aquatic infrastructure help",
        "pool installation questions",
        "pool maintenance faq",
        "pool equipment support",
        "spa equipment support",
        "pool contractor questions",
        "aquatic engineering help",
        "pool equipment troubleshooting"
    ],
    openGraph: {
        title: "Frequently Asked Questions | Noble Nautica Pool & Spa Equipment",
        description: "Find answers to common questions about Noble Nautica's premium pool and spa equipment, installation, maintenance, and support.",
        url: "https://noblenautica.com/faq",
        images: [
            {
                url: "/logo.svg",
                width: 1200,
                height: 630,
                alt: "Noble Nautica FAQ - Pool & Spa Equipment Questions",
            },
        ],
    },
    twitter: {
        title: "Frequently Asked Questions | Noble Nautica Pool & Spa Equipment",
        description: "Find answers to common questions about Noble Nautica's premium pool and spa equipment, installation, maintenance, and support.",
        images: ["/logo.svg"],
    },
    alternates: {
        canonical: "https://noblenautica.com/faq",
    },
}

const faqs = [
    {
        question: "What types of pool equipment does Noble Nautica provide?",
        answer: "Noble Nautica provides a comprehensive range of premium pool and spa equipment including filtration systems, lighting solutions, water treatment equipment, automation systems, pumps, covers, and accessories. We specialize in precision-engineered systems for Olympic-sized pools, wellness retreats, and residential projects."
    },
    {
        question: "Do you provide installation services for pool equipment?",
        answer: "While Noble Nautica primarily supplies premium equipment to contractors, architects, and developers, we provide detailed installation guidance and support. We work with a network of certified professionals who can assist with installation and maintenance of our products."
    },
    {
        question: "What regions does Noble Nautica serve?",
        answer: "Noble Nautica serves customers across Europe, the United States, and growing markets including the Indian subcontinent, China, and Southeast Asia. We have established partnerships and distribution networks in these regions to provide local support."
    },
    {
        question: "How can I request a product catalogue?",
        answer: "You can download our comprehensive product catalogue by visiting our contact page and filling out the catalogue request form. Simply provide your contact details and the catalogue will be automatically downloaded to your device."
    },
    {
        question: "What makes Noble Nautica equipment different from competitors?",
        answer: "Noble Nautica equipment is precision-engineered with a focus on innovation, quality, and reliability. Our products are designed for the world's most ambitious projects, featuring AI-enabled systems, seamless glass-edge pools, and future-ready technology that ensures long-term performance."
    },
    {
        question: "Do you offer custom solutions for specific projects?",
        answer: "Yes, Noble Nautica specializes in custom aquatic infrastructure solutions. We work closely with contractors, architects, and developers to create tailored systems that meet specific project requirements, from Olympic-sized pools to luxury wellness retreats."
    },
    {
        question: "What is your warranty policy?",
        answer: "Noble Nautica provides comprehensive warranties on all our products, with specific terms varying by product category. Our commitment to quality ensures that every product performs beautifully for years to come. Contact us for specific warranty information on products you're interested in."
    },
    {
        question: "How can I contact Noble Nautica for technical support?",
        answer: "You can reach our technical support team by emailing noblenautica13@gmail.com or visiting our contact page. We provide expert consultation for aquatic infrastructure projects and are committed to helping you find the perfect solutions for your needs."
    },
    {
        question: "Do you provide training for pool contractors?",
        answer: "Yes, Noble Nautica offers training and educational resources for pool contractors and professionals. We provide detailed product information, installation guides, and ongoing support to ensure proper implementation of our equipment."
    },
    {
        question: "What payment methods do you accept?",
        answer: "Noble Nautica accepts various payment methods including bank transfers, credit cards, and other standard business payment options. Contact our sales team for specific payment terms and methods available in your region."
    }
]

export default function FAQPage() {
    return (
        <main className="min-h-screen">
            <FAQStructuredData faqs={faqs} />
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[50vh] w-full bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url("/contactbg.svg")` }}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-white text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                        Find answers to common questions about our premium pool and spa equipment solutions.
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#385785] mb-4">
                            Common Questions & Answers
                        </h2>
                        <p className="text-[#385785] text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                            Get expert answers to the most frequently asked questions about our products and services.
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-b border-[#C7DAE7]">
                                <AccordionTrigger className="text-left text-[#385785] hover:text-[#6384AA] font-semibold">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-[#385785] text-sm sm:text-base leading-relaxed pt-2">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <div className="text-center mt-12">
                        <p className="text-[#385785] text-sm sm:text-base mb-4">
                            Still have questions? We&apos;re here to help!
                        </p>
                        <a
                            href="/contact"
                            className="inline-block bg-[#385785] text-white px-6 py-3 rounded-lg hover:bg-[#6384AA] transition-colors duration-300"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}

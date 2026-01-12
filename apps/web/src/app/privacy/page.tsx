import { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/sections/footer"

export const metadata: Metadata = {
    title: "Privacy Policy | Noble Nautica",
    description: "Learn about Noble Nautica's privacy policy and how we collect, use, and protect your personal information when you use our website and services.",
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: "https://noblenautica.com/privacy",
    },
}

export default function PrivacyPage() {
    return (
        <main className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[40vh] w-full bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url("/contactbg.svg")` }}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-white text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                        Your privacy is important to us. Learn how we protect your information.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-lg max-w-none">
                        <h2 className="text-2xl font-bold text-[#385785] mb-6">Information We Collect</h2>
                        <p className="text-[#385785] mb-6">
                            We collect information you provide directly to us, such as when you create an account,
                            request a catalogue, contact us, or use our services. This may include your name, email address,
                            phone number, location, and any other information you choose to provide.
                        </p>

                        <h2 className="text-2xl font-bold text-[#385785] mb-6">How We Use Your Information</h2>
                        <p className="text-[#385785] mb-6">
                            We use the information we collect to provide, maintain, and improve our services,
                            communicate with you, process your requests, and provide customer support.
                        </p>

                        <h2 className="text-2xl font-bold text-[#385785] mb-6">Information Sharing</h2>
                        <p className="text-[#385785] mb-6">
                            We do not sell, trade, or otherwise transfer your personal information to third parties
                            without your consent, except as described in this privacy policy or as required by law.
                        </p>

                        <h2 className="text-2xl font-bold text-[#385785] mb-6">Data Security</h2>
                        <p className="text-[#385785] mb-6">
                            We implement appropriate security measures to protect your personal information against
                            unauthorized access, alteration, disclosure, or destruction.
                        </p>

                        <h2 className="text-2xl font-bold text-[#385785] mb-6">Contact Us</h2>
                        <p className="text-[#385785] mb-6">
                            If you have any questions about this privacy policy, please contact us at
                            <a href="mailto:noblenautica13@gmail.com" className="text-[#6384AA] hover:underline">
                                noblenautica13@gmail.com
                            </a>
                        </p>

                        <p className="text-sm text-gray-600 mt-8">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}

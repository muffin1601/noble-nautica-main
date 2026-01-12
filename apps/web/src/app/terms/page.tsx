import { Metadata } from "next"
import Navbar from "@/components/navbar"
import Footer from "@/sections/footer"

export const metadata: Metadata = {
    title: "Terms of Service | Noble Nautica",
    description: "Read Noble Nautica's terms of service and conditions for using our website and services. Understand your rights and responsibilities when engaging with our platform.",
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: "https://noblenautica.com/terms",
    },
}

export default function TermsPage() {
    return (
        <main className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[40vh] w-full bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url("/contactbg.svg")` }}>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-white text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                        Please read these terms carefully before using our services.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-lg max-w-none">
                        <h2 className="text-2xl font-bold text-[#385785] mb-6">Acceptance of Terms</h2>
                        <p className="text-[#385785] mb-6">
                            By accessing and using this website, you accept and agree to be bound by the terms
                            and provision of this agreement. If you do not agree to abide by the above,
                            please do not use this service.
                        </p>

                        <h2 className="text-2xl font-bold text-[#385785] mb-6">Use License</h2>
                        <p className="text-[#385785] mb-6">
                            Permission is granted to temporarily download one copy of the materials on Noble Nautica&apos;s
                            website for personal, non-commercial transitory viewing only. This is the grant of a license,
                            not a transfer of title.
                        </p>

                        <h2 className="text-2xl font-bold text-[#385785] mb-6">Disclaimer</h2>
                        <p className="text-[#385785] mb-6">
                            The materials on Noble Nautica&apos;s website are provided on an &apos;as is&apos; basis.
                            Noble Nautica makes no warranties, expressed or implied, and hereby disclaims
                            and negates all other warranties including without limitation, implied warranties
                            or conditions of merchantability, fitness for a particular purpose, or non-infringement
                            of intellectual property or other violation of rights.
                        </p>

                        <h2 className="text-2xl font-bold text-[#385785] mb-6">Limitations</h2>
                        <p className="text-[#385785] mb-6">
                            In no event shall Noble Nautica or its suppliers be liable for any damages
                            (including, without limitation, damages for loss of data or profit, or due to
                            business interruption) arising out of the use or inability to use the materials
                            on Noble Nautica&apos;s website.
                        </p>

                        <h2 className="text-2xl font-bold text-[#385785] mb-6">Contact Information</h2>
                        <p className="text-[#385785] mb-6">
                            If you have any questions about these terms of service, please contact us at
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

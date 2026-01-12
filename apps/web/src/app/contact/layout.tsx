import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Contact Noble Nautica | Get In Touch for Pool & Spa Solutions",
    description: "Contact Noble Nautica for premium pool and spa equipment solutions. Located in Ruislip, UK, we provide expert consultation for aquatic infrastructure projects. Download our comprehensive catalogue or get in touch for personalized service.",
    keywords: [
        "contact noble nautica",
        "pool equipment consultation",
        "spa equipment contact",
        "aquatic infrastructure support",
        "pool contractor consultation",
        "pool equipment catalogue",
        "noble nautica contact",
        "pool solutions contact",
        "aquatic engineering support",
        "pool equipment uk"
    ],
    openGraph: {
        title: "Contact Noble Nautica | Get In Touch for Pool & Spa Solutions",
        description: "Contact Noble Nautica for premium pool and spa equipment solutions. Located in Ruislip, UK, we provide expert consultation for aquatic infrastructure projects.",
        url: "https://noblenautica.com/contact",
        images: [
            {
                url: "/contactbg.svg",
                width: 1200,
                height: 630,
                alt: "Contact Noble Nautica - Pool & Spa Solutions",
            },
        ],
    },
    twitter: {
        title: "Contact Noble Nautica | Get In Touch for Pool & Spa Solutions",
        description: "Contact Noble Nautica for premium pool and spa equipment solutions. Expert consultation for aquatic infrastructure projects.",
        images: ["/contactbg.svg"],
    },
    alternates: {
        canonical: "https://noblenautica.com/contact",
    },
}

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}

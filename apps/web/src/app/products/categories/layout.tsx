import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Pool & Spa Product Categories | Premium Aquatic Equipment",
    description: "Explore Noble Nautica's comprehensive range of premium pool and spa equipment categories. From filtration systems to lighting, automation, and accessories - discover professional-grade aquatic infrastructure solutions.",
    keywords: [
        "pool equipment categories",
        "spa equipment categories",
        "pool filtration systems",
        "pool lighting equipment",
        "pool automation systems",
        "water treatment equipment",
        "pool accessories",
        "spa accessories",
        "aquatic equipment categories",
        "pool equipment types",
        "professional pool equipment",
        "premium pool products"
    ],
    openGraph: {
        title: "Pool & Spa Product Categories | Premium Aquatic Equipment",
        description: "Explore Noble Nautica's comprehensive range of premium pool and spa equipment categories. From filtration systems to lighting, automation, and accessories.",
        url: "https://noblenautica.com/products/categories",
        images: [
            {
                url: "/productbg.svg",
                width: 1200,
                height: 630,
                alt: "Pool & Spa Product Categories - Noble Nautica",
            },
        ],
    },
    twitter: {
        title: "Pool & Spa Product Categories | Premium Aquatic Equipment",
        description: "Explore Noble Nautica's comprehensive range of premium pool and spa equipment categories.",
        images: ["/productbg.svg"],
    },
    alternates: {
        canonical: "https://noblenautica.com/products/categories",
    },
}

export default function CategoriesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}

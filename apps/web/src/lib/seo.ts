import { Metadata } from 'next'

interface SEOConfig {
    title: string
    description: string
    keywords?: string[]
    image?: string
    url?: string
    type?: 'website' | 'article' | 'product'
    publishedTime?: string
    modifiedTime?: string
    author?: string
    section?: string
    tags?: string[]
}

export function generateMetadata(config: SEOConfig): Metadata {
    const {
        title,
        description,
        keywords = [],
        image = '/logo.svg',
        url,
        type = 'website',
        publishedTime,
        modifiedTime,
        author,
        section,
        tags = []
    } = config

    const baseUrl = 'https://noblenautica.com'
    const fullUrl = url ? `${baseUrl}${url}` : baseUrl
    const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

    return {
        title,
        description,
        keywords: [
            ...keywords,
            'noble nautica',
            'pool equipment',
            'spa equipment',
            'aquatic infrastructure',
            'premium pool products'
        ],
        openGraph: {
            title,
            description,
            url: fullUrl,
            siteName: 'Noble Nautica',
            images: [
                {
                    url: fullImageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: 'en_US',
            type: type === 'product' ? 'website' : type,
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime }),
            ...(author && { authors: [{ name: author }] }),
            ...(section && { section }),
            ...(tags.length > 0 && { tags }),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [fullImageUrl],
        },
        alternates: {
            canonical: fullUrl,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    }
}

export const defaultKeywords = [
    'pool equipment',
    'spa equipment',
    'aquatic infrastructure',
    'pool filtration systems',
    'pool lighting',
    'water treatment',
    'pool automation',
    'premium pool products',
    'pool contractors',
    'aquatic engineering',
    'wellness infrastructure',
    'pool accessories',
    'marine equipment',
    'pool pumps',
    'pool covers',
    'noble nautica'
]

export function generateBreadcrumbData(items: Array<{ name: string; url: string }>) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `https://noblenautica.com${item.url}`
        }))
    }
}

export function generateFAQData(faqs: Array<{ question: string; answer: string }>) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    }
}

export function generateProductData(product: {
    name: string
    description: string
    image: string
    category: string
    price?: number
    availability?: string
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.image,
        "brand": {
            "@type": "Brand",
            "name": "Noble Nautica"
        },
        "category": product.category,
        "offers": {
            "@type": "Offer",
            "availability": product.availability || "https://schema.org/InStock",
            "priceCurrency": "GBP",
            ...(product.price && { "price": product.price }),
            "seller": {
                "@type": "Organization",
                "name": "Noble Nautica"
            }
        }
    }
}

export function generateLocalBusinessData() {
    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Noble Nautica",
        "description": "Premium aquatic and wellness infrastructure solutions",
        "url": "https://noblenautica.com",
        "telephone": "+44-20-0000-0000",
        "email": "noblenautica13@gmail.com",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "9 Hill Lane",
            "addressLocality": "Ruislip",
            "postalCode": "HA4 7JJ",
            "addressCountry": "UK"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "51.5759",
            "longitude": "-0.4214"
        },
        "openingHours": "Mo-Fr 09:00-17:00",
        "priceRange": "$$",
        "paymentAccepted": "Cash, Credit Card, Bank Transfer",
        "currenciesAccepted": "GBP, EUR, USD"
    }
}

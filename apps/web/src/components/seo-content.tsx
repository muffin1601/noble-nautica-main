import Script from 'next/script'

interface SEOContentProps {
    title: string
    description: string
    keywords?: string[]
    structuredData?: Record<string, unknown>
    breadcrumbs?: Array<{ name: string; url: string }>
}

export default function SEOContent({
    title,
    description,
    keywords = [],
    structuredData,
    breadcrumbs
}: SEOContentProps) {
    return (
        <>
            {/* Structured Data */}
            {structuredData && (
                <Script
                    id="structured-data"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData)
                    }}
                />
            )}

            {/* Breadcrumb Structured Data */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Script
                    id="breadcrumb-structured-data"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            "itemListElement": breadcrumbs.map((item: { name: string; url: string }, index: number) => ({
                                "@type": "ListItem",
                                "position": index + 1,
                                "name": item.name,
                                "item": `https://noblenautica.com${item.url}`
                            }))
                        })
                    }}
                />
            )}

            {/* SEO Content */}
            <div className="sr-only">
                <h1>{title}</h1>
                <p>{description}</p>
                {keywords.length > 0 && (
                    <div>
                        <span>Keywords: </span>
                        <span>{keywords.join(', ')}</span>
                    </div>
                )}
            </div>
        </>
    )
}

// FAQ Component for structured data
interface FAQProps {
    faqs: Array<{ question: string; answer: string }>
}

export function FAQStructuredData({ faqs }: FAQProps) {
    return (
        <Script
            id="faq-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
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
                })
            }}
        />
    )
}

// Product structured data component
interface ProductStructuredDataProps {
    product: {
        name: string
        description: string
        image: string
        category: string
        price?: number
        availability?: string
        sku?: string
        brand?: string
    }
}

export function ProductStructuredData({ product }: ProductStructuredDataProps) {
    return (
        <Script
            id="product-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": product.name,
                    "description": product.description,
                    "image": product.image,
                    "sku": product.sku,
                    "brand": {
                        "@type": "Brand",
                        "name": product.brand || "Noble Nautica"
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
                })
            }}
        />
    )
}

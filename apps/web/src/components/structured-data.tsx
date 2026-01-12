import Script from 'next/script'

interface StructuredDataProps {
    type: 'organization' | 'website' | 'product' | 'breadcrumb' | 'faq' | 'contact'
    data: Record<string, unknown>
}

export default function StructuredData({ type, data }: StructuredDataProps) {
    const getStructuredData = () => {
        switch (type) {
            case 'organization':
                return {
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "Noble Nautica",
                    "description": "Premium aquatic and wellness infrastructure solutions for ambitious projects worldwide",
                    "url": "https://noblenautica.com",
                    "logo": "https://noblenautica.com/logo.svg",
                    "image": "https://noblenautica.com/logo.svg",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "9 Hill Lane",
                        "addressLocality": "Ruislip",
                        "postalCode": "HA4 7JJ",
                        "addressCountry": "UK"
                    },
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "telephone": "+44-20-0000-0000",
                        "contactType": "customer service",
                        "email": "noblenautica13@gmail.com",
                        "availableLanguage": "English"
                    },
                    "sameAs": [
                        "https://www.linkedin.com/company/noble-nautica",
                        "https://www.instagram.com/noblenautica"
                    ],
                    "foundingDate": "2020",
                    "numberOfEmployees": "10-50",
                    "industry": "Aquatic Infrastructure",
                    "areaServed": [
                        "Europe",
                        "United States",
                        "India",
                        "China",
                        "Southeast Asia"
                    ]
                }

            case 'website':
                return {
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": "Noble Nautica",
                    "description": "Premium pool and spa equipment solutions",
                    "url": "https://noblenautica.com",
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": "https://noblenautica.com/products/categories?search={search_term_string}",
                        "query-input": "required name=search_term_string"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Noble Nautica",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://noblenautica.com/logo.svg"
                        }
                    }
                }

            case 'product':
                return {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": data.name,
                    "description": data.description,
                    "image": data.image,
                    "brand": {
                        "@type": "Brand",
                        "name": "Noble Nautica"
                    },
                    "category": data.category,
                    "offers": {
                        "@type": "Offer",
                        "availability": "https://schema.org/InStock",
                        "priceCurrency": "GBP",
                        "seller": {
                            "@type": "Organization",
                            "name": "Noble Nautica"
                        }
                    }
                }

            case 'breadcrumb':
                return {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": (data as unknown as Array<{ name: string; url: string }>).map((item, index: number) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "name": item.name,
                        "item": item.url
                    }))
                }

            case 'faq':
                return {
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": (data as unknown as Array<{ question: string; answer: string }>).map((faq) => ({
                        "@type": "Question",
                        "name": faq.question,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": faq.answer
                        }
                    }))
                }

            case 'contact':
                return {
                    "@context": "https://schema.org",
                    "@type": "ContactPage",
                    "name": "Contact Noble Nautica",
                    "description": "Get in touch with Noble Nautica for premium pool and spa equipment solutions",
                    "url": "https://noblenautica.com/contact",
                    "mainEntity": {
                        "@type": "Organization",
                        "name": "Noble Nautica",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "9 Hill Lane",
                            "addressLocality": "Ruislip",
                            "postalCode": "HA4 7JJ",
                            "addressCountry": "UK"
                        },
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": "+44-20-0000-0000",
                            "contactType": "customer service",
                            "email": "noblenautica13@gmail.com"
                        }
                    }
                }

            default:
                return {}
        }
    }

    return (
        <Script
            id={`structured-data-${type}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(getStructuredData())
            }}
        />
    )
}

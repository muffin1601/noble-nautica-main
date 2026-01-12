import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Noble Nautica - Premium Pool & Spa Equipment',
        short_name: 'Noble Nautica',
        description: 'Premium aquatic and wellness infrastructure solutions for ambitious projects worldwide',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#385785',
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
            {
                src: '/favicon.ico',
                sizes: '16x16 32x32',
                type: 'image/x-icon',
            },
        ],
        categories: ['business', 'productivity', 'utilities'],
        lang: 'en',
        orientation: 'portrait-primary',
        scope: '/',
    }
}

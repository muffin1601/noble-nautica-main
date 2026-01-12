// import * as dotenv from 'dotenv'
// import * as path from 'path'
// import { createClient } from '@supabase/supabase-js'

// // Load environment variables from .env.local
// dotenv.config({ path: path.join(__dirname, '../../.env.local') })

// // Storage bucket names
// const STORAGE_BUCKETS = {
//     PRODUCT_IMAGES: 'product-images',
//     PRODUCT_VIDEOS: 'product-videos',
//     PRODUCT_DOCUMENTS: 'product-documents',
//     PRODUCT_SCHEMATICS: 'product-schematics',
//     PRODUCT_DIMENSIONS: 'product-dimensions',
//     PRODUCT_CHARTS: 'product-charts',
//     PRODUCT_MODELS: 'product-models',
//     PRODUCT_CATALOGUES: 'product-catalogues'
// } as const

// async function createStorageBucketsWithClient(supabaseClient: ReturnType<typeof createClient>) {
//     const buckets = Object.values(STORAGE_BUCKETS)

//     for (const bucket of buckets) {
//         try {
//             console.log(`Creating bucket: ${bucket}...`)
//             const { error } = await supabaseClient.storage.createBucket(bucket, {
//                 public: true,
//                 allowedMimeTypes: [
//                     'image/*',
//                     'video/*',
//                     'application/pdf',
//                     'application/msword',
//                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//                 ],
//                 fileSizeLimit: 52428800 // 50MB
//             })

//             if (error && !error.message.includes('already exists')) {
//                 console.error(`❌ Failed to create bucket ${bucket}:`, error.message)
//             } else if (error && error.message.includes('already exists')) {
//                 console.log(`✅ Bucket ${bucket} already exists`)
//             } else {
//                 console.log(`✅ Created bucket ${bucket}`)
//             }
//         } catch (error) {
//             console.error(`❌ Error creating bucket ${bucket}:`, error)
//         }
//     }
// }

// async function setupStorage() {
//     console.log('Setting up Supabase storage buckets...')
//     console.log('')

//     // Check if environment variables are set
//     const supabaseUrl = "https://cthovkpojgsjpzojbeln.supabase.co"
//     const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aG92a3BvamdzanB6b2piZWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTc1NjAsImV4cCI6MjA2NjA5MzU2MH0.vhR9jcL0bth_NcsMisIJA_pLFJ_TPe0gSObBG-WlnDU"

//     if (!supabaseUrl || !supabaseKey) {
//         console.error('❌ Environment variables not found!')
//         console.error('')
//         console.error('Please create a .env.local file in the apps/admin directory with:')
//         console.error('')
//         console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co')
//         console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here')
//         console.error('')
//         console.error('You can find these values in your Supabase Dashboard > Settings > API')
//         process.exit(1)
//     }

//     console.log('✅ Environment variables loaded')
//     console.log(`📡 Supabase URL: ${supabaseUrl}`)
//     console.log('')

//     // Create Supabase client specifically for this script
//     const supabase = createClient(supabaseUrl, supabaseKey)

//     try {
//         await createStorageBucketsWithClient(supabase)
//         console.log('')
//         console.log('✅ Storage buckets setup completed!')
//         console.log('')
//         console.log('Created buckets:')
//         console.log('- product-images (for product photos)')
//         console.log('- product-videos (for product videos)')
//         console.log('- product-documents (for PDFs, manuals, certificates)')
//         console.log('- product-schematics (for technical diagrams)')
//         console.log('- product-dimensions (for dimension drawings)')
//         console.log('- product-charts (for performance charts)')
//         console.log('')
//         console.log('All buckets are configured as public with the following limits:')
//         console.log('- Max file size: 50MB')
//         console.log('- Allowed types: images, videos, PDFs, documents')
//         console.log('')
//         console.log('🎉 Setup complete! You can now upload files in your admin panel.')
//     } catch (error) {
//         console.error('❌ Failed to setup storage buckets:', error)
//         console.error('')
//         if (error instanceof Error && error.message.includes('JWT')) {
//             console.error('This might be a permissions issue. Make sure your Supabase API key has the correct permissions.')
//         }
//         console.error('You can also create the buckets manually in your Supabase Dashboard > Storage')
//         process.exit(1)
//     }
// }

// // Run the setup
// setupStorage() 
import Navbar from "@/components/navbar"
import { Loader2 } from "lucide-react"

export default function CategoryProductsLoading() {
    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="h-screen w-full bg-cover bg-center" style={{ backgroundImage: `url("/productbg.svg")` }}>
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                        <p className="text-white text-lg">Loading products...</p>
                    </div>
                </div>
            </div>
        </main>
    )
} 
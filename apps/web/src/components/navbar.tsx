"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Menu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface NavItem {
    name: string
    href: string
}

const navItems: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products/categories" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
]

const Navbar: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
    }

    const cn = (...classes: (string | boolean | undefined)[]) => {
        return classes.filter(Boolean).join(" ")
    }

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 p-4 mx-auto text-gray-800 left-0 right-0 z-50 transition-all duration-300"
                )}
            >
                <div className="lg:px-8 px-4 flex items-center justify-between rounded-xl max-w-7xl mx-auto bg-white/50 backdrop-blur-sm py-3">
                    <div className="flex items-center w-full justify-between gap-8">
                        <Link href="/" className="font-bold text-2xl">
                            <Image
                                src="/logo.svg"
                                className="w-40"
                                alt="Noble Nautica Logo"
                                width={160}
                                height={40}
                                priority
                            />
                        </Link>
                        <nav className="hidden lg:flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="px-4 py-2 rounded-md flex items-center capitalize gap-1 transition-colors hover:bg-gray-100 hover:text-sky-600"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        aria-expanded={mobileMenuOpen}
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" aria-hidden="true" />
                        ) : (
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </header>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="fixed inset-0 z-[99] lg:hidden bg-black/20 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMobileMenu}
                    >
                        <motion.div
                            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto shadow-xl"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 flex justify-between items-center border-b border-gray-100">
                                <Link href="/" className="font-bold text-2xl" onClick={closeMobileMenu}>
                                    <Image
                                        src="/logo.svg"
                                        width={96}
                                        height={32}
                                        className="w-24"
                                        alt="Noble Nautica"
                                    />
                                </Link>
                                <button
                                    onClick={closeMobileMenu}
                                    className="text-gray-700 hover:text-sky-500 p-2 rounded-md hover:bg-gray-100"
                                    aria-label="Close mobile menu"
                                >
                                    <X className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4 bg-white mx-auto text-gray-800">
                                {navItems.map((item) => (
                                    <div key={item.name} className="border-b border-gray-100 pb-4 last:border-b-0">
                                        <Link
                                            href={item.href}
                                            className="block py-2 text-lg font-medium hover:text-sky-600 transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            {item.name}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Navbar
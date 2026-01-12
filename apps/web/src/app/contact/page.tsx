"use client"

import Navbar from "@/components/navbar"
import Footer from "@/sections/footer"
import { Button } from "@/components/ui/button"
import ContactForm from "@/components/ContactForm"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from "react"
import StructuredData from "@/components/structured-data"

export default function ContactPage() {

  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    location: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [, setShowDownloadButton] = useState(false)
  const [pdfAvailable, setPdfAvailable] = useState(true)
  const [pdfChecking, setPdfChecking] = useState(true)

  const checkPdfAvailability = async () => {
    try {
      setPdfChecking(true)
      const response = await fetch('/api/catalogue')
      if (response.ok) {
        setPdfAvailable(true)
      } else {
        setPdfAvailable(false)
      }
    } catch (error) {
      console.error('Failed to check PDF availability:', error)
      setPdfAvailable(false)
    } finally {
      setPdfChecking(false)
    }
  }

  useEffect(() => {
    checkPdfAvailability()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name?.trim() || !formData.number?.trim() || !formData.email?.trim() || !formData.location?.trim()) {
      alert('Please fill in all fields')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/catalogue-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          productId: null,
          productName: 'Catalogue (General)',
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        // Download the catalogue from our API route
        try {
          const link = window.document.createElement('a')
          link.href = '/api/catalogue'
          link.download = 'catalogue.pdf'
          link.click()
        } catch (downloadError) {
          console.error('Failed to download catalogue:', downloadError)
          // Show error message if download fails
          alert('Form submitted successfully, but there was an issue with the automatic download. Please use the manual download button below.')
        }

        // Reset form and close dialog
        setFormData({ name: '', number: '', email: '', location: '' })
        setDialogOpen(false)
        setShowDownloadButton(true)
        alert('Thank you! Your catalogue download will begin shortly.')
      } else {
        const errorData = await response.text()
        console.error('Catalogue request failed:', response.status, errorData)
        alert('Failed to submit request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting catalogue request:', error)
      alert('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <main className="min-h-screen">
      <StructuredData type="contact" data={{}} />
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[50vh] w-full bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url("/contactbg.svg")` }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            Get In Touch
          </h1>
          <p className="text-white text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Ready to transform your aquatic space? Let&apos;s discuss your project and find the perfect solutions.
          </p>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#385785] mb-4 sm:mb-6">
              Our Location
            </h2>
            <p className="text-[#385785] text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Find the perfect solutions for your pool needs. We&apos;re here to help you create the aquatic space of your dreams.
            </p>
          </div>

          {/* <div className="flex justify-center mb-8 sm:mb-12">
            <Button className="bg-[#385785] text-white px-6 sm:px-8 py-3 sm:py-4 hover:bg-[#385785] text-sm sm:text-base font-medium">
              FIND US ON MAP
            </Button>
          </div> */}

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-0 sm:gap-8 lg:gap-12 max-w-6xl lg:mx-auto mx-8">


            <div className="flex flex-col items-center text-center p-6 sm:p-8 border-t border-[#385785]">

              <h3 className="text-[#385785] text-lg sm:text-xl font-semibold ">
                Address
              </h3>
              <p className="text-[#385785] text-xs sm:text-sm  opacity-80">
                Visit us at our office location
              </p>
              <p className="text-[#385785] text-base sm:text-lg font-semibold">
                9 Hill Lane , Ruislip , HA4 7JJ, UK
              </p>
            </div>

            <a href="mailto:noblenautica13@gmail.com" className="flex flex-col items-center text-center p-6 sm:p-8 border-t border-[#385785]">

              <h3 className="text-[#385785] text-lg sm:text-xl font-semibold ">
                Send a Mail
              </h3>
              <p className="text-[#385785] text-xs sm:text-sm opacity-80">
                General enquiries for you
              </p>
              <p className="text-[#385785] text-base sm:text-lg font-semibold">
                noblenautica13@gmail.com
              </p>
            </a>

            {/* <a href="https://wa.me/+919999839999" className="flex flex-col items-center text-center p-6 sm:p-8 border-t border-[#385785] sm:col-span-2 lg:col-span-1">
       
              <h3 className="text-[#385785] text-lg sm:text-xl font-semibold ">
                Chat with Us
              </h3>
              <p className="text-[#385785] text-xs sm:text-sm  opacity-80">
                General enquiries for you
              </p>
              <p className="text-[#385785] text-base sm:text-lg font-semibold">
              9999839999
              </p>

            </a> */}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <ContactForm />
      </section>


      {/* Catalogue Section */}
      <section className="py-6 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#385785] mb-4 sm:mb-6">
              Explore Our Catalogue
            </h2>
            <p className="text-[#385785] text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Discover a wide range of products and solutions tailored for your pool requirements.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (open) {
              setShowDownloadButton(false)
            }
          }}>
            <DialogTrigger asChild>
              <div className="flex justify-center">
                <Button
                  className="bg-[#385785] text-lg text-white px-6 md:px-12 py-3 md:py-8 rounded hover:bg-[#385785] w-full sm:w-auto"
                  disabled={!pdfAvailable || pdfChecking}
                >
                  {pdfChecking ? 'Checking...' : pdfAvailable ? 'Download Now' : 'Catalogue Unavailable'}
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Download Catalogue</DialogTitle>
                <DialogDescription>
                  Please fill in your details to download the catalogue.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Phone Number *</Label>
                  <Input
                    id="number"
                    name="number"
                    type="tel"
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter your city/location"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Download Catalogue'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>


        </div>
      </section>

      <Footer />
    </main>
  )
}

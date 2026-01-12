"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

const Catelog = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    location: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDownloadButton, setShowDownloadButton] = useState(false)
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
    <div className="flex px-4 sm:px-6 lg:px-0 items-center justify-center py-12">
      <div className="bg-[#6384AA] max-w-7xl gap-8 mx-auto text-white p-4 md:p-6 lg:p-8 rounded-xl shadow-lg flex flex-col lg:flex-row items-center w-full">
        <div className="w-full lg:w-1/2 p-2 md:p-4">
          <h2 className="text-xl md:text-2xl lg:text-5xl font-bold mb-4">Our Catalogue</h2>
          <p className="mb-4 text-sm md:text-lg">
            Our digital catalogue redefines product discovery, visually immersive, technically robust, and intuitively structured. From spec sheets to standout visuals, everything you need to specify with confidence, all in one place.
          </p>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (open) {
              setShowDownloadButton(false)
            }
          }}>
            <DialogTrigger asChild>
              <Button
                className="bg-[#385785] text-lg  text-white px-6 md:px-12 py-3 md:py-8 rounded hover:bg-[#385785] w-full sm:w-auto"
                disabled={!pdfAvailable || pdfChecking}
              >
                {pdfChecking ? 'Checking...' : pdfAvailable ? 'Download Now' : 'Catalogue Unavailable'}
              </Button>
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



          {/* Error message if PDF is not available */}
          {showDownloadButton && !pdfAvailable && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 mb-3">Thank you for your submission! However, the catalogue PDF is currently unavailable. Please try again later or contact support.</p>
            </div>
          )}
        </div>
        <div className="w-full lg:w-1/2 p-2 md:p-4 flex justify-center">
          <Image unoptimized
            src="/Catalogue.png"
            width={500}
            height={400}
            alt="Catalogue Preview"
            className="object-contain w-full rounded-xl  h-auto max-w-sm md:max-w-md lg:max-w-lg"
          />
        </div>
      </div>
    </div>
  )
}

export default Catelog  
"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import React, { useState } from 'react'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('')
    setError('')
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Thank you for subscribing!')
        setEmail('')
      } else {
        setError(data.error || 'Something went wrong.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer
      style={{
        backgroundImage: `url("/footer.svg")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      className='py-16 sm:py-20 md:py-24 lg:py-32 bg-[#385785] px-4 sm:px-6 md:px-8'
    >
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-12'>
          {/* Logo Section */}
          <div className='flex flex-col items-center lg:items-start order-2 lg:order-1'>
            <Image
              src="/icon.svg"
              alt="Noble Nautica Logo"
              width={120}
              height={120}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32"
              priority
            />
          </div>

          {/* Newsletter Section */}
          <div className='flex flex-col text-white items-center lg:items-end justify-center order-1 lg:order-2 w-full lg:w-auto'>
            <div className='flex flex-col gap-4 w-full max-w-md lg:max-w-none'>
              <div className='text-center lg:text-right'>
                <h2 className='text-xl sm:text-2xl md:text-3xl font-bold mb-2'>
                  Subscribe To Our Newsletter
                </h2>
                <p className='text-sm sm:text-base text-gray-200'>
                  Be the first to know about new arrivals and offers
                </p>
              </div>

              <form className='flex flex-col sm:flex-row gap-3 w-full' onSubmit={handleSubmit}>
                <Input
                  className='bg-white text-black flex-1 min-w-0'
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <Button
                  className="w-full sm:w-auto bg-[#6384AA] hover:bg-[#6384AA]/90 transition-colors"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>

              {/* Status Messages */}
              {success && (
                <div className="text-green-200 text-sm text-center lg:text-right">
                  {success}
                </div>
              )}
              {error && (
                <div className="text-red-200 text-sm text-center lg:text-right">
                  {error}
                </div>
              )}

              <div className='flex flex-col items-center lg:items-start pt-4 order-2 lg:order-1'>
                <Image
                  src="/whitelast-2.webp"
                  alt="Noble Nautica Logo"
                  width={500}
                  height={500}
                  className="w-28 mx-auto"
                  priority
                />
              </div>
              {/* Social Media Icons */}
              {/* <div className='flex items-center justify-center lg:justify-end gap-3 mt-4'>
                <a
                  href="mailto:info@noblenautica.com"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Email us"
                >
                  <Image
                    src="/mail.png"
                    alt="Email"
                    width={24}
                    height={24}
                    className='w-5 h-5 sm:w-6 sm:h-6'
                  />
                </a>
                <a
                  href="https://twitter.com/noblenautica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Follow us on X (Twitter)"
                >
                  <Image
                    src="/x.png"
                    alt="X (Twitter)"
                    width={24}
                    height={24}
                    className='w-5 h-5 sm:w-6 sm:h-6'
                  />
                </a>
                <a
                  href="https://instagram.com/noblenautica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <Image
                    src="/insta.png"
                    alt="Instagram"
                    width={24}
                    height={24}
                    className='w-5 h-5 sm:w-6 sm:h-6'
                  />
                </a>
                <a
                  href="https://youtube.com/@noblenautica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <Image
                    src="/utube.png"
                    alt="YouTube"
                    width={24}
                    height={24}
                    className='w-5 h-5 sm:w-6 sm:h-6'
                  />
                </a>
                <a
                  href="https://linkedin.com/company/noblenautica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Follow us on LinkedIn"
                >
                  <Image
                    src="/linkedin.png"
                    alt="LinkedIn"
                    width={24}
                    height={24}
                    className='w-5 h-5 sm:w-6 sm:h-6'
                  />
                </a>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
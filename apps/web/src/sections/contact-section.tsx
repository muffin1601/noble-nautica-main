"use client"

        
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
]

export default function ContactSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-600/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div
           
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch for Your Pool Business</h2>
              <h3 className="text-xl text-sky-400 mb-6">Talk to us today</h3>
              <p className="text-slate-300 leading-relaxed">
                Ready to elevate your pool business with our premium equipment and technology solutions? Our expert team
                is here to help you find the perfect products for your needs.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-slate-300">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-slate-300">info@noblenautica.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-slate-300">123 Marina Drive, Coastal City, CC 12345</p>
                </div>
              </div>
            </div>

            <Button size="lg" className="bg-sky-600 hover:bg-sky-700">
              Contact Us
            </Button>
          </div>

          {/* Newsletter Signup */}
          <div
           
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Subscribe To Our Newsletter</h3>
                <p className="text-slate-300 mb-6">Be the first to know about new arrivals and offers</p>

                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                  <Button size="lg" className="w-full bg-sky-600 hover:bg-sky-700">
                    Subscribe
                  </Button>
                </div>              

                <div className="mt-8">
                  <p className="text-sm text-slate-400 mb-4">Follow us on social media</p>
                  <div className="flex space-x-4">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        className="w-10 h-10 bg-white/10 hover:bg-sky-600 rounded-full flex items-center justify-center transition-colors duration-300"
                        aria-label={social.label}
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

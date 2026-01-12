"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import emailjs from '@emailjs/browser';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    enquiry: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // EmailJS configuration - get from environment variables
      const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateID = 'template_jq6vfk5';
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      // Check if environment variables are set
      if (!serviceID || !publicKey) {
        throw new Error('EmailJS configuration is missing. Please set NEXT_PUBLIC_EMAILJS_SERVICE_ID and NEXT_PUBLIC_EMAILJS_PUBLIC_KEY in your environment variables.');
      }

      // Template parameters matching your EmailJS template
      const templateParams = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        enquiryType: formData.enquiry,
        message: formData.message
      };

      const response = await emailjs.send(
        serviceID,
        templateID,
        templateParams,
        publicKey
      );

      if (response.status === 200) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          name: '',
          email: '',
          mobile: '',
          enquiry: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('EmailJS error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=" h-fit lg:min-h-screen flex items-center justify-center p-4 py-6">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#385785] mb-2">
            Get in Touch
          </h1>
        </div>

        {/* Form Container */}
        <div className="bg-[#C7DAE7] backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="mb-6">
            <p className="text-slate-600 text-lg italic mb-2">Partnership</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-700">
              Send your message
            </h2>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">Message sent successfully! We&apos;ll get back to you soon.</span>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">Failed to send message. Please try again or contact us directly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-white border-0 rounded-lg px-4 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-600 focus:ring-offset-0 text-slate-700"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                </div>
              </div>
              <div className="relative">
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-white border-0 rounded-lg px-4 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-600 focus:ring-offset-0 text-slate-700"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  type="tel"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-white border-0 rounded-lg px-4 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-600 focus:ring-offset-0 text-slate-700"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                </div>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  name="enquiry"
                  placeholder="Type of Enquiry"
                  value={formData.enquiry}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-white border-0 rounded-lg px-4 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-600 focus:ring-offset-0 text-slate-700"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Message Field */}
            <div>
              <Textarea
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className="w-full h-44 bg-white border-0 rounded-lg px-4 py-3 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-600 focus:ring-offset-0 text-slate-700 resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#385785] hover:bg-[#385785] text-white px-12 py-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
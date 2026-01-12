import { Button } from '@/components/ui/button'
// import Link from 'next/link'
import React from 'react'

const CTA = () => {
  return (
    <div className='bg-[#6384AA] translate-y-1/3 max-w-7xl mx-auto rounded-2xl px-4 md:px-8  py-8 md:py-16'>
        <div className='max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 lg:gap-0'>
            <div className='flex flex-col text-[#F7F2E7] gap-3 lg:items-left max-w-xl justify-center mb-0 lg:mb-6 text-center lg:text-left'>
                <h2 className='text-md md:text-xl lg:text-left italic'>Get a Quote for Your Pool Business</h2>
                <p className='text-sm md:text-3xl'>Talk to us today.</p>
            </div>
            {/* link to whatsapp */}
            {/* <Link href="https://wa.me/+919999839999">
                <Button className='bg-[#C7DAE7] text-[#385785] px-8 md:px-12 py-4 md:py-6 hover:bg-[#C7DAE7] text-sm md:text-base w-full lg:w-auto'>
                    Contact Our Experts
                </Button>
            </Link> */}

<Button className='bg-[#C7DAE7] text-[#385785] px-8 md:px-12 py-4 md:py-6 hover:bg-[#C7DAE7] text-sm md:text-base w-full lg:w-auto'>
                    Contact Our Experts
                </Button>
        </div>
    </div>
  )
}

export default CTA
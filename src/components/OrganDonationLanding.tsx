"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Heart, Shield, Users } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function OrganDonationLanding() {
  const router = useRouter()

  const handleRegisterClick = () => {
    router.push('/sample')
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 select-none">
              <Heart className="h-6 w-6 text-[#6C8CBF]" />
              <span className="text-xl font-bold text-[#6C8CBF] hover:text-[#5AA7A7] transition-colors select-none">HealSync</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary cursor-pointer">
              How It Works
            </Link>
            <Link href="#why-donate" className="text-sm font-medium hover:text-primary cursor-pointer">
              Why Donate
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary cursor-pointer">
              Testimonials
            </Link>
            <Link href="#security" className="text-sm font-medium hover:text-primary cursor-pointer">
              Security
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button 
              variant="default" 
              className="bg-primary text-white hover:bg-primary-dark cursor-pointer"
              onClick={() => router.push('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary" />
          <div className="container relative flex flex-col items-center justify-center gap-8 py-24 text-center md:py-32">
            <h1 className="text-4xl font-bold tracking-tight text-secondary md:text-6xl">Give the Gift of Life</h1>
            <p className="max-w-[600px] text-lg text-gray-600 md:text-xl">
              Join our mission to connect organ donors with recipients in need.
            </p>
            <Button 
              className="h-12 px-8 text-base bg-primary text-white hover:bg-primary-dark cursor-pointer"
              onClick={() => router.push('/auth')}
            >
              Become a Donor
            </Button>
            <div className="mt-8 flex flex-col items-center gap-4 md:flex-row">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent-lime" />
                <span className="text-sm">100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent-lime" />
                <span className="text-sm">Verified Process</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent-lime" />
                <span className="text-sm">Trusted by Thousands</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-white py-16 md:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-secondary md:text-4xl">How It Works</h2>
              <p className="mt-4 text-gray-600">Three simple steps to make a difference</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Sign Up",
                  description: "Complete our secure registration process to join our donor database.",
                  icon: Users,
                },
                {
                  title: "Get Matched",
                  description: "Our system finds potential matches based on medical compatibility.",
                  icon: CheckCircle,
                },
                {
                  title: "Save a Life",
                  description: "Complete the donation process with support from our medical team.",
                  icon: Heart,
                },
              ].map((step, index) => (
                <Card key={index} className="flex flex-col items-center p-6 text-center shadow-md">
                  <div className="mb-4 rounded-full bg-accent-teal p-3">
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Donate */}
        <section id="why-donate" className="bg-gradient-secondary py-16 md:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-secondary md:text-4xl">Why Donate?</h2>
              <p className="mt-4 text-gray-600">Your decision can transform lives</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Save Multiple Lives",
                  description: "A single donor can save up to 8 lives through organ donation.",
                  bgColor: "bg-accent-lime-light",
                  textColor: "text-accent-lime",
                },
                {
                  title: "Improve Quality of Life",
                  description: "Tissue donations can dramatically improve recipients' quality of life.",
                  bgColor: "bg-accent-yellow-light",
                  textColor: "text-accent-yellow",
                },
                {
                  title: "Leave a Legacy",
                  description: "Your gift continues to make a difference for generations to come.",
                  bgColor: "bg-primary-light",
                  textColor: "text-primary",
                },
                {
                  title: "Help Those in Need",
                  description: "Thousands of people are waiting for life-saving transplants.",
                  bgColor: "bg-accent-lime-light",
                  textColor: "text-accent-lime",
                },
                {
                  title: "It's Free",
                  description: "There is no cost to donors or their families for organ donation.",
                  bgColor: "bg-accent-yellow-light",
                  textColor: "text-accent-yellow",
                },
                {
                  title: "Medical Advancement",
                  description: "Donations contribute to research and medical advancements.",
                  bgColor: "bg-primary-light",
                  textColor: "text-primary",
                },
              ].map((reason, index) => (
                <div key={index} className={`rounded-lg p-6 shadow-md ${reason.bgColor}`}>
                  <h3 className={`mb-2 text-xl font-bold ${reason.textColor}`}>
                    {reason.title}
                  </h3>
                  <p className="text-gray-600">{reason.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="bg-white py-16 md:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-secondary md:text-4xl">Testimonials</h2>
              <p className="mt-4 text-gray-600">Stories from donors and recipients</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Kidney Recipient",
                  quote:
                    "Receiving a kidney transplant gave me a second chance at life. I'm forever grateful to my donor for their selfless gift.",
                  image: "/placeholder.svg?height=80&width=80",
                },
                {
                  name: "Michael Chen",
                  role: "Donor Family Member",
                  quote:
                    "After losing my brother, knowing his organs helped save four lives brings us comfort and meaning to our loss.",
                  image: "/placeholder.svg?height=80&width=80",
                },
              ].map((testimonial, index) => (
                <Card key={index} className="p-6 shadow-md">
                  <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                    <div>
                      <blockquote className="mb-4 italic text-gray-600">"{testimonial.quote}"</blockquote>
                      <div className="font-bold text-secondary">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Transparency */}
        <section id="security" className="bg-gradient-security py-16 md:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-secondary md:text-4xl">Security & Transparency</h2>
              <p className="mt-4 text-gray-600">Your trust is our priority</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold">Blockchain Verification</h3>
                </div>
                <p className="text-gray-600">
                  We use Thirdweb blockchain technology to ensure complete transparency and security in the donation
                  process. Every step is verified and recorded securely.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center gap-3">
                  <Shield className="h-6 w-6 text-secondary" />
                  <h3 className="text-xl font-bold">Data Protection</h3>
                </div>
                <p className="text-gray-600">
                  Your personal and medical information is protected with the highest level of encryption and security
                  protocols, ensuring your privacy at all times.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16">
          <div className="container text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Ready to Make a Difference?</h2>
            <p className="mb-8 text-white opacity-90">Join thousands of donors who have already registered</p>
            <Button 
              variant="secondary" 
              className="h-12 bg-white px-8 text-base text-primary hover:bg-gray-100 cursor-pointer"
              onClick={() => router.push('/auth')}
            >
              Register as a Donor
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 select-none">
                  <Heart className="h-6 w-6 text-[#6C8CBF]" />
                  <span className="text-xl font-bold text-[#6C8CBF] hover:text-[#5AA7A7] transition-colors select-none">HealSync</span>
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Connecting donors and recipients to save lives through secure, transparent organ donation.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase text-gray-500">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary cursor-pointer">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary cursor-pointer">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary cursor-pointer">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary cursor-pointer">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase text-gray-500">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary cursor-pointer">
                    Donation Process
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary cursor-pointer">
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary cursor-pointer">
                    Research
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary cursor-pointer">
                    News & Updates
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase text-gray-500">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary cursor-pointer">
                    Email: info@healsync.org
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary cursor-pointer">
                    Phone: (555) 123-4567
                  </Link>
                </li>
              </ul>
              <div className="mt-4 flex gap-4">
                <Link href="#" className="text-gray-400 hover:text-primary cursor-pointer">
                  <span className="sr-only">Facebook</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-primary cursor-pointer">
                  <span className="sr-only">Twitter</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-primary cursor-pointer">
                  <span className="sr-only">Instagram</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} HealSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
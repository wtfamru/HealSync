import OrganDonationLanding from "@/components/OrganDonationLanding"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "HealSync | Organ Donation Platform",
  description: "HealSync is a platform connecting organ donors with recipients. Make a difference by registering as an organ donor and saving lives.",
  keywords: "organ donation, donor registration, organ transplant, save lives, medical donation",
  authors: [{ name: "HealSync Team" }],
  openGraph: {
    title: "HealSync | Organ Donation Platform",
    description: "Connect with organ donors and recipients. Make a difference by registering as an organ donor.",
    type: "website",
    locale: "en_US",
    siteName: "HealSync",
  },
  twitter: {
    card: "summary_large_image",
    title: "HealSync | Organ Donation Platform",
    description: "Connect with organ donors and recipients. Make a difference by registering as an organ donor.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#5AA7A7",
}

export default function Page() {
  return <OrganDonationLanding />
}



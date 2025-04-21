"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { collection, query, where, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import {
  Users,
  UserCheck,
  UserPlus,
  ListChecks,
  ClipboardList,
  FileCheck,
  History,
  LogOut,
  ChevronDown,
  Wallet,
  Activity,
  User,
  BarChart3,
  Heart,
  Search,
  Clock,
  HeartPulse,
  ChevronsUpDown,
  Check,
  Trash,
  Upload,
  CheckCircle2,
  XCircle,
  ExternalLink
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import RegisterDonor from "./RegisterDonor"
import RegisterPatient from "./RegisterPatient"
import ViewDonors from "./ViewDonors"
import ViewPatients from "./ViewPatients"
import MatchDonors from "./MatchDonors"
import TransplantRecords from "./TransplantRecords"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DonorRegistration from "./donor-registration"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { ConnectButton } from "thirdweb/react"
import { sepolia } from "thirdweb/chains"
import { client } from "@/providers/thirdweb-provider"

const formSchema = z.object({
  donorId: z.string().min(1, "Please select a donor"),
  organ: z.string().min(1, "Please select an organ"),
  bloodGroup: z.string(),
  hlaMatch: z.string().refine(val => /^\d+$/.test(val), {
    message: "HLA match must be a number",
  }),
  tissueType: z.string().refine(val => /^\d+$/.test(val), {
    message: "Tissue type must be a number",
  }),
  age: z.string(),
  gender: z.string(),
})

interface Donor {
  id: string;
  name: string;
  organs: {
    kidney: number;
    eyes: number;
    liver: number;
    pancreas: number;
    heart: number;
    lungs: number;
  };
  address: {
    street: string;
    pincode: string;
    city: string;
    state: string;
  };
  isDeceased: boolean;
  isRegistered: boolean;
  bloodGroup?: string;
  age?: number;
  gender?: string;
}

interface RegisteredDonor {
  id: string;
  donorId: string;
  donorName: string;
  organ: string;
  bloodGroup: string;
  hlaMatch: string;
  tissueType: string;
  age: string;
  gender: string;
  reportPdfUrl: string;
  isVerified: boolean;
  registeredAt: string;
  verifiedAt?: string;
}

// Define the exact organ names as required by the contract
const ORGAN_NAMES = ["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Eyes"];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { user, userData, logout } = useAuth()
  const router = useRouter()
  const [availableDonors, setAvailableDonors] = useState<Donor[]>([])
  const [deceasedDonors, setDeceasedDonors] = useState<Donor[]>([])
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null)
  const [availableOrgans, setAvailableOrgans] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [pledgeSearchTerm, setPledgeSearchTerm] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedPledge, setSelectedPledge] = useState<Donor | null>(null)
  const [registeredDonors, setRegisteredDonors] = useState<RegisteredDonor[]>([])
  const [open, setOpen] = useState(false)
  const [viewPledge, setViewPledge] = useState<Donor | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donorId: "",
      organ: "",
      bloodGroup: "",
      hlaMatch: "",
      tissueType: "",
      age: "",
      gender: "",
    },
  })

  useEffect(() => {
    fetchDeceasedDonors()
    fetchPledges()
    fetchRegisteredDonors()
  }, [])

  const fetchDeceasedDonors = async () => {
    try {
      const donorsQuery = query(
        collection(db, "hospitals", user?.uid || "", "pledges"),
        where("isDeceased", "==", true),
        where("isRegistered", "==", false)
      )
      const querySnapshot = await getDocs(donorsQuery)
      const donorsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donor[]
      setDeceasedDonors(donorsList)
    } catch (error) {
      console.error("Error fetching donors:", error)
      toast.error("Failed to load donors")
    }
  }

  const fetchPledges = async () => {
    try {
      const pledgesQuery = query(
        collection(db, "hospitals", user?.uid || "", "pledges")
      )
      const querySnapshot = await getDocs(pledgesQuery)
      const pledgesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donor[]
      setAvailableDonors(pledgesList)
    } catch (error) {
      console.error("Error fetching pledges:", error)
      toast.error("Failed to load pledges")
    }
  }

  const fetchRegisteredDonors = async () => {
    try {
      const registeredQuery = query(
        collection(db, "hospitals", user?.uid || "", "registered_donors")
      )
      const querySnapshot = await getDocs(registeredQuery)
      const registeredList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RegisteredDonor[]
      setRegisteredDonors(registeredList)
    } catch (error) {
      console.error("Error fetching registered donors:", error)
      toast.error("Failed to load registered donors")
    }
  }

  const handleDonorSelect = (donorId: string) => {
    const donor = availableDonors.find(d => d.id === donorId)
    if (donor) {
      setSelectedDonor(donor)
      form.setValue("donorId", donorId)
      form.setValue("bloodGroup", donor.bloodGroup || "")
      form.setValue("age", donor.age?.toString() || "")
      form.setValue("gender", donor.gender || "")
      form.setValue("organ", "")
      form.setValue("hlaMatch", "")
      form.setValue("tissueType", "")
      
      // Define which organs can be donated based on deceased status
      const allowedOrgans = donor.isDeceased
        ? ["kidney", "liver", "pancreas", "eyes", "lungs", "heart"]
        : ["kidney", "liver", "pancreas"]
      
      const availableOrgans = Object.entries(donor.organs)
        .filter(([organ, count]) => 
          count > 0 && allowedOrgans.includes(organ.toLowerCase())
        )
        .map(([organ]) => organ.toLowerCase())
      
      setAvailableOrgans(availableOrgans)
    }
  }

  const handleMarkDeceased = async () => {
    if (!selectedPledge) return

    try {
      const pledgeRef = doc(db, "hospitals", user?.uid || "", "pledges", selectedPledge.id)
      await updateDoc(pledgeRef, {
        isDeceased: true
      })
      
      // Update both states
      setAvailableDonors(prev => prev.map(d => 
        d.id === selectedPledge.id ? { ...d, isDeceased: true } : d
      ))
      setDeceasedDonors(prev => [...prev, { ...selectedPledge, isDeceased: true }])
      
      // If the currently selected donor is the one being marked as deceased,
      // update their available organs
      if (selectedDonor && selectedDonor.id === selectedPledge.id) {
        const updatedSelectedDonor = { ...selectedDonor, isDeceased: true }
        setSelectedDonor(updatedSelectedDonor)
        
        // Update available organs based on new deceased status
        const allowedOrgans = ["kidney", "liver", "pancreas", "eyes", "lungs", "heart"]
        const availableOrgans = Object.entries(updatedSelectedDonor.organs)
          .filter(([organ, count]) => 
            count > 0 && allowedOrgans.includes(organ.toLowerCase())
          )
          .map(([organ]) => organ.toLowerCase())
        
        setAvailableOrgans(availableOrgans)
      }
      
      // Refresh data from the database
      await Promise.all([
        fetchDeceasedDonors(),
        fetchPledges()
      ])
      
      toast.success("Donor marked as deceased")
      setShowConfirmDialog(false)
      setSelectedPledge(null)
    } catch (error) {
      console.error("Error updating pledge:", error)
      toast.error("Failed to update donor status")
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedDonor) return

    try {
      // Ensure the organ name is in the proper case format
      const standardizedOrgan = ORGAN_NAMES.find(
        name => name.toLowerCase() === values.organ.toLowerCase()
      ) || values.organ;

      const registeredRef = collection(db, "hospitals", user?.uid || "", "registered_donors")
      await addDoc(registeredRef, {
        donorId: selectedDonor.id,
        donorName: selectedDonor.name,
        organ: standardizedOrgan, // Use standardized organ name
        bloodGroup: values.bloodGroup,
        hlaMatch: values.hlaMatch,
        tissueType: values.tissueType,
        age: values.age,
        gender: values.gender,
        reportPdfUrl: "",
        isVerified: false,
        registeredAt: new Date().toISOString(),
      })

      // Update the organ count in the pledges collection
      const pledgeRef = doc(db, "hospitals", user?.uid || "", "pledges", selectedDonor.id)
      
      // Convert the standardized organ name to lowercase for accessing the organs object
      const organKey = standardizedOrgan.toLowerCase();
      const organCount = selectedDonor.organs[organKey as keyof typeof selectedDonor.organs]
      const updatedOrgans = {
        ...selectedDonor.organs,
        [organKey]: organCount - 1
      }

      // Check if all organs are now 0
      const allOrgansZero = Object.values(updatedOrgans).every(count => count === 0)

      if (allOrgansZero) {
        // If all organs are 0, delete the pledge document
        await deleteDoc(pledgeRef)
        // Update local state for deceased donors
        setDeceasedDonors(prev => prev.filter(d => d.id !== selectedDonor.id))
      } else {
        // Otherwise, just update the organ count
        await updateDoc(pledgeRef, {
          [`organs.${organKey}`]: organCount - 1
        })
        // Update local state for deceased donors
        setDeceasedDonors(prev => prev.map(d => 
          d.id === selectedDonor.id ? { ...d, organs: updatedOrgans } : d
        ))
      }

      // Reset form and selected donor
      form.reset()
      setSelectedDonor(null)
      setAvailableOrgans([])

      // Fetch updated data
      await Promise.all([
        fetchDeceasedDonors(),
        fetchPledges(),
        fetchRegisteredDonors()
      ])

      toast.success(allOrgansZero 
        ? "Organ registration successful. Donor removed as all organs are registered." 
        : "Organ registration successful")
    } catch (error) {
      console.error("Error registering organ:", error)
      toast.error("Failed to register organ")
    }
  }

  const getOrganCount = (organs: Donor["organs"]) => {
    return Object.entries(organs)
      .filter(([_, count]) => count > 0)
      .map(([organ, count]) => `${organ}: ${count}`)
      .join(", ")
  }

  const filteredPledges = availableDonors.filter(donor =>
    !donor.isDeceased && donor.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth")
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  // Sample data for the donation rate chart
  const donationRateData = [
    { month: "Jan", rate: 65 },
    { month: "Feb", rate: 59 },
    { month: "Mar", rate: 80 },
    { month: "Apr", rate: 81 },
    { month: "May", rate: 56 },
    { month: "Jun", rate: 55 },
    { month: "Jul", rate: 40 },
    { month: "Aug", rate: 70 },
    { month: "Sep", rate: 90 },
    { month: "Oct", rate: 75 },
    { month: "Nov", rate: 85 },
    { month: "Dec", rate: 95 },
  ]

  // Sample data for organs that can be donated
  const organDonationInfo = [
    {
      name: "Kidneys",
      description: "Most commonly transplanted organ. One kidney allows for a normal, healthy life.",
      icon: <Activity className="h-8 w-8 text-[#5AA7A7]" />,
      color: "bg-[#96D7C6]/20",
    },
    {
      name: "Liver",
      description: "Portions of the liver can regenerate, making living donation possible.",
      icon: <Activity className="h-8 w-8 text-[#6C8CBF]" />,
      color: "bg-[#6C8CBF]/20",
    },
    {
      name: "Heart",
      description: "Vital for circulation, heart transplants save lives of those with end-stage heart failure.",
      icon: <Activity className="h-8 w-8 text-[#E2D36B]" />,
      color: "bg-[#E2D36B]/20",
    },
    {
      name: "Lungs",
      description: "Can be donated as a pair or individually to patients with various lung diseases.",
      icon: <Activity className="h-8 w-8 text-[#BAC94A]" />,
      color: "bg-[#BAC94A]/20",
    },
  ]

  const handleUploadReport = async (registeredId: string, file: File) => {
    try {
      const fileUrl = URL.createObjectURL(file)
      
      const registeredRef = doc(db, "hospitals", user?.uid || "", "registered_donors", registeredId)
      await updateDoc(registeredRef, {
        reportPdfUrl: fileUrl
      })
      
      setRegisteredDonors(prev => prev.map(d => 
        d.id === registeredId ? { 
          ...d, 
          reportPdfUrl: fileUrl 
        } : d
      ))
      
      toast.success("Report uploaded successfully")
    } catch (error) {
      console.error("Error uploading report:", error)
      toast.error("Failed to upload report")
    }
  }

  const handleVerifyDonor = async (registeredId: string) => {
    try {
      // Get the donor data before deleting
      const donorToVerify = registeredDonors.find(donor => donor.id === registeredId);
      
      if (!donorToVerify) {
        toast.error("Donor record not found");
        return;
      }
      
      // Here you would add code to store the donor on the blockchain
      // This is a placeholder for the blockchain integration
      toast.info("Preparing to register donor on blockchain...");
      
      // Delete the document from Firebase
      const registeredRef = doc(db, "hospitals", user?.uid || "", "registered_donors", registeredId);
      await deleteDoc(registeredRef);
      
      // Remove the donor from the local state
      setRegisteredDonors(prev => prev.filter(d => d.id !== registeredId));
      
      toast.success("Donor verified and record moved to blockchain");
    } catch (error) {
      console.error("Error verifying donor:", error);
      toast.error("Failed to verify donor");
    }
  }

  const handleRemovePdf = async (registeredId: string) => {
    try {
      const registeredRef = doc(db, "hospitals", user?.uid || "", "registered_donors", registeredId)
      await updateDoc(registeredRef, {
        reportPdfUrl: ""
      })
      
      setRegisteredDonors(prev => prev.map(d => 
        d.id === registeredId ? { 
          ...d, 
          reportPdfUrl: "" 
        } : d
      ))
      
      toast.success("Report removed successfully")
    } catch (error) {
      console.error("Error removing report:", error)
      toast.error("Failed to remove report")
    }
  }

  // Add a helper function to view reports
  const handleViewReport = (reportUrl: string) => {
    window.open(reportUrl, '_blank');
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-[#96D7C6]/10 to-white border-[#5AA7A7]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#6C8CBF] flex items-center">
                    <Users className="mr-2 h-5 w-5 text-[#5AA7A7]" />
                    Available Donors
                  </CardTitle>
                  <CardDescription>Total available donors in system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800">248</div>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <span className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      12% increase
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#E2D36B]/10 to-white border-[#E2D36B]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#6C8CBF] flex items-center">
                    <UserCheck className="mr-2 h-5 w-5 text-[#BAC94A]" />
                    Verified Donors
                  </CardTitle>
                  <CardDescription>Donors with complete verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800">186</div>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <span className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      8% increase
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#6C8CBF]/10 to-white border-[#6C8CBF]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#6C8CBF] flex items-center">
                    <User className="mr-2 h-5 w-5 text-[#6C8CBF]" />
                    Total Patients
                  </CardTitle>
                  <CardDescription>Patients waiting for transplants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800">312</div>
                  <p className="text-sm text-amber-600 flex items-center mt-1">
                    <span className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      3% increase
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Donation Rate Chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-[#6C8CBF]">Donation Rate</CardTitle>
                <CardDescription>Monthly donation rates over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={donationRateData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5AA7A7" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#5AA7A7" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke="#5AA7A7" fillOpacity={1} fill="url(#colorRate)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Organ Donation Information */}
            <h2 className="text-xl font-bold text-[#6C8CBF] mb-4">Organs That Can Be Donated</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {organDonationInfo.map((organ, index) => (
                <Card key={index} className={`${organ.color} border-none`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      {organ.icon}
                      <CardTitle className="ml-2 text-[#6C8CBF]">{organ.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{organ.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Information */}
            <Card className="bg-gradient-to-br from-[#96D7C6]/10 to-white border-[#5AA7A7]/20">
              <CardHeader>
                <CardTitle className="text-[#6C8CBF]">Organ Donation Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 bg-[#BAC94A] rounded-full p-1">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>One organ donor can save up to eight lives.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 bg-[#BAC94A] rounded-full p-1">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>A single tissue donor can help heal more than 75 people.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 bg-[#BAC94A] rounded-full p-1">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Every 10 minutes, someone is added to the national transplant waiting list.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 bg-[#BAC94A] rounded-full p-1">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>
                      Organs that can be donated after death include the heart, liver, kidneys, lungs, pancreas and
                      small intestines.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        )
      case "register-donor":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Register Donor</CardTitle>
                <CardDescription>Select a donor and register their organs</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="donorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Donor</FormLabel>
                          <div className="relative">
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between"
                              onClick={() => setOpen(!open)}
                            >
                              {field.value
                                ? availableDonors.find((donor) => donor.id === field.value)?.name
                                : "Select donor..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                            {open && (
                              <div className="absolute mt-2 w-full rounded-md border bg-white p-0 shadow-md">
                                <Input
                                  placeholder="Search donors..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="border-0 focus:ring-0"
                                />
                                <div className="max-h-[200px] overflow-y-auto">
                                  {availableDonors
                                    .filter(donor =>
                                      donor.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map(donor => (
                                      <div
                                        key={donor.id}
                                        onClick={() => {
                                          field.onChange(donor.id);
                                          handleDonorSelect(donor.id);
                                          setSearchTerm("");
                                          setOpen(false);
                                        }}
                                        className={cn(
                                          "flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-[#5AA7A7]/10",
                                          field.value === donor.id && "bg-[#5AA7A7]/10"
                                        )}
                                      >
                                        <Check
                                          className={cn(
                                            "h-4 w-4 text-[#5AA7A7]",
                                            field.value === donor.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <span>{donor.name}</span>
                                      </div>
                                    ))}
                                  {availableDonors.filter(donor =>
                                    donor.name.toLowerCase().includes(searchTerm.toLowerCase())
                                  ).length === 0 && (
                                    <div className="px-2 py-1.5 text-sm text-gray-500">
                                      No donors found
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="organ"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Organ</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="cursor-pointer">
                                <SelectValue placeholder="Select an organ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableOrgans.map((organKey) => {
                                // Map the lowercase organ key to the proper case format
                                const organName = ORGAN_NAMES.find(name => 
                                  name.toLowerCase() === organKey.toLowerCase()
                                ) || organKey;
                                
                                return (
                                  <SelectItem key={organKey} value={organName} className="cursor-pointer">
                                    {organName}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Group</FormLabel>
                          <FormControl>
                            <Input {...field} disabled placeholder="Auto-filled from donor data" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input {...field} disabled placeholder="Auto-filled from donor data" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <Input {...field} disabled placeholder="Auto-filled from donor data" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hlaMatch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HLA Match</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter HLA match value (numbers only)" 
                              type="text"
                              pattern="[0-9]*"
                              inputMode="numeric"
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                              }}
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tissueType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tissue Type</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter tissue type value (numbers only)" 
                              type="text"
                              pattern="[0-9]*"
                              inputMode="numeric"
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                              }}
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full cursor-pointer">
                      Register Organ
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Available Pledges</CardTitle>
                <CardDescription>List of donors who have pledged their organs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Search pledges..."
                    value={pledgeSearchTerm}
                    onChange={(e) => setPledgeSearchTerm(e.target.value)}
                    className="mb-4"
                  />
                  {availableDonors
                    .filter(donor => 
                      donor.name.toLowerCase().includes(pledgeSearchTerm.toLowerCase())
                    )
                    .map((donor) => (
                      <Card key={donor.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{donor.name}</h3>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                donor.isDeceased 
                                  ? "bg-red-100 text-red-700" 
                                  : "bg-emerald-100 text-emerald-700"
                              )}>
                                {donor.isDeceased ? "Deceased" : "Active"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {Object.entries(donor.organs)
                                .filter(([_, count]) => count > 0)
                                .map(([organ, count]) => `${organ}: ${count}`)
                                .join(", ")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewPledge(donor)}
                              className="cursor-pointer"
                            >
                              View Pledge
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedPledge(donor);
                                setShowConfirmDialog(true);
                              }}
                              disabled={donor.isDeceased}
                              className="cursor-pointer"
                            >
                              Mark Deceased
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case "verify-donor":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Verify Registered Donors</CardTitle>
              <CardDescription>List of donors who have registered their organs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registeredDonors.map((registered) => (
                  <Card key={registered.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{registered.donorName}</h3>
                          {registered.isVerified ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Pending Verification
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Organ: {registered.organ}</p>
                          <p>Blood Group: {registered.bloodGroup}</p>
                          <p>Age: {registered.age}</p>
                          <p>Gender: {registered.gender}</p>
                          <p>HLA Match: {registered.hlaMatch}</p>
                          <p>Tissue Type: {registered.tissueType}</p>
                        </div>
                        <div className="flex gap-2">
                          {!registered.isVerified ? (
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={() => handleVerifyDonor(registered.id)}
                              className="cursor-pointer"
                            >
                              Verify Donor
                            </Button>
                          ) : (
                            <span className="text-sm text-green-600">Verification complete</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      case "register-patient":
        return <RegisterPatient />
      case "donor-list":
        return <ViewDonors />
      case "waiting-list":
        return <ViewPatients />
      case "transplant-match":
        return <MatchDonors />
      case "transplant-records":
        return <TransplantRecords />
      case "donor-registration":
        return <DonorRegistration />
      default:
        return null
    }
  }

  return (
    <SidebarProvider>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {selectedPledge?.name} as deceased? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleMarkDeceased}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewPledge} onOpenChange={() => setViewPledge(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pledge Details</DialogTitle>
            <DialogDescription>
              Detailed information about the donor pledge
            </DialogDescription>
          </DialogHeader>
          {viewPledge && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm">Name</h4>
                  <p className="text-sm text-gray-500">{viewPledge.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Blood Group</h4>
                  <p className="text-sm text-gray-500">{viewPledge.bloodGroup || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Age</h4>
                  <p className="text-sm text-gray-500">{viewPledge.age || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Gender</h4>
                  <p className="text-sm text-gray-500">{viewPledge.gender || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Available Organs</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(viewPledge.organs)
                    .filter(([_, count]) => count > 0)
                    .map(([organ, count]) => (
                      <div
                        key={organ}
                        className="flex items-center justify-between p-2 bg-[#5AA7A7]/10 rounded-md"
                      >
                        <span className="capitalize">{organ}</span>
                        <span className="text-[#5AA7A7] font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Address</h4>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>{viewPledge.address.street}</p>
                  <p>{viewPledge.address.city}, {viewPledge.address.state}</p>
                  <p>PIN: {viewPledge.address.pincode}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-medium",
                  viewPledge.isDeceased 
                    ? "bg-red-100 text-red-700" 
                    : "bg-emerald-100 text-emerald-700"
                )}>
                  {viewPledge.isDeceased ? "Deceased" : "Active"}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setViewPledge(null)}
                  className="cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 py-4">
            <div className="flex items-center px-4 gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-[#6C8CBF] hover:text-[#5AA7A7] transition-colors select-none">
                HealSync
              </h1>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "dashboard"}
                  onClick={() => setActiveTab("dashboard")}
                  className="cursor-pointer hover:bg-gradient-to-r from-[#6C8CBF]/10 to-[#5AA7A7]/10 rounded-2xl"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "register-donor"}
                  onClick={() => setActiveTab("register-donor")}
                  className="cursor-pointer hover:bg-gradient-to-r from-[#6C8CBF]/10 to-[#5AA7A7]/10 rounded-2xl"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Register Donor</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "register-patient"}
                  onClick={() => setActiveTab("register-patient")}
                  className="cursor-pointer hover:bg-gradient-to-r from-[#6C8CBF]/10 to-[#5AA7A7]/10 rounded-2xl"
                >
                  <UserCheck className="h-5 w-5" />
                  <span>Register Patient</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "verify-donor"}
                  onClick={() => setActiveTab("verify-donor")}
                  className="cursor-pointer hover:bg-gradient-to-r from-[#6C8CBF]/10 to-[#5AA7A7]/10 rounded-2xl"
                >
                  <UserCheck className="h-5 w-5" />
                  <span>Verify Donor</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "donor-list"}
                  onClick={() => setActiveTab("donor-list")}
                  className="cursor-pointer hover:bg-gradient-to-r from-[#6C8CBF]/10 to-[#5AA7A7]/10 rounded-2xl"
                >
                  <Search className="h-5 w-5" />
                  <span>Donor List</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "waiting-list"}
                  onClick={() => setActiveTab("waiting-list")}
                  className="cursor-pointer hover:bg-gradient-to-r from-[#6C8CBF]/10 to-[#5AA7A7]/10 rounded-2xl"
                >
                  <Clock className="h-5 w-5" />
                  <span>Waiting List</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "transplant-match"}
                  onClick={() => setActiveTab("transplant-match")}
                  className="cursor-pointer hover:bg-gradient-to-r from-[#6C8CBF]/10 to-[#5AA7A7]/10 rounded-2xl"
                >
                  <HeartPulse className="h-5 w-5" />
                  <span>Transplant Match</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "transplant-records"}
                  onClick={() => setActiveTab("transplant-records")}
                  className="cursor-pointer hover:bg-gradient-to-r from-[#6C8CBF]/10 to-[#5AA7A7]/10 rounded-2xl"
                >
                  <History className="h-5 w-5" />
                  <span>Transplant Records</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <div className="flex flex-col gap-2">
              <ConnectButton
                client={client}
                connectButton={{
                  label: "Connect Wallet",
                  className: "w-full mb-4 bg-[#5AA7A7] hover:bg-[#4A9696] text-white cursor-pointer",
                }}
                connectModal={{
                  title: "Connect to HealSync",
                  titleIcon: "/logo.png",
                  size: "compact"
                }}
              />
            </div>

            <SidebarSeparator />

            <div className="pt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start px-2 cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {userData?.hospitalName || "Hospital Name"}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-[#6C8CBF] select-none">
              {activeTab === "dashboard" && "Hospital Dashboard"}
              {activeTab === "register-donor" && "Register Donor"}
              {activeTab === "register-patient" && "Register Patient"}
              {activeTab === "donor-list" && "Donor List"}
              {activeTab === "waiting-list" && "Waiting List"}
              {activeTab === "transplant-match" && "Transplant Match"}
              {activeTab === "transplant-records" && "Transplant Records"}
              {activeTab === "verify-donor" && "Verify Donor"}
            </h1>
          </header>

          <main className="p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}


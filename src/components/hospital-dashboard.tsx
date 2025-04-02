"use client"

import { useState } from "react"
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

export default function Dashboard() {
  const [activeLink, setActiveLink] = useState("dashboard")
  const { user, userData, logout } = useAuth()
  const router = useRouter()

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

  return (
    <SidebarProvider>
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
                <SidebarMenuButton isActive={activeLink === "dashboard"} onClick={() => setActiveLink("dashboard")} className="cursor-pointer">
                  <BarChart3 className="h-5 w-5" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeLink === "register-donors"}
                  onClick={() => setActiveLink("register-donors")}
                  className="cursor-pointer"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Register Donors</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeLink === "register-patients"}
                  onClick={() => setActiveLink("register-patients")}
                  className="cursor-pointer"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Register Patients</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeLink === "donor-list"} onClick={() => setActiveLink("donor-list")} className="cursor-pointer">
                  <Users className="h-5 w-5" />
                  <span>Donor List</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeLink === "waiting-list"}
                  onClick={() => setActiveLink("waiting-list")}
                  className="cursor-pointer"
                >
                  <ListChecks className="h-5 w-5" />
                  <span>Waiting List</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeLink === "non-verified-donors"}
                  onClick={() => setActiveLink("non-verified-donors")}
                  className="cursor-pointer"
                >
                  <ClipboardList className="h-5 w-5" />
                  <span>Non-Verified Donor List</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeLink === "transplant-match"}
                  onClick={() => setActiveLink("transplant-match")}
                  className="cursor-pointer"
                >
                  <FileCheck className="h-5 w-5" />
                  <span>Transplant Match</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeLink === "transplant-records"}
                  onClick={() => setActiveLink("transplant-records")}
                  className="cursor-pointer"
                >
                  <History className="h-5 w-5" />
                  <span>View Transplant Records</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <Button className="w-full mb-4 bg-[#5AA7A7] hover:bg-[#4A9696] text-white cursor-pointer" size="sm">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>

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
            <h1 className="text-2xl font-bold text-[#6C8CBF] select-none">Hospital Dashboard</h1>
          </header>

          <main className="p-6">
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
                          d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}


"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Heart, HeartPulse, Eye, Trash2 } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Donor } from "@/types/donor"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  donorId: z.string().min(1, "Please select a donor"),
  organ: z.string().min(1, "Please select an organ"),
  bloodGroup: z.string().min(1, "Please select a blood group"),
  hlaMatch: z.string().min(1, "Please select an HLA match"),
  tissueType: z.string().min(1, "Please select a tissue type"),
  age: z.string().min(1, "Please enter age"),
  gender: z.string().min(1, "Please enter gender"),
})

type FormData = z.infer<typeof formSchema>

interface DonorData {
  id: string
  name: string
  bloodGroup: string
  organs: {
    [key: string]: number
  }
  isDeceased: boolean
  isRegistered: boolean
  age?: number
  gender?: string
}

export default function DonorRegistration() {
  const { user } = useAuth()
  const [donors, setDonors] = useState<DonorData[]>([])
  const [selectedDonor, setSelectedDonor] = useState<DonorData | null>(null)
  const [availableOrgans, setAvailableOrgans] = useState<string[]>([])

  const form = useForm<FormData>({
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
      })) as DonorData[]
      setDonors(donorsList)
    } catch (error) {
      console.error("Error fetching donors:", error)
      toast.error("Failed to load donors")
    }
  }

  useEffect(() => {
    fetchDeceasedDonors()
  }, [user?.uid])

  const handleDonorSelect = (donorId: string) => {
    const donor = donors.find(d => d.id === donorId)
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
        ? ["kidney", "liver", "pancreas", "eyes", "lungs", "heart"] // All organs for deceased donors
        : ["kidney", "liver", "pancreas"] // Limited organs for living donors
      
      // Filter organs based on availability and donor status
      const availableOrgans = Object.entries(donor.organs)
        .filter(([organ, count]) => 
          count > 0 && allowedOrgans.includes(organ.toLowerCase())
        )
        .map(([organ]) => organ.toLowerCase())
      
      setAvailableOrgans(availableOrgans)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedDonor) return

    try {
      // Create a new document in the registered_donors collection
      const registeredRef = collection(db, "hospitals", user?.uid || "", "registered_donors")
      await addDoc(registeredRef, {
        donorId: selectedDonor.id,
        donorName: selectedDonor.name,
        organ: values.organ,
        bloodGroup: values.bloodGroup,
        hlaMatch: values.hlaMatch,
        tissueType: values.tissueType,
        reportPdfUrl: "",
        isVerified: false,
        registeredAt: new Date().toISOString(),
      })

      // Update the organ count in the pledges collection
      const pledgeRef = doc(db, "hospitals", user?.uid || "", "pledges", selectedDonor.id)
      const organCount = selectedDonor.organs[values.organ]
      const updatedOrgans = {
        ...selectedDonor.organs,
        [values.organ]: organCount - 1
      }

      // Check if all organs are now 0
      const allOrgansZero = Object.values(updatedOrgans).every(count => count === 0)

      if (allOrgansZero) {
        // If all organs are 0, delete the pledge document
        await deleteDoc(pledgeRef)
        // Update local state
        setDonors(prev => prev.filter(d => d.id !== selectedDonor.id))
      } else {
        // Otherwise, just update the organ count
        await updateDoc(pledgeRef, {
          [`organs.${values.organ}`]: organCount - 1
        })
        // Update local state
        setDonors(prev => prev.map(d => 
          d.id === selectedDonor.id ? { ...d, organs: updatedOrgans } : d
        ))
      }

      // Reset form and selected donor
      form.reset()
      setSelectedDonor(null)
      setAvailableOrgans([])

      // Fetch updated data
      await fetchDeceasedDonors()

      toast.success(allOrgansZero 
        ? "Organ registration successful. Donor removed as all organs are registered." 
        : "Organ registration successful")
    } catch (error) {
      console.error("Error registering organ:", error)
      toast.error("Failed to register organ")
    }
  }

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
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Donor</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between cursor-pointer",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? donors.find((donor) => donor.id === field.value)?.name
                              : "Search and select donor"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Type donor name to search..." />
                          <CommandEmpty>No donor found.</CommandEmpty>
                          <CommandGroup>
                            {donors.map((donor) => (
                              <CommandItem
                                value={donor.name}
                                key={donor.id}
                                onSelect={() => {
                                  form.setValue("donorId", donor.id)
                                  handleDonorSelect(donor.id)
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    donor.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {donor.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                    <Select onValueChange={(value) => field.onChange(value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an organ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableOrgans.map((organ) => (
                          <SelectItem key={organ} value={organ}>
                            {organ.charAt(0).toUpperCase() + organ.slice(1)}
                          </SelectItem>
                        ))}
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
                    <FormLabel>Select HLA Match</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an HLA match" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Add HLA match options here */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tissueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Tissue Type</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tissue type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Add tissue type options here */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={!selectedDonor || availableOrgans.length === 0}>
                Register Organ
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Available Donors</CardTitle>
          <CardDescription>List of deceased donors available for organ registration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {donors.map((donor) => (
              <Card key={donor.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{donor.name}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Deceased
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {Object.entries(donor.organs)
                        .filter(([_, count]) => count > 0)
                        .map(([organ, count]) => `${organ}: ${count}`)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
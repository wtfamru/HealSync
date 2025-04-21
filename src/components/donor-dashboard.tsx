"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Heart, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DatePickerField } from "@/components/ui/date-picker-field"

// Use this exact format for organ names as required by the contract
const ORGAN_NAMES = ["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Eyes"];

const formSchema = z.object({
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select your gender.",
  }),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  dob: z.date({
    required_error: "Date of birth is required.",
  }).refine((date) => {
    const today = new Date();
    const minDate = new Date("1900-01-01");
    return date <= today && date >= minDate;
  }, "Please select a valid date of birth."),
  bloodGroup: z.string({
    required_error: "Please select your blood group.",
  }).min(1, {
    message: "Blood group is required.",
  }),
  idType: z.string({
    required_error: "Please select an ID type.",
  }).min(1, {
    message: "ID type is required.",
  }),
  idNumber: z.string().min(1, {
    message: "ID number is required.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  pincode: z.string().min(6, {
    message: "Pincode must be at least 6 characters.",
  }),
  city: z.string().min(1, {
    message: "City is required.",
  }),
  state: z.string().min(1, {
    message: "State is required.",
  }),
  kidney: z.enum(["0", "1", "2"], {
    required_error: "Please select kidney donation preference.",
  }),
  eyes: z.enum(["0", "1", "2"], {
    required_error: "Please select eyes donation preference.",
  }),
  liver: z.boolean().default(false),
  pancreas: z.boolean().default(false),
  heart: z.boolean().default(false),
  lungs: z.boolean().default(false),
  weight: z.string().min(1, {
    message: "Weight is required.",
  }),
  height: z.string().min(1, {
    message: "Height is required.",
  }),
  hospitalId: z.string({
    required_error: "Please select your nearest hospital.",
  }).min(1, {
    message: "Hospital selection is required.",
  }),
}).refine((data) => {
  return data.kidney !== "0" || data.eyes !== "0" || data.liver || data.pancreas || data.heart || data.lungs;
}, {
  message: "Please select at least one organ to donate.",
  path: ["kidney"],
});

export default function DonorRegistrationForm() {
  const { user, userData, logout, updateUserData } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hospitals, setHospitals] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(
    userData?.isSubmitted || searchParams.get("submitted") === "true"
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [age, setAge] = useState<number>(userData?.age || 0)

  useEffect(() => {
    console.log("Donor Dashboard - userData:", userData);
    console.log("Donor Dashboard - isSubmitted state:", isSubmitted);
    console.log("Donor Dashboard - searchParams submitted:", searchParams.get("submitted"));
  }, [userData, isSubmitted, searchParams]);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const hospitalsQuery = query(
          collection(db, "users"),
          where("role", "==", "hospital")
        )
        const querySnapshot = await getDocs(hospitalsQuery)
        const hospitalsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().hospitalName || "Unnamed Hospital"
        }))
        setHospitals(hospitalsList)
      } catch (error) {
        console.error("Error fetching hospitals:", error)
        toast.error("Failed to load hospitals")
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: undefined,
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      dob: userData?.dob ? new Date(userData.dob) : undefined,
      bloodGroup: "",
      idType: "",
      idNumber: "",
      address: "",
      pincode: "",
      city: "",
      state: "",
      kidney: "0",
      eyes: "0",
      liver: false,
      pancreas: false,
      heart: false,
      lungs: false,
      weight: "",
      height: "",
      hospitalId: "",
    },
  })

  useEffect(() => {
    if (userData?.dob) {
      const date = new Date(userData.dob)
      form.setValue("dob", date)
      const calculatedAge = calculateAge(userData.dob)
      setAge(calculatedAge)
    }
  }, [userData?.dob, form])

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const handleDobChange = (date: Date | undefined) => {
    if (!date) return
    form.setValue("dob", date)
    const dateString = date.toISOString().split('T')[0]
    const calculatedAge = calculateAge(dateString)
    setAge(calculatedAge)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Check if already submitted
      if (userData?.isSubmitted) {
        toast.error('Form already submitted', {
          description: 'You have already submitted your pledge form.',
        });
        return;
      }

      // Ensure proper capitalization for organs
      // Structure the pledge data
      const pledgeData = {
        // Basic donor information
        name: `${values.firstName} ${values.lastName}`,
        gender: values.gender,
        dob: values.dob,
        age: age,
        bloodGroup: values.bloodGroup,
        weight: values.weight,
        height: values.height,
        
        // Organ donation preferences with standardized capitalization
        organs: {
          // Use lowercase for database storage, will be standardized when registering
          kidney: parseInt(values.kidney),
          eyes: parseInt(values.eyes),
          liver: values.liver ? 1 : 0,
          pancreas: values.pancreas ? 1 : 0,
          heart: values.heart ? 1 : 0,
          lungs: values.lungs ? 1 : 0,
        },
        
        // Status flags
        isRegistered: false,
        isDeceased: false,
        
        // Contact and identification
        address: {
          street: values.address,
          pincode: values.pincode,
          city: values.city,
          state: values.state,
        },
        idType: values.idType,
        idNumber: values.idNumber,
        
        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user?.uid,
        hospitalId: values.hospitalId,
      }

      // Send to hospital's database
      const hospitalPledgeRef = doc(db, "hospitals", values.hospitalId, "pledges", user?.uid || "");
      
      await setDoc(hospitalPledgeRef, pledgeData);

      // Update user's isSubmitted status
      const userRef = doc(db, "users", user?.uid || "");
      await updateDoc(userRef, {
        isSubmitted: true
      });

      setIsSubmitted(true);
      
      toast.success('Pledge Submitted Successfully', {
        description: 'Your organ donation pledge has been recorded.',
      });
    } catch (error) {
      console.error("Error submitting pledge:", error);
      toast.error('Failed to Submit Pledge', {
        description: 'Please try again later.',
      });
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth")
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#96D7C6]/10 to-white">
        <div className="text-center space-y-6">
          <div className="relative">
            <CheckCircle2 className="w-24 h-24 text-[#5AA7A7] mx-auto animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold text-[#6C8CBF]">Pledge Submitted Successfully!</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Thank you for your pledge. The hospital will contact you for further details.
            Please wait for their response.
          </p>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-[#5AA7A7] hover:text-[#4A9696] border-[#5AA7A7] hover:border-[#4A9696] hover:bg-[#4A9696]/10 cursor-pointer"
          >
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-md">
      <CardContent className="p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#6C8CBF] select-none">Donor Pledge Form</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-[#5AA7A7] hover:text-[#4A9696] border-[#5AA7A7] hover:border-[#4A9696] hover:bg-[#4A9696]/10 cursor-pointer"
          >
            Logout
          </Button>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#6C8CBF]">Personal Information</h2>

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-gray-600">Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4 cursor-pointer"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="male" className="border-gray-400 text-[#5AA7A7] cursor-pointer" />
                          </FormControl>
                          <FormLabel className="font-normal text-gray-600 cursor-pointer">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="female" className="border-gray-400 text-[#5AA7A7] cursor-pointer" />
                          </FormControl>
                          <FormLabel className="font-normal text-gray-600 cursor-pointer">Female</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="other" className="border-gray-400 text-[#5AA7A7] cursor-pointer" />
                          </FormControl>
                          <FormLabel className="font-normal text-gray-600 cursor-pointer">Other</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          {...field}
                          disabled
                          className="border-gray-400 focus:border-[#5AA7A7] focus:ring-[#5AA7A7] bg-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          {...field}
                          disabled
                          className="border-gray-400 focus:border-[#5AA7A7] focus:ring-[#5AA7A7] bg-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-gray-600">Date of Birth</FormLabel>
                    <FormControl>
                      <DatePickerField
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={handleDobChange}
                        minDate={new Date("1900-01-01")}
                        maxDate={new Date()}
                        placeholder="Pick a date"
                        error={!!form.formState.errors.dob}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input value={age} readOnly />
                </FormControl>
                <FormDescription>Automatically calculated from date of birth</FormDescription>
              </FormItem>

              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-600">Blood Group</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-400 cursor-pointer">
                          <SelectValue placeholder="Select your blood group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A+" className="cursor-pointer">A+</SelectItem>
                        <SelectItem value="A-" className="cursor-pointer">A-</SelectItem>
                        <SelectItem value="B+" className="cursor-pointer">B+</SelectItem>
                        <SelectItem value="B-" className="cursor-pointer">B-</SelectItem>
                        <SelectItem value="AB+" className="cursor-pointer">AB+</SelectItem>
                        <SelectItem value="AB-" className="cursor-pointer">AB-</SelectItem>
                        <SelectItem value="O+" className="cursor-pointer">O+</SelectItem>
                        <SelectItem value="O-" className="cursor-pointer">O-</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="idType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Identity Card Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-400 cursor-pointer">
                            <SelectValue placeholder="Select ID type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="aadhar" className="cursor-pointer">Aadhar</SelectItem>
                          <SelectItem value="pan" className="cursor-pointer">PAN</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Identity Card Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your ID number"
                          {...field}
                          className="border-gray-400 focus:border-[#5AA7A7] focus:ring-[#5AA7A7]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#6C8CBF]">Address Information</h2>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-600">Most Recent Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your complete address"
                        className="resize-none border-gray-400 focus:border-[#5AA7A7] focus:ring-[#5AA7A7]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Pincode</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter pincode"
                          {...field}
                          className="border-gray-400 focus:border-[#5AA7A7] focus:ring-[#5AA7A7]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter city"
                          {...field}
                          className="border-gray-400 focus:border-[#5AA7A7] focus:ring-[#5AA7A7]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter state"
                          {...field}
                          className="border-gray-400 focus:border-[#5AA7A7] focus:ring-[#5AA7A7]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#6C8CBF]">Hospital Selection</h2>

              <FormField
                control={form.control}
                name="hospitalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-600">Nearest Hospital</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <SelectTrigger className="border-gray-400 cursor-pointer">
                          <SelectValue placeholder={loading ? "Loading hospitals..." : "Select your nearest hospital"} />
                        </SelectTrigger>
                        <SelectContent>
                          {hospitals.map((hospital) => (
                            <SelectItem
                              key={hospital.id}
                              value={hospital.id}
                              className="cursor-pointer"
                            >
                              {hospital.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#6C8CBF]">Donation Preferences</h2>

              <div className="space-y-4">
                <p className="text-gray-600 font-medium">Organs you wish to donate:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="kidney"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">Kidney</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant={field.value === "0" ? "default" : "outline"}
                              onClick={() => field.onChange("0")}
                              className="flex-1"
                            >
                              No
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "1" ? "default" : "outline"}
                              onClick={() => field.onChange("1")}
                              className="flex-1"
                            >
                              One
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "2" ? "default" : "outline"}
                              onClick={() => field.onChange("2")}
                              className="flex-1"
                            >
                              Both
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eyes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">Eyes</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant={field.value === "0" ? "default" : "outline"}
                              onClick={() => field.onChange("0")}
                              className="flex-1"
                            >
                              No
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "1" ? "default" : "outline"}
                              onClick={() => field.onChange("1")}
                              className="flex-1"
                            >
                              One
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "2" ? "default" : "outline"}
                              onClick={() => field.onChange("2")}
                              className="flex-1"
                            >
                              Both
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="liver"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Button
                            type="button"
                            variant={field.value ? "default" : "outline"}
                            onClick={() => field.onChange(!field.value)}
                            className="w-full"
                          >
                            Liver
                          </Button>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pancreas"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Button
                            type="button"
                            variant={field.value ? "default" : "outline"}
                            onClick={() => field.onChange(!field.value)}
                            className="w-full"
                          >
                            Pancreas
                          </Button>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heart"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Button
                            type="button"
                            variant={field.value ? "default" : "outline"}
                            onClick={() => field.onChange(!field.value)}
                            className="w-full"
                          >
                            Heart
                          </Button>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lungs"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Button
                            type="button"
                            variant={field.value ? "default" : "outline"}
                            onClick={() => field.onChange(!field.value)}
                            className="w-full"
                          >
                            Lungs
                          </Button>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          pattern="[0-9]*\.?[0-9]*"
                          inputMode="decimal"
                          placeholder="Enter weight in kg"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            field.onChange(value);
                          }}
                          className="border-gray-400 focus:border-[#5AA7A7] focus:ring-[#5AA7A7] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          pattern="[0-9]*\.?[0-9]*"
                          inputMode="decimal"
                          placeholder="Enter height in cm"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            field.onChange(value);
                          }}
                          className="border-gray-400 focus:border-[#5AA7A7] focus:ring-[#5AA7A7] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => form.reset()} className="border-gray-400 cursor-pointer">
                Reset
              </Button>
              <Button type="submit" className="bg-[#5AA7A7] hover:bg-[#4A9696] text-white cursor-pointer">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
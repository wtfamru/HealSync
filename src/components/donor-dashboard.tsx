"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Heart } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { toast } from 'sonner'
import { Card, CardContent } from "@/components/ui/card"

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
  donateEyes: z.boolean().default(false),
  donateHeart: z.boolean().default(false),
  donateKidney: z.boolean().default(false),
  donateLungs: z.boolean().default(false),
  weight: z.string().min(1, {
    message: "Weight is required.",
  }),
  height: z.string().min(1, {
    message: "Height is required.",
  }),
}).refine((data) => {
  return data.donateEyes || data.donateHeart || data.donateKidney || data.donateLungs;
}, {
  message: "Please select at least one organ to donate.",
  path: ["donateEyes"],
});

export default function DonorRegistrationForm() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: undefined,
      firstName: "",
      lastName: "",
      bloodGroup: "",
      idType: "",
      idNumber: "",
      address: "",
      pincode: "",
      city: "",
      state: "",
      donateEyes: false,
      donateHeart: false,
      donateKidney: false,
      donateLungs: false,
      weight: "",
      height: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = {
      ...values,
      userId: user?.uid,
      createdAt: new Date().toISOString()
    }
    
    console.log(formData)
    toast.success('Registration Successful', {
      description: 'Thank you for registering as a donor.',
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth")
    } catch (error) {
      console.error("Failed to logout:", error)
    }
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
                          className="border-gray-400 focus:border-[#5AA7A7] focus:ring-[#5AA7A7]"
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
                          className="border-gray-400 focus:border-[#5AA7A7] focus:ring-[#5AA7A7]"
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal border-gray-400",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: Date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              <h2 className="text-xl font-semibold text-[#6C8CBF]">Donation Preferences</h2>

              <div className="space-y-4">
                <p className="text-gray-600 font-medium">Organs you wish to donate:</p>
                <FormField
                  control={form.control}
                  name="donateEyes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormControl>
                          <Button
                            type="button"
                            variant={field.value ? "default" : "outline"}
                            onClick={() => field.onChange(!field.value)}
                            className={`w-full h-auto py-3 px-4 rounded-lg border cursor-pointer transition-colors ${
                              field.value 
                                ? "bg-[#5AA7A7] hover:bg-[#4A9696] text-white border-[#5AA7A7]" 
                                : "border-gray-400 hover:border-[#5AA7A7] hover:text-[#5AA7A7]"
                            }`}
                          >
                            Eyes
                          </Button>
                        </FormControl>
                        <FormControl>
                          <Button
                            type="button"
                            variant={form.watch("donateHeart") ? "default" : "outline"}
                            onClick={() => form.setValue("donateHeart", !form.watch("donateHeart"))}
                            className={`w-full h-auto py-3 px-4 rounded-lg border cursor-pointer transition-colors ${
                              form.watch("donateHeart")
                                ? "bg-[#5AA7A7] hover:bg-[#4A9696] text-white border-[#5AA7A7]" 
                                : "border-gray-400 hover:border-[#5AA7A7] hover:text-[#5AA7A7]"
                            }`}
                          >
                            Heart
                          </Button>
                        </FormControl>
                        <FormControl>
                          <Button
                            type="button"
                            variant={form.watch("donateKidney") ? "default" : "outline"}
                            onClick={() => form.setValue("donateKidney", !form.watch("donateKidney"))}
                            className={`w-full h-auto py-3 px-4 rounded-lg border cursor-pointer transition-colors ${
                              form.watch("donateKidney")
                                ? "bg-[#5AA7A7] hover:bg-[#4A9696] text-white border-[#5AA7A7]" 
                                : "border-gray-400 hover:border-[#5AA7A7] hover:text-[#5AA7A7]"
                            }`}
                          >
                            Kidney
                          </Button>
                        </FormControl>
                        <FormControl>
                          <Button
                            type="button"
                            variant={form.watch("donateLungs") ? "default" : "outline"}
                            onClick={() => form.setValue("donateLungs", !form.watch("donateLungs"))}
                            className={`w-full h-auto py-3 px-4 rounded-lg border cursor-pointer transition-colors ${
                              form.watch("donateLungs")
                                ? "bg-[#5AA7A7] hover:bg-[#4A9696] text-white border-[#5AA7A7]" 
                                : "border-gray-400 hover:border-[#5AA7A7] hover:text-[#5AA7A7]"
                            }`}
                          >
                            Lungs
                          </Button>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          type="number"
                          placeholder="Enter weight in kg"
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
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter height in cm"
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
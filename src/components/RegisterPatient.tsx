"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { client } from "@/providers/thirdweb-provider"
import { getContract, prepareContractCall, sendTransaction } from "thirdweb"
import { sepolia } from "thirdweb/chains"
import { useActiveAccount } from "thirdweb/react"
import { toast } from "sonner"
import { Search, FileCheck } from "lucide-react"

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const organs = ["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Eyes"]
const urgencyLevels = ["Low", "Medium", "High", "Critical"]
const genders = ["Male", "Female", "Other"]

interface PatientFormData {
  name: string;
  age: string;
  gender: string;
  bloodGroup: string;
  organ: string;
  ipfsHash: string;
  tissueType: string;
  hlaMatch: string;
  urgency: string;
}

const urgencyPriorityMap: { [key: string]: bigint } = {
  Low: 0n,
  Medium: 1n,
  High: 2n,
  Critical: 3n,
};

// Sample IPFS medical reports (in a real app, these would come from a database or API)
const sampleMedicalReports = [
  { hash: "QmX7BZye6LkUvJ1YK3Cx9yYmN9xY7Ri6JJvMKr8QXY9T5A", name: "Heart Examination Report" },
  { hash: "QmYDw9JjbXvHiRC4zFj5g5xrFEEKqgm5rA8PcBgn4rCG2U", name: "Kidney Function Test" },
  { hash: "QmZ9BtRbVKBFMdMLvSJg7LcY1jEkZEVNKtJfEdz3CKqg7K", name: "Liver Medical Report" },
  { hash: "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn", name: "Lung Assessment" },
  { hash: "QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB", name: "Pancreas Evaluation" },
  { hash: "QmR6jXApLMbuJ9YLWyiifLQKgMAvCrTdmncxPGyBQGtZ9h", name: "Eye Examination" },
]

export default function RegisterPatient() {
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    organ: "",
    ipfsHash: "",
    tissueType: "",
    hlaMatch: "",
    urgency: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const account = useActiveAccount()
  const [searchTerm, setSearchTerm] = useState("")

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  if (!CONTRACT_ADDRESS) {
    console.error("Contract address is missing from environment variables.");
    // Optionally return an error message component or throw an error
  }

  // Filter medical reports based on search term
  const filteredMedicalReports = sampleMedicalReports.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Replace sample IPFS hashes with gateway URLs for easier viewing
  const ipfsGateway = "https://ipfs.io/ipfs/"

  // Helper function to view the medical report
  const viewMedicalReport = (hash: string) => {
    if (!hash || hash === "custom") return
    
    const url = `${ipfsGateway}${hash}`
    window.open(url, '_blank')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: keyof PatientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!account) {
      toast.error("Please connect your wallet first.")
      return
    }

    if (!CONTRACT_ADDRESS) {
       toast.error("Application configuration error: Contract address missing.");
       console.error("Contract address (NEXT_PUBLIC_CONTRACT_ADDRESS) is not set in environment variables.");
       return;
    }

    if (!formData.name || !formData.age || !formData.gender || !formData.bloodGroup || !formData.organ || !formData.ipfsHash || !formData.tissueType || !formData.hlaMatch || !formData.urgency) {
      toast.error("Please fill in all required fields.")
      return
    }

    // Add specific validation for number fields before BigInt conversion
    const isNumeric = (value: string) => /^\d+$/.test(value); // Regex to check for only digits

    if (!isNumeric(formData.tissueType)) {
        toast.error("Tissue Type must be a valid whole number.");
        return;
    }
    if (!isNumeric(formData.hlaMatch)) {
        toast.error("HLA Match must be a valid whole number.");
        return;
    }

    setIsSubmitting(true)
    toast.info("Preparing transaction...")

    try {
      const contract = getContract({
        client,
        chain: sepolia,
        address: CONTRACT_ADDRESS,
      })

      const patientArgs = [
        formData.name,
        formData.gender,
        BigInt(formData.age),
        formData.bloodGroup,
        formData.organ,
        formData.ipfsHash,
        urgencyPriorityMap[formData.urgency],
        BigInt(formData.tissueType),
        BigInt(formData.hlaMatch),
      ] as const;

      const tx = prepareContractCall({
        contract: contract,
        method: "function registerRecipient(string _name, string _gender, uint256 _age, string _bloodGroup, string _organ, string _ipfsHash, uint256 _priority, uint256 _tissueType, uint256 _hlaMatch)",
        params: patientArgs,
      })

      const { transactionHash } = await sendTransaction({ transaction: tx, account })

      toast.success(
        `Patient registration transaction sent! Hash: ${transactionHash.slice(0, 6)}...${transactionHash.slice(-4)}`, {
          duration: 5000
        }
      )
      console.log("Transaction successful:", transactionHash)

      setFormData({
        name: "", age: "", gender: "", bloodGroup: "", organ: "",
        ipfsHash: "", tissueType: "", hlaMatch: "", urgency: ""
      })

    } catch (error: any) {
      console.error("Contract interaction error:", error)
      const message = error.reason || error.message || "An unknown error occurred during registration."
      toast.error(`Registration failed: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle>Register New Patient</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)} required>
                  <SelectTrigger id="gender" className="cursor-pointer">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => handleSelectChange("bloodGroup", value)}>
                  <SelectTrigger id="bloodGroup" className="cursor-pointer">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="organ">Organ</Label>
                <Select value={formData.organ} onValueChange={(value) => handleSelectChange("organ", value)}>
                  <SelectTrigger id="organ" className="cursor-pointer">
                    <SelectValue placeholder="Select organ" />
                  </SelectTrigger>
                  <SelectContent>
                    {organs.map((organ) => (
                      <SelectItem key={organ} value={organ}>
                        {organ}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="ipfsHash">Medical Report IPFS Hash</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search medical reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 mb-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={formData.ipfsHash} 
                      onValueChange={(value) => handleSelectChange("ipfsHash", value)}
                      className="flex-1"
                    >
                      <SelectTrigger id="ipfsHash" className="cursor-pointer">
                        <SelectValue placeholder="Select medical report" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredMedicalReports.map((report) => (
                          <SelectItem key={report.hash} value={report.hash}>
                            {report.name} ({report.hash.slice(0, 6)}...{report.hash.slice(-4)})
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom IPFS Hash</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.ipfsHash && formData.ipfsHash !== "custom" && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => viewMedicalReport(formData.ipfsHash)}
                        className="cursor-pointer"
                      >
                        <FileCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {formData.ipfsHash === "custom" && (
                    <Input
                      id="customIpfsHash"
                      value={formData.ipfsHash === "custom" ? "" : formData.ipfsHash}
                      onChange={(e) => setFormData(prev => ({ ...prev, ipfsHash: e.target.value }))}
                      placeholder="Enter custom IPFS hash..."
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="tissueType">Tissue Type</Label>
                <Input
                  id="tissueType"
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={formData.tissueType}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData((prev) => ({ ...prev, tissueType: value }));
                  }}
                  required
                  placeholder="Enter positive number only"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="hlaMatch">HLA Match</Label>
                <Input
                  id="hlaMatch"
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={formData.hlaMatch}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData((prev) => ({ ...prev, hlaMatch: value }));
                  }}
                  required
                  placeholder="Enter positive number only"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleSelectChange("urgency", value)}>
                  <SelectTrigger id="urgency" className="cursor-pointer">
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !account}
            className="w-full bg-[#5AA7A7] hover:bg-[#4A9696] mt-4 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Registering..." : (account ? "Register Patient" : "Connect Wallet to Register")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { client } from "@/providers/thirdweb-provider"
import { getContract } from "thirdweb"
import { sepolia } from "thirdweb/chains"
import { useReadContract } from "thirdweb/react"

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const organs = ["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Eyes"]

interface Donor {
  id: string;
  name: string;
  gender: string;
  age: string;
  medical: {
    bloodGroup: string;
    organ: string;
    tissueType: string;
    hlaMatch: string;
  };
  isAvailable: boolean;
}

export default function ViewDonors() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all")
  const [selectedOrgan, setSelectedOrgan] = useState("all")

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x7cfb5aee97b742d10739780336054422c60626e7";

  const contract = getContract({
    client,
    chain: sepolia,
    address: CONTRACT_ADDRESS,
  })

  const { data: donors, isPending } = useReadContract({
    contract,
    method: "function getAllDonors() view returns ((uint256 id, string name, string gender, uint256 age, (string bloodGroup, string organ, string tissueType, uint256 hlaMatch) medical, bool isAvailable)[])",
    params: [],
  })

  const donorsList: Donor[] = donors ? donors.map((donor: any) => ({
    id: donor.id.toString(),
    name: donor.name,
    gender: donor.gender,
    age: donor.age.toString(),
    medical: {
      bloodGroup: donor.medical.bloodGroup,
      organ: donor.medical.organ,
      tissueType: donor.medical.tissueType,
      hlaMatch: donor.medical.hlaMatch.toString(),
    },
    isAvailable: donor.isAvailable,
  })) : []

  const filteredDonors = donorsList.filter((donor) => {
    const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBloodGroup = selectedBloodGroup === "all" || donor.medical.bloodGroup === selectedBloodGroup
    const matchesOrgan = selectedOrgan === "all" || donor.medical.organ === selectedOrgan
    return matchesSearch && matchesBloodGroup && matchesOrgan
  })

  if (isPending) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Available Donors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <p>Loading donors from blockchain...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Available Donors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by blood group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blood Groups</SelectItem>
              {bloodGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedOrgan} onValueChange={setSelectedOrgan}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by organ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organs</SelectItem>
              {organs.map((organ) => (
                <SelectItem key={organ} value={organ}>
                  {organ}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Age</TableHead>
                <TableHead className="font-semibold">Gender</TableHead>
                <TableHead className="font-semibold">Blood Group</TableHead>
                <TableHead className="font-semibold">Organ</TableHead>
                <TableHead className="font-semibold">Tissue Type</TableHead>
                <TableHead className="font-semibold">HLA Match</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonors.map((donor) => (
                <TableRow key={donor.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{donor.name}</TableCell>
                  <TableCell>{donor.age}</TableCell>
                  <TableCell>{donor.gender}</TableCell>
                  <TableCell>{donor.medical.bloodGroup}</TableCell>
                  <TableCell>{donor.medical.organ}</TableCell>
                  <TableCell>{donor.medical.tissueType}</TableCell>
                  <TableCell>{donor.medical.hlaMatch}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      donor.isAvailable 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {donor.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 
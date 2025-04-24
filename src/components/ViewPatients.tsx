"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const organs = ["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Eyes"]
const urgencyLevels = ["Low", "Medium", "High", "Critical"]

interface Patient {
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
  urgency: string;
  isWaiting: boolean;
  waitingTime: string;
}

export default function ViewPatients() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all")
  const [selectedOrgan, setSelectedOrgan] = useState("all")
  const [selectedUrgency, setSelectedUrgency] = useState("all")

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x7cfb5aee97b742d10739780336054422c60626e7";

  const contract = getContract({
    client,
    chain: sepolia,
    address: CONTRACT_ADDRESS,
  })

  const { data: recipients, isPending } = useReadContract({
    contract,
    method: "function getAllWaitingRecipients() view returns ((uint256 id, string name, string gender, uint256 age, (string bloodGroup, string organ, string tissueType, uint256 hlaMatch) medical, string urgency, bool isWaiting, uint256 waitingTime)[])",
    params: [],
  })

  const patients: Patient[] = recipients ? recipients.map((recipient: any) => ({
    id: recipient.id.toString(),
    name: recipient.name,
    gender: recipient.gender,
    age: recipient.age.toString(),
    medical: {
      bloodGroup: recipient.medical.bloodGroup,
      organ: recipient.medical.organ,
      tissueType: recipient.medical.tissueType,
      hlaMatch: recipient.medical.hlaMatch.toString(),
    },
    urgency: recipient.urgency,
    isWaiting: recipient.isWaiting,
    waitingTime: new Date(Number(recipient.waitingTime) * 1000).toISOString(),
  })) : []

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBloodGroup = selectedBloodGroup === "all" || patient.medical.bloodGroup === selectedBloodGroup
    const matchesOrgan = selectedOrgan === "all" || patient.medical.organ === selectedOrgan
    const matchesUrgency = selectedUrgency === "all" || patient.urgency === selectedUrgency
    return matchesSearch && matchesBloodGroup && matchesOrgan && matchesUrgency
  })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Low":
        return "bg-blue-100 text-blue-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isPending) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Waiting Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <p>Loading patients from blockchain...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Waiting Patients</CardTitle>
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
          <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency Levels</SelectItem>
              {urgencyLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
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
                <TableHead className="font-semibold">Blood Group</TableHead>
                <TableHead className="font-semibold">Organ</TableHead>
                <TableHead className="font-semibold">Tissue Type</TableHead>
                <TableHead className="font-semibold">HLA Match</TableHead>
                <TableHead className="font-semibold">Urgency</TableHead>
                <TableHead className="font-semibold">Waiting Since</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.medical.bloodGroup}</TableCell>
                  <TableCell>{patient.medical.organ}</TableCell>
                  <TableCell>{patient.medical.tissueType}</TableCell>
                  <TableCell>{patient.medical.hlaMatch}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(patient.urgency)}`}>
                      {patient.urgency}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(patient.waitingTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
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
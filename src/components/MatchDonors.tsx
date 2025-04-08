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

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const organs = ["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Eyes"]

// Sample data - replace with actual data from your backend
const sampleMatches = [
  {
    id: 1,
    patient: {
      name: "Robert Johnson",
      age: 45,
      bloodGroup: "A+",
      organ: "Kidney",
      tissueType: "A1",
      hlaMatch: "B8",
      urgency: "High",
    },
    donor: {
      name: "John Doe",
      age: 32,
      bloodGroup: "A+",
      organ: "Kidney",
      tissueType: "A1",
      hlaMatch: "B8",
    },
    matchScore: 95,
    status: "Pending",
  },
  {
    id: 2,
    patient: {
      name: "Sarah Williams",
      age: 38,
      bloodGroup: "O-",
      organ: "Liver",
      tissueType: "A2",
      hlaMatch: "B7",
      urgency: "Critical",
    },
    donor: {
      name: "Jane Smith",
      age: 28,
      bloodGroup: "O-",
      organ: "Liver",
      tissueType: "A2",
      hlaMatch: "B7",
    },
    matchScore: 98,
    status: "Pending",
  },
]

export default function MatchDonors() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("")
  const [selectedOrgan, setSelectedOrgan] = useState("")

  const filteredMatches = sampleMatches.filter((match) => {
    const matchesSearch = 
      match.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.donor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBloodGroup = selectedBloodGroup === "all" || 
      match.patient.bloodGroup === selectedBloodGroup ||
      match.donor.bloodGroup === selectedBloodGroup
    const matchesOrgan = selectedOrgan === "all" || 
      match.patient.organ === selectedOrgan ||
      match.donor.organ === selectedOrgan
    return matchesSearch && matchesBloodGroup && matchesOrgan
  })

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Potential Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by patient or donor name..."
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
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Organ</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Match Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{match.patient.name}</div>
                      <div className="text-sm text-gray-500">Age: {match.patient.age}</div>
                      <div className="text-sm text-gray-500">Urgency: {match.patient.urgency}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{match.donor.name}</div>
                      <div className="text-sm text-gray-500">Age: {match.donor.age}</div>
                    </div>
                  </TableCell>
                  <TableCell>{match.patient.organ}</TableCell>
                  <TableCell>{match.patient.bloodGroup}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(match.matchScore)}`}>
                      {match.matchScore}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {match.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="mr-2">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="bg-[#5AA7A7] text-white hover:bg-[#4A9696]">
                      Approve Match
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
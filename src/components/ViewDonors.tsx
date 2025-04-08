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
const sampleDonors = [
  {
    id: 1,
    name: "John Doe",
    age: 32,
    bloodGroup: "A+",
    organ: "Kidney",
    tissueType: "A1",
    hlaMatch: "B8",
    status: "Available",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 28,
    bloodGroup: "O-",
    organ: "Liver",
    tissueType: "A2",
    hlaMatch: "B7",
    status: "Available",
  },
  {
    id: 3,
    name: "Michael Johnson",
    age: 45,
    bloodGroup: "B+",
    organ: "Heart",
    tissueType: "A3",
    hlaMatch: "B5",
    status: "Available",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    age: 35,
    bloodGroup: "AB+",
    organ: "Lung",
    tissueType: "A1",
    hlaMatch: "B9",
    status: "Available",
  },
  {
    id: 5,
    name: "Robert Brown",
    age: 41,
    bloodGroup: "A-",
    organ: "Pancreas",
    tissueType: "A2",
    hlaMatch: "B4",
    status: "Available",
  }
]

export default function ViewDonors() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all")
  const [selectedOrgan, setSelectedOrgan] = useState("all")

  const filteredDonors = sampleDonors.filter((donor) => {
    const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBloodGroup = selectedBloodGroup === "all" || donor.bloodGroup === selectedBloodGroup
    const matchesOrgan = selectedOrgan === "all" || donor.organ === selectedOrgan
    return matchesSearch && matchesBloodGroup && matchesOrgan
  })

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
                <TableHead className="font-semibold">Blood Group</TableHead>
                <TableHead className="font-semibold">Organ</TableHead>
                <TableHead className="font-semibold">Tissue Type</TableHead>
                <TableHead className="font-semibold">HLA Match</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonors.map((donor) => (
                <TableRow key={donor.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{donor.name}</TableCell>
                  <TableCell>{donor.age}</TableCell>
                  <TableCell>{donor.bloodGroup}</TableCell>
                  <TableCell>{donor.organ}</TableCell>
                  <TableCell>{donor.tissueType}</TableCell>
                  <TableCell>{donor.hlaMatch}</TableCell>
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
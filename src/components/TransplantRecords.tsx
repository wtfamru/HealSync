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

const organs = ["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Eyes"]

// Sample data - replace with actual data from your backend
const sampleRecords = [
  {
    id: 1,
    patient: {
      name: "Robert Johnson",
      age: 45,
      bloodGroup: "A+",
    },
    donor: {
      name: "John Doe",
      age: 32,
      bloodGroup: "A+",
    },
    organ: "Kidney",
    transplantDate: "2024-03-15",
    status: "Successful",
    hospital: "City General Hospital",
  },
  {
    id: 2,
    patient: {
      name: "Sarah Williams",
      age: 38,
      bloodGroup: "O-",
    },
    donor: {
      name: "Jane Smith",
      age: 28,
      bloodGroup: "O-",
    },
    organ: "Liver",
    transplantDate: "2024-02-20",
    status: "Successful",
    hospital: "City General Hospital",
  },
]

export default function TransplantRecords() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrgan, setSelectedOrgan] = useState("")

  const filteredRecords = sampleRecords.filter((record) => {
    const matchesSearch = 
      record.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.donor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesOrgan = selectedOrgan === "all" || record.organ === selectedOrgan
    return matchesSearch && matchesOrgan
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Successful":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      case "Failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transplant Records</CardTitle>
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
                <TableHead>Transplant Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.patient.name}</div>
                      <div className="text-sm text-gray-500">Age: {record.patient.age}</div>
                      <div className="text-sm text-gray-500">Blood Group: {record.patient.bloodGroup}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.donor.name}</div>
                      <div className="text-sm text-gray-500">Age: {record.donor.age}</div>
                      <div className="text-sm text-gray-500">Blood Group: {record.donor.bloodGroup}</div>
                    </div>
                  </TableCell>
                  <TableCell>{record.organ}</TableCell>
                  <TableCell>{record.transplantDate}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell>{record.hospital}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="mr-2">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="bg-[#5AA7A7] text-white hover:bg-[#4A9696]">
                      Download Report
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
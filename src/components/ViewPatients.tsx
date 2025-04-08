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
const urgencyLevels = ["Low", "Medium", "High", "Critical"]

// Sample data - replace with actual data from your backend
const samplePatients = [
  {
    id: 1,
    name: "Robert Johnson",
    age: 45,
    bloodGroup: "A+",
    organ: "Kidney",
    tissueType: "A1",
    hlaMatch: "B8",
    urgency: "High",
    status: "Waiting",
  },
  {
    id: 2,
    name: "Sarah Williams",
    age: 38,
    bloodGroup: "O-",
    organ: "Liver",
    tissueType: "A2",
    hlaMatch: "B7",
    urgency: "Critical",
    status: "Waiting",
  },
  {
    id: 3,
    name: "Emily Davis",
    age: 29,
    bloodGroup: "B+",
    organ: "Heart",
    tissueType: "A3",
    hlaMatch: "B5",
    urgency: "Medium",
    status: "Waiting",
  },
  {
    id: 4,
    name: "James Wilson",
    age: 52,
    bloodGroup: "AB+",
    organ: "Lung",
    tissueType: "A1",
    hlaMatch: "B9",
    urgency: "Critical",
    status: "Waiting",
  },
  {
    id: 5,
    name: "Maria Garcia",
    age: 33,
    bloodGroup: "A-",
    organ: "Pancreas",
    tissueType: "A2",
    hlaMatch: "B4",
    urgency: "Low",
    status: "Waiting",
  }
]

export default function ViewPatients() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all")
  const [selectedOrgan, setSelectedOrgan] = useState("all")
  const [selectedUrgency, setSelectedUrgency] = useState("all")

  const filteredPatients = samplePatients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBloodGroup = selectedBloodGroup === "all" || patient.bloodGroup === selectedBloodGroup
    const matchesOrgan = selectedOrgan === "all" || patient.organ === selectedOrgan
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
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.bloodGroup}</TableCell>
                  <TableCell>{patient.organ}</TableCell>
                  <TableCell>{patient.tissueType}</TableCell>
                  <TableCell>{patient.hlaMatch}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(patient.urgency)}`}>
                      {patient.urgency}
                    </span>
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
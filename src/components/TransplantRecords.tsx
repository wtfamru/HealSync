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
import { Search, Calendar, Database } from "lucide-react"
import { client } from "@/providers/thirdweb-provider"
import { getContract } from "thirdweb"
import { sepolia } from "thirdweb/chains"
import { useReadContract } from "thirdweb/react"

const organs = ["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Eyes"]

interface TransplantRecord {
  id: string;
  donor: {
    id: string;
    name: string;
  };
  recipient: {
    id: string;
    name: string;
  };
  organ: string;
  transplantDate: string;
  confirmationDate: string;
  notes: string;
}

type FilterType = "none" | "organ" | "date" | "year";
type SearchByType = "donorName" | "donorId" | "recipientName" | "recipientId";

export default function TransplantRecords() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("none")
  const [searchBy, setSearchBy] = useState<SearchByType>("donorName")
  const [selectedOrgan, setSelectedOrgan] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [showMonthFilter, setShowMonthFilter] = useState(false)

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x7cfb5aee97b742d10739780336054422c60626e7";

  const contract = getContract({
    client,
    chain: sepolia,
    address: CONTRACT_ADDRESS,
  })

  // Fetch confirmed transplant records from blockchain
  const { data: transplantRecords, isPending } = useReadContract({
    contract,
    method: "function getConfirmedTransplants() view returns ((uint256 donorId, string donorName, uint256 recipientId, string recipientName, string organ, uint256 transplantTimestamp, uint256 confirmationTimestamp, string notes)[])",
    params: [],
  })

  // Format ID with proper prefix and padding
  const formatId = (id: bigint, prefix: string): string => {
    try {
      return `${prefix}${id.toString().padStart(6, '0')}`;
    } catch (error) {
      console.error("Error formatting ID:", error);
      return "Invalid ID";
    }
  }

  // Format timestamp from blockchain
  const formatTimestamp = (timestamp: bigint): string => {
    try {
      return new Date(Number(timestamp) * 1000).toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return new Date().toISOString().split('T')[0];
    }
  }

  // Transform blockchain data to our interface
  const records: TransplantRecord[] = transplantRecords ? 
    (transplantRecords as any[]).map((record, index) => ({
      id: index.toString(),
      donor: {
        id: formatId(record.donorId, "D"),
        name: record.donorName,
      },
      recipient: {
        id: formatId(record.recipientId, "R"),
        name: record.recipientName,
      },
      organ: record.organ,
      transplantDate: formatTimestamp(record.transplantTimestamp),
      confirmationDate: formatTimestamp(record.confirmationTimestamp),
      notes: record.notes
    })) : []

  // Generate array of years from 2020 to current year
  const years = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => (2020 + i).toString()
  );

  // Array of months
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // When year changes, reset month filter and show month filter options
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedMonth("");
    setShowMonthFilter(true);
  };

  // When filter type changes, reset appropriate states
  const handleFilterTypeChange = (type: FilterType) => {
    setFilterType(type);
    if (type !== "year") {
      setShowMonthFilter(false);
      setSelectedMonth("");
    }
  };

  const getSearchPlaceholder = () => {
    switch (searchBy) {
      case "donorName":
        return "Search by donor name...";
      case "donorId":
        return "Search by donor ID...";
      case "recipientName":
        return "Search by recipient name...";
      case "recipientId":
        return "Search by recipient ID...";
      default:
        return "Search...";
    }
  };

  const filteredRecords = records.filter((record) => {
    // Apply search filter
    let matchesSearch = true;
    if (searchTerm) {
      switch (searchBy) {
        case "donorName":
          matchesSearch = record.donor.name.toLowerCase().includes(searchTerm.toLowerCase());
          break;
        case "donorId":
          matchesSearch = record.donor.id.toLowerCase().includes(searchTerm.toLowerCase());
          break;
        case "recipientName":
          matchesSearch = record.recipient.name.toLowerCase().includes(searchTerm.toLowerCase());
          break;
        case "recipientId":
          matchesSearch = record.recipient.id.toLowerCase().includes(searchTerm.toLowerCase());
          break;
      }
    }

    // Apply additional filters
    let matchesFilter = true;
    if (filterType === "organ" && selectedOrgan && selectedOrgan !== "all") {
      matchesFilter = record.organ === selectedOrgan;
    } else if (filterType === "date" && selectedDate) {
      matchesFilter = record.transplantDate === selectedDate;
    } else if (filterType === "year" && selectedYear) {
      // Extract year from YYYY-MM-DD format
      const recordYear = record.transplantDate.split("-")[0];
      let yearMatches = recordYear === selectedYear;
      
      // If month is also selected, check if month matches too
      if (yearMatches && selectedMonth && selectedMonth !== "all") {
        const recordMonth = record.transplantDate.split("-")[1];
        return recordMonth === selectedMonth;
      }
      
      matchesFilter = yearMatches;
    }

    return matchesSearch && matchesFilter;
  });

  const getFilterControl = () => {
    switch (filterType) {
      case "organ":
        return (
          <Select value={selectedOrgan} onValueChange={setSelectedOrgan}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select organ" />
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
        );
      case "date":
        return (
          <div className="relative w-[180px]">
            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-8"
            />
          </div>
        );
      case "year":
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {showMonthFilter && (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (isPending) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transplant Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <p>Loading transplant records from blockchain...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transplant Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* Search By Selector */}
            <Select value={searchBy} onValueChange={(value) => setSearchBy(value as SearchByType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="donorName">Donor Name</SelectItem>
                <SelectItem value="donorId">Donor ID</SelectItem>
                <SelectItem value="recipientName">Recipient Name</SelectItem>
                <SelectItem value="recipientId">Recipient ID</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Filter Type Selector */}
            <Select 
              value={filterType} 
              onValueChange={(value) => handleFilterTypeChange(value as FilterType)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Filter</SelectItem>
                <SelectItem value="organ">Filter by Organ</SelectItem>
                <SelectItem value="date">Filter by Date</SelectItem>
                <SelectItem value="year">Filter by Year</SelectItem>
              </SelectContent>
            </Select>

            {/* Conditional Filter Control */}
            {getFilterControl()}
          </div>
        </div>

        <div className="rounded-md border w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor ID</TableHead>
                <TableHead>Donor Name</TableHead>
                <TableHead>Recipient ID</TableHead>
                <TableHead>Recipient Name</TableHead>
                <TableHead>Organ</TableHead>
                <TableHead>Transplant Date</TableHead>
                <TableHead>Confirmation Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.donor.id}</TableCell>
                  <TableCell>{record.donor.name}</TableCell>
                  <TableCell>{record.recipient.id}</TableCell>
                  <TableCell>{record.recipient.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {record.organ}
                    </span>
                  </TableCell>
                  <TableCell>{record.transplantDate}</TableCell>
                  <TableCell>{record.confirmationDate}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={record.notes}>
                    {record.notes}
                  </TableCell>
                </TableRow>
              ))}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 
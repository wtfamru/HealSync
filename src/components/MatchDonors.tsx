"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Search, AlertCircle, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { client } from "@/providers/thirdweb-provider"
import { getContract, prepareContractCall } from "thirdweb"
import { sepolia } from "thirdweb/chains"
import { useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react"

const organs = ["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Eyes"]

interface MatchResult {
  success: boolean;
  donorId: string;
  recipientId: string;
  message: string;
}

interface Transplant {
  donorId: string;
  recipientId: string;
  timestamp: string;
  organ: string;
  donorName: string;
  recipientName: string;
}

type FilterType = "none" | "organ" | "date" | "year";
type SearchByType = "donorName" | "donorId" | "recipientName" | "recipientId";

export default function MatchDonors() {
  const [searchTerm, setSearchTerm] = useState("")
  const [commitDialogOpen, setCommitDialogOpen] = useState(false)
  const [selectedTransplant, setSelectedTransplant] = useState<Transplant | null>(null)
  const [transplantNotes, setTransplantNotes] = useState("")
  const [isMatchLoading, setIsMatchLoading] = useState(false)
  const account = useActiveAccount()
  const { mutate: sendTransaction } = useSendTransaction()
  
  // New state for advanced search and filters
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

  // Get transplant records
  const { data: transplantRecords, isPending: isLoadingRecords } = useReadContract({
    contract,
    method: "function getTransplantRecords() view returns ((uint256 donorId, string donorName, uint256 recipientId, string recipientName, string organ, uint256 timestamp)[])",
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
      const date = new Date(Number(timestamp) * 1000);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return new Date().toLocaleString();
    }
  }

  // Format date for filtering (YYYY-MM-DD)
  const formatDateForFilter = (timestamp: bigint): string => {
    try {
      return new Date(Number(timestamp) * 1000).toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting timestamp for filter:", error);
      return new Date().toISOString().split('T')[0];
    }
  }

  // Transform blockchain data for our component
  const transformedTransplants = transplantRecords ? 
    (transplantRecords as any[]).map(record => ({
      donorId: formatId(record.donorId, "D"),
      donorName: record.donorName,
      recipientId: formatId(record.recipientId, "R"),
      recipientName: record.recipientName,
      organ: record.organ,
      timestamp: formatTimestamp(record.timestamp),
      dateForFilter: formatDateForFilter(record.timestamp)
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

  const filteredTransplants = transformedTransplants.filter((transplant) => {
    // Apply search filter
    let matchesSearch = true;
    if (searchTerm) {
      switch (searchBy) {
        case "donorName":
          matchesSearch = transplant.donorName.toLowerCase().includes(searchTerm.toLowerCase());
          break;
        case "donorId":
          matchesSearch = transplant.donorId.toLowerCase().includes(searchTerm.toLowerCase());
          break;
        case "recipientName":
          matchesSearch = transplant.recipientName.toLowerCase().includes(searchTerm.toLowerCase());
          break;
        case "recipientId":
          matchesSearch = transplant.recipientId.toLowerCase().includes(searchTerm.toLowerCase());
          break;
      }
    }

    // Apply additional filters
    let matchesFilter = true;
    if (filterType === "organ" && selectedOrgan && selectedOrgan !== "all") {
      matchesFilter = transplant.organ === selectedOrgan;
    } else if (filterType === "date" && selectedDate) {
      matchesFilter = transplant.dateForFilter === selectedDate;
    } else if (filterType === "year" && selectedYear) {
      // Extract year from YYYY-MM-DD format
      const recordYear = transplant.dateForFilter.split("-")[0];
      let yearMatches = recordYear === selectedYear;
      
      // If month is also selected, check if month matches too
      if (yearMatches && selectedMonth && selectedMonth !== "all") {
        const recordMonth = transplant.dateForFilter.split("-")[1];
        return recordMonth === selectedMonth;
      }
      
      matchesFilter = yearMatches;
    }

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Sort by timestamp (newest first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Get the appropriate filter control based on filter type
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

  // Handle match recipient
  const handleMatchRecipient = async () => {
    if (!account) {
      toast.error("Please connect your wallet first")
      return
    }

    try {
      setIsMatchLoading(true)
      const tx = prepareContractCall({
        contract,
        method: "function matchRecipient() returns ((bool success, uint256 donorId, uint256 recipientId, string message))",
        params: [],
      })

      await sendTransaction(tx)
      
      toast.success("Match attempt transaction sent!", { duration: 5000 })
    } catch (error: any) {
      console.error("Error matching recipient:", error)
      const message = error.reason || error.message || "An unknown error occurred during matching."
      toast.error(`Matching failed: ${message}`)
    } finally {
      setIsMatchLoading(false)
    }
  }

  // Handle commit transplant
  const handleCommitTransplant = async () => {
    if (!account || !selectedTransplant) {
      toast.error("Please connect your wallet and select a transplant")
      return
    }

    try {
      const tx = prepareContractCall({
        contract,
        method: "function confirmTransplant(uint256 _donorId, uint256 _recipientId, string _notes)",
        params: [
          // Parse the numeric ID from the formatted string
          BigInt(selectedTransplant.donorId.replace('D', '')),
          BigInt(selectedTransplant.recipientId.replace('R', '')),
          transplantNotes
        ],
      })

      await sendTransaction(tx)
      
      toast.success("Transplant confirmation sent!", { duration: 5000 })
      setCommitDialogOpen(false)
      setSelectedTransplant(null)
      setTransplantNotes("")
    } catch (error: any) {
      console.error("Error confirming transplant:", error)
      const message = error.reason || error.message || "An unknown error occurred during confirmation."
      toast.error(`Confirmation failed: ${message}`)
    }
  }

  const openCommitDialog = (transplant: Transplant) => {
    setSelectedTransplant(transplant)
    setCommitDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Match Recipients Section */}
      <Card>
        <CardHeader>
          <CardTitle>Match Recipients</CardTitle>
          <CardDescription>
            Find compatible donors for recipients based on medical criteria and urgency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Automatic Matching</AlertTitle>
              <AlertDescription>
                The system will automatically match the most urgent recipient with a compatible donor.
              </AlertDescription>
              </Alert>
            <Button
              onClick={handleMatchRecipient}
              disabled={isMatchLoading}
              className="cursor-pointer bg-[#5AA7A7] text-white hover:bg-[#4A9696]"
            >
              {isMatchLoading ? "Matching..." : "Match with Recipient"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transplant History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Transplant History</CardTitle>
          <CardDescription>View and manage transplant matches</CardDescription>
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
                  <TableHead>Match Date</TableHead>
                  <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {isLoadingRecords ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading transplant records...
                    </TableCell>
                  </TableRow>
                ) : filteredTransplants.length > 0 ? (
                  filteredTransplants.map((transplant, index) => (
                      <TableRow key={index}>
                        <TableCell>{transplant.donorId}</TableCell>
                        <TableCell>{transplant.donorName}</TableCell>
                        <TableCell>{transplant.recipientId}</TableCell>
                        <TableCell>{transplant.recipientName}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {transplant.organ}
                          </span>
                        </TableCell>
                        <TableCell>{transplant.timestamp}</TableCell>
                        <TableCell>
                            <Button 
                              onClick={() => openCommitDialog(transplant)}
                              variant="outline" 
                              size="sm"
                              className="cursor-pointer bg-[#5AA7A7] text-white hover:bg-[#4A9696]"
                            >
                              Commit Transplant
                            </Button>
                        </TableCell>
                      </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No transplant records found
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    {/* Commit Transplant Dialog */}
    <Dialog open={commitDialogOpen} onOpenChange={setCommitDialogOpen}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Commit Transplant</DialogTitle>
          <DialogDescription>
              Add notes about this transplant before committing it to the blockchain.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="donorId" className="text-right">Donor ID</Label>
              <div className="col-span-3">{selectedTransplant?.donorId}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="donorName" className="text-right">Donor Name</Label>
              <div className="col-span-3">{selectedTransplant?.donorName}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipientId" className="text-right">Recipient ID</Label>
              <div className="col-span-3">{selectedTransplant?.recipientId}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipientName" className="text-right">Recipient Name</Label>
              <div className="col-span-3">{selectedTransplant?.recipientName}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="organ" className="text-right">Organ</Label>
              <div className="col-span-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedTransplant?.organ}
                </span>
              </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
            <Textarea
              id="notes"
              className="col-span-3"
              placeholder="Enter any relevant notes about the transplant..."
              value={transplantNotes}
              onChange={(e) => setTransplantNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCommitDialogOpen(false)}>
            Cancel
          </Button>
            <Button onClick={handleCommitTransplant} className="cursor-pointer">
              Confirm Transplant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  )
} 
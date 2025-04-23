import { useState, useEffect } from "react"
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
import { Search, AlertCircle, CheckCircle, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

interface Recipient {
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

interface Transplant {
  donorId: string;
  recipientId: string;
  timestamp: string;
  isCommitted?: boolean;
}

interface MatchResult {
  success: boolean;
  donorId: string;
  recipientId: string;
  message: string;
}

// Mock data simulating what would come from the blockchain
const mockDonors: Record<string, Donor> = {
  "1": {
    id: "1",
    name: "John Doe",
    gender: "Male",
    age: "32",
    medical: {
      bloodGroup: "A+",
      organ: "Kidney",
      tissueType: "Type1",
      hlaMatch: "6",
    },
    isAvailable: false,
  },
  "2": {
    id: "2",
    name: "Jane Smith",
    gender: "Female",
    age: "28",
    medical: {
      bloodGroup: "O-",
      organ: "Liver",
      tissueType: "Type2",
      hlaMatch: "5",
    },
    isAvailable: false,
  },
  "3": {
    id: "3",
    name: "David Wilson",
    gender: "Male",
    age: "45",
    medical: {
      bloodGroup: "B+",
      organ: "Heart",
      tissueType: "Type3",
      hlaMatch: "4",
    },
    isAvailable: false,
  }
};

const mockRecipients: Record<string, Recipient> = {
  "1": {
    id: "1",
    name: "Robert Johnson",
    gender: "Male",
    age: "45",
    medical: {
      bloodGroup: "A+",
      organ: "Kidney",
      tissueType: "Type1",
      hlaMatch: "6",
    },
    urgency: "High",
    isWaiting: false,
    waitingTime: "2023-11-15",
  },
  "2": {
    id: "2",
    name: "Sarah Williams",
    gender: "Female",
    age: "38",
    medical: {
      bloodGroup: "O-",
      organ: "Liver",
      tissueType: "Type2",
      hlaMatch: "5",
    },
    urgency: "Critical",
    isWaiting: false,
    waitingTime: "2023-10-20",
  },
  "3": {
    id: "3",
    name: "Michael Brown",
    gender: "Male",
    age: "52",
    medical: {
      bloodGroup: "B+",
      organ: "Heart",
      tissueType: "Type3",
      hlaMatch: "4",
    },
    urgency: "Medium",
    isWaiting: false,
    waitingTime: "2023-12-05",
  }
};

const mockTransplants: Transplant[] = [
  {
    donorId: "1",
    recipientId: "1",
    timestamp: "2023-12-10",
    isCommitted: true,
  },
  {
    donorId: "2",
    recipientId: "2",
    timestamp: "2023-12-15",
    isCommitted: true,
  },
  {
    donorId: "3",
    recipientId: "3",
    timestamp: "2023-12-20",
    isCommitted: false,
  }
];

// Mock new donors and recipients for the matching algorithm
const availableDonors: Donor[] = [
  {
    id: "4",
    name: "Emma Davis",
    gender: "Female",
    age: "35",
    medical: {
      bloodGroup: "AB+",
      organ: "Kidney",
      tissueType: "Type1",
      hlaMatch: "6",
    },
    isAvailable: true,
  },
  {
    id: "5",
    name: "James Anderson",
    gender: "Male",
    age: "42",
    medical: {
      bloodGroup: "A-",
      organ: "Liver",
      tissueType: "Type2",
      hlaMatch: "5",
    },
    isAvailable: true,
  }
];

const waitingRecipients: Recipient[] = [
  {
    id: "4",
    name: "Jessica Miller",
    gender: "Female",
    age: "29",
    medical: {
      bloodGroup: "AB+",
      organ: "Kidney",
      tissueType: "Type1",
      hlaMatch: "6",
    },
    urgency: "High",
    isWaiting: true,
    waitingTime: "2024-01-05",
  },
  {
    id: "5",
    name: "Thomas Clark",
    gender: "Male",
    age: "48",
    medical: {
      bloodGroup: "A-",
      organ: "Liver",
      tissueType: "Type2",
      hlaMatch: "5",
    },
    urgency: "Critical",
    isWaiting: true,
    waitingTime: "2024-01-10",
  }
];

type FilterType = "none" | "organ" | "date" | "year";
type SearchByType = "donorName" | "donorId" | "recipientName" | "recipientId";

export default function MatchDonors() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("none")
  const [searchBy, setSearchBy] = useState<SearchByType>("donorName")
  const [selectedOrgan, setSelectedOrgan] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [showMonthFilter, setShowMonthFilter] = useState(false)
  const [showCommitted, setShowCommitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMatchLoading, setIsMatchLoading] = useState(false)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [transplants, setTransplants] = useState<Transplant[]>([])
  const [donors, setDonors] = useState<Record<string, Donor>>({})
  const [recipients, setRecipients] = useState<Record<string, Recipient>>({})
  const [isConnected, setIsConnected] = useState(true) // Simulating connection to blockchain
  const [isCommitting, setIsCommitting] = useState<Record<string, boolean>>({})

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

  // Get placeholder text based on search type
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

  useEffect(() => {
    // Simulate loading data from blockchain
    const loadData = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTransplants(mockTransplants);
      setDonors(mockDonors);
      setRecipients(mockRecipients);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Simulated matching algorithm based on the contract logic
  const simulateMatchRecipient = async (): Promise<MatchResult> => {
    // Simulate the contract's matching algorithm
    // Find highest priority recipient (Critical > High > Medium > Low, then by waiting time)
    let bestRecipient: Recipient | null = null;
    let highestUrgencyScore = -1;
    let longestWaitingTime = "";
    
    for (const recipient of waitingRecipients) {
      if (!recipient.isWaiting) continue;
      
      let urgencyScore = 0;
      switch (recipient.urgency) {
        case "Critical": urgencyScore = 4; break;
        case "High": urgencyScore = 3; break;
        case "Medium": urgencyScore = 2; break;
        case "Low": urgencyScore = 1; break;
      }
      
      if (urgencyScore > highestUrgencyScore || 
          (urgencyScore === highestUrgencyScore && recipient.waitingTime < longestWaitingTime)) {
        highestUrgencyScore = urgencyScore;
        longestWaitingTime = recipient.waitingTime;
        bestRecipient = recipient;
      }
    }
    
    if (!bestRecipient) {
      return {
        success: false,
        donorId: "0",
        recipientId: "0",
        message: "No recipients waiting"
      };
    }
    
    // Find compatible donor
    let compatibleDonor: Donor | null = null;
    
    for (const donor of availableDonors) {
      if (!donor.isAvailable) continue;
      
      // Check compatibility (same logic as the contract's isCompatible function)
      if (donor.medical.organ === bestRecipient.medical.organ &&
          donor.medical.bloodGroup === bestRecipient.medical.bloodGroup &&
          donor.medical.tissueType === bestRecipient.medical.tissueType &&
          donor.medical.hlaMatch === bestRecipient.medical.hlaMatch) {
        compatibleDonor = donor;
        break;
      }
    }
    
    if (!compatibleDonor) {
      return {
        success: false,
        donorId: "0",
        recipientId: bestRecipient.id,
        message: "No compatible donor available"
      };
    }
    
    // Create a successful match
    return {
      success: true,
      donorId: compatibleDonor.id,
      recipientId: bestRecipient.id,
      message: `Successfully matched recipient ${bestRecipient.name} with donor ${compatibleDonor.name}`
    };
  };

  const handleMatchRecipient = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsMatchLoading(true);
      setMatchResult(null);
      
      // Simulate blockchain transaction time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await simulateMatchRecipient();
      
      if (result.success) {
        // Add a new transplant to our list
        const newTransplant: Transplant = {
          donorId: result.donorId,
          recipientId: result.recipientId,
          timestamp: new Date().toISOString().split('T')[0],
          isCommitted: false
        };
        
        // Add the new transplant to the list
        setTransplants(prev => [...prev, newTransplant]);
        
        // Update our records with donor and recipient data
        if (result.donorId !== "0" && result.recipientId !== "0") {
          const matchedDonor = availableDonors.find(d => d.id === result.donorId);
          const matchedRecipient = waitingRecipients.find(r => r.id === result.recipientId);
          
          if (matchedDonor && matchedRecipient) {
            // Mark donor as unavailable
            matchedDonor.isAvailable = false;
            
            // Mark recipient as not waiting
            matchedRecipient.isWaiting = false;
            
            // Add to our state
            setDonors(prev => ({
              ...prev,
              [matchedDonor.id]: matchedDonor
            }));
            
            setRecipients(prev => ({
              ...prev,
              [matchedRecipient.id]: matchedRecipient
            }));
          }
        }
        
        toast.success('Match successful! Transplant registered on blockchain');
      } else {
        toast.error(result.message);
      }
      
      setMatchResult(result);
    } catch (error: any) {
      console.error("Error matching recipient:", error);
      const message = error.message || "An unknown error occurred";
      toast.error(`Match failed: ${message}`);
      
      setMatchResult({
        success: false,
        donorId: "0",
        recipientId: "0",
        message: message
      });
    } finally {
      setIsMatchLoading(false);
    }
  };

  // New function to handle committing a transplant
  const handleCommitTransplant = async (index: number, transplant: Transplant) => {
    setIsCommitting(prev => ({ ...prev, [index]: true }));
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update transplant status
      const updatedTransplants = [...transplants];
      updatedTransplants[index] = { ...transplant, isCommitted: true };
      setTransplants(updatedTransplants);
      
      toast.success("Transplant successfully committed to blockchain!");
    } catch (error) {
      toast.error("Failed to commit transplant");
      console.error("Error committing transplant:", error);
    } finally {
      setIsCommitting(prev => ({ ...prev, [index]: false }));
    }
  };

  const filteredTransplants = transplants.filter((transplant) => {
    // Filter out committed transplants if showCommitted is false
    if (!showCommitted && transplant.isCommitted) return false;
    
    const donorData = donors[transplant.donorId];
    const recipientData = recipients[transplant.recipientId];
    
    if (!donorData || !recipientData) return false;
    
    // Apply search filter
    let matchesSearch = true;
    if (searchTerm) {
      switch (searchBy) {
        case "donorName":
          matchesSearch = donorData.name.toLowerCase().includes(searchTerm.toLowerCase());
          break;
        case "donorId":
          matchesSearch = transplant.donorId.toLowerCase().includes(searchTerm.toLowerCase());
          break;
        case "recipientName":
          matchesSearch = recipientData.name.toLowerCase().includes(searchTerm.toLowerCase());
          break;
        case "recipientId":
          matchesSearch = transplant.recipientId.toLowerCase().includes(searchTerm.toLowerCase());
          break;
      }
    }
    
    // Apply additional filters
    let matchesFilter = true;
    if (filterType === "organ" && selectedOrgan && selectedOrgan !== "all") {
      matchesFilter = donorData.medical.organ === selectedOrgan;
    } else if (filterType === "date" && selectedDate) {
      matchesFilter = transplant.timestamp === selectedDate;
    } else if (filterType === "year" && selectedYear) {
      // Extract year from YYYY-MM-DD format
      const recordYear = transplant.timestamp.split("-")[0];
      let yearMatches = recordYear === selectedYear;
      
      // If month is also selected, check if month matches too
      if (yearMatches && selectedMonth && selectedMonth !== "all") {
        const recordMonth = transplant.timestamp.split("-")[1];
        return recordMonth === selectedMonth; // If month selected, both year and month must match
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organ Matching Engine</CardTitle>
          <CardDescription>
            Match the highest priority recipient with a compatible donor based on blood group, organ, tissue type, and HLA match
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-sm text-gray-600">
                The matching algorithm will automatically find the most urgent recipient and try to match them with a compatible donor from the donor pool. 
                Recipients are prioritized by urgency level (Critical, High, Medium, Low) and waiting time.
              </p>
            </div>

            {matchResult && (
              <Alert variant={matchResult.success ? "success" : "destructive"} className="mb-4">
                <div className="flex items-start gap-2">
                  {matchResult.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  <div>
                    <AlertTitle>{matchResult.success ? "Match Successful" : "Match Failed"}</AlertTitle>
                    <AlertDescription>{matchResult.message}</AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            <Button
              onClick={handleMatchRecipient}
              disabled={isMatchLoading || !isConnected}
              className="w-full md:w-auto cursor-pointer bg-[#5AA7A7] hover:bg-[#4A9696]"
            >
              {isMatchLoading ? "Matching..." : "Match Recipient with Donor"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matching History</CardTitle>
          <CardDescription>
            View and manage matches between donors and recipients
          </CardDescription>
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
          
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setShowCommitted(!showCommitted)}
            >
              {showCommitted ? "Hide Committed Matches" : "Show Committed Matches"}
            </Button>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Loading matching records...</TableCell>
                  </TableRow>
                ) : filteredTransplants.length > 0 ? (
                  filteredTransplants.map((transplant, index) => {
                    const donor = donors[transplant.donorId];
                    const recipient = recipients[transplant.recipientId];
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{transplant.donorId}</TableCell>
                        <TableCell>{donor?.name || "Unknown"}</TableCell>
                        <TableCell>{transplant.recipientId}</TableCell>
                        <TableCell>{recipient?.name || "Unknown"}</TableCell>
                        <TableCell>{donor?.medical?.organ || "Unknown"}</TableCell>
                        <TableCell>{transplant.timestamp}</TableCell>
                        <TableCell>
                          {transplant.isCommitted ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Committed
                            </span>
                          ) : (
                            <Button 
                              onClick={() => handleCommitTransplant(index, transplant)}
                              disabled={isCommitting[index]}
                              variant="outline" 
                              size="sm"
                              className="cursor-pointer bg-[#5AA7A7] text-white hover:bg-[#4A9696]"
                            >
                              {isCommitting[index] ? "Committing..." : "Commit Transplant"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">No matching records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
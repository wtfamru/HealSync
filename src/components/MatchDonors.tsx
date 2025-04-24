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
import { Search, AlertCircle } from "lucide-react"
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

export default function MatchDonors() {
  const [searchTerm, setSearchTerm] = useState("")
  const [commitDialogOpen, setCommitDialogOpen] = useState(false)
  const [selectedTransplant, setSelectedTransplant] = useState<Transplant | null>(null)
  const [transplantNotes, setTransplantNotes] = useState("")
  const [isMatchLoading, setIsMatchLoading] = useState(false)
  const account = useActiveAccount()
  const { mutate: sendTransaction } = useSendTransaction()

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

  const filteredTransplants = transplantRecords ? 
    (transplantRecords as any[]).map(record => ({
      donorId: formatId(record.donorId, "D"),
      donorName: record.donorName,
      recipientId: formatId(record.recipientId, "R"),
      recipientName: record.recipientName,
      organ: record.organ,
      timestamp: formatTimestamp(record.timestamp)
    })).filter(transplant =>
      transplant.donorId.includes(searchTerm) ||
      transplant.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transplant.recipientId.includes(searchTerm) ||
      transplant.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transplant.organ.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []

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
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                placeholder="Search by donor or recipient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
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
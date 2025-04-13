"use client"

import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Heart, HeartPulse, Eye, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Donor } from "@/types/donor"

interface ViewPledgesProps {
  onSelectDonor: Dispatch<SetStateAction<Donor | null>>
}

export default function ViewPledges({ onSelectDonor }: ViewPledgesProps) {
  const { user } = useAuth()
  const [pledges, setPledges] = useState<Donor[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedPledge, setSelectedPledge] = useState<Donor | null>(null)

  useEffect(() => {
    fetchPledges()
  }, [])

  const fetchPledges = async () => {
    try {
      const pledgesQuery = query(
        collection(db, "hospitals", user?.uid || "", "pledges")
      )
      const querySnapshot = await getDocs(pledgesQuery)
      const pledgesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donor[]
      setPledges(pledgesList)
    } catch (error) {
      console.error("Error fetching pledges:", error)
      toast.error("Failed to load pledges")
    }
  }

  const handleMarkDeceased = async () => {
    if (!selectedPledge) return

    try {
      const pledgeRef = doc(db, "hospitals", user?.uid || "", "pledges", selectedPledge.id)
      await updateDoc(pledgeRef, {
        isDeceased: true
      })
      
      setPledges(prev => prev.map(p => 
        p.id === selectedPledge.id ? { ...p, isDeceased: true } : p
      ))
      setShowConfirmDialog(false)
      setSelectedPledge(null)
      
      toast.success("Donor marked as deceased")
    } catch (error) {
      console.error("Error updating pledge:", error)
      toast.error("Failed to update donor status")
    }
  }

  const getOrganCount = (organs: Donor["organs"]) => {
    return Object.entries(organs)
      .filter(([_, count]) => count > 0)
      .map(([organ, count]) => `${organ}: ${count}`)
      .join(", ")
  }

  return (
    <div className="w-80 border-l">
      <Card className="h-full rounded-none border-l-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Donor Pledges</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-4 p-4">
              {pledges.map((pledge) => (
                <Card key={pledge.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{pledge.name}</h3>
                        <p className="text-sm text-gray-500">{pledge.bloodGroup}</p>
                        <p className="text-sm text-gray-500">
                          {pledge.address.city}, {pledge.address.state}
                        </p>
                      </div>
                      <Badge variant={pledge.isDeceased ? "destructive" : "default"}>
                        {pledge.isDeceased ? "Deceased" : "Active"}
                      </Badge>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Organs:</span> {getOrganCount(pledge.organs)}
                      </p>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedPledge(pledge)
                          setShowConfirmDialog(true)
                        }}
                        disabled={pledge.isDeceased}
                      >
                        <HeartPulse className="w-4 h-4 mr-2" />
                        Mark Deceased
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Donor as Deceased</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {selectedPledge?.name} as deceased? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleMarkDeceased}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
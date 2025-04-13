import { useState } from "react"
import ViewPledges from "./view-pledges"
import { type Donor } from "../types/donor"

export default function RegisterDonor() {
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <ViewPledges onSelectDonor={setSelectedDonor} />
    </div>
  )
} 
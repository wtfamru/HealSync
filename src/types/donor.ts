export interface Donor {
  id: string
  name: string
  bloodGroup: string
  address: string
  organs: string[]
  isDeceased: boolean
  isRegistered: boolean
  createdAt: Date
  hospitalId?: string
  userId?: string
  severity?: string
}

export interface DonorPledge extends Donor {
  hospitalId: string
  userId: string
} 
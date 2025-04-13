interface UserData {
  id: string
  name: string
  email: string
  role: "donor" | "hospital" | "patient"
  bloodGroup: string
  address: string
  phone: string
  dob: string
  age: number
  firstName?: string
  lastName?: string
  isSubmitted?: boolean
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  logout: () => Promise<void>
  updateUserData: (data: Partial<UserData>) => Promise<void>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) return

    try {
      const userRef = doc(db, "users", user.uid)
      const updatedData = {
        ...data,
        updatedAt: new Date().toISOString()
      }
      
      // If DOB is being updated, calculate and add age
      if (data.dob) {
        updatedData.age = calculateAge(data.dob)
      }
      
      await updateDoc(userRef, updatedData)
      setUserData(prev => ({ ...prev, ...updatedData }))
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating user data:", error)
      toast.error("Failed to update profile")
    }
  }
} 
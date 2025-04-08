import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Trash2 } from "lucide-react"

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const organs = ["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Eyes"]
const urgencyLevels = ["Low", "Medium", "High", "Critical"]

export default function RegisterPatient() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    organ: "",
    tissueType: "",
    hlaMatch: "",
    urgency: "",
    medicalHistory: "",
    file: null as File | null,
  })
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, file });
      
      // Create URL for file preview
      const fileUrl = URL.createObjectURL(file);
      setFileUrl(fileUrl);
    }
  }

  const handleRemoveFile = () => {
    setFormData({ ...formData, file: null });
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle form submission
    console.log(formData)
  }

  const openFileInNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }

  // Clean up object URL on component unmount
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Patient</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="0"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select
                value={formData.bloodGroup}
                onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organ">Organ</Label>
              <Select
                value={formData.organ}
                onValueChange={(value) => setFormData({ ...formData, organ: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organ" />
                </SelectTrigger>
                <SelectContent>
                  {organs.map((organ) => (
                    <SelectItem key={organ} value={organ}>
                      {organ}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tissueType">Tissue Type</Label>
              <Input
                id="tissueType"
                value={formData.tissueType}
                onChange={(e) => setFormData({ ...formData, tissueType: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hlaMatch">HLA Match</Label>
              <Input
                id="hlaMatch"
                value={formData.hlaMatch}
                onChange={(e) => setFormData({ ...formData, hlaMatch: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) => setFormData({ ...formData, urgency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              placeholder="Enter patient's medical history..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Medical Report (PDF/Image)</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 relative">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  required
                  className="cursor-pointer"
                />
                {formData.file && (
                  <div className="absolute right-2 flex items-center gap-2">
                    <Eye
                      className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                      onClick={openFileInNewTab}
                    />
                    <Trash2
                      className="w-5 h-5 text-gray-500 hover:text-red-600 cursor-pointer transition-colors"
                      onClick={handleRemoveFile}
                    />
                  </div>
                )}
              </div>
            </div>
            {formData.file && (
              <div className="text-sm text-gray-500">
                Selected file: {formData.file.name} ({(formData.file.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-[#5AA7A7] hover:bg-[#4A9696]">
            Register Patient
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 